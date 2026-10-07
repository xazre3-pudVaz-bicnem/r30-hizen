/**
 * おまかせコース
 * 担当する検索語: すすきの 寿司 コース
 * 役割: いくらで、何品で、どれくらい時間がかかるか。料金を載せるのはこのページ。
 * 書かないこと: 「おまかせとは何か」の説明は /omakase-sushi。
 * 料金・品数は data/courses.ts から出す。このファイルに数字を直接書かないこと。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, Section, Split } from "@/components/sections/Blocks";
import { CourseRows } from "@/components/sections/CourseRows";
import { NoticeList } from "@/components/sections/NoticeList";
import { PageHead } from "@/components/sections/PageHead";
import { PillarPosts } from "@/components/sections/PillarPosts";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { confirmedAtLabel, courseById, courseCommon, courses, signatureDish } from "@/data/courses";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { site } from "@/data/site";
import { crumbsFor, menuNode, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.omakase;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function OmakasePage() {
  const full = courseById("omakase-15");
  const short = courseById("omakase-short");
  const set = courseById("hassun-set");

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs, [menuNode()])} />

      <PageHead
        crumbs={crumbs}
        label={page.label}
        title={
          <>
            <span className="ib">すすきので愉しむ、</span>
            <span className="ib">寿司のおまかせコース。</span>
          </>
        }
        lead={`お料理は、おまかせのコースのみ。品数の違う${courses.length}つから、お選びいただけます。`}
        photo={photos.cuisine01}
        photoPosition="50% 64%"
      />

      <Section>
        <Split heading="お品書きは、ご来店までのお楽しみ。">
          <Body>
            <p>{courseCommon.menuUndisclosed}</p>
            <p>春夏秋冬、それぞれの食材をいちばんよい状態で。その時季の魚介と旬の野菜を、{site.people.chefExperience}の店主が見極めて仕立てます。</p>
          </Body>
        </Split>
      </Section>

      <Section tone="ink-2" tight eager>
        <CourseRows variant="detail" headingLevel="h2" />
        <p className="t-note mt-8">
          {confirmedAtLabel}の内容と料金です。変更になる場合がございます。{courseCommon.perPerson}
        </p>
      </Section>

      <Section>
        <div className="grid grid-cols-12 items-end gap-x-4 lg:gap-x-10">
          <Reveal className="col-span-8 lg:col-span-6">
            <Photo photo={photos.omakase01} ratio="3/2" sizes="(max-width: 1023px) 64vw, 46vw" />
          </Reveal>
          <Reveal className="col-span-4 lg:col-span-3 lg:col-start-9" delay={0.1}>
            <Photo photo={photos.omakase02} ratio="3/4" position="50% 72%" sizes="(max-width: 1023px) 30vw, 22vw" />
          </Reveal>
        </div>
        <div className="mt-14 lg:mt-24">
          <Split heading="コースの選びかた">
            <Items
              items={[
                {
                  key: full.id,
                  title: "品数をしっかり味わう夜に",
                  body: (
                    <p>
                      {full.name}（{full.items}）。{full.contents.slice(0, 2).join("、")}に、結びの{signatureDish.name}まで。{full.notes[0]}
                    </p>
                  ),
                },
                {
                  key: short.id,
                  title: "時間をきめて楽しむ夜に",
                  body: (
                    <p>
                      {short.name}（{short.items}）。ご滞在は{short.stay}まで。このあとに予定のある日や、軽めに味わいたい日に。
                    </p>
                  ),
                },
                {
                  key: set.id,
                  title: "お酒を中心に過ごす夜に",
                  body: (
                    <p>
                      {set.name}（{set.items}）。{set.contents[0]}と握りを、お酒とともに少しずつ。{set.notes[0]}
                    </p>
                  ),
                },
              ]}
            />
          </Split>
        </div>
      </Section>

      <Section tone="ink-2">
        <Split heading="コースについてのお願い">
          <NoticeList only={["per-person", "allergy", "no-itemized", "two-of-us"]} />
          <p className="mt-8">
            <Link href={pages.reservation.path} className="more">
              ご予約の前に
            </Link>
          </p>
        </Split>
      </Section>

      <PillarPosts path={page.path} />
      <RelatedPages
        items={[
          { page: "omakaseSushi", note: "おまかせという頼み方の流れと、事前に伝えておくこと。" },
          { page: "cuisine", note: "握りの仕事と、従来の手法にとらわれない季節の一皿。" },
          { page: "drink", note: "コースに合わせる日本酒、ワイン、シャンパン。" },
          { page: "access", note: `${site.access.primary.station}から${site.access.primary.walk}。地図と営業時間。` },
        ]}
      />
      <ReservationBlock lead="コースのご予約は、お電話またはWeb予約で承ります。お電話でのご予約限定のセットもございます。" />
    </>
  );
}
