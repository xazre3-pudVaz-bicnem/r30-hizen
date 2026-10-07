/** 題材・書き方の型・関連記事の候補・写真を選ぶ。乱数は使わない（同じ状態なら、いつも同じものが選ばれる） */
import { categoryBySlug } from "../../../data/journal-categories";
import { topics, type Topic } from "../../../data/journal-topics";
import { pageList, pages } from "../../../data/pages";
import type { Post } from "../../../lib/journal-core";
import { FORMATS } from "./prompt";
import { hash, keywordKey } from "./text";

/** すでに使われている検索語（固定ページ＋記事） */
export function usedKeywordKeys(posts: Post[]): Set<string> {
  return new Set([...pageList.map((p) => p.primaryKeyword), ...posts.map((p) => p.primaryKeyword)].map(keywordKey));
}

/** まだ書いていない題材（その月に出してよいもの） */
export function openTopics(posts: Post[], date: string): Topic[] {
  const month = Number(date.slice(5, 7));
  const usedIds = new Set([...posts.map((p) => p.topicId), ...posts.map((p) => p.slug)]);
  const usedKeys = usedKeywordKeys(posts);
  return topics.filter(
    (x) => !usedIds.has(x.id) && !usedKeys.has(keywordKey(x.primaryKeyword)) && (!x.months || x.months.includes(month)),
  );
}

export function selectTopic(posts: Post[], date: string, forcedId?: string): Topic | undefined {
  if (forcedId) {
    const found = topics.find((x) => x.id === forcedId);
    if (!found) throw new Error(`指定の題材が見つかりません: ${forcedId}`);
    return found;
  }

  const open = openTopics(posts, date);
  if (open.length === 0) return undefined;

  // 直近2本と同じ分類は避ける（同じ話題がつづかないように）。候補が無くなるなら、その条件だけ外す
  const recentCategories = posts.slice(0, 2).map((p) => p.category);
  const fresh = open.filter((x) => !recentCategories.includes(x.category));
  const pool = fresh.length > 0 ? fresh : open;

  const countByCategory = new Map<string, number>();
  for (const p of posts) countByCategory.set(p.category, (countByCategory.get(p.category) ?? 0) + 1);

  // 季節の題材は、その月のうちに出す。あとは、記事の少ない分類を先に
  return [...pool].sort((a, b) => {
    const season = Number(Boolean(b.months)) - Number(Boolean(a.months));
    if (season !== 0) return season;
    const count = (countByCategory.get(a.category) ?? 0) - (countByCategory.get(b.category) ?? 0);
    if (count !== 0) return count;
    return topics.indexOf(a) - topics.indexOf(b);
  })[0];
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
