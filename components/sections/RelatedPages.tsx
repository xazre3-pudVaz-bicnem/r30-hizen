import Link from "next/link";
import { pages, type PageKey } from "@/data/pages";
import { Reveal } from "@/components/ui/Reveal";

export type RelatedItem = {
  page: PageKey;
  /** そのページへ進む理由を一文で */
  note: string;
};

/**
 * 関連する固定ページへの導線（読みもの → コース → アクセス → ご予約 と進めるための内部リンク）。
 * カードは使わず、罫で区切った行で並べる。
 */
export function RelatedPages({ heading = "あわせてご覧ください", items }: { heading?: string; items: RelatedItem[] }) {
  return (
    <section aria-labelledby="related-heading" className="bg-ink">
      <div className="wrap section-tight">
        <Reveal>
          <h2 id="related-heading" className="t-h3">
            {heading}
          </h2>
        </Reveal>
        <Reveal as="ul" className="rows mt-8" delay={0.08}>
          {items.map(({ page, note }) => (
            <li key={page}>
              <Link
                href={pages[page].path}
                className="group grid gap-x-10 gap-y-1 py-6 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:items-baseline md:py-7"
              >
                <span className="text-[1.0625rem] tracking-[0.12em] text-paper transition-colors duration-300 group-hover:text-brass">
                  {pages[page].label}
                </span>
                <span className="text-[0.875rem] leading-[1.95] text-paper-2">{note}</span>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
