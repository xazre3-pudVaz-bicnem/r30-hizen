import Link from "next/link";
import { pages } from "@/data/pages";
import type { Post } from "@/lib/journal";
import { getActiveCategories } from "@/lib/journal";
import { JournalRows } from "./JournalRows";

/** 1ページに並べる記事の数 */
export const JOURNAL_PER_PAGE = 20;

export function journalPageCount(total: number): number {
  return Math.max(1, Math.ceil(total / JOURNAL_PER_PAGE));
}

type Props = {
  posts: Post[];
  /** いまの分類（分類ページのとき） */
  currentCategory?: string;
  /** ページ送り（一覧のとき） */
  pagination?: { current: number; total: number };
};

/** 記事の一覧と、分類の切り替え。/journal・/journal/page/n・/journal/category/x で共通 */
export function JournalIndex({ posts, currentCategory, pagination }: Props) {
  const categories = getActiveCategories();

  return (
    <div className="bg-ink">
      <div className="wrap section-tight">
        <nav aria-label="分類" className="border-y border-line py-5">
          <ul className="flex flex-wrap gap-x-8 gap-y-1">
            <li>
              <Link
                href={pages.journal.path}
                aria-current={!currentCategory ? "page" : undefined}
                className="nav-link"
              >
                すべて
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/journal/category/${c.slug}`}
                  aria-current={currentCategory === c.slug ? "page" : undefined}
                  className="nav-link"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6">
          {posts.length > 0 ? (
            <JournalRows posts={posts} headingLevel="h2" withSummary />
          ) : (
            <p className="py-16">ただいま準備中です。</p>
          )}
        </div>

        {pagination && pagination.total > 1 && (
          <nav aria-label="ページ送り" className="mt-12 flex items-center justify-between gap-6">
            {pagination.current > 1 ? (
              <Link
                href={pagination.current === 2 ? pages.journal.path : `/journal/page/${pagination.current - 1}`}
                className="more"
                rel="prev"
              >
                新しい便り
              </Link>
            ) : (
              <span />
            )}
            <p className="t-note">
              <span className="num">{pagination.current}</span> ／ <span className="num">{pagination.total}</span>
            </p>
            {pagination.current < pagination.total ? (
              <Link href={`/journal/page/${pagination.current + 1}`} className="more" rel="next">
                以前の便り
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
