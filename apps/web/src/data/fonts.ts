export type FontDef = {
  family: string;
  slug: string; // @fontsource パッケージ名
  label: string;
  weights: string[];
  subsets: string[]; // 取得する subset (japanese, latin など)
};

// 日本語対応の Google Fonts (jsdelivr 経由で @fontsource WOFF を取得)
export const FONTS: FontDef[] = [
  {
    family: "Noto Sans JP",
    slug: "noto-sans-jp",
    label: "Noto Sans JP",
    weights: ["400", "700"],
    subsets: ["japanese", "latin"],
  },
  {
    family: "Noto Serif JP",
    slug: "noto-serif-jp",
    label: "Noto Serif JP",
    weights: ["400", "700"],
    subsets: ["japanese", "latin"],
  },
  {
    family: "M PLUS 1p",
    slug: "m-plus-1p",
    label: "M PLUS 1p",
    weights: ["400", "700"],
    subsets: ["japanese", "latin"],
  },
  {
    family: "M PLUS Rounded 1c",
    slug: "m-plus-rounded-1c",
    label: "M PLUS Rounded 1c",
    weights: ["400", "700"],
    subsets: ["japanese", "latin"],
  },
  {
    family: "Kosugi Maru",
    slug: "kosugi-maru",
    label: "Kosugi Maru",
    weights: ["400"],
    subsets: ["japanese", "latin"],
  },
  {
    family: "Sawarabi Gothic",
    slug: "sawarabi-gothic",
    label: "Sawarabi Gothic",
    weights: ["400"],
    subsets: ["japanese", "latin"],
  },
  {
    family: "Sawarabi Mincho",
    slug: "sawarabi-mincho",
    label: "Sawarabi Mincho",
    weights: ["400"],
    subsets: ["japanese", "latin"],
  },
  {
    family: "Zen Maru Gothic",
    slug: "zen-maru-gothic",
    label: "Zen Maru Gothic",
    weights: ["400", "700"],
    subsets: ["japanese", "latin"],
  },
  {
    family: "Zen Kaku Gothic New",
    slug: "zen-kaku-gothic-new",
    label: "Zen Kaku Gothic New",
    weights: ["400", "700"],
    subsets: ["japanese", "latin"],
  },
  {
    family: "Yusei Magic",
    slug: "yusei-magic",
    label: "Yusei Magic",
    weights: ["400"],
    subsets: ["japanese", "latin"],
  },
  {
    family: "Kaisei Decol",
    slug: "kaisei-decol",
    label: "Kaisei Decol",
    weights: ["400", "700"],
    subsets: ["japanese", "latin"],
  },
  {
    family: "Shippori Mincho",
    slug: "shippori-mincho",
    label: "Shippori Mincho",
    weights: ["400", "700"],
    subsets: ["japanese", "latin"],
  },
];
