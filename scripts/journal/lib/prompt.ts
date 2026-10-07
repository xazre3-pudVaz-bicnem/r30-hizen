/**
 * 自動投稿の指示文。
 *
 * system … 毎日同じ内容（書き方の決まり・店の事実・リンクしてよい固定ページ）。キャッシュが効くよう、日付などの変わる値は入れない
 * user   … その日の題材・書き方の型・関連記事の候補
 */
import { categoryBySlug } from "../../../data/journal-categories";
import type { Topic } from "../../../data/journal-topics";
import { linkablePages, pages } from "../../../data/pages";
import { agePolicy, site } from "../../../data/site";
import type { Post } from "../../../lib/journal-core";
import { buildFactSheet } from "./facts";
import { LIMITS, type Problem } from "./validate";

/**
 * 書き方の型。毎回ちがう見出しの立て方にするため、記事ごとに1つ指定する。
 * （どの記事も「〜とは → メリット → 選び方 → まとめ」になるのを防ぐ）
 */
export const FORMATS: { id: string; instruction: string }[] = [
  { id: "essay", instruction: "随筆として書く。ある場面の描写から入り、見出しは3〜4つ。箇条書きと表は使わない。" },
  { id: "questions", instruction: "読み手が抱く問いを、そのまま見出しにする（4〜6つ）。各節は、問いへの答えを最初の一文で言い切ってから理由を書く。" },
  { id: "steps", instruction: "段取りとして、順を追って書く（見出し4〜6つ）。番号つきの箇条書きを1か所だけ使う。" },
  { id: "compare", instruction: "二つか三つの選択肢を比べて書く。違いが一目でわかる表を1つだけ入れる。" },
  { id: "word", instruction: "ことばの意味から入り、仕組み、使われ方、味わい方の順に掘り下げる。見出しは4〜5つ。" },
  { id: "evening", instruction: "ある一晩の流れに沿って、時間の順に書く。見出しは場面で立てる（4〜5つ）。" },
  { id: "checklist", instruction: "出かける前に確かめることを挙げていく。見出しは4〜6つ。箇条書きを1か所だけ使う。" },
];

export function buildSystemPrompt(): string {
  const fixed = linkablePages
    .map((k) => `- ${pages[k].path} … ${pages[k].label}（${pages[k].linkHint}）`)
    .join("\n");

  return `あなたは、札幌・すすきのの鮨店「${site.name}」の公式サイトで、読みもの「季節の便り」を書いている編集者です。
読むのは、すすきので鮨を食べる夜を考えている大人です。検索して、この記事にたどり着きます。
書くのは、その人の問いに正面から答える、静かで具体的な文章です。宣伝文ではありません。

# 書き方
- です・ます調。一文は短く。形容詞を重ねず、具体的なことを書く
- 最初の段落は、見出しを付けずに書き始める。挨拶や前置き、記事の予告はしない
- 見出し（##）は、その節の中身を表すことば。番号や「まとめ」「はじめに」「おわりに」は付けない
- 小見出し（###）は、必要なときだけ。# は使わない（題名が別にある）
- 同じ文末を三度つづけない。体言止めを、ところどころに
- 本文は ${LIMITS.body[0] + 500}〜${LIMITS.body[0] + 1200} 字を目安に。問いに答えるのに必要なことだけを書き、字数を埋めるための段落は書かない
- 店は「${site.name}」と書く。「当店」「私たち」とは書かない
- 感嘆符（！）、絵文字、【】で囲んだ強調は使わない

# 使わない言い回し
「いかがでしたか」「〜なのです」「魅力をご紹介します」「ぜひチェックしてみてください」「〜ではないでしょうか」
「この記事では〜を解説します」「〜していきましょう」「〜と言えるでしょう」「皆さん」「徹底解説」「完全ガイド」「必見」「厳選」

# 事実の扱い（いちばん大切な決まり）
${site.name}について書いてよいのは、下の「店の事実」にあることだけです。
- 事実に無いことは、たとえ自然に思えても書かない。迷ったら書かない
- 数字（料金・時間・人数・年数）は、店の事実にあるものだけを、そのままの値で使う
- 年齢の決まりは「${agePolicy.label}」。「${agePolicy.minAge}歳以下」とは書かない（意味が変わる）

とくに、次のことは確認できていないので、あるとも無いとも書かない（個室だけは「無い」と書いてよい）。
個室以外の席の種類、席数、夜景、サプライズやケーキなどの演出、魚の産地、仕入先、製法（熟成・赤酢など）、
店主の名前・経歴・修業先、創業年、置いているお酒の銘柄、ノンアルコールの用意、外国語の対応、
ラストオーダー、定休の曜日、領収書、QRコード決済、キャンセルの扱い、服装の決まり、写真撮影の可否

鮨・魚・酒についての一般的な知識は書いてよいが、広く知られていることに限る。
- 統計、割合、順位、年号、価格の相場は書かない
- ほかの店の名前、ランキング、口コミ、受賞歴、「一番」「人気」「絶品」「名店」といった評価のことばは書かない
- 自分や客の体験談を作らない（「先日いらしたお客様が…」のような話は書かない）
- 旬の魚の話は一般論として書く。${site.name}でその魚が出るとは書かない（内容はその日の仕入れで決まり、お品書きは来店までのお楽しみ）

# 店の事実
${buildFactSheet()}

# 内部リンク
本文の中に、Markdown のリンク \`[文言](/path)\` を自然に入れる。
- 固定ページへのリンクを ${LIMITS.fixedLinks[0]}〜${LIMITS.fixedLinks[1]} 本。その日の指示にある「柱のページ」には必ずリンクする
- 関連記事へのリンクを ${LIMITS.relatedLinks[0]}〜${LIMITS.relatedLinks[1]} 本。その日の指示にある候補の中からだけ選ぶ
- リンクの文言は、リンク先の中身を表すことばにする（「こちら」「詳細」は不可）。見出しの中には置かない
- 同じページへのリンクは1回。URL は下の一覧と候補にあるものだけを使い、作らない。サイトの外へのリンクは置かない

リンクしてよい固定ページ:
${fixed}

# 出力
次の項目を返す。
- title … 題名。${LIMITS.title[0]}〜${LIMITS.title[1] - 6}字。検索語のことばを自然に含める。「｜」で前後に分けてもよい。店名は入れなくてよい
- description … 検索結果に出る説明。${LIMITS.description[0] + 10}〜${LIMITS.description[1] - 10}字。記事の中身を具体的に
- summary … 一覧に出す要約。${LIMITS.summary[0] + 10}〜${LIMITS.summary[1] - 15}字
- body … 本文（Markdown）。# の題名は書かない
- secondaryKeywords … この記事が答えている関連の検索語を 3 個`;
}

function seasonLabel(month: number): string {
  if (month >= 3 && month <= 5) return "春";
  if (month >= 6 && month <= 8) return "夏";
  if (month >= 9 && month <= 11) return "秋";
  return "冬";
}

export function buildUserPrompt(args: {
  topic: Topic;
  format: (typeof FORMATS)[number];
  date: string;
  /** 関連記事としてリンクしてよい候補 */
  candidates: Post[];
  /** 最近の題名（書き出しや切り口をかぶらせないため） */
  recentTitles: string[];
}): string {
  const { topic, format, date, candidates, recentTitles } = args;
  const month = Number(date.slice(5, 7));
  const category = categoryBySlug(topic.category);
  const pillar = pages[topic.pillar];

  return `今日（${date}・${seasonLabel(month)}）の一本を書いてください。

# 題材
- 担当する検索語: ${topic.primaryKeyword}
- 関連する検索語の例: ${topic.secondaryKeywords.join(" ／ ")}
- 分類: ${category?.name ?? topic.category}
- 書くこと: ${topic.angle}
- 柱のページ（必ずリンクする）: ${pillar.path}（${pillar.label}）

この検索語で調べる人が知りたいことに、最初の数段落で答えてください。
${site.name}の話は、記事の後半に一節だけ。事実の範囲で、この題材に関係することだけを書きます。

# 書き方の型
${format.instruction}

# 関連記事の候補（この中から ${LIMITS.relatedLinks[0]}〜${LIMITS.relatedLinks[1]} 本を選び、本文の流れの中でリンクする）
${candidates.map((p) => `- /journal/${p.slug} … 「${p.title}」— ${p.summary}`).join("\n")}

# 最近の記事（題名・書き出し・見出しの立て方が似ないようにする）
${recentTitles.map((x) => `- ${x}`).join("\n")}`;
}

/** 検査に落ちたときの書き直しの指示。指摘された所だけを直させる */
export function buildRevisionPrompt(problems: Problem[]): string {
  return `いまの原稿は、次の点で公開できません。指摘された所だけを直し、ほかの文は変えずに、もう一度すべての項目を返してください。

${problems.map((p) => `- ${p.message}`).join("\n")}

直すときの注意:
- 字数が足りないときは、題材について読み手の役に立つ具体的な説明を足す（同じことの言い換えや、店の宣伝で埋めない）
- 事実シートに無い数値や内容を指摘されたら、その文を削るか、事実シートの表現に置き換える
- リンクの本数や宛先を指摘されたら、一覧と候補にある URL だけを使って直す`;
}

export function buildTopicProposalPrompt(args: {
  category: string;
  usedKeywords: string[];
  month: number;
}): string {
  const category = categoryBySlug(args.category);
  return `「季節の便り」の新しい題材を1つ、提案してください。用意していた題材を書き終えたためです。

- 分類: ${category?.name ?? args.category}（${category?.description ?? ""}）
- いまは ${args.month} 月
- すすきの・札幌で鮨を食べたい大人が、実際に検索しそうな語を1つ選ぶ（2〜4語の組み合わせ）
- 下の「すでに使った検索語」と同じもの・言い換えにすぎないものは不可
- 店の事実に無いこと（個室、夜景、サプライズ、産地、ランキングなど）を前提にした題材は不可
- 一般的な知識と、店の事実だけで、${LIMITS.body[0]}字以上を書ける題材にする

返す項目:
- id … 記事の URL になる半角英小文字とハイフン（ローマ字か英語。例: sushi-nihonshu-erabikata）
- primaryKeyword … 担当する検索語（語の間は半角スペース）
- secondaryKeywords … 関連する検索語を 2〜3 個
- angle … 何を書くか、何を書かないかを一〜二文で
- pillar … 柱にする固定ページのパス（system の「リンクしてよい固定ページ」から1つ）

すでに使った検索語:
${args.usedKeywords.map((k) => `- ${k}`).join("\n")}`;
}
