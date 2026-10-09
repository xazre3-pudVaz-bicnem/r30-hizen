/**
 * デート
 * 担当する検索語: すすきの 寿司 デート（＋ すすきの デート ディナー）
 * 役割: デートで使える寿司店を探す人へ。このページで答えるのは4つ。
 *       カウンターの距離感 ／ 当日の流れ（待ち合わせ〜二軒目） ／ 服装 ／ 香り。
 * 書かないこと: 記念日のコース選びと予約は /anniversary。個室・夜景・カップルシートなど、無いものは書かない。
 *              服装の決まりは公式に案内が無い。「決まりは設けていない」と断定せず、「ご案内している決まりは無い」と書く。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Column, Items, PhotoEdge, Section, Split, Steps } from "@/components/sections/Blocks";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, courseById, firstSentence, fragrancePolicy, restaurant, stationWalk } from "@/data/restaurant";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.date;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function DatePage() {
  const full = courseById("omakase-15");
  const short = courseById("omakase-short");
  const { web, sameDayDeadline } = restaurant.reservation;

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        layout="split"
        crumbs={crumbs}
        label="ご利用の場面"
        title={
          <>
            <span className="ib">寿司デートは、</span>
            <span className="ib">すすきののカウンターで。</span>
          </>
        }
        lead="向かい合うより、横に並ぶ。同じ一貫を、同じ間合いで味わうカウンターは、話のきっかけに困りません。"
        photo={photos.counter01Portrait}
        photoPosition="50% 72%"
      />

      <Section>
        <Column
          side="left"
          heading={
            <>
              <span className="ib">向かい合うより、</span>
              <span className="ib">横に並ぶ。</span>
            </>
          }
        >
          <Body>
            <p>正面から向き合うより、肩を並べるほうが話しやすい。視線の先には、いつも握る手もとがあります。</p>
            <p>料理は、一品ずつ届きます。いま握られた一貫、次に出てくる一皿。話がとぎれても、目の前の仕事が間を埋めてくれます。</p>
            <p>お料理はおまかせのコースのみ。品書きを前に悩む時間がなく、相手との時間に集中できます。</p>
          </Body>
        </Column>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.sushi03} side="right" width="narrow" ratio="3/2" position="50% 50%" align="start">
          <h2 className="t-h2">
            <span className="ib">待ち合わせから、</span>
            <span className="ib">二軒目まで。</span>
          </h2>
          <div className="mt-10">
            <Steps
              items={[
                {
                  key: "meet",
                  title: "待ち合わせ",
                  body: (
                    <p>
                      店は{stationWalk}。駅で落ち合って、歩いて向かえます。営業は{restaurant.hours.opens}からです。
                    </p>
                  ),
                },
                {
                  key: "seat",
                  title: "席に着く",
                  body: <p>お席は{restaurant.seats.style}。カウンターに、横並びで。</p>,
                },
                {
                  key: "course",
                  title: "コースを味わう",
                  body: (
                    <p>
                      {full.name}（{full.items}）は、{firstSentence(full.notes[0])}
                      {short.name}（{short.items}）は、ご滞在{short.stay}までです。
                    </p>
                  ),
                },
                {
                  key: "after",
                  title: "そのあと",
                  body: <p>時間をきめて楽しむなら、{short.name}を。食後にもう一軒、という夜に向いています。すすきのは、二軒目に困らない街です。</p>,
                },
              ]}
            />
          </div>
          <p className="mt-10">
            <Link href={pages.omakase.path} className="more">
              コースと料金を見る
            </Link>
          </p>
        </PhotoEdge>
      </Section>

      <Section>
        <Split heading="服装と、香り。">
          <Body>
            <p>服装について、サイトでご案内している決まりはありません。カウンターの鮨店には、落ち着いた装いがよくなじみます。</p>
            <p>
              気をつけていただきたいのは、香りです。{fragrancePolicy.sentence}お出かけ前に、お相手にもひとこと伝えておくと安心です。
            </p>
          </Body>
          <div className="mt-10">
            <Items
              items={[
                {
                  key: "age",
                  title: agePolicy.label,
                  body: (
                    <p>
                      お二人とも{agePolicy.minAge}歳以上であることをご確認ください。{agePolicy.sentence}
                    </p>
                  ),
                },
                {
                  key: "allergy",
                  title: "苦手な食材",
                  body: <p>アレルギーは、ご予約の際にお知らせください。当日の食材の変更や、苦手な食材の差し替えはいたしかねます。</p>,
                },
              ]}
            />
          </div>
        </Split>
      </Section>

      <Onward pillar={page.path} items={["space", "drink", "anniversary"]} />
      <ReservationBlock lead={`${web.partyLabel}のご予約は、Web予約でも承ります。当日のご予約は${sameDayDeadline}までに、お電話でどうぞ。`} />
    </>
  );
}
