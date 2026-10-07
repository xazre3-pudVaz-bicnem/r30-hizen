/**
 * 「季節の便り」— サイト側の読み出し。
 * ビルド時に Markdown を読み、静的なページにする（実行時にデータベースへは取りに行かない）。
 */
import { cache } from "react";
import { categoryBySlug, journalCategories } from "@/data/journal-categories";
import { photos, type Photo, type PhotoKey } from "@/data/photos";
import { loadPosts, type Post } from "./journal-core";

export type { Post } from "./journal-core";
export { formatDate } from "./journal-core";

export const getAllPosts = cache((): Post[] => loadPosts());

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

/** 記事があるカテゴリだけ、登録の順で返す */
export function getActiveCategories() {
  const posts = getAllPosts();
  return journalCategories
    .map((c) => ({ ...c, count: posts.filter((p) => p.category === c.slug).length }))
    .filter((c) => c.count > 0);
}

/** 記事の見出し写真。frontmatter のキーが登録に無ければ、カテゴリの1枚目に落とす */
export function postPhoto(post: Pick<Post, "photo" | "category">): Photo {
  if (post.photo in photos) return photos[post.photo as PhotoKey];
  const fallback = categoryBySlug(post.category)?.photos[0];
  return fallback && fallback in photos ? photos[fallback as PhotoKey] : photos.sushi01;
}

/** 写真の公開パス（OGP・構造化データ用の変わらない URL） */
export function postPhotoPublicPath(post: Pick<Post, "photo" | "category">): string {
  const key = post.photo in photos ? post.photo : (categoryBySlug(post.category)?.photos[0] ?? "sushi01");
  return PUBLIC_PATHS[key as PhotoKey] ?? PUBLIC_PATHS.sushi01;
}

const PUBLIC_PATHS: Record<PhotoKey, string> = {
  counter01: "/images/hizen-counter-01.webp",
  counter01Portrait: "/images/hizen-counter-01-portrait.webp",
  counter02: "/images/hizen-counter-02.webp",
  entrance01: "/images/hizen-entrance-01.webp",
  entrance02: "/images/hizen-entrance-02.webp",
  sushi01: "/images/hizen-susukino-sushi-01.webp",
  sushi02: "/images/hizen-susukino-sushi-02.webp",
  sushi03: "/images/hizen-susukino-sushi-03.webp",
  sushi04: "/images/hizen-susukino-sushi-04.webp",
  chef01: "/images/hizen-chef-01.webp",
  chef02: "/images/hizen-chef-02.webp",
  chef03: "/images/hizen-chef-03.webp",
  omakase01: "/images/hizen-omakase-01.webp",
  omakase02: "/images/hizen-omakase-02.webp",
  omakase03: "/images/hizen-omakase-03.webp",
  cuisine01: "/images/hizen-cuisine-01.webp",
  cuisine02: "/images/hizen-cuisine-02.webp",
  cuisine03: "/images/hizen-cuisine-03.webp",
  cuisine04: "/images/hizen-cuisine-04.webp",
  cuisine05: "/images/hizen-cuisine-05.webp",
  cuisine06: "/images/hizen-cuisine-06.webp",
  sake01: "/images/hizen-sake-01.webp",
  season01: "/images/hizen-season-01.webp",
};

/**
 * 関連する記事。同じカテゴリ・同じ固定ページを支える記事・近い検索語を優先する。
 * 本文中のリンクとは別に、記事の末尾へ自動で並べる。
 */
export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const words = new Set([post.primaryKeyword, ...post.secondaryKeywords].flatMap((k) => k.split(/\s+/)));
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      let score = 0;
      if (p.category === post.category) score += 3;
      if (p.pillar === post.pillar) score += 2;
      for (const w of [p.primaryKeyword, ...p.secondaryKeywords].flatMap((k) => k.split(/\s+/))) {
        if (words.has(w)) score += 1;
      }
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.p);
}

/** ある固定ページを支える記事（固定ページの下に「あわせて読む」として出す） */
export function getPostsForPillar(path: string, limit = 3): Post[] {
  return getAllPosts()
    .filter((p) => p.pillar === path)
    .slice(0, limit);
}
