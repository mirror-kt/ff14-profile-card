import { ofetch } from "ofetch";

const API_BASE = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api";

export type CharacterData = {
  ok: true;
  character: {
    id: string;
    name: string;
    world: string;
    dataCenter: string;
    portrait: string | null;
  };
  jobs: { name: string; level: string; iconUrl: string | null }[];
};

export type ApiError = {
  ok: false;
  code: "not_found" | "private" | "maintenance" | "fetch_failed";
  message: string;
};

export async function fetchCharacter(id: string): Promise<CharacterData | ApiError> {
  try {
    return await ofetch<CharacterData>(`${API_BASE}/character/${id}`);
  } catch (err) {
    const data = (err as { data?: { error?: string; message?: string } }).data;
    return {
      ok: false,
      code: (data?.error as ApiError["code"]) ?? "fetch_failed",
      message: data?.message ?? "取得に失敗しました",
    };
  }
}

export async function fetchFont(slug: string, subset: string, weight: string): Promise<ArrayBuffer> {
  const url = `https://cdn.jsdelivr.net/npm/@fontsource/${slug}/files/${slug}-${subset}-${weight}-normal.woff`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`failed to fetch font ${slug}/${subset}/${weight}: ${res.status}`);
  }
  return res.arrayBuffer();
}
