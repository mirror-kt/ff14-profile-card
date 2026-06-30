import { parseHTML } from "linkedom";

const LODESTONE_BASE = "https://jp.finalfantasyxiv.com/lodestone/character";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export type CharacterResult =
  | {
      ok: true;
      character: {
        id: string;
        name: string;
        world: string;
        dataCenter: string;
        portrait: string | null;
      };
      jobs: JobEntry[];
    }
  | {
      ok: false;
      code: "not_found" | "private" | "maintenance" | "fetch_failed";
      message: string;
    };

export type JobEntry = {
  name: string;
  level: string;
  iconUrl: string | null;
};

export async function fetchCharacter(id: string): Promise<CharacterResult> {
  if (!/^\d+$/.test(id)) {
    return { ok: false, code: "fetch_failed", message: "invalid character id" };
  }

  const [profileRes, classJobRes] = await Promise.all([
    fetchLodestone(`${LODESTONE_BASE}/${id}/`),
    fetchLodestone(`${LODESTONE_BASE}/${id}/class_job/`),
  ]);

  if (profileRes.status === 404 || classJobRes.status === 404) {
    return { ok: false, code: "not_found", message: "character not found" };
  }
  if (profileRes.status >= 500 || classJobRes.status >= 500) {
    return {
      ok: false,
      code: "maintenance",
      message: "Lodestone is under maintenance",
    };
  }
  if (!profileRes.ok || !classJobRes.ok) {
    return {
      ok: false,
      code: "fetch_failed",
      message: `unexpected status ${profileRes.status}/${classJobRes.status}`,
    };
  }

  const profileHtml = await profileRes.text();
  const classJobHtml = await classJobRes.text();

  const profile = parseProfile(profileHtml);
  if (!profile) {
    return {
      ok: false,
      code: "private",
      message: "profile is private or layout changed",
    };
  }
  const jobs = parseClassJob(classJobHtml);

  return {
    ok: true,
    character: { id, ...profile },
    jobs,
  };
}

async function fetchLodestone(url: string): Promise<Response> {
  const cache = (caches as unknown as { default: Cache }).default;
  const req = new Request(url, { headers: { "User-Agent": UA } });
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) {
    const cacheable = new Response(res.clone().body, res);
    cacheable.headers.set("Cache-Control", "public, max-age=300");
    await cache.put(req, cacheable);
  }
  return res;
}

type Elem = {
  textContent: string | null;
  querySelector: (sel: string) => Elem | null;
  querySelectorAll: (sel: string) => Iterable<Elem>;
  getAttribute: (name: string) => string | null;
};

function parseProfile(html: string): {
  name: string;
  world: string;
  dataCenter: string;
  portrait: string | null;
} | null {
  const { document } = parseHTML(html) as unknown as { document: Elem };
  const name = textOf(document.querySelector(".frame__chara__name"));
  const serverRaw = textOf(document.querySelector(".frame__chara__world"));
  if (!name || !serverRaw) return null;

  const match = serverRaw.match(/^(.+?)\s*\[(.+?)\]\s*$/);
  const world = match ? match[1] : serverRaw;
  const dataCenter = match ? match[2] : "";

  const portrait =
    document.querySelector(".frame__chara__face img")?.getAttribute("src") ??
    null;

  return { name, world, dataCenter, portrait };
}

function parseClassJob(html: string): JobEntry[] {
  const { document } = parseHTML(html) as unknown as { document: Elem };
  const items = document.querySelectorAll(
    ".character__job li, .character__job__role li",
  );
  const seen = new Set<string>();
  const result: JobEntry[] = [];
  for (const li of items) {
    const name = textOf(li.querySelector(".character__job__name"));
    const level = textOf(li.querySelector(".character__job__level"));
    if (!name) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    const iconUrl = li.querySelector("img")?.getAttribute("src") ?? null;
    result.push({ name, level: level || "-", iconUrl });
  }
  return result;
}

function textOf(el: Elem | null | undefined): string {
  return el?.textContent?.trim() ?? "";
}
