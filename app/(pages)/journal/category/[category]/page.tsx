/**
 * 季節の便り — 分類ごとの一覧
 * 記事が 3 本に満たない分類は、検索エンジンに載せない（薄い一覧ページを増やさないため）。リンクは辿らせる。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalIndex } from "@/components/sections/JournalIndex";
import { PageHead } from "@/components/sections/PageHead";
import { JsonLd } from "@/components/ui/JsonLd";
import { categoryBySlug, journalCategories, MIN_POSTS_TO_INDEX } from "@/data/journal-categories";
import { pages } from "@/data/pages";
import { restaurant } from "@/data/restaurant";
import { getPostsByCategory } from "@/lib/journal";
import { breadcrumbNode, organizationNode, webPageNode, websiteNode, type Crumb } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return journalCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) return {};
  const count = getPostsByCategory(slug).length;
  return buildMetadata({
    title: `${category.name}｜${pages.journal.label}｜${restaurant.name}`,
    description: `${category.description}${restaurant.name}の読みもの「${pages.journal.label}」から、${category.name}についての記事をまとめました。`,
    path: `/journal/category/${slug}`,
    ogImage: pages.journal.ogImage,
    noindex: count < MIN_POSTS_TO_INDEX,
  });
}

export default async function JournalCategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  const posts = getPostsByCategory(slug);
  const path = `/journal/category/${slug}`;
  const pillar = pages[category.pillar];
  const crumbs: Crumb[] = [
    { name: pages.home.label, path: pages.home.path },
    { name: pages.journal.label, path: pages.journal.path },
    { name: category.name, path },
  ];

  return (
    <>
      <JsonLd
        graph={[
          organizationNode(),
          websiteNode(),
          webPageNode({
            path,
            title: `${category.name}｜${pages.journal.label}`,
            description: category.description,
            type: "CollectionPage",
            hasBreadcrumb: true,
          }),
          breadcrumbNode(crumbs, path),
        ]}
      />
      <PageHead crumbs={crumbs} label={pages.journal.label} title={category.name} lead={category.description} />

      <JournalIndex posts={posts} currentCategory={slug} />

      <div className="wrap pb-[calc(var(--gap)/2)]">
        <p className="t-note">{pillar.teaser}</p>
        <p className="mt-2">
          <Link href={pillar.path} className="more">
            {pillar.label}
          </Link>
        </p>
      </div>
    </>
  );
}
