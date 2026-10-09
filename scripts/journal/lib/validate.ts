/**
 * 記事の検査（公開の前に必ず通す関門）。
 *
 *   書く（generate.ts） → ここで検査 → 通ったものだけ保存・公開
 *
 * 自動投稿が書いた原稿も、公開済みの記事の点検（audit.ts）も、必ずこの1つの関数を通す。
 * 規則を2か所に置くと「生成では通ったのに点検で落ちる」ずれが起きるため。
 *
 * 見ていること
 *   A 体裁          … 文字数、見出しの数、h1・画像・生の URL が無いこと
 *   B 定型表現      … AI が書いた記事にありがちな言い回し
 *   C 根拠のない主張 … 最上級・No.1、口コミ・受賞、「おすすめ◯選」、他店との比較、事実に無い金額
 *   D 店の事実      … 店について述べる文の数値・設備・サービス・魚や料理の名前が、事実シート（と店からのメモ）にあるか
 *   E 内部リンク    … リンク先が実在するか、本数、柱のページへのリンク
 *   F 重複          … 検索語・題名・題材・本文・一文が、既存の記事や固定ページと重なっていないか
 *   G 店の話の置き方 … 毎回同じ「店の紹介」で終わる形になっていないか、題名に同じ語を続けていないか
 */
import { categorySlugs } from "../../../data/journal-categories";
import { linkablePages, pageList, pages } from "../../../data/pages";
import { agePolicy, restaurant } from "../../../data/restaurant";
import { h2List, linkTargets, plainText, type Post } from "../../../lib/journal-core";
import { allowedNumericTokens, allowedYen, normalizeDigits, numericTokens, shopDishNames } from "./facts";
import { themeCloseness, themeOfPost, THEME_TOO_CLOSE } from "./similarity";
import { dice, keywordKey, normalize, sentences, shingleOverlap } from "./text";

export type Draft = {
  title: string;
  description: string;
  summary: string;
  body: string;
  secondaryKeywords: string[];
  /** この記事が答えている問いを一文で */
  semanticTopic?: string;
};

export type Target = {
  slug: string;
  category: string;
  primaryKeyword: string;
  /** 柱にする固定ページのパス */
  pillar: string;
  /** 公開日。題名の語の続き具合を、それより前の記事と比べるために使う */
  date?: string;
};

export type Options = {
  /** この記事のもとになった「店からのメモ」の文（data/shop-notes.ts の facts）。ここにあることは、店の事実として書いてよい */
  noteFacts?: string[];
};

export type Problem = { code: string; message: string };

export const LIMITS = {
  title: [14, 44],
  description: [60, 120],
  summary: [30, 110],
  semanticTopic: [10, 70],
  /** 本文の文字数（記法を除く）。目安は 1,500〜3,000 字 */
  body: [1500, 3800],
  h2: [3, 8],
  fixedLinks: [2, 4],
  relatedLinks: [2, 4],
  /** 直近の記事のうち、題名に「すすきの」と「寿司・鮨」の両方を入れてよい本数（この記事を含めた7本のうち） */
  headTermTitles: 2,
} as const;

/** 記事の slug に使えない名前（/journal/page/…, /journal/category/… と衝突する） */
export const RESERVED_SLUGS = ["page", "category", "feed", "feed.xml"];

/** 題材を替えないと直せない問題（書き直しではなく、別の題材に替える） */
export function needsNewTopic(problems: Problem[]): boolean {
  return problems.some((p) => /^(cannibal\.|dup\.(body|theme|structure))/.test(p.code));
}

// ---------------------------------------------------------------------------
// B 定型表現
// ---------------------------------------------------------------------------
const STOCK_PHRASES: [RegExp, string][] = [
  [/いかがでした(でしょう)?か|いかがでしょうか/, "「いかがでしたか」"],
  [/なのです/, "「〜なのです」"],
  [/魅力を(ご)?紹介/, "「魅力をご紹介」"],
  [/ぜひ.{0,10}(チェック|参考に)|ぜひ.{0,8}してみてください/, "「ぜひチェックしてみてください」の類"],
  [/ではないでしょうか/, "「〜ではないでしょうか」"],
  [/この記事では|本記事では|今回の記事/, "「この記事では」"],
  [/(について|を)(詳しく|徹底)?解説(し|いた)/, "「〜を解説します」"],
  [/ていきましょう|見ていきます/, "「〜していきましょう」"],
  [/と(言|い)えるでしょう|過言ではありません/, "「〜と言えるでしょう」"],
  [/皆さん|みなさん|皆様は/, "読者への呼びかけ（皆さん）"],
  [/当店|弊店|私たち|わたしたち|我々/, `「当店」「私たち」（店は「${restaurant.name}」と書く）`],
  [/[！!]/, "感嘆符"],
  [/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2728}]/u, "絵文字"],
  [/徹底(解説|比較|ガイド)|完全(ガイド|版)|保存版|必見|厳選/, "煽りの常套句（徹底解説・完全ガイド・必見など）"],
];

const STOCK_HEADINGS = /^(まとめ|おわりに|終わりに|最後に|さいごに|はじめに|結論|総括)$/;

// ---------------------------------------------------------------------------
// C 根拠のない主張（どこに書いても不可）
// ---------------------------------------------------------------------------
const FORMER_ADDRESS = new RegExp(restaurant.legacy.formerAddressPatterns.join("|"));

const UNSUPPORTED: [RegExp, string][] = [
  [/No\.?\s?[1１]|ナンバーワン|日本一|北海道一|札幌(で)?一番|すすきの(で)?一番|札幌一|すすきの一/, "「一番」「No.1」"],
  [/一番(人気|おいしい|美味|旨い|おすすめ)/, "「一番人気」「一番おいしい」"],
  [/最高峰|最高級|究極|至高|唯一無二|絶品|極上|名店/, "最上級の形容（最高峰・絶品・極上・名店など）"],
  [/絶対(に)?(おすすめ|満足|後悔|外さない)|必ず満足|間違いなく|間違いなし|間違いありません/, "「絶対おすすめ」「間違いなし」"],
  [/口コミ|クチコミ|レビュー|高評価|評判(の(店|鮨|寿司|よい|良い|いい)|が(高|良|よ|い)|を呼)/, "口コミ・評判"],
  [/人気(店|の店|を集め|沸騰)|話題の店|予約困難|予約が取れない|行列/, "人気・予約困難"],
  [/ランキング|受賞|ミシュラン|百名店|ビブグルマン|食べログ|ぐるなび|ホットペッパー|Retty/i, "ランキング・受賞・グルメサイト名"],
  [/雑誌|テレビ|メディア(掲載|で紹介)|芸能人|有名人/, "メディア掲載・有名人"],
  [/おすすめ.{0,8}[0-9０-９一二三四五六七八九十]+\s*選|[0-9０-９]+\s*選(?![択手考定別挙ばびぶべんりる])|ベスト\s*[0-9０-９]+|TOP\s*[0-9０-９]+/i, "「おすすめ◯選」「ベスト◯」の形"],
  [/(他店|ほかの店|他の店|よその店)(と|より|に)(は)?(比べ|比較|勝|優|劣)|食べ比べランキング|名店めぐり/, "他店との比較"],
  [FORMER_ADDRESS, "移転前の住所"],
  [/https?:\/\//, "URL（サイト内のリンクは /path の形で書く）"],
  [/<[a-z][^>]*>/i, "HTML のタグ"],
];

// ---------------------------------------------------------------------------
// D 店について書いてはいけないこと（確認できていない設備・サービス・来歴）
//   店を主語にした段落で、打ち消しの言葉なしに出てきたら不可。
//   「個室はございません」は可、「個室でゆっくり」は不可。
//   店からのメモに同じ言葉があれば可（メモが事実の出どころになる）。
// ---------------------------------------------------------------------------
const SHOP_UNVERIFIED: [RegExp, string][] = [
  [/個室|テーブル席|座敷|掘りごたつ|ソファ席|テラス/, "個室・テーブル席"],
  [/夜景|眺望|景色/, "夜景・眺望"],
  [/サプライズ|ケーキ|花束|メッセージプレート|バースデープレート|記念撮影|演出/, "サプライズ・ケーキなどの演出"],
  [/飲み放題|食べ放題|アラカルト|単品|お好みで(注文|頼)|ランチ|昼の営業|テイクアウト|持ち帰り|出前|デリバリー|お土産/, "飲み放題・単品・ランチ・持ち帰り"],
  [/駐車場(あり|完備|を完備|をご用意)|Wi-?Fi|電源|クローク|喫煙(可|席|所)/i, "駐車場・Wi-Fi・喫煙"],
  [/英語(の)?(メニュー|対応)|外国語|通訳/, "外国語対応"],
  [/ノンアルコール|ソフトドリンク|ペアリングコース|利き酒セット/, "ノンアルコール・ペアリングコース"],
  [/\d+\s*席/, "席数"],
  [/[月火水木金土日]曜(日)?(が|は)?(定休|休み|お休み)|年中無休|ラストオーダー|L\.?O\.?|深夜(まで|営業)/, "定休の曜日・ラストオーダー"],
  [/[一-龥ぁ-んァ-ヶー]{1,6}産(の|、|。|で|を|に)|直送|市場(から|で|直)|仕入れ?先|漁師|契約農家|自家製|熟成|赤酢|天然(もの|物)(のみ|だけ)|無添加/, "産地・仕入先・製法"],
  [/修業|修行|出身|銀座|老舗|創業|\d+年の歴史|代目/, "店主の経歴・創業"],
  [/領収書|請求書|個別会計|割り勘|QR|PayPay|d払い|楽天ペイ|現金のみ|キャンセル料|ドレスコード|サービス料|チャージ|お通し/i, "会計・キャンセルの扱い"],
  [/ペット|お子様(連れ)?(歓迎|可|も)|キッズ|ベビーカー/, "子ども・ペット"],
];

const NEGATION = /ない|ません|ございません|お断り|不可|できません|いたしかねます|おりません|お控え|ご遠慮|ではなく/;

/**
 * 魚介・鮨種の名前。
 * 店の料理として書いてよいのは、事実シートにあるもの（名物の丼の具など）と、店からのメモにあるものだけ。
 * 一般論の節で魚の話をするのは構わない（店名のある文・店名のある節でだけ見る）。
 */
const NETA = [
  "鮪", "まぐろ", "マグロ", "中トロ", "大トロ", "赤身", "鯛", "金目", "平目", "ヒラメ", "鰈", "カレイ", "烏賊", "イカ", "蛸", "タコ",
  "海老", "エビ", "穴子", "アナゴ", "鰻", "うなぎ", "鯖", "サバ", "鯵", "アジ", "鰯", "イワシ", "秋刀魚", "サンマ", "鰤", "ブリ",
  "鰊", "ニシン", "小肌", "コハダ", "鱒", "鮭", "サーモン", "帆立", "ホタテ", "北寄", "ホッキ", "つぶ貝", "ツブ", "牡蠣", "蟹", "カニ",
  "ししゃも", "シシャモ", "八角", "白子", "鱈", "数の子", "玉子", "かんぴょう", "赤貝", "蛤", "鮑", "アワビ", "間八", "カンパチ",
  "鰹", "カツオ", "太刀魚", "のどぐろ", "キンキ", "雲丹", "ウニ", "いくら", "イクラ", "毛蟹", "毛ガニ",
];
/** 表記ゆれ。事実シートの書き方（左）が許されていれば、右の書き方も許す */
const NETA_VARIANTS: Record<string, string[]> = { 雲丹: ["ウニ"], いくら: ["イクラ"], 毛蟹: ["毛ガニ"] };
const KATAKANA_ONLY = /^[ァ-ヶー]+$/;
/** 文の中から、魚介の名前を1つ探す。カタカナの名前は、ほかのカタカナ語の一部（アジア、コントロール）を拾わないように境目を見る */
function findNeta(text: string): string | undefined {
  return NETA.find((n) => (KATAKANA_ONLY.test(n) ? new RegExp(`(?<![ァ-ヶー])${n}(?![ァ-ヶー])`).test(text) : text.includes(n)));
}
/** 「出るとは限らない」「その日の仕入れ次第」のように、提供を約束していない文は可 */
const NOT_PROMISED = /とは限り|かどうか|日によって|仕入れ(次第|で決ま|によって)|お楽しみ|入る日も|出る日も|出るとは|並ぶとは/;

/** 店を主語にした文に、少なくとも1つは入っているはずの「事実シートの言葉」 */
function factTerms(): string[] {
  return [
    ...restaurant.techniques,
    ...restaurant.drinks.kinds,
    "おまかせ", "コース", "カウンター", "席", "予約", "電話", "Web", "当日", "アレルギー", "食材", "明細",
    "夫婦", "握", "酒肴", "八寸", "三食丼", "雲丹", "いくら", "毛蟹", "お椀", "ボトル", "すすきの", "徒歩", "駅",
    "階", "禁煙", "貸切", "営業", "不定休", "仕入れ", "お品書き", "品書き", "人数", "店主", "職人", "黒", "目の前",
    "駐車場", "カード", "電子マネー", "鮨店", "香", "歳", "大人", "ページ", "一皿", "料理", "お酒", "提供", "店",
    "手法", "盛り付け", "旬", "名物", "結び", "入店", "住所", "場所", "移転", "決まり", "お願い", "静か", "年齢",
  ];
}

const SHOP_NAME = /R-?30\s?hizen|hizen|ヒゼン/i;

/** 本文を、見出し（h2）ごとの区画と段落に分ける */
function blocks(body: string): { heading: string; paragraphs: string[] }[] {
  const out: { heading: string; paragraphs: string[] }[] = [{ heading: "", paragraphs: [] }];
  let buf: string[] = [];
  const flush = () => {
    if (buf.length) out[out.length - 1].paragraphs.push(buf.join("\n"));
    buf = [];
  };
  for (const line of body.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      flush();
      out.push({ heading: h[1], paragraphs: [] });
    } else if (line.trim() === "") {
      flush();
    } else {
      buf.push(line);
    }
  }
  flush();
  return out;
}

/** 店について述べている段落（店名のある区画ぜんぶ、または店名を含む段落） */
function shopParagraphs(body: string): string[] {
  const out: string[] = [];
  for (const b of blocks(body)) {
    const whole = SHOP_NAME.test(b.heading);
    for (const p of b.paragraphs) if (whole || SHOP_NAME.test(p)) out.push(p);
  }
  return out;
}

const SYNONYMS: Record<string, string[]> = {
  寿司: ["寿司", "鮨", "すし", "握り"],
  昆布締め: ["昆布締め", "昆布〆", "昆布じめ"],
  酢締め: ["酢締め", "酢〆", "酢で〆", "〆"],
  苦手なもの: ["苦手"],
  苦手な食べ物: ["苦手"],
  合う: ["合う", "相性", "合わ", "合い"],
  選び方: ["選び方", "選ぶ", "選びかた", "選べ", "選ん"],
  決め方: ["決め方", "決める", "決めかた"],
  聞き方: ["聞き方", "聞く", "尋ね", "確かめ"],
  誘い方: ["誘い方", "誘う", "誘い"],
  食べ方: ["食べ方", "食べかた", "食べる"],
  歩き方: ["歩き方", "歩く", "歩い"],
  行き方: ["行き方", "行く", "向かう", "行け"],
  過ごし方: ["過ごし方", "過ごす", "過ごし"],
  違い: ["違い", "違う", "異な"],
  役割: ["役割", "役目", "ため", "働き"],
  時期: ["時期", "時季", "季節", "旬"],
  予算: ["予算", "料金", "費用"],
  所要時間: ["所要時間", "時間"],
  会計: ["会計", "支払"],
  支払い: ["支払", "会計"],
  ディナー: ["ディナー", "夜", "食事"],
  食事: ["食事", "ディナー", "食べ"],
  一軒目: ["一軒目", "1軒目"],
  撮っていい: ["撮", "写真"],
  初めて: ["初めて", "はじめて"],
  ゲスト: ["ゲスト", "お客様", "相手"],
  年齢制限: ["歳", "年齢"],
  当日: ["当日"],
  明細: ["明細"],
  二人: ["二人", "2人", "ふたり", "どうし"],
  女性: ["女性"],
  とは: [],
  いつ: ["いつ", "時機", "何日"],
  何貫: ["何貫", "貫"],
  追加: ["追加"],
  弱い: ["弱", "強くない"],
  周辺: ["周辺", "まわり", "近く", "あたり"],
};

function hasToken(text: string, token: string): boolean {
  const list = token in SYNONYMS ? SYNONYMS[token] : [token];
  if (list.length === 0) return true;
  const n = normalize(text);
  return list.some((w) => n.includes(normalize(w)));
}

// ---- 一文の使い回し ----------------------------------------------------------

const GRAM = 6;
const LONG_SENTENCE = 24;

/** リンクの記法を外し、記号を落とした一文 */
function bareSentences(body: string): { raw: string; bare: string }[] {
  return sentences(body.replace(/^#{1,6}\s+.*$/gm, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"))
    .map((raw) => ({ raw, bare: normalize(raw.replace(/^[-*>\d.\s]+/, "").replace(/[*_`]/g, "")) }))
    .filter((s) => s.bare.length > 0);
}

const gramCache = new WeakMap<Post, Set<string>>();
function gramsOf(post: Post): Set<string> {
  let set = gramCache.get(post);
  if (!set) {
    set = new Set();
    for (const { bare } of bareSentences(post.body)) {
      for (let i = 0; i + GRAM <= bare.length; i++) set.add(bare.slice(i, i + GRAM));
    }
    gramCache.set(post, set);
  }
  return set;
}

/** 一文のうち、ほかの記事にも出てくる部分の割合（0〜1） */
function sentenceContainment(bare: string, grams: Set<string>): number {
  const total = bare.length - GRAM + 1;
  if (total <= 0) return 0;
  let hit = 0;
  for (let i = 0; i + GRAM <= bare.length; i++) if (grams.has(bare.slice(i, i + GRAM))) hit++;
  return hit / total;
}

/** 題名に「すすきの」と「寿司・鮨」の両方が入っているか */
export function hasHeadTerm(title: string): boolean {
  return /すすきの/.test(title) && /寿司|鮨|すし/.test(title);
}

// ---------------------------------------------------------------------------
// 本体
// ---------------------------------------------------------------------------
export function validateArticle(
  draft: Draft,
  target: Target,
  /** ほかの記事（自分自身は含めない）。新しい順 */
  others: Post[],
  options: Options = {},
): Problem[] {
  const problems: Problem[] = [];
  const add = (code: string, message: string) => problems.push({ code, message });

  const { title, description, summary, body } = draft;
  const text = plainText(body);
  const all = `${title}\n${description}\n${summary}\n${body}`;
  const h2s = h2List(body);
  const links = linkTargets(body);
  const noteText = (options.noteFacts ?? []).join("\n");

  // ---- A 体裁 --------------------------------------------------------------
  const len = (s: string) => [...s].length;
  const within = (name: string, value: number, [min, max]: readonly [number, number], unit = "字") => {
    if (value < min || value > max) add(`length.${name}`, `${name} は ${min}〜${max}${unit}（いま ${value}${unit}）`);
  };
  within("title", len(title), LIMITS.title);
  within("description", len(description), LIMITS.description);
  within("summary", len(summary), LIMITS.summary);
  within("body", len(text), LIMITS.body);
  within("h2", h2s.length, LIMITS.h2, "個");
  if (!draft.semanticTopic) add("semantic.missing", "semanticTopic（この記事が答えている問いを一文で）が無い");
  else within("semanticTopic", len(draft.semanticTopic), LIMITS.semanticTopic);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(target.slug)) add("slug.format", `slug は半角英小文字・数字・ハイフンで: ${target.slug}`);
  if (RESERVED_SLUGS.includes(target.slug)) add("slug.reserved", `slug「${target.slug}」は使えません`);
  if (!categorySlugs.includes(target.category)) add("category", `分類が登録にありません: ${target.category}`);
  if (/^#\s+/m.test(body)) add("h1", "本文に h1（# 見出し）を書かない。題名が h1 になる");
  if (/!\[[^\]]*\]\(/.test(body)) add("image", "本文に画像を入れない");
  if (h2s.some((h) => /\[[^\]]+\]\(/.test(h)) || /^#{2,3}\s+.*\[[^\]]+\]\([^)]+\)/m.test(body)) add("heading.link", "見出しの中にリンクを置かない");
  for (const h of h2s) if (STOCK_HEADINGS.test(h.trim())) add("heading.stock", `見出し「${h}」は定型。内容を表す見出しにする`);
  if (new Set(h2s.map(normalize)).size !== h2s.length) add("heading.dup", "同じ見出しが2回ある");
  for (const p of body.split(/\n\s*\n/)) {
    if (!/^(#|\||-|\d+\.|>)/.test(p.trim()) && len(plainText(p)) > 420) {
      add("paragraph.long", `段落が長すぎる（420字超）: 「${plainText(p).slice(0, 24)}…」`);
    }
  }
  if (draft.secondaryKeywords.length < 2 || draft.secondaryKeywords.length > 5) add("keywords.count", "secondaryKeywords は 2〜5 個");
  // 表の見出しの行に、空のマスを作らない（読み上げで、その列が何の列か分からなくなる）
  const lines = body.split(/\r?\n/);
  for (let i = 0; i + 1 < lines.length; i++) {
    if (!/^\s*\|/.test(lines[i]) || !/^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) continue;
    const cells = lines[i].trim().replace(/^\|/, "").replace(/\|$/, "").split("|");
    if (cells.some((c) => c.trim() === "")) add("table.header", `表の見出しに空のマスがある: 「${lines[i].trim().slice(0, 30)}」`);
  }

  // ---- B 定型表現 ----------------------------------------------------------
  for (const [re, label] of STOCK_PHRASES) {
    const m = all.match(re);
    if (m) add("stock", `定型表現: ${label}（「${m[0]}」）`);
  }

  // ---- C 根拠のない主張 ----------------------------------------------------
  for (const [re, label] of UNSUPPORTED) {
    const m = all.match(re);
    if (m) add("unsupported", `根拠を示せない表現: ${label}（「${m[0]}」）`);
  }
  if (new RegExp(`${agePolicy.minAge}歳以下`).test(normalizeDigits(all))) {
    add("age.wording", `年齢の表記は「${agePolicy.label}」。「${agePolicy.minAge}歳以下」と書かない（意味が変わる）`);
  }
  // 金額は、コースの料金だけ
  const yenOk = new Set(allowedYen());
  for (const m of normalizeDigits(all).matchAll(/(\d[\d,]*)\s*(万)?円/g)) {
    const value = Number(m[1].replace(/,/g, "")) * (m[2] ? 10000 : 1);
    if (!yenOk.has(value)) add("price", `事実シートに無い金額: ${m[0]}（書いてよいのはコースの料金だけ）`);
  }

  // ---- D 店の事実 ----------------------------------------------------------
  const shop = shopParagraphs(body);
  const allowed = allowedNumericTokens(options.noteFacts);
  const terms = factTerms();
  // 店の料理として書いてよい名前（長い順に消していく。「毛蟹」を先に消してから「蟹」を探すため）
  const dishBase = [...shopDishNames(), ...NETA.filter((n) => noteText.includes(n))];
  const dishOk = [...dishBase, ...dishBase.flatMap((n) => NETA_VARIANTS[n] ?? [])].sort((a, b) => b.length - a.length);
  for (const para of shop) {
    const plain = plainText(para.replace(/\n/g, "。"));
    for (const token of numericTokens(plain)) {
      const bare = token.replace(/[^\d:]/g, "");
      if (!allowed.has(token) && !allowed.has(bare)) {
        add("fact.number", `店について述べる段落に、事実シートに無い数値: 「${token}」（${plain.slice(0, 30)}…）`);
      }
    }
    for (const s of sentences(para.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"))) {
      for (const [re, label] of SHOP_UNVERIFIED) {
        const m = s.match(re);
        if (m && !NEGATION.test(s) && !noteText.includes(m[0])) add("fact.unverified", `確認できていない内容（${label}）: 「${s.slice(0, 40)}」`);
      }
      // 店の料理として、事実に無い魚・料理の名前を挙げていないか
      if (!NEGATION.test(s) && !NOT_PROMISED.test(s)) {
        let rest = s;
        for (const ok of dishOk) rest = rest.split(ok).join("　");
        const invented = findNeta(rest);
        if (invented) add("fact.dish", `店の料理として、事実シートに無い魚・料理の名前: 「${invented}」（${s.slice(0, 40)}）`);
      }
      const leadIn = /(とおりです|こうなります|まとめます|挙げます|ご案内します)。?$/.test(s) || [...s].length < 14;
      if (SHOP_NAME.test(s) && !leadIn && !terms.some((t) => s.includes(t))) {
        add("fact.vague", `店についての文に、事実シートの言葉が1つも無い: 「${s.slice(0, 40)}」`);
      }
    }
  }
  const shopMentions = (all.match(/R-30\s?hizen/g) ?? []).length;
  if (shopMentions === 0) add("shop.none", `本文で ${restaurant.name} に一度は触れる（事実シートの範囲で）`);
  if (shopMentions > 12) add("shop.many", `店名が多すぎる（${shopMentions}回）。宣伝の文章にしない`);

  // ---- E 内部リンク --------------------------------------------------------
  const fixedPaths = new Set(linkablePages.map((k) => pages[k].path));
  const otherSlugs = new Set(others.map((p) => p.slug));
  const fixedUsed = new Set<string>();
  const relatedUsed = new Set<string>();
  for (const { text: label, href } of links) {
    if (!href.startsWith("/")) {
      add("link.external", `サイト外へのリンクは置かない: ${href}`);
      continue;
    }
    const path = href.split("#")[0].replace(/\/$/, "") || "/";
    if (fixedPaths.has(path)) fixedUsed.add(path);
    else if (path.startsWith("/journal/") && otherSlugs.has(path.slice("/journal/".length))) relatedUsed.add(path);
    else add("link.missing", `存在しないページへのリンク: ${href}`);
    if (/^(こちら|ここ|このページ|詳細|リンク)$/.test(label.trim())) add("link.label", `リンクの文言が内容を表していない: 「${label}」`);
  }
  within("固定ページへのリンク", fixedUsed.size, LIMITS.fixedLinks, "本");
  const relatedMin = Math.min(LIMITS.relatedLinks[0], others.length);
  if (relatedUsed.size < relatedMin || relatedUsed.size > LIMITS.relatedLinks[1]) {
    add("link.related", `関連記事へのリンクは ${relatedMin}〜${LIMITS.relatedLinks[1]} 本（いま ${relatedUsed.size} 本）`);
  }
  if (!fixedUsed.has(target.pillar)) add("link.pillar", `柱のページ（${target.pillar}）へのリンクが無い`);
  const hrefs = links.map((l) => l.href.split("#")[0]);
  for (const h of new Set(hrefs)) {
    if (hrefs.filter((x) => x === h).length > 2) add("link.repeat", `同じページへのリンクが3回以上: ${h}`);
  }

  // ---- F 重複・検索語 ------------------------------------------------------
  const tokens = target.primaryKeyword.split(/\s+/).filter(Boolean);
  const head = `${title} ${description}`;
  const missingAnywhere = tokens.filter((t) => !hasToken(all, t));
  if (missingAnywhere.length) add("keyword.missing", `検索語「${target.primaryKeyword}」のうち、本文に無い語: ${missingAnywhere.join("、")}`);
  const inHead = tokens.filter((t) => hasToken(head, t)).length;
  if (tokens.length && inHead / tokens.length < 0.6) add("keyword.head", `題名と説明文に、検索語「${target.primaryKeyword}」の語をもう少し入れる`);
  const exact = target.primaryKeyword.replace(/\s+/g, "");
  if ((normalize(all).split(normalize(exact)).length - 1) > 6) add("keyword.stuffing", "検索語をそのままつなげた形が多すぎる");

  const key = keywordKey(target.primaryKeyword);
  for (const p of pageList) {
    if (keywordKey(p.primaryKeyword) === key) add("cannibal.page", `固定ページ ${p.path} と同じ検索語を狙っている: ${p.primaryKeyword}`);
  }
  const theme = {
    slug: target.slug,
    category: target.category,
    primaryKeyword: target.primaryKeyword,
    secondaryKeywords: draft.secondaryKeywords,
    title,
    summary,
    semanticTopic: draft.semanticTopic,
  };
  const mine = bareSentences(body).filter((s) => s.bare.length >= LONG_SENTENCE);
  let reusedSentences = 0;
  for (const p of others) {
    if (keywordKey(p.primaryKeyword) === key) add("cannibal.post", `記事 ${p.slug} と同じ検索語を狙っている: ${p.primaryKeyword}`);
    if (p.title === title) add("dup.title", `題名が記事 ${p.slug} と同じ`);
    else if (dice(p.title, title) > 0.62) add("dup.title", `題名が記事 ${p.slug} と近い（「${p.title}」）`);
    if (p.description === description) add("dup.description", `説明文が記事 ${p.slug} と同じ`);
    const overlap = shingleOverlap(plainText(p.body), text);
    if (overlap > 0.2) add("dup.body", `本文が記事 ${p.slug} と重なっている（重なり ${(overlap * 100).toFixed(0)}%）`);
    const same = h2s.filter((h) => h2List(p.body).some((x) => dice(x, h) > 0.8)).length;
    if (same >= 3) add("dup.structure", `見出しの立て方が記事 ${p.slug} とほぼ同じ（${same} 個が共通）`);
    // 題材そのものが近すぎないか（検索語・答えている問い・題名・要約のどれかが重なる）
    const close = themeCloseness(theme, themeOfPost(p));
    if (close.score >= THEME_TOO_CLOSE && keywordKey(p.primaryKeyword) !== key && dice(p.title, title) <= 0.62) {
      add("dup.theme", `題材が記事 ${p.slug} と近すぎる（${close.by}・${close.score.toFixed(2)}）。別の題材にする`);
    }
    // 同じ文の使い回し（とくに、毎回同じ「店の紹介」の文）
    const grams = gramsOf(p);
    for (const s of mine) {
      if (reusedSentences >= 4) break;
      if (sentenceContainment(s.bare, grams) >= 0.75) {
        reusedSentences++;
        add("dup.sentence", `記事 ${p.slug} とほぼ同じ文がある。言い回しを変えるか、削る: 「${s.raw.slice(0, 44)}」`);
      }
    }
  }
  for (const p of pageList) {
    if (p.title === title || p.description === description) add("dup.page", `題名か説明文が固定ページ ${p.path} と同じ`);
  }

  // ---- G 店の話の置き方・題名の語 --------------------------------------------
  // 毎回、最後に店の紹介の節を足す形にしない（店そのものを題材にした記事は別）
  const lastHeading = h2s[h2s.length - 1] ?? "";
  if (target.category !== "hizen" && /^R-?30\s?hizen/i.test(lastHeading.trim())) {
    add("shop.tail", `最後の節を店の紹介にしない（見出し「${lastHeading}」）。店との関わりは、本文の流れの中で触れる`);
  }
  for (const h of h2s) {
    if (/^R-?30\s?hizen\s*(について|とは|のご紹介|の紹介|のご案内|の案内|の特徴)$/i.test(h.trim())) {
      add("shop.template", `見出し「${h}」は、どの記事にも付けられる定型。題材に即した見出しにする`);
    }
  }
  // 題名に「すすきの＋寿司」を毎回は入れない
  if (hasHeadTerm(title)) {
    const before = target.date ? others.filter((p) => p.date <= target.date!) : others;
    const recent = before.slice(0, 6).filter((p) => hasHeadTerm(p.title)).length;
    if (recent >= LIMITS.headTermTitles) {
      add("title.headterm", "題名に「すすきの」と「寿司・鮨」を入れた記事が続いている。題名は内容のことばで付ける（検索語は説明文と本文に入れる）");
    }
  }

  return problems;
}
