/**
 * 接待・会食
 * 担当する検索語: すすきの 寿司 接待（＋ すすきの 会食／貸切）
 * 役割: 幹事が確かめたい「席・人数・会計・予約」を先に伝える。
 * 書かないこと: プライベートな記念日は /anniversary。
 *              個室は無い。あるかのように書かない（冒頭で「個室はございません」と明記する）。
 *              領収書の形式・請求書払いなど、確認できていない会計の扱いは書かない。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, PhotoSplit, Section, Split } from "@/components/sections/Blocks";
import { PageHead } from "@/components/sections/PageHead";
import { PillarPosts } from "@/components/sections/PillarPosts";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { courseById, courseCommon, priceLabel } from "@/data/courses";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, fragrancePolicy, site, stationWalk } from "@/data/site";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.businessDinner;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function BusinessDinnerPage() {
  const full = courseById("omakase-15");
  const short = courseById("omakase-short");
  const { web } = site.reservation;

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label="ご利用の場面"
        title={
          <>
            <span className="ib">すすきのでの接待・会食に、</span>
            <span className="ib">カウンターの寿司を。</span>
          </>
        }
        lead={`大切なお相手をもてなす席に。${site.name}の席の形と、幹事の方に先にお伝えしておきたいことをまとめました。`}
        photo={photos.counter02}
        photoPosition="50% 60%"
      />

      <Section>
        <Split heading="個室はございません。カウンターでのおもてなしです。">
          <Body>
            <p>はじめにお伝えします。{site.name}のお席は{site.seating.style}で、個室はございません。</p>
            <p>込み入ったお話をする席というより、食事そのものを一緒に楽しんでいただく会食に向いています。目の前で握られる一貫が、そのまま会話の糸口になります。</p>
            <p>{agePolicy.audience}の店ですので、店内は落ち着いています。ほかのお客様とお席が並ぶことは、あらかじめご承知おきください。</p>
          </Body>
        </Split>
      </Section>

      <Section tone="ink-2">
        <Split heading="人数と、ご予約の方法。">
          <Items
            items={[
              {
                key: "two",
                title: `${web.partySize}名様`,
                body: <p>Web予約（{web.label}）、またはお電話で承ります。</p>,
              },
              {
                key: "three",
                title: "3名様以上",
                body: <p>お電話でご予約ください。Web予約はご利用いただけません。</p>,
              },
              {
                key: "charter",
                title: "貸切",
                body: <p>{site.seating.charter}</p>,
              },
            ]}
          />
          <p className="mt-8">
            <Link href={pages.reservation.path} className="more">
              ご予約について
            </Link>
          </p>
        </Split>
      </Section>

      <Section>
        <PhotoSplit photo={photos.sushi01} ratio="4/5" position="60% 50%" side="right">
          <h2 className="t-h2">
            <span className="ib">会食に合わせた、</span>
            <span className="ib">コース選び。</span>
          </h2>
          <div className="mt-8">
            <Items
              items={[
                {
                  key: full.id,
                  title: full.name,
                  body: (
                    <p>
                      {full.items}・{priceLabel(full.price)}。{full.notes[0]}
                    </p>
                  ),
                },
                {
                  key: short.id,
                  title: short.name,
                  body: (
                    <p>
                      {short.items}・{priceLabel(short.price)}。ご滞在は{short.stay}まで。次のご予定がある会食に。
                    </p>
                  ),
                },
              ]}
            />
          </div>
          <p className="mt-6 text-[0.9375rem] leading-[2.05]">{courseCommon.perPerson}</p>
          <p className="mt-8">
            <Link href={pages.omakase.path} className="more">
              コースの内容を見る
            </Link>
          </p>
        </PhotoSplit>
      </Section>

      <Section tone="ink-2">
        <Split heading="お会計について">
          <Body>
            <p>コースご利用時などの明細は、発行しておりません。社内の精算で明細が必要な場合は、あらかじめご承知おきください。</p>
            <p>クレジットカードは、{site.payment.cards.join("、")}をご利用いただけます。</p>
            <p>そのほか、お会計まわりで確かめておきたいことがございましたら、ご予約の際にお電話でお尋ねください。</p>
          </Body>
        </Split>
      </Section>

      <Section>
        <Split heading="お相手に、事前にお伝えいただきたいこと。">
          <Items
            items={[
              {
                key: "age",
                title: agePolicy.label,
                body: <p>ご同席の皆様が{agePolicy.minAge}歳以上であることをご確認ください。</p>,
              },
              {
                key: "fragrance",
                title: "香りについて",
                body: <p>{fragrancePolicy.sentence}</p>,
              },
              {
                key: "allergy",
                title: "アレルギー",
                body: <p>当日の食材の変更はできません。お相手のアレルギーは、ご予約の際にまとめてお知らせください。苦手な食材の差し替えはいたしかねます。</p>,
              },
              {
                key: "place",
                title: "場所",
                body: (
                  <p>
                    {stationWalk}、{site.address.buildingName}の{site.address.floorText}です。{site.access.parking}
                  </p>
                ),
              },
            ]}
          />
        </Split>
      </Section>

      <PillarPosts path={page.path} limit={4} />
      <RelatedPages
        items={[
          { page: "omakase", note: "コースの品数・料金・所要時間。" },
          { page: "space", note: "店内の様子と、お席について。" },
          { page: "access", note: `${stationWalk}。地図と店舗情報。` },
          { page: "drink", note: "会食の席に合わせる、日本酒とワイン。" },
        ]}
      />
      <ReservationBlock lead="3名様以上のご予約と、貸切のご相談は、お電話で承ります。" />
    </>
  );
}
