/**
 * 「季節の便り」の記事を読む部分。
 *
 * サイト（Next.js）と、自動投稿のスクリプト（tsx）の両方から使う。
 * そのため、ここでは next/* や画像の import を使わない。
 *
 * 記事は content/journal/<slug>.md に、frontmatter つきの Markdown で置く。
 * frontmatter が壊れた記事は、警告を出して読み飛ばす（1本の不備でサイト全体のビルドを落とさない）。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { categorySlugs } from "../data/journal-categories";

export const JOURNAL_DIR = path.join(process.cwd(), "content", "journal");

export type PostMeta = {
  slug: string;
  title: string;
  /** meta description */
  description: string;
  /** 一覧に出す要約 */
  summary: string;
  /** 公開日 YYYY-MM-DD（日本時間） */
  date: string;
  /** 更新日 YYYY-MM-DD */
  updated?: string;
  category: string;
  /** この記事が担当する検索語（1記事1つ。サイト内で重ねない） */
  primaryKeyword: string;
  secondaryKeywords: string[];
  /** 主に支える固定ページのパス */
  pillar: string;
  /** 見出し写真（data/photos.ts のキー） */
  photo: string;
  /** 題材の ID（data/journal-topics.ts）。手書きの記事は無くてよい */
  topicId?: string;
  /** 書き方の型（自動投稿が毎回ちがう構成にするための記録） */
  format?: string;
  /** editor＝人が書いた／auto＝自動投稿 */
  author: "editor" | "auto";
  /** 同じ日の記事の並び順（大きいほど上） */
  order: number;
};

export type Post = PostMeta & {
  body: string;
  /** 本文の文字数（記法を除く） */
  chars: number;
  headings: { id: string; text: string }[];
};

/** Markdown の記法を落として、文字だけにする */
export function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\|/g, "")
    .replace(/^[-:\s]+$/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, "");
}

/** 本文の h2 を拾う（目次と、構成の焼き直し検査に使う） */
export function h2List(markdown: string): string[] {
  return [...markdown.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1].replace(/[*_`]/g, "").trim());
}

/** 本文中のリンク先（内部・外部とも） */
export function linkTargets(markdown: string): { text: string; href: string }[] {
  return [...markdown.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].map((m) => ({ text: m[1], href: m[2] }));
}

function toDateString(v: unknown): string | undefined {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return undefined;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/** 1ファイルを読む。不備があれば理由を返す */
export function parsePost(file: string): { post?: Post; error?: string } {
  const slug = path.basename(file, ".md");
  let raw: string;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch (e) {
    return { error: `読めません: ${(e as Error).message}` };
  }
  let fm: matter.GrayMatterFile<string>;
  try {
    fm = matter(raw);
  } catch (e) {
    return { error: `frontmatter を解釈できません: ${(e as Error).message}` };
  }
  const d = fm.data as Record<string, unknown>;

  const title = str(d.title);
  const description = str(d.description);
  const summary = str(d.summary) ?? description;
  const date = toDateString(d.date);
  const category = str(d.category);
  const primaryKeyword = str(d.primaryKeyword);
  const pillar = str(d.pillar);
  const photo = str(d.photo);

  const missing = Object.entries({ title, description, date, category, primaryKeyword, pillar, photo })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) return { error: `frontmatter に不足: ${missing.join(", ")}` };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: `ファイル名（slug）は半角英小文字・数字・ハイフンで: ${slug}` };
  if (!categorySlugs.includes(category!)) return { error: `カテゴリが登録にありません: ${category}` };

  const body = fm.content.trim();
  if (!body) return { error: "本文がありません" };

  const secondaryKeywords = Array.isArray(d.secondaryKeywords)
    ? d.secondaryKeywords.filter((x): x is string => typeof x === "string" && x.trim() !== "")
    : [];

  const post: Post = {
    slug,
    title: title!,
    description: description!,
    summary: summary!,
    date: date!,
    updated: toDateString(d.updated),
    category: category!,
    primaryKeyword: primaryKeyword!,
    secondaryKeywords,
    pillar: pillar!,
    photo: photo!,
    topicId: str(d.topicId),
    format: str(d.format),
    author: d.author === "auto" ? "auto" : "editor",
    order: typeof d.order === "number" ? d.order : 0,
    body,
    chars: plainText(body).length,
    headings: h2List(body).map((text, i) => ({ id: `sec-${i + 1}`, text })),
  };
  return { post };
}

/**
 * 全記事を新しい順に読む。
 * 読む場所は content/journal に固定している（パスを引数で受けると、ビルドがプロジェクト全体を
 * サーバーの同梱対象として追跡してしまうため）。
 */
export function loadPosts(): Post[] {
  if (!fs.existsSync(JOURNAL_DIR)) return [];
  const posts: Post[] = [];
  for (const name of fs.readdirSync(JOURNAL_DIR)) {
    if (!name.endsWith(".md") || name.startsWith("_")) continue;
    const { post, error } = parsePost(path.join(process.cwd(), "content", "journal", name));
    if (post) posts.push(post);
    else console.warn(`[journal] ${name} を読み飛ばしました — ${error}`);
  }
  return posts.sort(comparePosts);
}

export function comparePosts(a: PostMeta, b: PostMeta): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  if (a.order !== b.order) return b.order - a.order;
  return a.slug < b.slug ? -1 : 1;
}

/** 2026-10-07 → 2026.10.07 */
export function formatDate(date: string): string {
  return date.replaceAll("-", ".");
}

/** 日本時間の今日 YYYY-MM-DD */
export function todayJst(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
