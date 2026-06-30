import { useMemo, useState } from "react";
import { Card } from "./components/Card";
import { Form, type FormState } from "./components/Form";
import { FONTS } from "./data/fonts";
import { JOBS_BY_NAME } from "./data/jobs";
import { type CharacterData, fetchCharacter } from "./lib/api";
import { renderCardPng } from "./lib/render";

const ERROR_MESSAGES: Record<string, string> = {
  not_found: "指定された ID のキャラクターは見つかりませんでした",
  private: "このキャラクターのプロフィールは非公開です",
  maintenance:
    "Lodestone がメンテナンス中です。しばらく経ってからお試しください",
  fetch_failed: "取得に失敗しました",
};

export function App() {
  const [form, setForm] = useState<FormState>({
    characterId: "",
    originalImage: null,
    backgroundImage: null,
    bgCrop: { x: 0, y: 0 },
    bgZoom: 1,
    mainJob: null,
    subJobs: [],
    playTimes: [],
    playStyles: [],
    fontFamily: FONTS[0].family,
    panelPosition: "right",
    panelTheme: "dark",
  });

  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleFetchCharacter = async () => {
    setIsFetching(true);
    setFetchError(null);
    const res = await fetchCharacter(form.characterId);
    setIsFetching(false);
    if (!res.ok) {
      setCharacter(null);
      setFetchError(ERROR_MESSAGES[res.code] ?? res.message);
      return;
    }
    setCharacter(res);
  };

  const cardProps = useMemo(() => {
    return {
      characterName: character?.character.name ?? "",
      world: character?.character.world ?? "",
      dataCenter: character?.character.dataCenter ?? "",
      mainJob: form.mainJob ? (JOBS_BY_NAME[form.mainJob] ?? null) : null,
      subJobs: form.subJobs.map((n) => JOBS_BY_NAME[n]).filter(Boolean),
      playTimes: form.playTimes,
      playStyles: form.playStyles,
      jobs: (character?.jobs ?? []).flatMap((j) => {
        const def = JOBS_BY_NAME[j.name];
        if (!def) return [];
        return [
          {
            name: j.name,
            level: j.level,
            iconUrl: `/jobs/${def.iconId}.png`,
            role: def.role,
          },
        ];
      }),
      backgroundDataUrl: form.backgroundImage,
      panelPosition: form.panelPosition,
      panelTheme: form.panelTheme,
    };
  }, [character, form]);

  const handleGenerate = async () => {
    setIsRendering(true);
    setRenderError(null);
    try {
      const fontDef =
        FONTS.find((f) => f.family === form.fontFamily) ?? FONTS[0];
      const blob = await renderCardPng(<Card {...cardProps} />, { fontDef });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        FF14 プロフィールカードジェネレーター
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        <Form
          state={form}
          onChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
          onFetchCharacter={handleFetchCharacter}
          onGenerate={handleGenerate}
          isFetching={isFetching}
          isRendering={isRendering}
          fetchError={fetchError}
        />

        <div className="flex flex-col gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">プレビュー (HTML)</div>
            <div
              className="overflow-hidden rounded"
              style={{ width: 800, height: 420 }}
            >
              <div
                style={{
                  width: 1200,
                  height: 630,
                  transform: "scale(0.6667)",
                  transformOrigin: "top left",
                }}
              >
                <Card {...cardProps} />
              </div>
            </div>
          </div>

          {renderError && <p className="text-red-400 text-sm">{renderError}</p>}

          {outputUrl && (
            <div className="bg-slate-800 rounded-lg p-4 flex flex-col gap-3">
              <div className="text-sm text-slate-400">生成結果</div>
              <img
                src={outputUrl}
                alt="generated card"
                className="w-full rounded"
              />
              <a
                href={outputUrl}
                download={`${character?.character.name ?? "profile"}.png`}
                className="self-start px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium"
              >
                ダウンロード
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
