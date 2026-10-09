import Link from "next/link";
import { pages } from "@/data/pages";
import { restaurant, telHref } from "@/data/restaurant";
import { Reveal } from "@/components/ui/Reveal";

type Props = {
  /** その場面に合わせたひとこと。省くと共通の文 */
  lead?: string;
  /** /reservation 自身では「ご予約の前に」へのリンクを出さない */
  hideGuideLink?: boolean;
  headingId?: string;
};

/**
 * 予約の導線。電話と Web 予約の2つだけ。
 *
 * 置く場所は1ページに1か所（ページの終わり。コースのページだけは、コースを見終えた位置）。
 * ヘッダーの「ご予約」と合わせて、これ以上は増やさない。ヒーローには置かない。
 * 押し売りにならないよう、塗りのボタンや固定表示のボタンは使わない。
 */
export function ReservationBlock({ lead, hideGuideLink, headingId = "reserve-heading" }: Props) {
  const { web, sameDayDeadline, phoneOnlyParties } = restaurant.reservation;
  return (
    <section aria-labelledby={headingId} className="border-t border-line">
      <div className="wrap section grid gap-y-12 lg:grid-cols-12 lg:gap-x-10">
        <Reveal className="lg:col-span-5">
          <h2 id={headingId} className="t-h2">
            {pages.reservation.label}
          </h2>
          <p className="measure mt-7">
            {lead ?? `お席は${restaurant.seats.style}です。ご予約は、お電話またはWeb予約で承ります。`}
          </p>
          {!hideGuideLink && (
            <p className="mt-7">
              <Link href={pages.reservation.path} className="more">
                ご予約の前に
              </Link>
            </p>
          )}
        </Reveal>

        <Reveal delay={0.1} className="rows lg:col-span-6 lg:col-start-7">
          <div className="py-9 lg:py-11">
            <p className="label">お電話</p>
            <p className="mt-3">
              <a href={telHref} className="inline-flex min-h-12 items-center text-paper transition-colors duration-300 hover:text-brass">
                <span className="num text-[1.9rem] lg:text-[2.25rem]">{restaurant.phone.display}</span>
              </a>
            </p>
            <p className="t-note mt-2">
              {phoneOnlyParties}のご予約はお電話にて。当日のご予約は{sameDayDeadline}まで承ります。
            </p>
          </div>

          <div className="py-9 lg:py-11">
            <p className="label">Web予約</p>
            <p className="mt-5">
              <a href={web.url} target="_blank" rel="noopener noreferrer" className="action">
                Webで席を予約する
                <span className="sr-only">（{web.label}が別のタブで開きます）</span>
              </a>
            </p>
            <p className="t-note mt-5">
              {web.partyLabel}でのご利用に限ります（{web.label}）。
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
