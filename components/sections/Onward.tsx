import Link from "next/link";
import { categoryBySlug } from "@/data/journal-categories";
import { pages, type PageKey } from "@/data/pages";
import { formatDate, getPostsForPillar } from "@/lib/journal";
import { Phrase } from "@/components/ui/Phrase";
import { Reveal } from "@/components/ui/Reveal";

/**
 * 進む先。ページの名前だけを書けば、添える一文は data/pages.ts の teaser が出る。
 * その場面に合わせて言い換えたいときだけ、note を付ける。
 */
export type OnwardItem = PageKey | { page: PageKey; note: string };

/**
 * ページの終わりに置く「つづき」。
 * 関連する案内（2〜3件）と、そのページを支える季節の便りを、小さな文字で静かに並べる。
 * 一覧の箱やカードにはしない。リンクの数も絞る（多く並べるほど、読む人には広告の列に見える）。
 *
 * pillar を渡すと、そのページを pillar に指定した記事が自動で並ぶ（無ければ、その段は出ない）。
 */
export function Onward({ items, pillar, posts: postLimit = 3 }: { items: OnwardItem[]; pillar?: string; posts?: number }) {
  const posts = pillar ? getPostsForPillar(pillar, postLimit) : [];
  const links = items.map((it) => (typeof it === "string" ? { page: it, note: pages[it].teaser } : it));

  return (
    <section aria-label="あわせてご覧ください" className="border-t border-line">
      <div className="wrap section-tight grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
        <Reveal className="lg:col-span-5">
          <h2 className="label">あわせてご覧ください</h2>
          <ul className="mt-4">
            {links.map(({ page, note }) => (
              <li key={page}>
                <Link href={pages[page].path} className="group block py-3.5">
                  <span className="link tracking-[0.1em]">{pages[page].label}</span>{" "}
                  <span className="t-note mt-1.5 block">{note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        {posts.length > 0 && (
          <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.08}>
            <h2 className="label">{pages.journal.label}から</h2>
            <ul className="mt-4">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/journal/${post.slug}`} className="group block py-3.5">
                    <span className="link tracking-[0.08em]">
                      <Phrase>{post.title}</Phrase>
                    </span>{" "}
                    <span className="t-note mt-1.5 block">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>{" "}
                      {categoryBySlug(post.category) && <span className="ml-4">{categoryBySlug(post.category)!.name}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
}
