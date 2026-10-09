import Link from "next/link";
import { headerNav, pages } from "@/data/pages";
import { addressLine, hoursLine, restaurant, telHref } from "@/data/restaurant";
import { HeaderScroll } from "./HeaderScroll";
import { Logo } from "./Logo";
import { MenuDialog } from "./MenuDialog";
import { NavLinks } from "./NavLinks";

/**
 * ヘッダー。
 *
 * メニューは店の案内の6つと、控えめな「ご予約」だけ（data/pages.ts の headerNav）。
 * 「ご利用の場面」「はじめての方へ」のページは、ここにも全画面メニューにも出さない。
 *
 * overHero はトップページ専用。最初の画面では写真の上に透けて重なり、ロゴと「ご予約」を出さない
 * （ヒーローには行動を促すものを置かない、という決まりのため）。ヒーローを過ぎると通常の表示になる。
 */
export function Header({ overHero = false }: { overHero?: boolean }) {
  const nav = headerNav.map(({ key, label }) => ({ href: pages[key].path, label }));

  return (
    <header className="site-header" data-over-hero={overHero ? "" : undefined}>
      <a href="#main" className="sr-only-focusable">
        本文へ移動
      </a>
      <div className="wrap flex h-16 items-center justify-between gap-6 lg:h-20">
        <Link href="/" className="hide-on-hero flex min-h-11 shrink-0 items-center">
          <Logo width={88} priority className="h-auto w-[72px] lg:w-[88px]" />
          <span className="sr-only">トップページへ</span>
        </Link>

        <div className="flex items-center gap-x-5 lg:gap-x-10 xl:gap-x-12">
          <nav aria-label="メインメニュー" className="hidden lg:block">
            <NavLinks items={nav} />
          </nav>

          <Link href={pages.reservation.path} className="nav-reserve hide-on-hero">
            {pages.reservation.label}
          </Link>

          <MenuDialog>
            <div className="wrap flex min-h-[calc(100%-4rem)] flex-col pb-8 pt-4">
              <nav aria-label="メニュー">
                <ul>
                  {nav.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="flex min-h-[3.75rem] items-center text-[1.3125rem] tracking-[0.2em] text-paper">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  <Link href={pages.reservation.path} className="nav-reserve min-h-12 text-[1rem]">
                    {pages.reservation.label}
                  </Link>
                </p>
              </nav>

              <address className="t-note mt-auto pt-10">
                <p>{addressLine}</p>
                <p>
                  {hoursLine}（{restaurant.hours.closedLabel}）
                </p>
                <p className="mt-2">
                  <a href={telHref} className="inline-flex min-h-11 items-center text-paper">
                    <span className="num text-[1.5rem]">{restaurant.phone.display}</span>
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
