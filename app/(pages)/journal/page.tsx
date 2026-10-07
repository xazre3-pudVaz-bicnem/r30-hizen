/**
 * 季節の便り — 一覧
 * 担当する検索語: すすきの 寿司 コラム（記事の入口。個別の話題は各記事の担当）
 */
import type { Metadata } from "next";
import { JournalIndex, JOURNAL_PER_PAGE, journalPageCount } from "@/components/sections/JournalIndex";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { getAllPosts } from "@/lib/journal";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.journal;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function JournalPage() {
  const all = getAllPosts();

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs, [], "CollectionPage")} />
      <PageHead
        crumbs={crumbs}
        label="読みもの"
        title={page.label}
        lead="旬の魚、鮨の仕事、酒との合わせ方。すすきのでの過ごし方も、少しずつ綴っていきます。"
      />
      <JournalIndex
        posts={all.slice(0, JOURNAL_PER_PAGE)}
        pagination={{ current: 1, total: journalPageCount(all.length) }}
      />
      <ReservationBlock />
    </>
  );
}
