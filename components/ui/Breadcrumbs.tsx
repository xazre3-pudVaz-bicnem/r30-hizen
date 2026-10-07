import Link from "next/link";
import type { Crumb } from "@/lib/schema";

/** パンくず。構造化データ（BreadcrumbList）は各ページの JsonLd が同じ配列から出す */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="パンくず" className="t-note">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-x-3">
              {i > 0 && (
                <span aria-hidden="true">／</span>
              )}
              {last ? (
                <span aria-current="page" className="text-paper-2">
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
