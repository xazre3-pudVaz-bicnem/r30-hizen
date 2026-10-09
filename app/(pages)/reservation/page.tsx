/**
 * ご予約
 * 担当する検索語: R-30 hizen 予約（方法・人数の条件・当日予約・注意事項）
 * 書かないこと: コースの中身は /omakase、場所は /access。
 * 構造化データの FAQPage を出すのは、サイト内でこのページだけ。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Section, Split } from "@/components/sections/Blocks";
import { CourseRows } from "@/components/sections/CourseRows";
import { FaqList } from "@/components/sections/FaqList";
import { NoticeList } from "@/components/sections/NoticeList";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { JsonLd } from "@/components/ui/JsonLd";
import { reservationFaqs } from "@/data/faq";
import { pages } from "@/data/pages";
import { confirmedAtLabel, hoursLine, restaurant, telHref } from "@/data/restaurant";
import { crumbsFor, faqNodes, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.reservation;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function ReservationPage() {
  const { web, sameDayDeadline, notAccepted, phoneOnlyParties } = restaurant.reservation;

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs, [faqNodes(page.path, reservationFaqs)])} />

      <PageHead
        crumbs={crumbs}
        label={page.label}
        title="ご予約のご案内"
        lead={`${restaurant.name}のご予約は、お電話またはWeb予約で承ります。お席は${restaurant.seats.style}、お料理はおまかせのコースのみです。`}
      />

      <Section tight className="pt-0">
        <div className="grid gap-y-0 lg:grid-cols-2 lg:gap-x-16">
          <div className="border-t border-line py-11 lg:py-14">
            <h2 className="label">お電話でのご予約</h2>
            <p className="mt-4">
              <a href={telHref} className="inline-flex min-h-12 items-center text-paper transition-colors duration-300 hover:text-brass">
                <span className="num text-[2.25rem] lg:text-[2.75rem]">{restaurant.phone.display}</span>
              </a>
            </p>
            <ul className="mt-6 space-y-2">
              <li>{phoneOnlyParties}のご予約</li>
              <li>当日のご予約（{sameDayDeadline}まで）</li>
              <li>お電話でのご予約限定のセット</li>
              <li>貸切のご相談</li>
            </ul>
            <p className="t-note mt-6">
              営業時間 {hoursLine}（{restaurant.hours.closedLabel}）
            </p>
          </div>

          <div className="border-t border-line py-11 max-lg:border-b lg:py-14">
            <h2 className="label">Web予約</h2>
            <p className="mt-6">
              <a href={web.url} target="_blank" rel="noopener noreferrer" className="action">
                Webで席を予約する
                <span className="sr-only">（{web.label}が別のタブで開きます）</span>
              </a>
            </p>
            <ul className="mt-7 space-y-2">
              <li>{web.partyLabel}でのご利用に限ります</li>
              <li>ご予約は{web.label}のページで承ります</li>
            </ul>
            <p className="t-note mt-6">{notAccepted}経由のご予約は、お受けしておりません。</p>
          </div>
        </div>
      </Section>

      <Section>
        <Split heading="お選びいただくコース">
          <CourseRows variant="brief" />
          <p className="t-note mt-5">料金は税込です（{confirmedAtLabel}）。</p>
          <p className="mt-9">
            <Link href={pages.omakase.path} className="more">
              コースの内容を見る
            </Link>
          </p>
        </Split>
      </Section>

      <Section>
        <Split heading="ご予約の前に">
          <NoticeList />
        </Split>
      </Section>

      <Section>
        <Split heading="よくあるご質問">
          <FaqList faqs={reservationFaqs} />
          <p className="mt-10">ご不明な点やご相談は、お電話でお尋ねください。</p>
        </Split>
      </Section>

      <Onward items={["omakase", "access", "space"]} />
    </>
  );
}
