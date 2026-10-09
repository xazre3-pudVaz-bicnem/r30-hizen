/**
 * 題材の近さを測る（簡易の類似度）。
 *
 * 使いどころは2つ。
 *   書く前 … これから書く題材が、公開済みの記事と近すぎないか。近ければ、その題材は見送って別の題材にする
 *   書いた後 … できた原稿（題名・要約・関連語・答えている問い）が、公開済みの記事と近すぎないか
 *
 * 比べるもの（公開済みの記事から取る項目）
 *   title ／ slug ／ primaryKeyword ／ secondaryKeywords ／ category ／ summary ／ semanticTopic
 *
 * 外部の API（埋め込み）は使わない。語の重なり（Jaccard）と、2文字単位の重なり（Dice）で足りる規模のため。
 * 本文そのものの写し・言い換えは、validate.ts の 8文字の連なり（shingleOverlap）が別に見る。
 */
import type { Post } from "../../../lib/journal-core";
import { dice, normalize } from "./text";

export type Theme = {
  slug: string;
  category: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  title?: string;
  summary?: string;
  /** 答えている問い（記事なら frontmatter の semanticTopic、題材なら angle） */
  semanticTopic?: string;
};

/** どの記事にも出てくるので、近さの判断に使わない語（正規化したあとの形） */
const COMMON = new Set(
  ["すすきの", "札幌", "北海道", "寿司", "握り寿司", "握り", "とは", "店", "夜", "大人", "r30hizen", "r30", "hizen", "食事", "ディナー"].map(normalize),
);

function words(keywords: string[]): Set<string> {
  const out = new Set<string>();
  for (const k of keywords) {
    for (const w of k.split(/\s+/)) {
      const n = normalize(w);
      if (n && !COMMON.has(n)) out.add(n);
    }
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let hit = 0;
  for (const x of a) if (b.has(x)) hit++;
  return hit / (a.size + b.size - hit);
}

export function themeOfPost(p: Post): Theme {
  return {
    slug: p.slug,
    category: p.category,
    primaryKeyword: p.primaryKeyword,
    secondaryKeywords: p.secondaryKeywords,
    title: p.title,
    summary: p.summary,
    semanticTopic: p.semanticTopic,
  };
}

export type Closeness = {
  /** 0〜1。大きいほど近い */
  score: number;
  /** いちばん効いた見方 */
  by: "担当する検索語" | "関連の検索語" | "答えている問い" | "題名" | "要約";
};

/**
 * 2つの題材の近さ。
 * いくつかの見方のうち、いちばん近く出たものを採る（どれか1つでも重なっていれば、読み手には同じ話に見えるため）。
 */
export function themeCloseness(a: Theme, b: Theme): Closeness {
  const views: Closeness[] = [
    // 担当する検索語どうし（共通語を除いた語の重なり）
    { by: "担当する検索語", score: jaccard(words([a.primaryKeyword]), words([b.primaryKeyword])) },
    // 関連語まで含めた語の重なり。語数が増えるぶん、少し割り引く
    {
      by: "関連の検索語",
      score: 0.85 * jaccard(words([a.primaryKeyword, ...a.secondaryKeywords]), words([b.primaryKeyword, ...b.secondaryKeywords])),
    },
  ];
  if (a.semanticTopic && b.semanticTopic) views.push({ by: "答えている問い", score: dice(a.semanticTopic, b.semanticTopic) });
  if (a.title && b.title) views.push({ by: "題名", score: dice(a.title, b.title) });
  if (a.summary && b.summary) views.push({ by: "要約", score: dice(a.summary, b.summary) });
  return views.reduce((best, v) => (v.score > best.score ? v : best));
}

/** これ以上なら「同じ話」とみなす */
export const THEME_TOO_CLOSE = 0.6;

/** 公開済みの記事のうち、いちばん近いもの */
export function closestPost(theme: Theme, posts: Post[]): { post: Post; closeness: Closeness } | undefined {
  let best: { post: Post; closeness: Closeness } | undefined;
  for (const post of posts) {
    if (post.slug === theme.slug) continue;
    const closeness = themeCloseness(theme, themeOfPost(post));
    if (!best || closeness.score > best.closeness.score) best = { post, closeness };
  }
  return best;
}
