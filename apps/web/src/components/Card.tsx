import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { Job, JobRole } from "../data/jobs";

export type CardJob = {
  name: string;
  level: string;
  iconUrl: string | null;
  role: JobRole;
};

export type PanelPosition = "right" | "left" | "top" | "bottom";
export type PanelTheme = "dark" | "light";

export type CardProps = {
  characterName: string;
  world: string;
  dataCenter: string;
  mainJob: Job | null;
  subJobs: Job[];
  playTimes: string[];
  playStyles: string[];
  jobs: CardJob[];
  backgroundDataUrl: string | null;
  panelPosition: PanelPosition;
  panelTheme: PanelTheme;
};

type Palette = {
  panelBg: string;
  text: string;
  label: string;
  faint: string;
  divider: string;
};

const PALETTES: Record<PanelTheme, Palette> = {
  dark: {
    panelBg: "rgba(12, 14, 20, 0.82)",
    text: "#f3f3f5",
    label: "#ff7088",
    faint: "rgba(243, 243, 245, 0.65)",
    divider: "rgba(255, 112, 136, 0.45)",
  },
  light: {
    panelBg: "rgba(248, 246, 244, 0.86)",
    text: "#1f1f24",
    label: "#c93b54",
    faint: "rgba(31, 31, 36, 0.6)",
    divider: "rgba(201, 59, 84, 0.4)",
  },
};

const ROLE_ORDER: JobRole[] = ["tank", "healer", "melee", "ranged", "caster", "gatherer", "crafter"];

export function Card(props: CardProps): ReactElement {
  const palette = PALETTES[props.panelTheme];
  const isHorizontal = props.panelPosition === "top" || props.panelPosition === "bottom";

  const panelStyle = buildPanelStyle(props.panelPosition, palette);

  const jobGroups = ROLE_ORDER.map((role) => ({
    role,
    jobs: props.jobs.filter((j) => j.role === role),
  })).filter((g) => g.jobs.length > 0);

  const today = new Date();
  const dateStr = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        position: "relative",
        fontFamily: "Sans",
        backgroundColor: "#111",
      }}
    >
      {props.backgroundDataUrl && (
        <img
          src={props.backgroundDataUrl}
          width={1200}
          height={630}
          style={{ position: "absolute", inset: 0, objectFit: "cover" }}
        />
      )}

      <div style={panelStyle}>
        {isHorizontal
          ? <HorizontalContent {...props} jobGroups={jobGroups} dateStr={dateStr} palette={palette} />
          : <VerticalContent {...props} jobGroups={jobGroups} dateStr={dateStr} palette={palette} />}
      </div>
    </div>
  );
}

type ContentProps = CardProps & {
  jobGroups: { role: JobRole; jobs: CardJob[] }[];
  dateStr: string;
  palette: Palette;
};

function VerticalContent(props: ContentProps) {
  const { palette } = props;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <div
        style={{
          fontSize: 42, fontWeight: 700, lineHeight: 1, letterSpacing: 1,
          marginBottom: 8, display: "flex",
        }}
      >
        {props.characterName || "—"}
      </div>

      <Divider palette={palette} />

      <div style={{ display: "flex", marginTop: 6, marginBottom: 6 }}>
        <ColumnSection label="メインジョブ" palette={palette}>
          <MainJobValue mainJob={props.mainJob} />
        </ColumnSection>
        <ColumnSection label="ワールド" palette={palette}>
          <span style={{ fontSize: 18 }}>{worldLabel(props.world, props.dataCenter)}</span>
        </ColumnSection>
      </div>

      <Divider palette={palette} />

      <RowSection label="プレイ時間帯" marginTop={6} marginBottom={6} palette={palette}>
        <JoinedList items={props.playTimes} separator="、" fontSize={16} palette={palette} />
      </RowSection>

      <Divider palette={palette} />

      <RowSection label="プレイスタイル" marginTop={6} marginBottom={8} palette={palette}>
        <JoinedList items={props.playStyles} separator="、" fontSize={15} palette={palette} />
      </RowSection>

      <Divider palette={palette} />

      <JobGrid groups={props.jobGroups} iconSize={30} marginTop={8} gap={4} />

      <Copyright dateStr={props.dateStr} palette={palette} />
    </div>
  );
}

function HorizontalContent(props: ContentProps) {
  const { palette } = props;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <div style={{
        fontSize: 38, fontWeight: 700, lineHeight: 1, letterSpacing: 1,
        marginBottom: 8, display: "flex",
      }}>
        {props.characterName || "—"}
      </div>

      <Divider palette={palette} />

      <div style={{ display: "flex", flex: 1, marginTop: 10, gap: 0 }}>
        {/* Column 1: 基本情報 */}
        <div style={{
          display: "flex", flexDirection: "column", width: 240,
          paddingRight: 18, gap: 14,
        }}>
          <RowSection label="メインジョブ" palette={palette}>
            <MainJobValue mainJob={props.mainJob} />
          </RowSection>
          <RowSection label="ワールド" palette={palette}>
            <span style={{ fontSize: 17 }}>{worldLabel(props.world, props.dataCenter)}</span>
          </RowSection>
        </div>

        {/* Column 2: プレイ情報 */}
        <div style={{
          display: "flex", flexDirection: "column", flex: 1,
          paddingLeft: 18, paddingRight: 18, gap: 12,
          borderLeft: `1px solid ${palette.divider}`,
        }}>
          <RowSection label="プレイ時間帯" palette={palette}>
            <JoinedList items={props.playTimes} separator="、" fontSize={15} palette={palette} />
          </RowSection>
          <RowSection label="プレイスタイル" palette={palette}>
            <JoinedList items={props.playStyles} separator="、" fontSize={14} palette={palette} />
          </RowSection>
        </div>

        {/* Column 3: ジョブレベル */}
        <div style={{
          display: "flex", flexDirection: "column", width: 280,
          paddingLeft: 18,
          borderLeft: `1px solid ${palette.divider}`,
        }}>
          <Label palette={palette}>ジョブレベル</Label>
          <div style={{ display: "flex", marginTop: 6 }}>
            <JobGrid groups={props.jobGroups} iconSize={22} marginTop={0} gap={2} />
          </div>
        </div>
      </div>

      <Copyright dateStr={props.dateStr} palette={palette} />
    </div>
  );
}

function buildPanelStyle(position: PanelPosition, palette: Palette): CSSProperties {
  const common: CSSProperties = {
    position: "absolute",
    backgroundColor: palette.panelBg,
    display: "flex",
    flexDirection: "column",
    color: palette.text,
    overflow: "hidden",
  };
  switch (position) {
    case "right":
      return { ...common, top: 0, right: 0, bottom: 0, width: "50%", padding: "20px 30px 22px" };
    case "left":
      return { ...common, top: 0, left: 0, bottom: 0, width: "50%", padding: "20px 30px 22px" };
    case "top":
      return { ...common, top: 0, left: 0, right: 0, height: "50%", padding: "18px 28px 20px" };
    case "bottom":
      return { ...common, bottom: 0, left: 0, right: 0, height: "50%", padding: "18px 28px 20px" };
  }
}

function MainJobValue({ mainJob }: { mainJob: Job | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {mainJob && (
        <img src={`/jobs/${mainJob.iconId}.png`} width={20} height={20} />
      )}
      <span style={{ fontSize: 18 }}>{mainJob?.name ?? "—"}</span>
    </div>
  );
}

function worldLabel(world: string, dataCenter: string): string {
  if (!world) return "—";
  return `${world}${dataCenter ? `(${dataCenter})` : ""}`;
}

function JobGrid({
  groups, iconSize, marginTop, gap,
}: {
  groups: { role: JobRole; jobs: CardJob[] }[];
  iconSize: number;
  marginTop: number;
  gap: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, marginTop }}>
      {groups.map((group) => (
        <div key={group.role} style={{ display: "flex", gap }}>
          {group.jobs.map((j) => (
            <div
              key={j.name}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                minWidth: iconSize + 4,
              }}
            >
              {j.iconUrl && <img src={j.iconUrl} width={iconSize} height={iconSize} />}
              <span style={{ fontSize: Math.max(10, iconSize - 18), lineHeight: 1.2, marginTop: 1 }}>
                {j.level}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Copyright({ dateStr, palette }: { dateStr: string; palette: Palette }) {
  return (
    <div
      style={{
        position: "absolute", right: 14, bottom: 8,
        display: "flex", flexDirection: "column", alignItems: "flex-end",
        fontSize: 10, color: palette.faint, lineHeight: 1.3,
      }}
    >
      <span>(C)SQUARE ENIX CO., LTD. All Rights Reserved.</span>
      <span>{dateStr}</span>
    </div>
  );
}

function Divider({ palette }: { palette: Palette }) {
  return <div style={{ display: "flex", height: 1, backgroundColor: palette.divider }} />;
}

function ColumnSection({
  label, children, palette,
}: { label: string; children: ReactNode; palette: Palette }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Label palette={palette}>{label}</Label>
      <div style={{ marginTop: 4, display: "flex" }}>{children}</div>
    </div>
  );
}

function RowSection({
  label, children, marginTop = 0, marginBottom = 0, palette,
}: {
  label: string; children: ReactNode; marginTop?: number; marginBottom?: number; palette: Palette;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop, marginBottom }}>
      <Label palette={palette}>{label}</Label>
      <div style={{ marginTop: 4, display: "flex" }}>{children}</div>
    </div>
  );
}

function Label({ children, palette }: { children: ReactNode; palette: Palette }) {
  return (
    <div
      style={{
        fontSize: 10, color: palette.label, letterSpacing: 1.5,
        fontWeight: 500, display: "flex",
      }}
    >
      {children}
    </div>
  );
}

function JoinedList({
  items, separator, fontSize, palette,
}: {
  items: string[]; separator: string; fontSize: number; palette: Palette;
}) {
  if (items.length === 0) {
    return <span style={{ fontSize, color: palette.faint }}>—</span>;
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 0" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", fontSize }}>
          <div style={{ display: "flex" }}>{item}</div>
          {i < items.length - 1 && (
            <div style={{ display: "flex", marginLeft: 2, marginRight: 4 }}>{separator}</div>
          )}
        </div>
      ))}
    </div>
  );
}
