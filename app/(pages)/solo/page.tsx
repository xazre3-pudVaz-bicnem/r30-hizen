/**
 * お一人で
 * 担当する検索語: すすきの 寿司 一人
 * 役割: 一人で寿司を食べたい人へ。このページで答えるのは4つ。
 *       1名の予約方法（電話） ／ 一人で座るカウンター ／ 一人の夜に合うコース ／ 出張・旅行の方へ。
 * 書かないこと: カウンター全般の作法は /counter-sushi。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Column, Items, PhotoEdge, Section, Split, Statement } from "@/components/sections/Blocks";
import { CourseRows } from "@/components/sections/CourseRows";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, courseById, hoursLine, restaurant, stationWalk, telHref } from "@/data/restaurant";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.solo;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function SoloPage() {
  const set = courseById("hassun-set");
  const short = courseById("omakase-short");
  const full = courseById("omakase-15");
  const { web, sameDayDeadline, soloLabel } = restaurant.reservation;

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        layout="split"
        crumbs={crumbs}
        label="ご利用の場面"
        title={
          <>
            <span className="ib">すすきので、</span>
            <span className="ib">ひとり寿司。</span>
          </>
        }
        lead="出張の夜、旅の途中、自分をねぎらいたい日。カウンターは、一人で座るための席でもあります。"
        photo={photos.cuisine02}
        photoPosition="46% 50%"
      />

      <Section>
        <Statement
          note={
            <>
              <p>
                {restaurant.name}は、お一人でもご利用いただけます。Web予約は{web.partyLabel}限定のため、{soloLabel}のご予約はお電話で承ります。
              </p>
              <p>当日のご予約は、{sameDayDeadline}まで。出張先で夜の予定が空いた日にも、お電話ください。</p>
              <p className="text-center">
                <a href={telHref} className="inline-flex min-h-12 items-center text-paper transition-colors duration-300 hover:text-brass">
                  <span className="num text-[2rem] lg:text-[2.25rem]">{restaurant.phone.display}</span>
                </a>
              </p>
            </>
          }
        >
          <span className="ib">{soloLabel}のご予約は、</span>
          <span className="ib">お電話で。</span>
        </Statement>
      </Section>

      <Section>
        <Split heading="一人で座る、カウンター。">
          <Items
            items={[
              {
                key: "seat",
                title: "正面には、握る手もと",
                body: <p>お席は{restaurant.seats.style}。目の前で仕事が進むので、一人の食事に手持ちぶさたな時間がありません。</p>,
              },
              {
                key: "order",
                title: "注文に迷わない",
                body: <p>お料理はおまかせのコースのみ。品書きとにらめっこする必要がありません。</p>,
              },
              {
                key: "quiet",
                title: "静かな店内",
                body: <p>{agePolicy.audience}の店です。まわりを気にせず、鮨と酒に向き合えます。</p>,
              },
            ]}
          />
          <p className="mt-10">
            <Link href={pages.counterSushi.path} className="more">
              カウンターでの過ごし方
            </Link>
          </p>
        </Split>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.chef03} side="left" width="narrow" ratio="3/2" position="50% 50%" align="start">
          <h2 className="t-h2">
            <span className="ib">一人の夜に合う、</span>
            <span className="ib">コース。</span>
          </h2>
          <div className="mt-9">
            <CourseRows
              only={[set.id, short.id, full.id]}
              practical="stay"
              notes={{
                [set.id]: `お酒とともに、少しずつ。${set.notes[0]}`,
                [short.id]: "握りを中心に、ほどよく。次の日が早い夜に。",
                [full.id]: "一人でも、しっかり味わいたい夜に。",
              }}
            />
          </div>
          <p className="t-note mt-5">コースは人数分でのご提供です。お一人なら、一人前から承ります。</p>
          <p className="mt-9">
            <Link href={pages.omakase.path} className="more">
              コースの内容を見る
            </Link>
          </p>
        </PhotoEdge>
      </Section>

      <Section>
        <Column side="right" heading="出張や旅行で、札幌へ来られる方へ。">
          <Body>
            <p>
              店は{stationWalk}、{restaurant.address.buildingName}の{restaurant.address.floorText}。すすきのや大通周辺にお泊まりなら、歩いてお越しいただけます。
            </p>
            <p>
              営業は{hoursLine}、定休日は{restaurant.hours.closedLabel}です。お休みの日は決まっておりませんので、ご予約の際にお確かめください。
            </p>
          </Body>
          <p className="mt-10">
            <Link href={pages.access.path} className="more">
              地図と店舗情報
            </Link>
          </p>
        </Column>
      </Section>

      <Onward pillar={page.path} items={["omakaseSushi", "drink", "access"]} />
      <ReservationBlock lead={`${soloLabel}のご予約は、お電話で承ります。当日のご予約は${sameDayDeadline}までにどうぞ。`} />
    </>
  );
}
