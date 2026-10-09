/**
 * 季節の便り — 一覧の2ページ目以降
 * 記事が増えると自動でページが増える（1ページ 20 本）。
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JournalIndex, JOURNAL_PER_PAGE, journalPageCount } from "@/components/sections/JournalIndex";
import { PageHead } from "@/components/sections/PageHead";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { restaurant } from "@/data/restaurant";
import { getAllPosts } from "@/lib/journal";
import { breadcrumbNode, organizationNode, webPageNode, websiteNode, type Crumb } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ page: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  const total = journalPageCount(getAllPosts().length);
  // 1ページ目は /journal。ここは 2 ページ目から
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ page: String(i + 2) }));
}

function resolve(pageParam: string) {
  const n = Number(pageParam);
  const all = getAllPosts();
  const total = journalPageCount(all.length);
  if (!Number.isInteger(n) || n < 2 || n > total) return null;
  return { n, total, posts: all.slice((n - 1) * JOURNAL_PER_PAGE, n * JOURNAL_PER_PAGE) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const r = resolve(page);
  if (!r) return {};
  return buildMetadata({
    title: `${pages.journal.label}（${r.n}ページ目）｜${restaurant.name}`,
    description: `${restaurant.name}の読みもの「${pages.journal.label}」の一覧、${r.n}ページ目です。旬の魚、鮨の仕事、酒との合わせ方について。`,
    path: `/journal/page/${r.n}`,
    ogImage: pages.journal.ogImage,
  });
}

export default async function JournalPagedPage({ params }: Props) {
  const { page } = await params;
  const r = resolve(page);
  if (!r) notFound();

  const path = `/journal/page/${r.n}`;
  const crumbs: Crumb[] = [
    { name: pages.home.label, path: pages.home.path },
    { name: pages.journal.label, path: pages.journal.path },
    { name: `${r.n}ページ目`, path },
  ];

  return (
    <>
      <JsonLd
        graph={[
          organizationNode(),
          websiteNode(),
          webPageNode({
            path,
            title: `${pages.journal.label}（${r.n}ページ目）`,
            description: pages.journal.description,
            type: "CollectionPage",
            hasBreadcrumb: true,
          }),
          breadcrumbNode(crumbs, path),
        ]}
      />
      <PageHead crumbs={crumbs} label="読みもの" title={`${pages.journal.label}　${r.n}ページ目`} />
      <JournalIndex posts={r.posts} pagination={{ current: r.n, total: r.total }} />
    </>
  );
}
