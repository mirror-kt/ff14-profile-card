import { type ChangeEvent, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { FONTS } from "../data/fonts";
import { JOBS } from "../data/jobs";
import { PLAY_STYLES, PLAY_TIMES } from "../data/playstyles";
import { cropImage } from "../lib/cropImage";
import type { PanelPosition, PanelTheme } from "./Card";

export type FormState = {
  characterId: string;
  originalImage: string | null;
  backgroundImage: string | null;
  bgCrop: { x: number; y: number };
  bgZoom: number;
  mainJob: string | null;
  subJobs: string[];
  playTimes: string[];
  playStyles: string[];
  fontFamily: string;
  panelPosition: PanelPosition;
  panelTheme: PanelTheme;
};

const PANEL_POSITIONS: { value: PanelPosition; label: string }[] = [
  { value: "right", label: "右" },
  { value: "left", label: "左" },
  { value: "top", label: "上" },
  { value: "bottom", label: "下" },
];

const PANEL_THEMES: { value: PanelTheme; label: string }[] = [
  { value: "dark", label: "黒系" },
  { value: "light", label: "白系" },
];

export type FormProps = {
  state: FormState;
  onChange: (next: Partial<FormState>) => void;
  onFetchCharacter: () => void;
  onGenerate: () => void;
  isFetching: boolean;
  isRendering: boolean;
  fetchError: string | null;
};

export function Form({
  state,
  onChange,
  onFetchCharacter,
  onGenerate,
  isFetching,
  isRendering,
  fetchError,
}: FormProps) {
  const handleBg = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      onChange({
        originalImage: src,
        backgroundImage: src,
        bgCrop: { x: 0, y: 0 },
        bgZoom: 1,
      });
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback(
    async (_area: Area, pixels: Area) => {
      if (!state.originalImage) return;
      try {
        const cropped = await cropImage(state.originalImage, pixels);
        onChange({ backgroundImage: cropped });
      } catch (err) {
        console.error("crop failed", err);
      }
    },
    [state.originalImage, onChange],
  );

  const toggleArr = (
    key: "subJobs" | "playTimes" | "playStyles",
    value: string,
  ) => {
    const cur = state[key];
    const next = cur.includes(value)
      ? cur.filter((v) => v !== value)
      : [...cur, value];
    onChange({ [key]: next });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-800 rounded-lg">
      <Field label="キャラクターID">
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={state.characterId}
            onChange={(e) =>
              onChange({ characterId: e.target.value.replace(/\D/g, "") })
            }
            placeholder="例: 12345678"
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
          />
          <button
            type="button"
            onClick={onFetchCharacter}
            disabled={!state.characterId || isFetching}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded font-medium"
          >
            {isFetching ? "取得中…" : "取得"}
          </button>
        </div>
        {fetchError && (
          <p className="text-red-400 text-sm mt-1">{fetchError}</p>
        )}
      </Field>

      <Field label="背景画像">
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <span className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium">
            画像を選択
          </span>
          <span className="text-sm text-slate-400">
            {state.originalImage ? "選択済み" : "未選択"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleBg}
            className="hidden"
          />
        </label>

        {state.originalImage && (
          <div className="flex flex-col gap-2 mt-2">
            <div
              className="relative bg-slate-900 rounded overflow-hidden"
              style={{ width: "100%", aspectRatio: "1200/630" }}
            >
              <Cropper
                image={state.originalImage}
                crop={state.bgCrop}
                zoom={state.bgZoom}
                aspect={1200 / 630}
                onCropChange={(c) => onChange({ bgCrop: c })}
                onZoomChange={(z) => onChange({ bgZoom: z })}
                onCropComplete={onCropComplete}
                restrictPosition={false}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">ズーム</span>
              <input
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={state.bgZoom}
                onChange={(e) => onChange({ bgZoom: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xs text-slate-400 w-10 text-right">
                {state.bgZoom.toFixed(2)}x
              </span>
            </div>
            <p className="text-xs text-slate-500">
              枠内をドラッグで位置調整、スライダーで拡大縮小
            </p>
          </div>
        )}
      </Field>

      <Field label="メインジョブ (単一選択)">
        <select
          value={state.mainJob ?? ""}
          onChange={(e) => onChange({ mainJob: e.target.value || null })}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
        >
          <option value="">未選択</option>
          {JOBS.map((j) => (
            <option key={j.name} value={j.name}>
              {j.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="サブジョブ (複数選択)">
        <div className="flex flex-wrap gap-2">
          {JOBS.map((j) => (
            <Chip
              key={j.name}
              label={j.name}
              active={state.subJobs.includes(j.name)}
              onClick={() => toggleArr("subJobs", j.name)}
            />
          ))}
        </div>
      </Field>

      <Field label="プレイ時間帯 (複数選択)">
        <div className="flex flex-wrap gap-2">
          {PLAY_TIMES.map((p) => (
            <Chip
              key={p}
              label={p}
              active={state.playTimes.includes(p)}
              onClick={() => toggleArr("playTimes", p)}
            />
          ))}
        </div>
      </Field>

      <Field label="プレイスタイル (複数選択)">
        <div className="flex flex-wrap gap-2">
          {PLAY_STYLES.map((p) => (
            <Chip
              key={p}
              label={p}
              active={state.playStyles.includes(p)}
              onClick={() => toggleArr("playStyles", p)}
            />
          ))}
        </div>
      </Field>

      <Field label="パネル位置">
        <div className="flex gap-2">
          {PANEL_POSITIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange({ panelPosition: p.value })}
              className={
                "px-4 py-1.5 rounded text-sm border " +
                (state.panelPosition === p.value
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500")
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="パネル色">
        <div className="flex gap-2">
          {PANEL_THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ panelTheme: t.value })}
              className={
                "px-4 py-1.5 rounded text-sm border " +
                (state.panelTheme === t.value
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="フォント">
        <select
          value={state.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
        >
          {FONTS.map((f) => (
            <option key={f.family} value={f.family}>
              {f.label}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isRendering}
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 rounded-lg font-bold text-lg"
      >
        {isRendering ? "生成中…" : "カード画像を生成"}
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-full text-sm border " +
        (active
          ? "bg-blue-600 border-blue-500 text-white"
          : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500")
      }
    >
      {label}
    </button>
  );
}
