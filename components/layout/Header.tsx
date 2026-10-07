import Link from "next/link";
import { footerNav, headerNav, pages } from "@/data/pages";
import { addressLine, hoursLine, site, telHref } from "@/data/site";
import { HeaderScroll } from "./HeaderScroll";
import { Logo } from "./Logo";
import { MenuDialog } from "./MenuDialog";
import { NavLinks } from "./NavLinks";

/**
 * ヘッダー。
 * overHero はトップページ専用。最初の画面では写真の上に透けて重なり、ロゴと「ご予約」を出さない
 * （ヒーローには行動を促すものを置かない、という決まりのため）。ヒーローを過ぎると通常の表示になる。
 */
export function Header({ overHero = false }: { overHero?: boolean }) {
  const nav = headerNav.map((k) => ({ href: pages[k].path, label: pages[k].label }));

  return (
    <header className="site-header" data-over-hero={overHero ? "" : undefined}>
      <a href="#main" className="sr-only-focusable">
        本文へ移動
      </a>
      <div className="wrap flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
        <Link href="/" className="hide-on-hero flex min-h-11 shrink-0 items-center">
          <Logo width={92} priority className="h-auto w-[76px] lg:w-[92px]" />
          <span className="sr-only">トップページへ</span>
        </Link>

        <nav aria-label="メインメニュー" className="hidden lg:block">
          <NavLinks items={nav} />
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={pages.reservation.path}
            className="hide-on-hero inline-flex min-h-11 items-center border border-paper/30 px-5 text-[0.8125rem] tracking-[0.2em] text-paper transition-colors duration-500 hover:border-brass"
          >
            ご予約
          </Link>

          <MenuDialog>
            <div className="wrap pb-16 pt-6">
              <nav aria-label="メニュー">
                <ul className="rows">
                  {[...headerNav, "reservation" as const].map((k) => (
                    <li key={k}>
                      <Link href={pages[k].path} className="flex min-h-16 items-center text-[1.125rem] tracking-[0.18em] text-paper">
                        {pages[k].label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10">
                  {footerNav.slice(1, 3).map((group) => (
                    <div key={group.heading}>
                      <p className="label">{group.heading}</p>
                      <ul className="mt-3">
                        {group.items.map((k) => (
                          <li key={k}>
                            <Link href={pages[k].path} className="flex min-h-11 items-center text-[0.9375rem] text-paper-2">
                              {pages[k].label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </nav>

              <address className="t-note mt-14">
                <p>{addressLine}</p>
                <p>
                  {hoursLine}（{site.hours.closedLabel}）
                </p>
                <p className="mt-3">
                  <a href={telHref} className="inline-flex min-h-11 items-center text-paper">
                    <span className="num text-[1.5rem]">{site.tel.display}</span>
                  </a>
                </p>
              </address>
            </div>
          </MenuDialog>
        </div>
      </div>
      {overHero && <HeaderScroll />}
    </header>
  );
}
