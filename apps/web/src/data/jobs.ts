export type JobRole =
  | "tank"
  | "healer"
  | "melee"
  | "ranged"
  | "caster"
  | "gatherer"
  | "crafter";

export type Job = {
  name: string;
  iconId: string;
  role: JobRole;
};

// docs/JOBS.md と対応。iconId は public/jobs/{iconId}.png として配置する。
export const JOBS: Job[] = [
  { name: "ナイト", iconId: "pld", role: "tank" },
  { name: "戦士", iconId: "war", role: "tank" },
  { name: "暗黒騎士", iconId: "drk", role: "tank" },
  { name: "ガンブレイカー", iconId: "gnb", role: "tank" },
  { name: "白魔道士", iconId: "whm", role: "healer" },
  { name: "学者", iconId: "sch", role: "healer" },
  { name: "占星術師", iconId: "ast", role: "healer" },
  { name: "賢者", iconId: "sge", role: "healer" },
  { name: "モンク", iconId: "mnk", role: "melee" },
  { name: "竜騎士", iconId: "drg", role: "melee" },
  { name: "忍者", iconId: "nin", role: "melee" },
  { name: "侍", iconId: "sam", role: "melee" },
  { name: "リーパー", iconId: "rpr", role: "melee" },
  { name: "ヴァイパー", iconId: "vpr", role: "melee" },
  { name: "魔獣使い", iconId: "btm", role: "melee" },
  { name: "吟遊詩人", iconId: "brd", role: "ranged" },
  { name: "機工士", iconId: "mch", role: "ranged" },
  { name: "踊り子", iconId: "dnc", role: "ranged" },
  { name: "黒魔道士", iconId: "blm", role: "caster" },
  { name: "召喚士", iconId: "smn", role: "caster" },
  { name: "赤魔道士", iconId: "rdm", role: "caster" },
  { name: "ピクトマンサー", iconId: "pct", role: "caster" },
  { name: "青魔道士", iconId: "blu", role: "caster" },
  { name: "採掘師", iconId: "min", role: "gatherer" },
  { name: "園芸師", iconId: "btn", role: "gatherer" },
  { name: "漁師", iconId: "fsh", role: "gatherer" },
  { name: "木工師", iconId: "crp", role: "crafter" },
  { name: "鍛冶師", iconId: "bsm", role: "crafter" },
  { name: "甲冑師", iconId: "arm", role: "crafter" },
  { name: "彫金師", iconId: "gsm", role: "crafter" },
  { name: "革細工師", iconId: "ltw", role: "crafter" },
  { name: "裁縫師", iconId: "wvr", role: "crafter" },
  { name: "錬金術師", iconId: "alc", role: "crafter" },
  { name: "調理師", iconId: "cul", role: "crafter" },
];

// Lodestone は「斧術士」「弓術士」など旧クラス名を返すことがあるため、
// 対応するジョブにマップする。
const CLASS_ALIAS: Record<string, string> = {
  剣術士: "ナイト",
  斧術士: "戦士",
  格闘士: "モンク",
  槍術士: "竜騎士",
  双剣士: "忍者",
  弓術士: "吟遊詩人",
  幻術士: "白魔道士",
  巴術士: "召喚士",
  呪術士: "黒魔道士",
};

export const JOBS_BY_NAME: Record<string, Job> = Object.fromEntries([
  ...JOBS.map((j) => [j.name, j] as const),
  ...Object.entries(CLASS_ALIAS).flatMap(([alias, jobName]) => {
    const job = JOBS.find((j) => j.name === jobName);
    return job ? [[alias, job] as const] : [];
  }),
]);
