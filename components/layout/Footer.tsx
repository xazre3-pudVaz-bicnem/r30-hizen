import Link from "next/link";
import { footerNav, pages } from "@/data/pages";
import { agePolicy, buildingLine, hoursLine, postalLine, site, telHref } from "@/data/site";
import { Logo } from "./Logo";

/** フッター。店名・住所・電話番号は data/site.ts から出す（全ページ同じ表記） */
export function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="wrap section-tight no-cv">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <Link href="/" className="inline-flex min-h-11 items-center">
              <Logo width={132} />
              <span className="sr-only">トップページへ</span>
            </Link>

            <address className="mt-8 text-[0.875rem] leading-[2.1] text-paper-2">
              <p>{postalLine}</p>
              <p>
                {site.address.region}
                {site.address.locality}
                {site.address.street}
              </p>
              <p>{buildingLine}</p>
              <p className="mt-4">
                <a href={telHref} className="inline-flex min-h-11 items-center text-paper">
                  <span className="num text-[1.5rem]">{site.tel.display}</span>
                </a>
              </p>
            </address>

            <p className="mt-2 text-[0.875rem] text-paper-2">
              {hoursLine}（{site.hours.closedLabel}）
            </p>
            <p className="t-note mt-4">
              {agePolicy.label}／{site.seating.style}／{site.seating.smoking}
            </p>

            <p className="mt-8">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="link inline-flex min-h-11 items-center text-[0.8125rem] tracking-[0.2em]"
              >
                <span className="latin">Instagram</span>
                <span className="sr-only">（別のタブで開きます）</span>
              </a>
            </p>
          </div>

          <nav aria-label="フッターメニュー" className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-[repeat(4,max-content)] md:justify-between">
            {footerNav.map((group) => (
              <div key={group.heading}>
                <p className="label">{group.heading}</p>
                <ul className="mt-4">
                  {group.items.map((k) => (
                    <li key={k}>
                      <Link
                        href={pages[k].path}
                        className="flex min-h-10 items-center text-[0.875rem] text-paper-2 transition-colors duration-300 hover:text-paper"
                      >
                        {pages[k].label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="t-note mt-20">
          <span className="latin text-[0.6875rem]">&copy; {new Date().getFullYear()} {site.name}</span>
        </p>
      </div>
    </footer>
  );
}
