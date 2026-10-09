/**
 * アクセス・店舗情報
 * 担当する検索語: R-30 hizen アクセス（場所・行き方・営業時間・支払い）
 * 書かないこと: 予約の手順は /reservation。
 * 住所・電話番号・営業時間は data/restaurant.ts から出す。道順の細かい説明（◯◯の角を曲がる等）は、
 * 現地で確かめた情報が無いので書かない。
 * 構造化データは、トップと同じく Restaurant（住所・地図・営業時間まで）を出す。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, PhotoEdge, Section, Split } from "@/components/sections/Blocks";
import { FaqList } from "@/components/sections/FaqList";
import { MapEmbed } from "@/components/sections/MapEmbed";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { ShopFacts } from "@/components/sections/ShopFacts";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { addressLine, hoursLine, restaurant, stationWalk } from "@/data/restaurant";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.access;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function AccessPage() {
  const { access, address, hours } = restaurant;
  const routes = [access.primary, ...access.others];

  const questions = [
    {
      q: "以前の場所から移転したのですか？",
      a: `はい。現在は、${addressLine}で営業しています。以前の住所や古い地図が残っているサイトもございますので、ご来店の際は、このページの住所と地図をご確認ください。`,
    },
    {
      q: "駐車場はありますか？",
      a: access.parking,
    },
    {
      q: "何時から何時まで営業していますか？",
      a: `営業時間は${hoursLine}、定休日は${hours.closedLabel}です。お休みの日は決まっておりませんので、ご予約の際にご確認ください。`,
    },
    {
      q: "ビルの何階ですか？",
      a: `${address.buildingName}の${address.floorText}です。`,
    },
  ];

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs, [], { type: "ContactPage", withRestaurant: true })} />

      <PageHead
        crumbs={crumbs}
        label={page.label}
        title={
          <>
            <span className="ib">{stationWalk}、</span>
            <span className="ib">
              {address.buildingName}の{address.floorText}。
            </span>
          </>
        }
        lead={`${restaurant.name}は、${address.locality}${address.district}にあります。地下鉄と市電、どちらの駅からも歩いてお越しいただけます。`}
      />

      <Section tight className="pt-0">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-7 xl:col-span-6">
            <h2 className="label">店舗情報</h2>
            <div className="mt-5">
              <ShopFacts variant="full" />
            </div>
          </div>
          {/* 表のほうが長いので、地図は読み進めるあいだ画面に残す（右側が空いたままにならないように） */}
          <Reveal className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start xl:col-span-6" delay={0.08}>
            <h2 className="label">地図</h2>
            <div className="mt-5">
              <MapEmbed embedUrl={restaurant.map.embedUrl} linkUrl={restaurant.map.linkUrl} title={`${restaurant.name}の地図`} tall />
            </div>
          </Reveal>
        </div>
      </Section>

      <Section>
        <Split heading="最寄りの駅から">
          <ul className="rows">
            {routes.map((r) => (
              <li key={r.station} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 py-6 md:py-7">
                <p className="text-paper">
                  <span className="t-note mr-3">{r.line}</span>{" "}
                  <span className="ib text-[1.0625rem] tracking-[0.1em] md:text-[1.125rem]">{r.station}</span>
                </p>
                <p className="text-paper">{r.walk}</p>
              </li>
            ))}
          </ul>
          <Body className="mt-9">
            <p>すすきのの中心から、少し西へ。札幌の中心部・大通からも歩ける距離です。旅行や出張で札幌にお越しの際も、どうぞお立ち寄りください。</p>
          </Body>
        </Split>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.entrance01} side="left" width="narrow" ratio="3/4" ratioSp="4/5" position="50% 64%">
          <h2 className="t-h2">
            <span className="ib">ビルの{address.floorText}、</span>
            <span className="ib">灯るロゴが目印。</span>
          </h2>
          <Body className="measure mt-9">
            <p>
              {address.buildingName}の{address.floorText}。入口では、壁に灯る「{restaurant.name}」のロゴがお迎えします。
            </p>
            <p>通りからは見えない場所にあります。はじめての方は、上の地図で場所をお確かめのうえ、お越しください。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.space.path} className="more">
              店内を見る
            </Link>
          </p>
        </PhotoEdge>
      </Section>

      <Section>
        <Split heading="アクセスについてのご質問">
          <FaqList faqs={questions} />
        </Split>
      </Section>

      <Onward pillar={page.path} items={["reservation", "space", "solo"]} />
      <ReservationBlock />
    </>
  );
}
