/**
 * 記念日
 * 担当する検索語: すすきの 寿司 記念日（＋ 記念日 ディナー／誕生日／結婚記念日）
 * 役割: 記念日のディナーに寿司店を探す人へ、雰囲気・所要時間・予約の勘どころを伝える。
 * 書かないこと: 付き合う前後のデートの話は /date、会社の会食は /business-dinner。
 *              ケーキ・花束・メッセージプレート・サプライズ演出・個室・夜景は、用意があると確認できていない。
 *              「できる」とは書かない（質問には「ご案内していない。電話で相談を」と答える）。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, PhotoSplit, Section, Split } from "@/components/sections/Blocks";
import { FaqList } from "@/components/sections/FaqList";
import { PageHead } from "@/components/sections/PageHead";
import { PillarPosts } from "@/components/sections/PillarPosts";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { courseById, priceLabel, signatureDish } from "@/data/courses";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, fragrancePolicy, hoursLine, site, stationWalk } from "@/data/site";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.anniversary;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function AnniversaryPage() {
  const full = courseById("omakase-15");
  const short = courseById("omakase-short");
  const { web, sameDayDeadline } = site.reservation;

  const questions = [
    {
      q: "ケーキやメッセージプレートは用意できますか？",
      a: "現在、サイトではご案内しておりません。ご希望がございましたら、ご予約の際にお電話でご相談ください。",
    },
    {
      q: "個室はありますか？",
      a: `個室はございません。お席は${site.seating.style}です。${agePolicy.audience}のため、まわりのお席も大人のお客様だけです。`,
    },
    {
      q: "服装の決まりはありますか？",
      a: `服装について、サイトでご案内している決まりはございません。香りについてのみ、お願いがございます。${fragrancePolicy.sentence}`,
    },
    {
      q: "記念日の当日に思い立っても、予約できますか？",
      a: `当日のご予約は${sameDayDeadline}まで、お電話で承ります。お席に限りがございますので、お日にちが決まりましたらお早めにどうぞ。`,
    },
  ];

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label="ご利用の場面"
        title={
          <>
            <span className="ib">すすきので迎える記念日に、</span>
            <span className="ib">カウンターの寿司を。</span>
          </>
        }
        lead="結婚記念日、誕生日、節目の日。同じ料理を、同じ速さで、並んで味わう。それだけで、いつもの食事とは違う夜になります。"
        photo={photos.cuisine03}
        photoPosition="50% 52%"
      />

      <Section>
        <Split heading="記念日に、おまかせが向く理由。">
          <Body>
            <p>品書きがないので、何を頼むかに気を取られません。次の一皿を二人で待つ、その時間ごと記念日になります。</p>
            <p>{courseById("omakase-15").contents.slice(0, 2).join("、")}。少しずつ、たくさんの種類を味わえるのも、おまかせの良さです。旬の魚介と季節の一皿が、その日だけの組み合わせで並びます。</p>
            <p>{site.name}は{agePolicy.audience}。静かな店内で、ゆっくりと言葉を交わしていただけます。</p>
          </Body>
        </Split>
      </Section>

      <Section tone="ink-2">
        <PhotoSplit photo={photos.sushi04} ratio="3/2">
          <h2 className="t-h2">
            <span className="ib">記念日に合う、</span>
            <span className="ib">二つのコース。</span>
          </h2>
          <div className="mt-8">
            <Items
              items={[
                {
                  key: full.id,
                  title: full.name,
                  body: (
                    <p>
                      {full.items}・{priceLabel(full.price)}。{full.notes[0]}時間を気にせず過ごしたい記念日に。
                    </p>
                  ),
                },
                {
                  key: short.id,
                  title: short.name,
                  body: (
                    <p>
                      {short.items}・{priceLabel(short.price)}。ご滞在は{short.stay}まで。このあとにもう一軒、という夜に。
                    </p>
                  ),
                },
              ]}
            />
          </div>
          <p className="mt-6 text-[0.9375rem] leading-[2.05]">どちらも、結びは{signatureDish.label}です。</p>
          <p className="mt-8">
            <Link href={pages.omakase.path} className="more">
              コースの内容を見る
            </Link>
          </p>
        </PhotoSplit>
      </Section>

      <Section>
        <Split heading="乾杯のお酒">
          <Body>
            <p>{site.drinks.bottles}日本酒で始めるのも、泡で始めるのも、お好みで。</p>
          </Body>
          <p className="mt-8">
            <Link href={pages.drink.path} className="more">
              お酒について
            </Link>
          </p>
        </Split>
      </Section>

      <Section tone="ink-2">
        <Split heading="記念日のご予約で、確かめておきたいこと。">
          <Items
            items={[
              {
                key: "book",
                title: "ご予約の方法",
                body: (
                  <p>
                    {web.partySize}名様でしたら、Web予約をご利用いただけます。お電話でも承ります。
                  </p>
                ),
              },
              {
                key: "allergy",
                title: "アレルギーと苦手な食材",
                body: <p>アレルギーは、ご予約の際にお知らせください。当日の食材の変更や、苦手な食材の差し替えはいたしかねます。お相手の分も、先に確かめておくと安心です。</p>,
              },
              {
                key: "fragrance",
                title: "香りについて",
                body: <p>{fragrancePolicy.sentence}贈りものの香水は、お食事のあとに。</p>,
              },
              {
                key: "time",
                title: "お時間",
                body: (
                  <p>
                    営業は{hoursLine}。{stationWalk}です。
                  </p>
                ),
              },
            ]}
          />
        </Split>
      </Section>

      <Section>
        <Split heading="記念日のご利用について、よくあるご質問">
          <FaqList faqs={questions} />
        </Split>
      </Section>

      <PillarPosts path={page.path} limit={4} />
      <RelatedPages
        items={[
          { page: "omakase", note: "コースの品数・料金・所要時間。" },
          { page: "space", note: "黒を基調にした、カウンター席だけの店内。" },
          { page: "access", note: `${stationWalk}。地図と店舗情報。` },
          { page: "reservation", note: "ご予約の方法と、ご来店前のお願い。" },
        ]}
      />
      <ReservationBlock lead="記念日のお席は、お早めにどうぞ。2名様のご予約は、Web予約でも承ります。" />
    </>
  );
}
