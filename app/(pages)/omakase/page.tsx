/**
 * おまかせコース
 * 担当する検索語: すすきの 寿司 コース
 * 役割: いくらで、何品で、どれくらい時間がかかるか。料金を載せるのはこのページ。
 * 書かないこと: 「おまかせとは何か」の説明は /omakase-sushi。
 * 料金・品数は data/restaurant.ts から出す。このファイルに数字を直接書かないこと。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Column, Section, Split } from "@/components/sections/Blocks";
import { CourseRows } from "@/components/sections/CourseRows";
import { NoticeList } from "@/components/sections/NoticeList";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { confirmedAtLabel, courseCommon, courses, restaurant } from "@/data/restaurant";
import { crumbsFor, menuNode, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.omakase;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function OmakasePage() {
  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs, [menuNode()])} />

      <PageHead
        layout="split"
        crumbs={crumbs}
        label={page.label}
        title={
          <>
            <span className="ib">すすきので愉しむ、</span>
            <span className="ib">寿司のおまかせコース。</span>
          </>
        }
        lead={`お料理は、おまかせのコースのみ。品数の違う${courses.length}つから、お選びいただけます。`}
        photo={photos.omakase02}
        photoPosition="50% 68%"
      />

      <Section>
        <Column
          side="right"
          heading={
            <>
              <span className="ib">品書きのない、</span>
              <span className="ib">{courses.length}つのコース。</span>
            </>
          }
        >
          <Body>
            <p>{courseCommon.menuUndisclosed}</p>
            <p>
              春夏秋冬、それぞれの食材をいちばんよい状態で。その時季の魚介と旬の野菜を、{restaurant.people.chefExperience}の店主が見極めて仕立てます。
            </p>
          </Body>
        </Column>
      </Section>

      {/* 見出し（h2）は、中の各コース（article）が持つ */}
      <Section plain>
        <CourseRows variant="detail" headingLevel="h2" />
        <p className="t-note mt-12">
          {confirmedAtLabel}の内容と料金です。変更になる場合がございます。{courseCommon.perPerson}
        </p>
      </Section>

      <Section plain>
        <div className="grid grid-cols-12 items-end gap-x-4 lg:gap-x-10">
          <Reveal className="col-span-8 lg:col-span-6 lg:col-start-2">
            <Photo photo={photos.omakase01} ratio="3/2" sizes="(max-width: 1023px) 62vw, 42vw" />
          </Reveal>
          <Reveal className="col-span-4 lg:col-span-3 lg:col-start-9" delay={0.1}>
            <Photo photo={photos.omakase03} ratio="3/4" position="50% 40%" sizes="(max-width: 1023px) 30vw, 21vw" />
          </Reveal>
        </div>
        <p className="t-note mt-6 lg:pl-[8.6%]">写真は一例です。お料理の内容は、その日の仕入れによって替わります。</p>
      </Section>

      <Section>
        <Split heading="コースについてのお願い">
          <NoticeList only={["per-person", "allergy", "no-itemized", "two-of-us"]} />
          <p className="mt-9">
            <Link href={pages.reservation.path} className="more">
              ご予約の前に
            </Link>
          </p>
        </Split>
      </Section>

      <Onward pillar={page.path} items={["omakaseSushi", "cuisine", "drink"]} />
      <ReservationBlock lead="コースのご予約は、お電話またはWeb予約で承ります。お電話でのご予約限定のセットもございます。" />
    </>
  );
}
