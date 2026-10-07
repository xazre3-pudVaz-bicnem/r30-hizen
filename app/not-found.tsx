import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { pages } from "@/data/pages";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: `ページが見つかりません｜${site.name}` },
  description: "お探しのページは、移動または削除された可能性があります。",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="bg-ink">
        <div className="wrap page-head min-h-[70svh]">
          <p className="label">404</p>
          <h1 className="t-h1 mt-5">
            <span className="ib">お探しのページは、</span>
            <span className="ib">見つかりませんでした。</span>
          </h1>
          <p className="measure mt-8">サイトを新しくした際に、ページの場所が変わっていることがあります。下のリンクからお進みください。</p>
          <ul className="rows mt-12 max-w-[34rem]">
            {[pages.home, pages.omakase, pages.access, pages.reservation, pages.journal].map((p) => (
              <li key={p.path}>
                <Link href={p.path} className="flex min-h-14 items-center text-paper transition-colors duration-300 hover:text-brass">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
