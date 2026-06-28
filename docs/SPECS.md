FF14のLodestoneの情報から、プロフィールカードの画像(png形式)を生成する静的サイトを作成してください。

## 技術スタック

- pnpm (workspaces で SPA と Worker を管理)
- React SPA
- ofetch (https://github.com/unjs/ofetch)
- Cloudflare Workers (Lodestone プロキシ用)
- satori (https://github.com/vercel/satori) — HTML/JSX から SVG を生成
- @resvg/resvg-wasm — SVG を PNG にラスタライズ (ブラウザで実行)
- Tailwind CSS — スタイリング (satori の `tw` プロパティ経由で利用)

## プロフィールカードに表示する情報

- キャラクター名
- メインジョブ
- データセンター名・ワールド名
- プレイスタイル
- ジョブアイコンと各ジョブのレベル
- 背景として任意の画像

実際の例: [example.png](./example.png)

### 背景画像

- ユーザがローカルからアップロードした画像をそのまま背景として使用する
- アップロード方式: `<input type="file" accept="image/*">` によるファイル選択
- 画像はサーバには送らず、ブラウザ内でのみ扱う (`FileReader` または `URL.createObjectURL` で読み込み、satori には dataURL / ArrayBuffer で渡す)

### メインジョブ

ユーザが @docs/JOBS.md の固定選択肢から単一選択する。
カード上部にハイライト表示する用途で、各ジョブのレベル一覧自体は Lodestone から取得する。

### サブジョブ

ユーザが @docs/JOBS.md の固定選択肢から複数選択する。
メインジョブと同様にハイライト表示の用途。

### プレイ時間帯

ユーザが以下の固定選択肢から選択する (Lodestone からは取得しない)。

- 平日昼
- 平日夜
- 休日昼
- 休日夜
- 不定期
- 暮らしてる

複数選択可とする。

### プレイスタイル

ユーザが以下の固定選択肢から選択する (Lodestoneからは取得しない)。


- レベリング💪
- レイド😈
- クラフター✂️
- 採集⛏釣り🎣
- PvP⚔︎
- SS📸
- ミラプリ👗
- おしゃべり💬
- ハウジング🏡
- 麻雀🀄️
- 演奏🎹
- のんびり🐢
- 地図🗺
- 金策💰
- モブハント📜
- ロールプレイ🎭
- VC可🎤
- 無人島開拓🏝

複数選択可とする。

## 画像生成方式

カード画像の生成は以下のパイプラインで行う。すべてブラウザ上で完結させる。

1. プロフィールカードのレイアウトを React コンポーネントとして JSX で記述
2. satori に JSX を渡して SVG を生成
3. `@resvg/resvg-wasm` で SVG を PNG にラスタライズ
4. 生成された PNG を Blob として `<a download>` でユーザにダウンロードさせる

### 出力サイズ

- **1200 × 630 px** (OGP 標準サイズ、1x)
- Twitter / Discord 等にそのまま OGP として貼り付け可能

### ジョブアイコン

- ジョブアイコン画像は SPA の `public/` に同梱する
- 事前に Lodestone または公式素材から取得しておき、ファイル名は Lodestone のジョブ ID もしくは英語ジョブ名に統一する
- CORS や外部依存を排除でき、satori からも高速に読み込める

### スタイリング方針

- satori はインライン style と、Tailwind 互換の `tw` プロパティをサポートする
- スタイリングは原則 Tailwind のクラスを `tw` プロパティで指定する形に統一する
- satori の CSS サポートは限定的 (flexbox/絶対配置中心、`float` や `grid` 不可) であることに留意する
- 通常 UI (入力フォーム等) のスタイリングにも Tailwind を使用する

### フォント

- satori は Web フォントを自動取得しないため、フォントファイル (`.ttf` / `.otf` / `.woff`) を fetch し `ArrayBuffer` で satori に渡す必要がある

### 絵文字 (Twemoji)

プレイスタイル選択肢に絵文字が含まれるため、カード画像にも絵文字を描画する。
satori はデフォルトでは絵文字を描画できないので、Twemoji (https://github.com/twitter/twemoji) の SVG をカスタムアセットとして注入する。

**実装方針:**

- satori の `loadAdditionalAsset` コールバック (`type === 'emoji'` のケース) で対象絵文字を検出する
- 該当絵文字のコードポイントから Twemoji の SVG URL を組み立て、fetch して dataURL として satori に返す
- 取得元: `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/{codepoint}.svg`
- フォントと同様に、取得済み Twemoji SVG は SPA 側でメモリキャッシュする
- CORS / 取得安定性のため、必要に応じて Cloudflare Worker 経由でプロキシ + Cache API でキャッシュする

#### ユーザ選択式フォント (jsdelivr 経由 @fontsource WOFF 取得)

ユーザがフォントを一覧から選択し、選択されたフォントのみを jsdelivr 経由で取得する構成とする。
satori は WOFF を読めるため、Cloudflare Worker による中継は不要 (SPA から直接 fetch する)。

**取得経路:**

```
SPA
  ↓ GET https://cdn.jsdelivr.net/npm/@fontsource/{slug}/files/{slug}-{subset}-{weight}-normal.woff
jsdelivr CDN (@fontsource パッケージの WOFF を CORS 付きで配信)
  ↓
SPA に WOFF を ArrayBuffer で返す → satori に渡す
```

**理由:**

- `@fontsource` が npm 上で各 Google Fonts の TTF/WOFF/WOFF2 をパッケージング配布しており、jsdelivr 経由で個別の WOFF ファイルを直接ダウンロード可能
- jsdelivr は CORS を許可しているため、ブラウザの SPA から直接 fetch できる
- Google Fonts CSS API は UA に応じて形式を切替えるが、ブラウザの UA を上書きできないため SPA からは WOFF2 しか取れず satori で使えない → これを回避する目的での Worker プロキシは不要に

**選択可能フォント一覧:**

- 日本語対応フォントの数十個程度をホワイトリストとして SPA 側 (`apps/web/src/data/fonts.ts`) にハードコード
- 例: Noto Sans JP / Noto Serif JP / M PLUS 1p / Kosugi Maru / Sawarabi Gothic / Zen Maru Gothic 等
- 各フォントに `slug` (@fontsource パッケージ名) と `subsets` (例: `["japanese", "latin"]`) を持たせ、サブセットごとに WOFF を取得して satori に渡す

**UX 上の留意:**

- 日本語フォントは subset ごとに数百 KB 〜 MB あり、選択時にローディング表示を出す
- 一度取得したフォントは SPA 側でメモリキャッシュし、再選択時の待ち時間を排除する

## Lodestoneからの情報取得について

以下の 2 ページをスクレイピングする。

- `https://jp.finalfantasyxiv.com/lodestone/character/{character_id}/` — キャラクター名、データセンター名、ワールド名 を取得
- `https://jp.finalfantasyxiv.com/lodestone/character/{character_id}/class_job/` — 各ジョブのアイコンとレベルを取得

CSS セレクタは以下を参考にする。

- プロフィールトップ用: https://github.com/xivapi/lodestone-css-selectors/blob/main/profile/character.json
- クラスジョブ用: https://github.com/xivapi/lodestone-css-selectors/blob/main/profile/classjob.json

### キャラクター ID の入力

- ユーザが Lodestone のキャラクター ID (数字列) を直接入力する
- URL 貼り付けやキャラクター名検索は実装しない
- バリデーション: 数字のみ、桁数チェック程度

### エラーハンドリング

主要 3 ケースを Worker 側で判別し、SPA に明示的なエラーコードを返して UI 表示する。

| ケース | 判別方法 | UI 表示例 |
|---|---|---|
| 存在しないキャラクター ID | Lodestone が 404 を返す | 「指定された ID のキャラクターは見つかりませんでした」 |
| Private プロフィール | プロフィール要素が取得できない (CSS セレクタが空) | 「このキャラクターのプロフィールは非公開です」 |
| Lodestone メンテナンス中 | Lodestone が 5xx またはメンテ用 HTML を返す | 「Lodestone がメンテナンス中です。しばらく経ってからお試しください」 |

その他のネットワークエラー等はシンプルに「取得に失敗しました」と表示する。

### CORS対策: Cloudflare Workers プロキシ

Lodestone は `Access-Control-Allow-Origin` を返さないため、ブラウザの React SPA から直接 fetch することはできない。
これを解決するため、Cloudflare Workers でプロキシを実装する。

- Worker がサーバサイドで Lodestone に fetch し、レスポンスに `Access-Control-Allow-Origin` を付与してブラウザへ返す
- 同一キャラクターへの繰り返しリクエストは Cloudflare の Cache API でキャッシュし、Lodestone への負荷を下げる
- SPA からは Worker のエンドポイント (例: `https://<worker>.workers.dev/character/{character_id}/class_job`) を ofetch で叩く
- HTML パース (CSS セレクタ適用) は Worker 側で行い、SPA には JSON で必要な情報のみ返すことを推奨

### リポジトリ構成

SPA と Worker を pnpm workspaces で 1 リポジトリ管理する。

```
.
├── apps/
│   ├── web/      # React SPA
│   └── proxy/    # Cloudflare Workers (Lodestone プロキシ)
└── pnpm-workspace.yaml
```

## デプロイ

- SPA: **Cloudflare Pages**
- プロキシ Worker: **Cloudflare Workers**
- いずれも `wrangler` で管理し、GitHub Actions で main ブランチへのマージ時に自動デプロイする
- 同一ドメイン (例: `<project>.pages.dev` 配下に Pages Functions/Workers Routes で API を生やす) にまとめて CORS 設定を簡素化することを推奨
