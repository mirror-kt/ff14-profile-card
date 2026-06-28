export const PLAY_TIMES = [
  "平日昼",
  "平日夜",
  "休日昼",
  "休日夜",
  "不定期",
  "暮らしてる",
] as const;

export type PlayTime = (typeof PLAY_TIMES)[number];

export const PLAY_STYLES = [
  "レベリング💪",
  "レイド😈",
  "クラフター✂️",
  "採集⛏釣り🎣",
  "PvP⚔︎",
  "SS📸",
  "ミラプリ👗",
  "おしゃべり💬",
  "ハウジング🏡",
  "麻雀🀄️",
  "演奏🎹",
  "のんびり🐢",
  "地図🗺",
  "金策💰",
  "モブハント📜",
  "ロールプレイ🎭",
  "VC可🎤",
  "無人島開拓🏝",
] as const;

export type PlayStyle = (typeof PLAY_STYLES)[number];
