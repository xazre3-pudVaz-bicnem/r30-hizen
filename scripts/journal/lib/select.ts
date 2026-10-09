/**
 * 何を書くかを決める：題材・書き方の型・関連記事の候補・写真。
 * 乱数は使わない（同じ状態なら、いつも同じものが選ばれる）。
 *
 * 書く順番
 *   1. 店からのメモ（data/shop-notes.ts）で、まだ記事にしていないもの … この店にしか書けない話
 *   2. 題材の一覧（data/journal-topics.ts）。優先度 A → B → C を、最近の記事の割合を見ながら選ぶ
 *      A＝店の仕事・コース・名物・決まり ／ B＝すすきのでの場面 ／ C＝鮨と酒の一般知識
 *   どちらも、公開済みの記事と題材が近すぎるものは見送る（lib/similarity.ts）。
 */
import { categoryBySlug } from "../../../data/journal-categories";
import { tierOf, topics, type Tier, type Topic } from "../../../data/journal-topics";
import { pageList, pages } from "../../../data/pages";
import { shopNotes, type ShopNote } from "../../../data/shop-notes";
import type { Post } from "../../../lib/journal-core";
import { FORMATS } from "./prompt";
import { closestPost, THEME_TOO_CLOSE } from "./similarity";
import { hash, keywordKey } from "./text";

/** 書く対象。題材の一覧の1件か、店からのメモ1件 */
export type Job = Topic & { note?: ShopNote };

/** すでに使われている検索語（固定ページ＋記事） */
export function usedKeywordKeys(posts: Post[]): Set<string> {
  return new Set([...pageList.map((p) => p.primaryKeyword), ...posts.map((p) => p.primaryKeyword)].map(keywordKey));
}

function usedIds(posts: Post[]): Set<string | undefined> {
  return new Set([...posts.map((p) => p.topicId), ...posts.map((p) => p.slug)]);
}

/** まだ書いていない題材（その月に出してよいもの） */
export function openTopics(posts: Post[], date: string): Topic[] {
  const month = Number(date.slice(5, 7));
  const ids = usedIds(posts);
  const usedKeys = usedKeywordKeys(posts);
  return topics.filter((x) => !ids.has(x.id) && !usedKeys.has(keywordKey(x.primaryKeyword)) && (!x.months || x.months.includes(month)));
}

/** 店からのメモのうち、まだ記事にしていないもの（期限を過ぎたものは除く）。期限の近い順 */
export function openNotes(posts: Post[], date: string): ShopNote[] {
  const ids = usedIds(posts);
  const usedKeys = usedKeywordKeys(posts);
  return shopNotes
    .filter((n) => !ids.has(n.id) && !usedKeys.has(keywordKey(n.primaryKeyword)) && (!n.until || n.until >= date))
    .sort((a, b) => (a.until ?? "9999") .localeCompare(b.until ?? "9999") || a.date.localeCompare(b.date));
}

export function jobFromNote(note: ShopNote): Job {
  return {
    id: note.id,
    category: note.category ?? "hizen",
    tier: "A",
    pillar: note.pillar ?? "cuisine",
    primaryKeyword: note.primaryKeyword,
    secondaryKeywords: note.secondaryKeywords ?? [],
    angle: `店からのメモ（${note.kind}）にある事実を軸に、「${note.subject}」を書く。メモと店の事実に無いことは足さない`,
    note,
  };
}

// ---- 優先度の配分 -----------------------------------------------------------

/** 最近の記事に占める割合の目安。A（店にしか書けない話）をいちばん多く */
export const TIER_TARGET: Record<Tier, number> = { A: 0.45, B: 0.4, C: 0.15 };
/** 割合を見る本数（およそ2週間分） */
const TIER_WINDOW = 14;
const TIERS: Tier[] = ["A", "B", "C"];

/** 記事の優先度。frontmatter に無ければ、題材の一覧か分類から決める */
export function tierOfPost(p: Post): Tier {
  if (p.tier) return p.tier;
  const topic = topics.find((x) => x.id === (p.topicId ?? p.slug));
  return topic ? topic.tier : tierOf(p.slug, p.category);
}

export function tierShares(posts: Post[]): Record<Tier, number> {
  const recent = posts.slice(0, TIER_WINDOW);
  const share = (t: Tier) => (recent.length === 0 ? 0 : recent.filter((p) => tierOfPost(p) === t).length / recent.length);
  return { A: share("A"), B: share("B"), C: share("C") };
}

/** いま足りていない順に並べた優先度（目安との差が大きいものが先。同じなら A → B → C） */
export function tierOrder(posts: Post[]): Tier[] {
  const shares = tierShares(posts);
  return [...TIERS].sort((a, b) => TIER_TARGET[b] - shares[b] - (TIER_TARGET[a] - shares[a]) || TIERS.indexOf(a) - TIERS.indexOf(b));
}

// ---- 題材選び ---------------------------------------------------------------

export type Skipped = { id: string; reason: string };

/**
 * 書ける題材を、試す順に並べて返す。
 * 先頭の題材で原稿が通らなかったとき（既存の記事と重なる、など）は、次の題材に替えて書く。
 */
export function candidateJobs(posts: Post[], date: string, forcedId?: string): { jobs: Job[]; skipped: Skipped[] } {
  if (forcedId) {
    const note = shopNotes.find((n) => n.id === forcedId);
    if (note) return { jobs: [jobFromNote(note)], skipped: [] };
    const found = topics.find((x) => x.id === forcedId);
    if (!found) throw new Error(`指定の題材が見つかりません: ${forcedId}`);
    return { jobs: [found], skipped: [] };
  }

  const recent = posts.slice(0, 2).map((p) => p.category);
  const order = tierOrder(posts);
  const countByCategory = new Map<string, number>();
  for (const p of posts) countByCategory.set(p.category, (countByCategory.get(p.category) ?? 0) + 1);

  const ranked = [...openTopics(posts, date)].sort((a, b) => {
    // 直前の記事と同じ分類は後ろへ（同じ話題がつづかないように）
    const justNow = Number(a.category === recent[0]) - Number(b.category === recent[0]);
    if (justNow !== 0) return justNow;
    // いま足りていない優先度を先に
    const tier = order.indexOf(a.tier) - order.indexOf(b.tier);
    if (tier !== 0) return tier;
    // 2本前と同じ分類も、できれば避ける
    const before = Number(recent.includes(a.category)) - Number(recent.includes(b.category));
    if (before !== 0) return before;
    // 季節の題材は、その月のうちに出す
    const season = Number(Boolean(b.months)) - Number(Boolean(a.months));
    if (season !== 0) return season;
    // 記事の少ない分類を先に
    const count = (countByCategory.get(a.category) ?? 0) - (countByCategory.get(b.category) ?? 0);
    if (count !== 0) return count;
    return topics.indexOf(a) - topics.indexOf(b);
  });

  const jobs: Job[] = [];
  const skipped: Skipped[] = [];
  for (const job of [...openNotes(posts, date).map(jobFromNote), ...ranked]) {
    // 公開済みの記事と題材が近すぎるものは見送る
    const near = closestPost(
      { slug: job.id, category: job.category, primaryKeyword: job.primaryKeyword, secondaryKeywords: job.secondaryKeywords, semanticTopic: job.angle },
      posts,
    );
    if (near && near.closeness.score >= THEME_TOO_CLOSE) {
      skipped.push({ id: job.id, reason: `記事 ${near.post.slug} と題材が近い（${near.closeness.by}・${near.closeness.score.toFixed(2)}）` });
      continue;
    }
    jobs.push(job);
  }
  return { jobs, skipped };
}

/** 次に書く題材（1つ）。無ければ undefined */
export function selectTopic(posts: Post[], date: string, forcedId?: string): Job | undefined {
  return candidateJobs(posts, date, forcedId).jobs[0];
}

/** 書き方の型。直近3本と違うものを、題材ごとに決まった形で選ぶ */
export function selectFormat(topic: Topic, posts: Post[]) {
  const recent = posts.slice(0, 3).map((p) => p.format);
  const pool = FORMATS.filter((f) => !recent.includes(f.id));
  const list = pool.length > 0 ? pool : FORMATS;
  return list[hash(topic.id) % list.length];
}

/** 関連記事の候補。同じ分類・同じ柱のページを支える記事を先に、あとは新しい順 */
export function relatedCandidates(topic: Topic, posts: Post[], limit = 8): Post[] {
  const pillarPath = pages[topic.pillar].path;
  return [...posts]
    .map((p) => ({ p, score: (p.category === topic.category ? 2 : 0) + (p.pillar === pillarPath ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.p);
}

/** 見出し写真。分類ごとの候補から、題材ごとに決まった1枚 */
export function pickPhoto(topic: Topic): string {
  const list = categoryBySlug(topic.category)?.photos ?? ["sushi01"];
  return list[hash(topic.id) % list.length];
}
