import Link from "next/link";
import { pages } from "@/data/pages";
import { site, telHref } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";

type Props = {
  /** その場面に合わせたひとこと。省くと共通の文 */
  lead?: string;
  /** /reservation 自身では「ご予約の前に」へのリンクを出さない */
  hideGuideLink?: boolean;
  headingId?: string;
};

/**
 * ページの終わりに置く予約の導線。電話と Web 予約の2つだけ。
 * 押し売りにならないよう、大きな塗りのボタンは使わない。ヒーローには置かない。
 */
export function ReservationBlock({ lead, hideGuideLink, headingId = "reserve-heading" }: Props) {
  const { web, sameDayDeadline } = site.reservation;
  return (
    <section aria-labelledby={headingId} className="border-t border-line bg-ink-2">
      <div className="wrap section-tight grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
        <Reveal>
          <h2 id={headingId} className="t-h2">
            ご予約
          </h2>
          <p className="measure mt-6">
            {lead ?? "お席はカウンターのみです。ご予約は、お電話またはWeb予約で承ります。"}
          </p>
          {!hideGuideLink && (
            <p className="mt-6">
              <Link href={pages.reservation.path} className="more">
                ご予約の前に
              </Link>
            </p>
          )}
        </Reveal>

        <Reveal delay={0.1} className="rows">
          <div className="py-8 lg:py-10">
            <p className="label">お電話</p>
            <p className="mt-2">
              <a href={telHref} className="inline-flex min-h-12 items-center text-paper transition-colors duration-300 hover:text-brass">
                <span className="num text-[1.9rem] lg:text-[2.25rem]">{site.tel.display}</span>
              </a>
            </p>
            <p className="t-note mt-1">
              1名様、3名様以上のご予約はお電話にて。当日のご予約は{sameDayDeadline}まで承ります。
            </p>
          </div>

          <div className="py-8 lg:py-10">
            <p className="label">Web予約</p>
            <p className="mt-4">
              <a href={web.url} target="_blank" rel="noopener noreferrer" className="action">
                Webで席を予約する
                <span className="sr-only">（{web.label}が別のタブで開きます）</span>
              </a>
            </p>
            <p className="t-note mt-4">
              {web.partySize}名様でのご利用に限ります（{web.label}）。
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
