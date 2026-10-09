import Link from "next/link";
import { footerNav, pages } from "@/data/pages";
import { agePolicy, buildingLine, hoursLine, postalLine, restaurant, telHref } from "@/data/restaurant";
import { Logo } from "./Logo";

/**
 * フッター。
 * 店名・住所・電話番号は data/restaurant.ts から出す（全ページ同じ表記）。
 * ヘッダーのメニューに出していないページ（ご利用の場面・はじめての方へ）へは、ここからたどれる。
 */
export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-2">
      <div className="wrap pb-12 pt-[calc(var(--gap)/2.4)]">
        <div className="grid gap-y-16 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex min-h-11 items-center">
              <Logo width={128} />
              <span className="sr-only">トップページへ</span>
            </Link>

            <address className="mt-8 text-[0.9375rem] leading-[2.05] text-paper-2">
              <p>{postalLine}</p>
              <p>
                <span className="ib">
                  {restaurant.address.region}
                  {restaurant.address.locality}
                </span>
                <span className="ib">{restaurant.address.street}</span>
              </p>
              <p>{buildingLine}</p>
              <p className="mt-3">
                <a href={telHref} className="inline-flex min-h-11 items-center text-paper">
                  <span className="num text-[1.5rem]">{restaurant.phone.display}</span>
                </a>
              </p>
            </address>

            <p className="mt-1 text-[0.9375rem] text-paper-2">
              {hoursLine}（{restaurant.hours.closedLabel}）
            </p>
            <p className="t-note mt-3">
              {agePolicy.label}／{restaurant.seats.style}／{restaurant.seats.smoking}
            </p>

            <p className="mt-6">
              <a
                href={restaurant.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="link inline-flex min-h-11 items-center text-[0.875rem] tracking-[0.2em]"
              >
                <span className="latin">Instagram</span>
                <span className="sr-only">（別のタブで開きます）</span>
              </a>
            </p>
          </div>

          <nav
            aria-label="フッターメニュー"
            className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:col-span-7 lg:col-start-6"
          >
            {footerNav.map((group, i) => (
              <div key={group.heading} className={i === 0 ? "row-span-2 md:row-span-1" : undefined}>
                <p className="label">{group.heading}</p>
                <ul className="mt-4">
                  {group.items.map((k) => (
                    <li key={k}>
                      <Link
                        href={pages[k].path}
                        className="flex min-h-10 items-center text-[0.9375rem] text-paper-2 transition-colors duration-300 hover:text-paper"
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
          <span className="latin text-[0.75rem]">
            &copy; {new Date().getFullYear()} {restaurant.name}
          </span>
        </p>
      </div>
    </footer>
  );
}
