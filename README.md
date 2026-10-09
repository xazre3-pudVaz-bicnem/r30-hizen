# R-30 hizen 公式サイト

札幌・すすきのの鮨店「R-30 hizen」の公式サイトです。
Next.js（App Router）＋ TypeScript ＋ Tailwind CSS。GitHub に push すると Vercel が公開します。WordPress もデータベースも使いません。

- 本番: <https://www.hizen-susukino.jp> （www あり。www なしの `hizen-susukino.jp` は、www ありへ転送されます）
- 確認用: <https://r30-hizen.vercel.app> （本番と同じ内容。検索エンジンには載らない設定）
- 旧サイト: <https://hizen-susukino.com> （別のドメイン。残したまま運用する方針です。下の「旧サイトとの併存」を参照）
- 店舗への確認事項と保留にしていること: [docs/TODO.md](docs/TODO.md)
- 検索意図マップ（どのページがどの検索語を担当するか）: [docs/KEYWORD_MAP.md](docs/KEYWORD_MAP.md)
- 全 URL の title・description・h1・canonical の一覧: [docs/URL_INVENTORY.md](docs/URL_INVENTORY.md)

## 動かす

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 本番ビルド
npm run check        # 型・Lint・SEO の設計・自動投稿の自己点検・記事の点検をまとめて
```

Node.js 20.9 以上。

## 本番のドメイン

本番は `https://www.hizen-susukino.jp` です。
URL は `next.config.ts` の `PRODUCTION_URL` の1か所で決めています。metadataBase・canonical・og:url・sitemap・robots・構造化データ・RSS の URL は、すべてここから作られます。ドメインを変えるときは、そこだけを直します。

Vercel の環境変数に `NEXT_PUBLIC_SITE_URL` は入れないでください。入れるとそちらが優先され、`PRODUCTION_URL` を直しても変わらなくなります。

### 公開したあとに確かめること

push して Vercel の公開が済んだら、本番そのものに点検を掛けます。

```bash
BASE=https://www.hizen-susukino.jp npm run site:check
```

配信しているドメインと canonical の向き先が同じか、robots.txt・sitemap.xml・OGP 画像・構造化データの URL が本番のドメインになっているかを、まとめて確かめます。
**ドメインを変えたとき・つなぎ直したときは、必ず実行してください。** 2026年10月に、canonical・OGP・sitemap が旧サイトのドメインを指したまま公開されていたことがあります（`PRODUCTION_URL` が旧ドメインのままでした）。

目で確かめるなら、次の2つです。

- `https://www.hizen-susukino.jp/robots.txt` に `Sitemap: https://www.hizen-susukino.jp/sitemap.xml` の行がある
- トップのソースに `<link rel="canonical" href="https://www.hizen-susukino.jp">` がある

Vercel のビルドログに「canonical の向き先が、Vercel につないである本番ドメインと違います」と出たら、`PRODUCTION_URL` を確かめます。

### 旧サイトとの併存

旧サイト（`hizen-susukino.com`）は別のドメインにあり、**残したまま運用する方針**です（2026-10-09）。新しいサイトへの転送はしないので、公式サイトが2つある形になります。

- 旧サイトが持っている検索結果での評価や被リンクは、新しいサイトへは移りません。新しいドメインは、評価のない状態から始まります
- 旧サイトの側で直しておきたいこと（予約ボタンのリンク切れ、構造化データに残っている移転前の住所）と、Google ビジネスプロフィールの「Web サイト」をどちらにするかは、[docs/TODO.md](docs/TODO.md) の F にまとめてあります
- Search Console には、新しいドメインを別のプロパティとして登録し、`https://www.hizen-susukino.jp/sitemap.xml` を送信します。
  所有権の確認タグは旧サイトのものが入っています。新しいドメインで確認できなければ、Search Console に表示されたタグの値を `data/restaurant.ts` の `googleSiteVerification` に入れます
- `next.config.ts` の `LEGACY_REDIRECTS`（旧サイトの URL → 新しいページ）は、いまは使われません。**将来、旧サイトを閉じることになったとき**のために残してあります。
  そのときは、閉じる前に、旧サイトの URL をパスを付けたまま `https://www.hizen-susukino.jp/…` へ 301 で転送してもらいます（`/course.html` などは、この表が内容の近いページへ送ります）。ドメインごと引き取れる場合は、Vercel のこのプロジェクトに追加して、`www.hizen-susukino.jp` への転送に設定します

### 検索エンジンに載る・載らないの決まり

| 配信される場所 | canonical・sitemap | index |
| --- | --- | --- |
| `www.hizen-susukino.jp`（本番） | `https://www.hizen-susukino.jp/...` | 載る |
| `*.vercel.app`（本番デプロイの別名・プレビュー） | 本番のデプロイなら本番の URL／プレビューは出さない | **載らない**（`X-Robots-Tag: noindex` を必ず付ける。プレビューは `<meta name="robots" content="noindex">` と robots.txt の `Disallow` も） |
| 手元 | 出さない | 載らない |

## 店舗の情報を直すとき

**店名・住所・電話番号・営業時間・年齢の決まり・予約の決まり・コースの料金は、`data/restaurant.ts` の1ファイルにしかありません。**
ページや部品のファイル、自動投稿の指示文に直接書かないでください（書くと `npm run seo:audit` が止めます）。
このファイルを直せば、画面の表示、構造化データ（JSON-LD）、自動投稿に渡す「店の事実」が、まとめて変わります。

| 直したいもの | 場所 |
| --- | --- |
| 店名・住所・電話番号・営業時間・アクセス・座標・予約先・席・お支払い・お知らせ | `data/restaurant.ts` → `restaurant` / `notices` |
| 年齢の決まり（30歳未満入店不可）・香りの決まり | `data/restaurant.ts` → `agePolicy` / `fragrancePolicy` |
| コースの名前・料金・品数・内容・滞在時間 | `data/restaurant.ts` → `courses` |
| Google ビジネスプロフィールの登録内容（突き合わせ用） | `data/restaurant.ts` → `restaurant.googleBusinessProfile` |
| よくあるご質問（画面と構造化データの両方） | `data/faq.ts` |
| ページごとの title・description・担当する検索語・メニュー | `data/pages.ts` |
| 写真の説明（alt） | `data/photos.ts` |
| 店から聞き取った一次情報（今週の魚・仕込みなど。記事の材料） | `data/shop-notes.ts` |

直したあとは `npm run check` を実行します。料金を変えた場合は、古い料金を書いた記事があれば、そこで見つかります。

## 写真を足すとき

1. 元の写真を `assets/source-photos/` に置く（**店舗が所有していると確認できた写真だけ**。他店や素材サイトの写真、生成した料理写真は使わない）
2. `scripts/prepare-images.mjs` の `JOBS` に1行足して `npm run images:prepare`（`public/images/` に、内容が分かる名前で書き出されます）
3. `data/photos.ts` に、写っているものを説明する alt を書く
4. 記事の見出し写真や OGP に使うなら、`scripts/make-og.mjs` にも足して `npm run og:make`

大きく使えるのは、元の幅が 1,500px 以上ある写真です。幅 870px の写真（`sushi03` `sushi04` `chef03` `omakase01` など）は、画面の 4 割ほどまでの大きさで使っています。

## 構成

```
app/
  (home)/page.tsx          トップ（区画は10。最初の画面に、予約などのリンクやボタンは置かない）
  (pages)/                 下層ページ。1ページ＝1つの検索意図
    concept cuisine omakase space access reservation    … ヘッダーのメニューに出す（＋ご予約）
    drink                                                … 鮨と料理・おまかせ・フッターからたどる
    anniversary date business-dinner solo                … ご利用の場面
    susukino-sushi omakase-sushi counter-sushi adult-sushi … はじめての方へ
    journal/               季節の便り（一覧・記事・分類・RSS・記事ごとの OGP 画像）
  sitemap.ts robots.ts     記事を足すと、自動で反映される
components/                layout（ヘッダー・フッター）／sections（区画）／ui（部品）
data/                      店舗情報（restaurant.ts）・ページの登録・題材・店からのメモ（＝正本）
lib/                       SEO（canonical・OGP）・構造化データ・検索語の正規化・記事の読み出し
content/journal/           記事（Markdown）
scripts/journal/           自動投稿（題材選び・指示文・検査）
scripts/seo/               SEO の設計の点検・検索意図マップ
scripts/check-site.ts      ビルドした HTML の総点検・全 URL の一覧表
.github/workflows/         毎日の自動投稿
```

各ページのファイルの先頭に、「担当する検索語」「このページで答えること」「ここでは書かないこと」をコメントで残してあります。加筆するときは、そこを先に読んでください。同じ検索語を2ページで取り合わないため、そしてどのページも同じ中身にしないための決まりです。

### メニューと、場面別のページ

ヘッダーのメニュー（スマートフォンの全画面メニューも同じ）は、**コンセプト／鮨と料理／おまかせ／空間／季節の便り／アクセス ＋ 控えめな「ご予約」** だけです（`data/pages.ts` の `headerNav`）。
「ご利用の場面」（記念日・デート・接待・お一人で）と「はじめての方へ」（高級寿司・おまかせ寿司・カウンター寿司・大人の隠れ家）のページは、消さずに残してあり、本文中のリンク・ページの終わりの「あわせてご覧ください」・フッター・パンくず・季節の便りからたどれます。メニューに足すと `npm run seo:audit` が止めます。

### 検索意図マップ

`data/pages.ts` が、固定ページの検索意図マップです。1ページにつき担当する検索語（primaryKeyword）は1つ。
新しいページを足して、既存のページと担当語が重なると（寿司／鮨の表記ゆれ・語の順番は同じ語として数えます）、`next dev`・`next build` のときに警告が出て、`npm run seo:audit` が失敗します。

- トップ … 「すすきの 寿司」（あわせて拾う語: すすきの 鮨／すすきの おまかせ寿司／札幌 寿司）。店の全体像
- `/susukino-sushi` … 「すすきの 高級寿司」（すすきの 高級鮨／すすきの おまかせ寿司／すすきの カウンター寿司）。「高級」の中身・料金と時間・向く夜

### 構造化データ

| ページ | 出すもの |
| --- | --- |
| サイト全体 | Organization（店名・別名・ロゴ・公式の掲載先）＋ WebSite ＋ そのページの WebPage |
| トップ・アクセス | Organization の代わりに **Restaurant**（住所・電話・座標・営業時間・料金帯・Instagram・予約） |
| トップ以外 | BreadcrumbList |
| 季節の便りの記事 | BlogPosting（書き手・発行元は R-30 hizen） |
| おまかせコース | Menu |
| ご予約 | FAQPage（サイト内でここだけ） |

値はすべて `data/restaurant.ts` から。評価・受賞・未確定の席数など、確かめられない項目は入れていません。
別名（alternateName）には、店名の読みが入ります。Google ビジネスプロフィールの店名がサイトと違うとき（以前は「R-30 hizen すすきの店」でした）は、`restaurant.googleBusinessProfile.name` にその名前を書いておけば、別名にも自動で入ります。

## 季節の便り（毎日の自動投稿）

GitHub Actions が毎朝（日本時間 9:17 ごろ）、Claude API で記事を1本書き、**検査に通ったものだけ**を `content/journal/` に追加して push します。push を受けて Vercel がビルドし、記事・sitemap・RSS が公開されます。

**Vercel Cron とデータベースを使わなかった理由**: 記事を Git の中の Markdown として持てば、公開されるページはすべて静的になり（表示が最も速い）、記事は履歴つきで残り、手で直すこともできます。実行時にデータベースへ取りに行く部分が無いので、止まる場所がありません。

### 何を書くか（量産しないための決まり）

書く順番は、「この店にしか書けない話」が先です。

| 優先度 | 中身 | 出どころ |
| --- | --- | --- |
| 店からのメモ | 今週の魚、仕込み、この一皿の話など、店から聞き取ったこと | `data/shop-notes.ts`（いまは空。入れると、ほかの題材より先に書かれます） |
| A | 店の仕事（隠し包丁・昆布〆・煮ツメ）、コース、名物の丼、店の決まり | `data/journal-topics.ts` |
| B | すすきのでの記念日・デート・接待・旅行・おまかせ・カウンター | 同上 |
| C | 鮨と酒の一般的な知識 | 同上 |

最近 14 本の割合が **A 45%・B 40%・C 15%** に近づくように選びます（`scripts/journal/lib/select.ts`）。
**店の仕入れ先・産地・技法を、モデルに作らせることはしません。** 店について書いてよいのは、`data/restaurant.ts` の事実と、`data/shop-notes.ts` のメモにあることだけです。「今日の仕入れ」「今週の魚」のような記事は、メモを入れたときにだけ書かれます。

### 流れ

1. 今日の分がすでにあれば、何もしない
2. 題材を選ぶ。公開済みの記事と題材が近すぎるもの（検索語・答えている問い・題名・要約の類似度）は、書く前に見送る
3. 書き方の型を1つ選ぶ（随筆・問い・段取り・比較など7種類。直近3本と違うもの）
4. Claude に書かせる。店の事実は `data/restaurant.ts` から組み立てて渡す
5. 検査する（`scripts/journal/lib/validate.ts`）。落ちたら、指摘した所だけを直させる（最大4回）。
   既存の記事と重なっている（題材・本文・検索語）と分かったら、書き直しではなく**題材を替える**（最大3題材）
6. 通ったときだけ保存する。**通らなければ、その日は公開しない**（ジョブは失敗として残ります）

### 検査していること（公開前の関門）

- 定型表現（「いかがでしたか」「〜なのです」「この記事では」「ぜひチェック」など）
- 根拠のない表現：「一番」「No.1」「人気」「絶品」、口コミ、受賞、ランキング、**「おすすめ◯選」、他店との比較**
- 店について：事実に無い数値・金額、**店の料理として事実に無い魚・料理の名前**、確認できていない設備やサービス（個室・夜景・サプライズ・席数・産地・仕入先・店主の経歴など）
- 内部リンク：固定ページ 2〜4本＋関連記事 2〜4本、柱のページへのリンク、リンク先の実在
- 重複：担当する検索語（固定ページとも照合）・題名・**題材そのもの**・本文（8文字の連なりの重なり）・見出しの立て方・**ほかの記事と同じ一文の使い回し**
- 店の話の置き方：**最後の節を店の紹介にしない**（毎回同じ「R-30 hizenについて」で終わる形にしない）
- 題名：「すすきの」と「寿司・鮨」の両方を入れた題名は、7本のうち2本まで

同じ検査を、公開済みの全記事にも掛けられます（`npm run journal:audit`）。
記事の書き手の表示は「R-30 hizen」です（`data/restaurant.ts` の `author`）。確かめられない肩書き（店主監修など）は付けていません。

### 店からのメモを足す

`data/shop-notes.ts` の配列に1件足します（ファイルの先頭に書き方の見本があります）。

- 書くのは、店から聞いた事実だけ。1文ずつ、短く
- 魚の名前や産地は、聞いたとおりに。聞いていないことは書かない（検査は、メモに無い魚の名前や数字が店の話として出てきたら止めます）
- 「今週の」「今日の」のように古くなる話には `until`（その日まで）を付ける

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

検査が厳しくなったぶん、Haiku で通らない日が続くようなら、`CLAUDE_MODEL` をより上位のモデルに替えてください（通らない日は公開されないだけで、誤った記事が出ることはありません）。

### 止める・題材を足す

- 止める: GitHub の Actions で、このワークフローを Disable にする
- 題材を足す: `data/journal-topics.ts` に1行足す（`npm run journal:selftest` が、重複や固定ページとの食い合いを確かめます）
- 手で記事を書く: `content/journal/<slug>.md` を置く。frontmatter は既存の記事を参考に（`author: "editor"`・`semanticTopic` は必須）

## 点検

| コマンド | 見ること |
| --- | --- |
| `npm run check` | 型・Lint・下の3つ |
| `npm run seo:audit` | 検索意図の重なり、title・description の重複と長さ、ヘッダーのメニュー、店舗情報が `data/restaurant.ts` 以外に直接書かれていないか、Google ビジネスプロフィールとの NAP の一致 |
| `npm run journal:selftest` | 題材の一覧と優先度、事実シート、検査が違反を落とすか（API は使わない） |
| `npm run journal:audit` | 公開済みの全記事を、自動投稿と同じ基準で点検 |
| `npm run site:check` | ビルドしたサイトを実際に叩く：全ページ 200、h1・title・description の重複なし、canonical、OGP、構造化データの配置と値、移転前の住所が無い、メニューが6項目、予約ボタンは1ページ1か所、alt、先読みは LCP の写真だけ、ヒーローにリンクやボタンが無い、内部リンク切れ、旧 URL の 301 転送、robots・sitemap、`*.vercel.app` の noindex |
| `npm run site:check -- --inventory` | 上に加えて、全 URL の一覧表を `docs/URL_INVENTORY.md` に書き出す |
| `npm run seo:map -- --write` | `docs/KEYWORD_MAP.md` を作り直す |

`site:check` は、サーバーを立ててから実行します。

```bash
NEXT_PUBLIC_SITE_URL=https://www.hizen-susukino.jp npm run build
npx next start -p 4318          # 別の端末で
npm run site:check
```

公開したあとは、本番そのものにも掛けます（`BASE=https://www.hizen-susukino.jp npm run site:check`）。

## デザインの決まり

- **地は1色（墨 `#0A0A0A`）で通す。** 区画は、余白と写真で分ける（帯の色を交互に替えない）。`#111111` はフッターだけ
- 文字 `#F2EFE9` `#D8D2C8`／鈍い真鍮 `#A89169` をごく少量（`app/globals.css` の `@theme`）
- **区画のあいだ**は PC 160〜240px、スマートフォン 112px（`--gap`）
- **本文**は PC 17px・スマートフォン 16px、行間 2.0。本文より小さくするのは注記だけ。見出しは大きくしすぎない（h1 は最大 36px）
- **写真は大きく。** 画面の幅いっぱい・片側だけ端まで・縦と横の混在。同じ大きさの写真を3つ並べない。カード、角丸、影、飾りの線、アイコン、絵文字、光るボタンは使わない
- 和文が主役。欧文は、ロゴまわりと数字だけ（見出しには使わない）。和文は端末の明朝（Webフォントは読み込まない）
- **動きは3つだけ**：写真と文字がその場でゆっくり濃くなる／最初の画面の文字が一度だけ現れる／ヒーローの写真がごくわずかに引く。浮き上がる動き・マウスへの追従・1文字ずつ出る演出は使わない
- トップの最初の画面には、行動を促すもの（予約・お問い合わせ・詳しく見る）を置かない。ヘッダーの「ご予約」も、最初の画面では出ない
- **予約への導線は、ヘッダーの「ご予約」と、各ページの終わりの1か所だけ。** スマートフォンの下に固定の予約ボタンは置かない。記事のページには予約のブロックを置かない
- 下層ページは `components/sections/Blocks.tsx` の部品で組む。ただし、**ページごとに違う組み合わせ・違う順番**にする（どのページも同じ型、にしない）

### 画面の幅・高さが変わっても崩さないための決まり

2026年10月に、幅 280〜2560px・3つのブラウザ（Chrome・Safari 系・Firefox）で総点検して決めたものです。部品を足すときは、同じ決まりに合わせてください。

- **写真は画面より高くしない。** 幅を画面の割合で決めているので、何もしないと横に広い画面ほど縦に伸びます。`Bleed`・`Offset`・`PhotoEdge`・`PageHead` の写真には `.frame-fit`（高さは画面の 9 割まで。超える分は上下を切り抜く）が付いています
- **画面いっぱいの写真は、幅 1920px で止める。** それ以上に広げると、元の写真（幅 1,566px が大半）の画素が足りず、ぼやけます
- **文章の列を痩せさせない。** 写真を広く取る組み（`PhotoEdge` の `wide`）は、文章の列が 24rem を下回らないようにしてあります（`--edge-text-min`）。「見出し｜説明」を横に並べる行（`Items`・`NoticeList`・トップの場面の一覧）は、画面の幅ではなく**置かれた場所の幅**で、横並びか縦積みかを決めます（container query）
- **横位置の写真を縦長の枠に入れるとき**は、写真が枠の高さに合わせて拡大されます。`Photo` が `sizes` に倍率を掛けて、拡大後の大きさに合う画像を取りに行きます（掛けないと PC でぼやける）
- **ページ内リンクの飛び先**は、どれもヘッダーのすぐ下に来ます（`html` の `scroll-padding-top`）。飛び先の要素に `scroll-mt-*` を足すと、二重に空いて下にずれます
- **画面の外の区画の描画を後回しにするのは、初めて開いたときの最初の表示のあいだだけ**です（`app/layout.tsx` の `CV_SCRIPT` と、`app/globals.css` の `html[data-cv]`）。表示が済んだら1区画ずつ通常の描画に戻します。`content-visibility: auto` を区画に付けたままにすると、再読み込みや「戻る」のあとに見ていた場所から数百px ずれ、Safari では画面が跳ねます（実際に起きていました）。区画に直接 `content-visibility` を書かないでください
