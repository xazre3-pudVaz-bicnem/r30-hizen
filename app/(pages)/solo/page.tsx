/**
 * お一人で
 * 担当する検索語: すすきの 寿司 一人
 * 役割: 一人で寿司を食べたい人へ、一人で予約できるか・どのコースがよいかを伝える。
 * 書かないこと: カウンター全般の作法は /counter-sushi。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, PhotoSplit, Section, Split } from "@/components/sections/Blocks";
import { PageHead } from "@/components/sections/PageHead";
import { PillarPosts } from "@/components/sections/PillarPosts";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { courseById, priceLabel } from "@/data/courses";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, hoursLine, site, stationWalk, telHref } from "@/data/site";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.solo;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function SoloPage() {
  const set = courseById("hassun-set");
  const short = courseById("omakase-short");
  const full = courseById("omakase-15");
  const { web, sameDayDeadline } = site.reservation;

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label="ご利用の場面"
        title={
          <>
            <span className="ib">すすきので一人寿司を。</span>
            <span className="ib">おひとりさまのカウンター鮨。</span>
          </>
        }
        lead="出張の夜、旅の途中、自分をねぎらいたい日。カウンターは、一人で座るための席でもあります。"
        photo={photos.cuisine04}
        photoPosition="50% 50%"
      />

      <Section>
        <Split heading="1名様のご予約は、お電話で。">
          <Body>
            <p>{site.name}は、お一人でもご利用いただけます。Web予約は{web.partySize}名様限定のため、1名様のご予約はお電話で承ります。</p>
            <p>当日のご予約は、{sameDayDeadline}まで承ります。出張先で夜の予定が空いた日にも、お電話ください。</p>
          </Body>
          <p className="mt-8">
            <a href={telHref} className="inline-flex min-h-12 items-center text-paper transition-colors duration-300 hover:text-brass">
              <span className="num text-[2rem]">{site.tel.display}</span>
            </a>
          </p>
        </Split>
      </Section>

      <Section tone="ink-2">
        <PhotoSplit photo={photos.chef03} ratio="3/2">
          <h2 className="t-h2">
            <span className="ib">一人の夜に合う、</span>
            <span className="ib">コース。</span>
          </h2>
          <div className="mt-8">
            <Items
              items={[
                {
                  key: set.id,
                  title: set.name,
                  body: (
                    <p>
                      {set.items}・{priceLabel(set.price)}。{set.lead}
                      {set.notes[0]}
                    </p>
                  ),
                },
                {
                  key: short.id,
                  title: short.name,
                  body: (
                    <p>
                      {short.items}・{priceLabel(short.price)}。ご滞在は{short.stay}まで。握りを中心に、ほどよく。
                    </p>
                  ),
                },
                {
                  key: full.id,
                  title: full.name,
                  body: (
                    <p>
                      {full.items}・{priceLabel(full.price)}。一人でも、しっかり味わいたい夜に。
                    </p>
                  ),
                },
              ]}
            />
          </div>
          <p className="t-note mt-5">コースは人数分でのご提供です。お一人なら、一人前から承ります。</p>
          <p className="mt-8">
            <Link href={pages.omakase.path} className="more">
              コースの内容を見る
            </Link>
          </p>
        </PhotoSplit>
      </Section>

      <Section>
        <Split heading="一人でも、気がねなく。">
          <Items
            items={[
              {
                key: "order",
                title: "注文に迷わない",
                body: <p>お料理はおまかせのコースのみ。品書きとにらめっこする必要がありません。</p>,
              },
              {
                key: "seat",
                title: "席は、カウンター",
                body: <p>正面には、握る手もと。一人の食事に、手持ちぶさたな時間がありません。</p>,
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

      <Section tone="ink-2">
        <Split heading="出張や旅行で、札幌へ来られる方へ。">
          <Body>
            <p>店は{stationWalk}、{site.address.buildingName}の{site.address.floorText}。すすきのや大通周辺にお泊まりなら、歩いてお越しいただけます。</p>
            <p>営業は{hoursLine}、定休日は{site.hours.closedLabel}です。お休みの日は決まっておりませんので、ご予約の際にお確かめください。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.access.path} className="more">
              アクセスを見る
            </Link>
          </p>
        </Split>
      </Section>

      <PillarPosts path={page.path} limit={4} />
      <RelatedPages
        items={[
          { page: "counterSushi", note: "カウンターでの過ごし方と、ささやかな作法。" },
          { page: "omakaseSushi", note: "おまかせという頼み方の流れと、事前に伝えること。" },
          { page: "drink", note: "一人の夜に合わせる、日本酒とワイン。" },
          { page: "reservation", note: "ご予約の方法と、ご来店前のお願い。" },
        ]}
      />
      <ReservationBlock lead="1名様のご予約は、お電話で承ります。当日のご予約もどうぞ。" />
    </>
  );
}
