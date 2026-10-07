/**
 * デート
 * 担当する検索語: すすきの 寿司 デート（＋ すすきの デート ディナー）
 * 役割: デートで使える寿司店を探す人へ、会話のしやすさ・時間配分・気をつける点を伝える。
 * 書かないこと: 記念日の過ごし方は /anniversary。個室・夜景・カップルシートなど、無いものは書かない。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, PhotoSplit, Section, Split } from "@/components/sections/Blocks";
import { PageHead } from "@/components/sections/PageHead";
import { PillarPosts } from "@/components/sections/PillarPosts";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { courseById } from "@/data/courses";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, fragrancePolicy, site, stationWalk } from "@/data/site";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.date;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function DatePage() {
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
            <span className="ib">すすきので寿司デートを。</span>
            <span className="ib">カウンターで過ごす、大人の夜。</span>
          </>
        }
        lead="向かい合うより、横に並ぶ。同じ一貫を、同じ間合いで味わうカウンターは、話のきっかけに困りません。"
        photo={photos.cuisine05}
        photoPosition="50% 54%"
      />

      <Section>
        <Split heading="カウンターが、デートに向く理由。">
          <Items
            items={[
              {
                key: "side",
                title: "横に並ぶ距離",
                body: <p>正面から向き合うより、肩を並べるほうが話しやすい。視線の先には、いつも握る手もとがあります。</p>,
              },
              {
                key: "topic",
                title: "目の前の仕事が、話題になる",
                body: <p>いま握られた一貫、次に出てくる一皿。料理が一品ずつ届くので、会話の間が自然に埋まります。</p>,
              },
              {
                key: "choice",
                title: "注文に迷わない",
                body: <p>お料理はおまかせのコースのみ。品書きを前に悩む時間がなく、相手との時間に集中できます。</p>,
              },
            ]}
          />
        </Split>
      </Section>

      <Section tone="ink-2">
        <PhotoSplit photo={photos.sushi03} ratio="3/2">
          <h2 className="t-h2">
            <span className="ib">当日の流れを、</span>
            <span className="ib">思い描く。</span>
          </h2>
          <div className="mt-8">
            <Items
              items={[
                {
                  key: "meet",
                  title: "待ち合わせ",
                  body: (
                    <p>
                      店は{stationWalk}。駅で落ち合って、歩いて向かえます。営業は{site.hours.opens}からです。
                    </p>
                  ),
                },
                {
                  key: "long",
                  title: "ゆっくり過ごすなら",
                  body: (
                    <p>
                      {full.name}（{full.items}）。{full.notes[0]}
                    </p>
                  ),
                },
                {
                  key: "short",
                  title: "二軒目も考えるなら",
                  body: (
                    <p>
                      {short.name}（{short.items}）。ご滞在は{short.stay}まで。食後にもう一軒、という夜に向いています。
                    </p>
                  ),
                },
              ]}
            />
          </div>
          <p className="mt-8">
            <Link href={pages.omakase.path} className="more">
              コースと料金を見る
            </Link>
          </p>
        </PhotoSplit>
      </Section>

      <Section>
        <Split heading="デートの前に、知っておきたいこと。">
          <Items
            items={[
              {
                key: "age",
                title: agePolicy.label,
                body: <p>お二人とも{agePolicy.minAge}歳以上であることをご確認ください。{agePolicy.sentence}</p>,
              },
              {
                key: "fragrance",
                title: "香水と柔軟剤",
                body: <p>{fragrancePolicy.sentence}お出かけ前に、お相手にもひとこと伝えておくと安心です。</p>,
              },
              {
                key: "allergy",
                title: "苦手な食材",
                body: <p>アレルギーは、ご予約の際にお知らせください。当日の食材の変更や、苦手な食材の差し替えはいたしかねます。</p>,
              },
              {
                key: "book",
                title: "ご予約",
                body: (
                  <p>
                    {web.partySize}名様のご予約は、Web予約でも承ります。当日のご予約は{site.reservation.sameDayDeadline}まで、お電話で。
                  </p>
                ),
              },
            ]}
          />
        </Split>
      </Section>

      <Section tone="ink-2">
        <Split heading="一杯を、分け合う。">
          <Body>
            <p>{site.drinks.kinds.slice(0, 3).join("、")}。握りに合わせて、同じお酒を二人で。{site.drinks.bottles}</p>
          </Body>
          <p className="mt-8">
            <Link href={pages.drink.path} className="more">
              お酒について
            </Link>
          </p>
        </Split>
      </Section>

      <PillarPosts path={page.path} limit={4} />
      <RelatedPages
        items={[
          { page: "space", note: "黒を基調にした、カウンター席だけの店内。" },
          { page: "anniversary", note: "結婚記念日や誕生日のディナーに。" },
          { page: "counterSushi", note: "カウンターでの過ごし方と、ささやかな作法。" },
          { page: "reservation", note: "ご予約の方法と、ご来店前のお願い。" },
        ]}
      />
      <ReservationBlock lead="2名様のご予約は、Web予約でも承ります。当日のご予約はお電話でどうぞ。" />
    </>
  );
}
