/**
 * 記念日
 * 担当する検索語: すすきの 寿司 記念日（＋ 記念日 ディナー／誕生日／結婚記念日）
 * 役割: 記念日のディナーに寿司店を探す人へ。このページで答えるのは4つ。
 *       二人での過ごし方 ／ コースと滞在時間 ／ 乾杯のお酒 ／ ご予約で確かめること。
 * 書かないこと: 付き合う前後のデートの話（距離感・服装・二軒目）は /date、会社の会食は /business-dinner。
 *              ケーキ・花束・メッセージプレート・サプライズ演出・個室・夜景は、用意があると確認できていない。
 *              「できる」とは書かない（質問には「ご案内していない。電話で相談を」と答える）。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Column, Items, PhotoEdge, Section, Split } from "@/components/sections/Blocks";
import { CourseRows } from "@/components/sections/CourseRows";
import { FaqList } from "@/components/sections/FaqList";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, courseById, firstSentence, fragrancePolicy, restaurant, signatureDish } from "@/data/restaurant";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.anniversary;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function AnniversaryPage() {
  const full = courseById("omakase-15");
  const short = courseById("omakase-short");
  const { web, sameDayDeadline } = restaurant.reservation;

  const questions = [
    {
      q: "ケーキやメッセージプレートは用意できますか？",
      a: "現在、サイトではご案内しておりません。ご希望がございましたら、ご予約の際にお電話でご相談ください。",
    },
    {
      q: "個室はありますか？",
      a: `個室はございません。お席は${restaurant.seats.style}です。${agePolicy.audience}のため、まわりのお席も大人のお客様だけです。`,
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
        photo={photos.cuisine06}
        photoPosition="46% 54%"
      />

      <Section>
        <Column
          side="left"
          heading={
            <>
              <span className="ib">二人で、同じものを、</span>
              <span className="ib">同じ速さで。</span>
            </>
          }
        >
          <Body>
            <p>品書きがないので、何を頼むかに気を取られません。次の一皿を二人で待つ、その時間ごと記念日になります。</p>
            <p>席は、横に並ぶカウンター。向かい合うより近く、目の前の仕事を一緒に眺めていられます。</p>
            <p>
              {restaurant.name}は{agePolicy.audience}。まわりのお席も、大人のお客様だけです。静かな店内で、ゆっくりと言葉を交わしていただけます。
            </p>
          </Body>
        </Column>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.cuisine03} side="left" width="half" ratio="4/5" ratioSp="1/1" position="52% 50%" align="end">
          <h2 className="t-h2">
            <span className="ib">記念日の、</span>
            <span className="ib">コースと滞在時間。</span>
          </h2>
          <div className="mt-9">
            <CourseRows
              only={[full.id, short.id]}
              practical
              notes={{
                [full.id]: `${firstSentence(full.notes[0])}時間を気にせず過ごしたい記念日に。`,
                [short.id]: "このあとにもう一軒、という夜に。旬の要所を、ほどよく。",
              }}
            />
          </div>
          <p className="mt-7">どちらも、結びは{signatureDish.label}です。</p>
          <p className="mt-9">
            <Link href={pages.omakase.path} className="more">
              コースの内容を見る
            </Link>
          </p>
        </PhotoEdge>
      </Section>

      <Section>
        <Split heading="乾杯のお酒">
          <Body>
            <p>{restaurant.drinks.bottles}日本酒で始めるのも、泡で始めるのも、お好みで。</p>
          </Body>
          <p className="mt-9">
            <Link href={pages.drink.path} className="more">
              鮨に合わせるお酒
            </Link>
          </p>
        </Split>
      </Section>

      <Section>
        <Split heading="ご予約のときに、確かめておきたいこと。">
          <Items
            items={[
              {
                key: "book",
                title: "ご予約の方法",
                body: <p>{web.partyLabel}でしたら、Web予約をご利用いただけます。お電話でも承ります。</p>,
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
                key: "age",
                title: agePolicy.label,
                body: <p>お二人とも{agePolicy.minAge}歳以上であることをご確認ください。</p>,
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

      <Onward pillar={page.path} items={["omakase", "space", "date"]} />
      <ReservationBlock lead={`記念日のお席は、お早めにどうぞ。${web.partyLabel}のご予約は、Web予約でも承ります。`} />
    </>
  );
}
