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
import { PageHead } from "@/components/sections/PageHead";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { confirmedAtLabel } from "@/data/courses";
import { reservationFaqs } from "@/data/faq";
import { pages } from "@/data/pages";
import { hoursLine, site, telHref } from "@/data/site";
import { crumbsFor, faqNodes, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.reservation;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function ReservationPage() {
  const { web, sameDayDeadline, notAccepted } = site.reservation;

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs, [faqNodes(page.path, reservationFaqs)])} />

      <PageHead
        crumbs={crumbs}
        label={page.label}
        title="ご予約のご案内"
        lead={`${site.name}のご予約は、お電話またはWeb予約で承ります。お席は${site.seating.style}、お料理はおまかせのコースのみです。`}
      />

      <Section tight>
        <div className="grid gap-y-0 lg:grid-cols-2 lg:gap-x-16">
          <div className="border-t border-line py-10 lg:py-12">
            <h2 className="label">お電話でのご予約</h2>
            <p className="mt-4">
              <a href={telHref} className="inline-flex min-h-12 items-center text-paper transition-colors duration-300 hover:text-brass">
                <span className="num text-[2.25rem] lg:text-[2.75rem]">{site.tel.display}</span>
              </a>
            </p>
            <ul className="mt-5 space-y-2 text-[0.9375rem] leading-[2]">
              <li>1名様、3名様以上のご予約</li>
              <li>当日のご予約（{sameDayDeadline}まで）</li>
              <li>お電話でのご予約限定のセット</li>
              <li>貸切のご相談</li>
            </ul>
            <p className="t-note mt-5">
              営業時間 {hoursLine}（{site.hours.closedLabel}）
            </p>
          </div>

          <div className="border-t border-line py-10 max-lg:border-b lg:py-12">
            <h2 className="label">Web予約</h2>
            <p className="mt-6">
              <a href={web.url} target="_blank" rel="noopener noreferrer" className="action">
                Webで席を予約する
                <span className="sr-only">（{web.label}が別のタブで開きます）</span>
              </a>
            </p>
            <ul className="mt-6 space-y-2 text-[0.9375rem] leading-[2]">
              <li>{web.partySize}名様でのご利用に限ります</li>
              <li>ご予約は{web.label}のページで承ります</li>
            </ul>
            <p className="t-note mt-5">{notAccepted}経由のご予約は、お受けしておりません。</p>
          </div>
        </div>
      </Section>

      <Section tone="ink-2">
        <Split heading="お選びいただくコース">
          <CourseRows variant="brief" />
          <p className="t-note mt-5">{confirmedAtLabel}の料金です。</p>
          <p className="mt-8">
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

      <Section tone="ink-2">
        <Split heading="よくあるご質問">
          <FaqList faqs={reservationFaqs} />
        </Split>
      </Section>

      <RelatedPages
        items={[
          { page: "omakase", note: "3つのコースの品数・料金・所要時間。" },
          { page: "access", note: `${site.access.primary.station}から${site.access.primary.walk}。地図と店舗情報。` },
          { page: "space", note: "店内の様子と、お席について。" },
        ]}
      />

      <section className="border-t border-line bg-ink-2">
        <Reveal className="wrap section-tight">
          <p className="measure">ご不明な点やご相談は、お電話でお尋ねください。</p>
          <p className="mt-6">
            <a href={telHref} className="inline-flex min-h-12 items-center text-paper transition-colors duration-300 hover:text-brass">
              <span className="num text-[1.9rem]">{site.tel.display}</span>
            </a>
          </p>
        </Reveal>
      </section>
    </>
  );
}
