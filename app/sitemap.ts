import type { MetadataRoute } from "next";
import { journalCategories, MIN_POSTS_TO_INDEX } from "@/data/journal-categories";
import { pageList } from "@/data/pages";
import { CONFIRMED_AT } from "@/data/restaurant";
import { getAllPosts } from "@/lib/journal";
import { absoluteUrl, isIndexable } from "@/lib/seo";

/**
 * sitemap.xml。
 * 記事（content/journal）を足して再ビルドすれば、自動で反映される。
 * 公開 URL が決まっていない環境（プレビュー・手元）では空にする。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexable) return [];

  const posts = getAllPosts();
  const latest = posts[0]?.date ?? CONFIRMED_AT;

  const fixed: MetadataRoute.Sitemap = pageList.map((p) => ({
    url: absoluteUrl(p.path)!,
    // トップと一覧は、新しい記事が出るたびに変わる
    lastModified: p.path === "/" || p.path === "/journal" ? latest : CONFIRMED_AT,
    changeFrequency: p.path === "/" || p.path === "/journal" ? "daily" : "monthly",
    priority: p.path === "/" ? 1 : 0.8,
  }));

  const categories: MetadataRoute.Sitemap = journalCategories
    .map((c) => ({ c, list: posts.filter((p) => p.category === c.slug) }))
    .filter(({ list }) => list.length >= MIN_POSTS_TO_INDEX)
    .map(({ c, list }) => ({
      url: absoluteUrl(`/journal/category/${c.slug}`)!,
      lastModified: list[0].date,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  const articles: MetadataRoute.Sitemap = posts.map((p) => ({
    url: absoluteUrl(`/journal/${p.slug}`)!,
    lastModified: p.updated ?? p.date,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...fixed, ...categories, ...articles];
}
