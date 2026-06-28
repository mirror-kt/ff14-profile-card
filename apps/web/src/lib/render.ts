import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm?url";
import type { ReactElement } from "react";
import { fetchFont } from "./api";
import type { FontDef } from "../data/fonts";

let resvgReady: Promise<void> | null = null;
function ensureResvg(): Promise<void> {
  if (!resvgReady) {
    resvgReady = (async () => {
      const wasm = await fetch(resvgWasm);
      await initWasm(await wasm.arrayBuffer());
    })();
  }
  return resvgReady;
}

const fontCache = new Map<string, ArrayBuffer>();
async function loadFont(slug: string, subset: string, weight: string): Promise<ArrayBuffer> {
  const key = `${slug}:${subset}:${weight}`;
  const cached = fontCache.get(key);
  if (cached) return cached;
  const buf = await fetchFont(slug, subset, weight);
  fontCache.set(key, buf);
  return buf;
}

const emojiCache = new Map<string, string>();
async function loadEmoji(segment: string): Promise<string> {
  const cached = emojiCache.get(segment);
  if (cached) return cached;
  const codepoint = toTwemojiCodepoint(segment);
  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${codepoint}.svg`;
  const res = await fetch(url);
  if (!res.ok) {
    const blank = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=";
    emojiCache.set(segment, blank);
    return blank;
  }
  const svg = await res.text();
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  emojiCache.set(segment, dataUrl);
  return dataUrl;
}

function toTwemojiCodepoint(str: string): string {
  const parts: string[] = [];
  for (const ch of [...str]) {
    const cp = ch.codePointAt(0);
    if (!cp) continue;
    if (cp === 0xfe0f) continue;
    parts.push(cp.toString(16));
  }
  return parts.join("-");
}

export type RenderOptions = {
  fontDef: FontDef;
};

export async function renderCardPng(jsx: ReactElement, opts: RenderOptions): Promise<Blob> {
  await ensureResvg();

  const fontJobs: { weight: string; subset: string }[] = [];
  for (const weight of opts.fontDef.weights) {
    for (const subset of opts.fontDef.subsets) {
      fontJobs.push({ weight, subset });
    }
  }
  const fonts = await Promise.all(
    fontJobs.map(async ({ weight, subset }) => ({
      name: opts.fontDef.family,
      data: await loadFont(opts.fontDef.slug, subset, weight),
      weight: Number(weight) as 400 | 700,
      style: "normal" as const,
    })),
  );

  const svg = await satori(jsx, {
    width: 1200,
    height: 630,
    fonts,
    loadAdditionalAsset: async (code, segment) => {
      if (code === "emoji") return await loadEmoji(segment);
      return segment;
    },
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const png = resvg.render().asPng();
  return new Blob([png as BlobPart], { type: "image/png" });
}
