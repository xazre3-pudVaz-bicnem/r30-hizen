# R-30 hizen 公式サイト

札幌・すすきのの鮨店「R-30 hizen」の公式サイトです。
Next.js（App Router）＋ TypeScript ＋ Tailwind CSS。GitHub に push すると Vercel が公開します。WordPress もデータベースも使いません。

- 本番: https://hizen-susukino.com （www なし）
- 店舗への確認事項と保留にしていること: [docs/TODO.md](docs/TODO.md)
- キーワードマップ: [docs/KEYWORD_MAP.md](docs/KEYWORD_MAP.md)

## 動かす

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 本番ビルド
npm run check        # 型・Lint・SEO の設計・自動投稿の自己点検・記事の点検をまとめて
```

Node.js 20.9 以上。

## 公開の手順（GitHub → Vercel）

1. GitHub に空のリポジトリを作り、このフォルダーを push する（ブランチは `main`）
2. Vercel で「Add New → Project」から、そのリポジトリを取り込む。設定は既定のままでよい（環境変数は不要）
3. Vercel の Domains に `hizen-susukino.com` を追加し、**www なしを主**にする。`www.hizen-susukino.com` を足す場合は、www → www なし へ転送する
   （旧サイトは www なしで公開されており、www は名前解決されていません。canonical・sitemap も www なしで出ます）
4. DNS を Vercel に向ける。切り替えるまでは、旧サイトがそのまま表示されます
5. 公開できたら、次の4つを自分の目で確かめる
   - `https://hizen-susukino.com/robots.txt` が `Allow: /` になっている
   - `https://hizen-susukino.com/sitemap.xml` にページが並んでいる
   - トップのソースに `<link rel="canonical" href="https://hizen-susukino.com">` がある
   - 旧 URL（`/concept.html` など）が新しいページへ転送される
6. Search Console で sitemap を送信する（所有権確認のタグは旧サイトのものを引き継いでいます）
7. 自動投稿を動かす場合は、GitHub の Settings → Secrets and variables → Actions に `ANTHROPIC_API_KEY` を登録する

プレビュー（`*.vercel.app`）と手元では、canonical と sitemap を出さず、全ページ noindex になります。
本番の URL は `next.config.ts` の `PRODUCTION_URL` で決めています。ドメインを変えるときは、そこを直します。

## 店舗の情報を直すとき

**ページのファイルに、住所・電話番号・料金・年齢の決まりを直接書かないでください。** 次のファイルだけを直します。
画面の表示、構造化データ（JSON-LD）、自動投稿に渡す「店の事実」が、まとめて変わります。

| 直したいもの | ファイル |
| --- | --- |
| 店名・住所・電話番号・営業時間・アクセス・予約先・お支払い・お知らせ | `data/site.ts` |
| 年齢の決まり（30歳未満入店不可）・香りの決まり | `data/site.ts` の `agePolicy` / `fragrancePolicy` |
| コースの名前・料金・品数・内容 | `data/courses.ts` |
| よくあるご質問（画面と構造化データの両方） | `data/faq.ts` |
| ページごとの title・description・担当する検索語 | `data/pages.ts` |
| 写真の説明（alt） | `data/photos.ts` |

直したあとは `npm run check` を実行します。料金を変えた場合は、古い料金を書いた記事があれば、そこで見つかります。

## 写真を足すとき

1. 元の写真を `assets/source-photos/` に置く（**店舗が所有していると確認できた写真だけ**。他店や素材サイトの写真、生成した料理写真は使わない）
2. `scripts/prepare-images.mjs` の `JOBS` に1行足して `npm run images:prepare`（`public/images/` に、内容が分かる名前で書き出されます）
3. `data/photos.ts` に、写っているものを説明する alt を書く
4. 記事の見出し写真や OGP に使うなら、`scripts/make-og.mjs` にも足して `npm run og:make`

## 構成

```
app/
  (home)/page.tsx          トップ（最初の画面に、予約などのリンクやボタンは置かない）
  (pages)/                 下層ページ。1ページ＝1つの検索意図
    concept cuisine omakase drink space access reservation
    susukino-sushi anniversary date business-dinner omakase-sushi counter-sushi adult-sushi solo
    journal/               季節の便り（一覧・記事・分類・RSS・記事ごとの OGP 画像）
  sitemap.ts robots.ts     記事を足すと、自動で反映される
components/                layout（ヘッダー・フッター）／sections（区画）／ui（部品）
data/                      店舗情報・コース・ページの登録・題材（＝正本）
lib/                       SEO（canonical・OGP）・構造化データ・記事の読み出し
content/journal/           記事（Markdown）
scripts/journal/           自動投稿（題材選び・指示文・検査）
scripts/seo/               SEO の設計の点検・キーワードマップ
.github/workflows/         毎日の自動投稿
```

各ページのファイルの先頭に、「担当する検索語」と「ここでは書かないこと」をコメントで残してあります。加筆するときは、そこを先に読んでください。同じ検索語を2ページで取り合わないための決まりです。

## 季節の便り（毎日の自動投稿）

GitHub Actions が毎朝（日本時間 9:17 ごろ）、Claude API で記事を1本書き、検査に通ったものだけを `content/journal/` に追加して push します。push を受けて Vercel がビルドし、記事・sitemap・RSS が公開されます。

**Vercel Cron とデータベースを使わなかった理由**: 記事を Git の中の Markdown として持てば、公開されるページはすべて静的になり（表示が最も速い）、記事は履歴つきで残り、手で直すこともできます。実行時にデータベースへ取りに行く部分が無いので、止まる場所がありません。Vercel の実行環境からリポジトリへ書き込む作りにもなっていません（書き込むのは GitHub Actions です）。

### 流れ

1. 今日の分がすでにあれば、何もしない
2. 題材を1つ選ぶ（`data/journal-topics.ts`。使った検索語・直近2本の分類と重ならないもの。季節の題材はその月にだけ）
3. 書き方の型を1つ選ぶ（随筆・問い・段取り・比較など7種類。直近3本と違うもの）
4. Claude に書かせる。店について書いてよい事実は `data/site.ts`・`data/courses.ts` から組み立てて渡す
5. 検査する（`scripts/journal/lib/validate.ts`）。落ちたら、指摘した所だけを直させる（最大4回）
6. 通ったときだけ保存する。**通らなければ、その日は公開しない**（ジョブは失敗として残ります）

### 検査していること

- 定型表現（「いかがでしたか」「〜なのです」「この記事では」「ぜひチェック」など）
- 根拠のない表現（「一番」「人気」「絶品」、口コミ、受賞、ランキング）
- 店について：事実に無い数値・金額、確認できていない設備やサービス（個室・夜景・サプライズ・産地・仕入先・店主の経歴など）
- 内部リンク：固定ページ 2〜4本＋関連記事 2〜4本、柱のページへのリンク、リンク先の実在
- 重複：題名・説明文・本文（8文字の連なりの重なり）・見出しの立て方・担当する検索語（固定ページとも照合）

同じ検査を、公開済みの全記事にも掛けられます（`npm run journal:audit`）。

### 手元で試す

```bash
cp .env.example .env.local        # ANTHROPIC_API_KEY を入れる（.env.local は Git に入りません）
npm run journal:dry-run           # 1本書いて検査する。保存はしない
npm run journal:selftest          # API を使わない自己点検（検査が、違反を落とすか）

# API を使わずに、保存まで通して試す
DRY_RUN_FIXTURE=scripts/journal/fixtures/nitsume-toha.json JOURNAL_TOPIC=nitsume-toha \
  JOURNAL_WRITE_DIR=tmp-journal npm run journal:generate
```

GitHub の画面からも試せます。Actions →「季節の便り（毎日1本）」→ Run workflow で「試し書き」にチェックを入れると、保存も公開もせず、原稿がログに出ます。

### 設定

| 名前 | 置き場所 | 内容 |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | GitHub の **Secrets**（手元は `.env.local`） | 必須。リポジトリには絶対に入れない |
| `CLAUDE_MODEL` | GitHub の **Variables** | 使うモデル。省くと `claude-haiku-4-5` |

費用の目安（見込み）: Haiku 4.5 で、1本あたりおおよそ数円〜20円ほど（書き直しの回数で変わります）。

### 止める・題材を足す

- 止める: GitHub の Actions で、このワークフローを Disable にする
- 題材を足す: `data/journal-topics.ts` に1行足す（`npm run journal:selftest` が、重複や固定ページとの食い合いを確かめます）
- 手で記事を書く: `content/journal/<slug>.md` を置く。frontmatter は既存の記事を参考に（`author: "editor"`）

## 点検

| コマンド | 見ること |
| --- | --- |
| `npm run check` | 型・Lint・下の3つ |
| `npm run seo:audit` | 検索語の食い合い、title・description の重複と長さ、住所や料金がページに直接書かれていないか |
| `npm run journal:selftest` | 題材の一覧、事実シート、検査が違反を落とすか（API は使わない） |
| `npm run journal:audit` | 公開済みの全記事を、自動投稿と同じ基準で点検 |
| `npm run site:check` | ビルドしたサイトを実際に叩く：全ページ 200、h1 は1つ、canonical、OGP、JSON-LD の住所が正本と一致、移転前の住所が無い、alt、ヒーローにリンクやボタンが無い、内部リンク切れ、旧 URL の転送、robots・sitemap |
| `npm run seo:map -- --write` | `docs/KEYWORD_MAP.md` を作り直す |

`site:check` は、サーバーを立ててから実行します。

```bash
NEXT_PUBLIC_SITE_URL=https://hizen-susukino.com npm run build
npx next start -p 4318          # 別の端末で
npm run site:check
```

## デザインの決まり

- 色: 地 `#0A0A0A` `#111111` `#161616`／文字 `#F2EFE9` `#D8D2C8`／鈍い真鍮 `#A89169` をごく少量（`app/globals.css` の `@theme`）
- 写真・文字・余白で組む。カード、角丸、影、飾りの線、アイコン、絵文字、光るボタンは使わない
- 和文は端末の明朝（Webフォントは読み込まない）。欧文の数字と小さなラベルだけ Cormorant Garamond
- トップの最初の画面には、行動を促すもの（予約・お問い合わせ・詳しく見る）を置かない。ヘッダーの「ご予約」も、最初の画面では出ない
- スマートフォンの下に固定の予約ボタンは置かない。予約は、ヘッダーの「ご予約」と各ページの終わりから
- 下層ページは `components/sections/Blocks.tsx` の部品で組む（ページごとに見た目を変えない）
