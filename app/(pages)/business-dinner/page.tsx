/**
 * 接待・会食
 * 担当する検索語: すすきの 寿司 接待（＋ すすきの 会食／貸切）
 * 役割: 幹事の方へ。このページで答えるのは5つ。
 *       席の形（個室なし） ／ 人数とご予約 ／ ご予算 ／ お会計 ／ お相手への配慮。
 * 書かないこと: プライベートな記念日は /anniversary。
 *              個室は無い。あるかのように書かない（冒頭で「個室はございません」と明記する）。
 *              領収書の形式・請求書払い・お飲みものの料金など、確認できていないことは書かない。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, Offset, Section, Split, Statement } from "@/components/sections/Blocks";
import { CourseRows } from "@/components/sections/CourseRows";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, confirmedAtLabel, courseById, courseCommon, fragrancePolicy, restaurant, stationWalk } from "@/data/restaurant";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.businessDinner;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function BusinessDinnerPage() {
  const full = courseById("omakase-15");
  const short = courseById("omakase-short");
  const { web, groupLabel, sameDayDeadline } = restaurant.reservation;

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label="ご利用の場面"
        title={
          <>
            <span className="ib">すすきのでの接待・会食を、</span>
            <span className="ib">カウンターの寿司で。</span>
          </>
        }
        lead={`大切なお相手をもてなす席に。${restaurant.name}の席の形と、幹事の方に先にお伝えしておきたいことをまとめました。`}
        photo={photos.cuisine01}
        photoPosition="50% 62%"
        ratioSp="1/1"
      />

      <Section>
        <Statement
          note={
            <>
              <p>
                はじめにお伝えします。{restaurant.name}のお席は{restaurant.seats.style}で、個室はございません。
              </p>
              <p>込み入ったお話をする席というより、食事そのものを一緒に楽しんでいただく会食に向いています。目の前で握られる一貫が、そのまま会話の糸口になります。</p>
              <p>{agePolicy.audience}の店ですので、店内は落ち着いています。ほかのお客様とお席が並ぶことは、あらかじめご承知おきください。</p>
            </>
          }
        >
          <span className="ib">個室はございません。</span>
          <span className="ib">カウンターでの、おもてなしです。</span>
        </Statement>
      </Section>

      <Section>
        <Split heading="人数と、ご予約。">
          <dl className="facts">
            <div>
              <dt>{web.partyLabel}</dt>
              <dd>Web予約（{web.label}）、またはお電話で承ります。</dd>
            </div>
            <div>
              <dt>{groupLabel}</dt>
              <dd>お電話でご予約ください。Web予約はご利用いただけません。</dd>
            </div>
            <div>
              <dt>貸切</dt>
              <dd>{restaurant.seats.charter}</dd>
            </div>
            <div>
              <dt>当日</dt>
              <dd>当日のご予約は、{sameDayDeadline}までにお電話で。</dd>
            </div>
          </dl>
          <p className="mt-9">
            <Link href={pages.reservation.path} className="more">
              ご予約について
            </Link>
          </p>
        </Split>
      </Section>

      <Section bare>
        <Offset photo={photos.counter02} bleed="right" ratio="16/9" ratioSp="4/3" position="50% 60%" />
        <div className="wrap mt-14 lg:mt-24">
          <Split heading="ご予算の目安">
            <CourseRows
              only={[full.id, short.id]}
              practical
              notes={{
                [full.id]: full.notes[0],
                [short.id]: "次のご予定がある会食や、軽めに済ませたい席に。",
              }}
            />
            <p className="t-note mt-5">
              お一人様あたりの料金です（税込・{confirmedAtLabel}）。{courseCommon.perPerson}
            </p>
            <p className="mt-9">
              <Link href={pages.omakase.path} className="more">
                コースの内容を見る
              </Link>
            </p>
          </Split>
        </div>
      </Section>

      <Section>
        <Split heading="お会計">
          <Body>
            <p>コースご利用時などの明細は、発行しておりません。社内の精算で明細が必要な場合は、あらかじめご承知おきください。</p>
            <p>クレジットカードは、{restaurant.payment.cards.join("、")}をご利用いただけます。</p>
            <p>そのほか、お会計まわりで確かめておきたいことがございましたら、ご予約の際にお電話でお尋ねください。</p>
          </Body>
        </Split>
      </Section>

      <Section>
        <Split heading="お相手へ、事前にお伝えいただきたいこと。">
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
                    {stationWalk}、{restaurant.address.buildingName}の{restaurant.address.floorText}です。{restaurant.access.parking}
                  </p>
                ),
              },
            ]}
          />
        </Split>
      </Section>

      <Onward pillar={page.path} items={["access", "space", "drink"]} />
      <ReservationBlock lead={`${groupLabel}のご予約と、貸切のご相談は、お電話で承ります。`} />
    </>
  );
}
