import Link from "next/link";
import { pages } from "@/data/pages";
import { getPostsForPillar } from "@/lib/journal";
import { Reveal } from "@/components/ui/Reveal";
import { JournalRows } from "./JournalRows";

/**
 * 固定ページの下に出す「季節の便りから」。
 * そのページを pillar に指定した記事が自動で並ぶ（記事が無ければ区画ごと出ない）。
 * 記事 → 固定ページ だけでなく、固定ページ → 記事 のリンクもここで張られる。
 */
export function PillarPosts({ path, limit = 3 }: { path: string; limit?: number }) {
  const posts = getPostsForPillar(path, limit);
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="pillar-posts-heading" className="border-t border-line bg-ink">
      <div className="wrap section-tight">
        <Reveal className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
          <h2 id="pillar-posts-heading" className="t-h3">
            {pages.journal.label}から
          </h2>
          <Link href={pages.journal.path} className="more">
            一覧を見る
          </Link>
        </Reveal>
        <Reveal className="mt-8" delay={0.08}>
          <JournalRows posts={posts} />
        </Reveal>
      </div>
    </section>
  );
}
