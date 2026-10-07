/**
 * アクセス・店舗情報
 * 担当する検索語: R-30 hizen アクセス（場所・行き方・営業時間・支払い）
 * 書かないこと: 予約の手順は /reservation。
 * 住所・電話番号・営業時間は data/site.ts から出す。道順の細かい説明（◯◯の角を曲がる等）は、
 * 現地で確かめた情報が無いので書かない。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Section, Split } from "@/components/sections/Blocks";
import { FaqList } from "@/components/sections/FaqList";
import { MapEmbed } from "@/components/sections/MapEmbed";
import { PageHead } from "@/components/sections/PageHead";
import { PillarPosts } from "@/components/sections/PillarPosts";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { ShopFacts } from "@/components/sections/ShopFacts";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { pages } from "@/data/pages";
import { addressLine, hoursLine, site, stationWalk } from "@/data/site";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.access;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function AccessPage() {
  const { access, address, hours } = site;
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
      <JsonLd graph={pageGraph(page, crumbs, [], "ContactPage")} />

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
        lead={`${site.name}は、${address.locality}${address.district}にあります。地下鉄と市電、どちらの駅からも歩いてお越しいただけます。`}
      />

      <Section tight>
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-5">
            <h2 className="t-h3">店舗情報</h2>
            <div className="mt-6">
              <ShopFacts variant="full" />
            </div>
          </div>
          <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.08}>
            <h2 className="t-h3">地図</h2>
            <div className="mt-6">
              <MapEmbed embedUrl={site.map.embedUrl} linkUrl={site.map.linkUrl} title={`${site.name}の地図`} tall />
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="ink-2">
        <Split heading="最寄りの駅から">
          <ul className="rows">
            {routes.map((r) => (
              <li key={r.station} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 py-6">
                <p className="text-paper">
                  <span className="t-note mr-3">{r.line}</span>
                  <span className="ib text-[1.0625rem] tracking-[0.1em]">{r.station}</span>
                </p>
                <p className="text-paper">{r.walk}</p>
              </li>
            ))}
          </ul>
          <Body className="mt-8">
            <p>すすきのの中心から、少し西へ。札幌の中心部・大通からも歩ける距離です。旅行や出張で札幌にお越しの際も、どうぞお立ち寄りください。</p>
            <p>{access.parking}</p>
          </Body>
        </Split>
      </Section>

      <Section>
        <Split heading="アクセスについてのご質問">
          <FaqList faqs={questions} />
          <p className="mt-10">
            <Link href={pages.reservation.path} className="more">
              ご予約について
            </Link>
          </p>
        </Split>
      </Section>

      <PillarPosts path={page.path} />
      <RelatedPages
        items={[
          { page: "reservation", note: "お電話・Web予約の方法と、ご来店前のお願い。" },
          { page: "space", note: "店内の様子と、お席について。" },
          { page: "solo", note: "出張や旅行の夜に、お一人でのご利用。" },
        ]}
      />
      <ReservationBlock />
    </>
  );
}
