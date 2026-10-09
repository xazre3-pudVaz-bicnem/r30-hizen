import Link from "next/link";
import type { Crumb } from "@/lib/schema";

/**
 * パンくず。構造化データ（BreadcrumbList）は各ページの JsonLd が同じ配列から出す。
 * いまいるページの名前が長いとき（記事の題名など）は、1行に収めて末尾を省く。全文は h1 にある。
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="パンくず" className="t-note">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className={`flex items-center gap-x-3 ${last ? "min-w-0" : ""}`}>
              {i > 0 && (
                <span aria-hidden="true" className="shrink-0">
                  ／
                </span>
              )}
              {last ? (
                <span aria-current="page" className="max-w-[58vw] truncate text-paper-2 md:max-w-[36rem]">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="inline-flex min-h-6 items-center transition-colors duration-300 hover:text-paper">
                  {c.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
