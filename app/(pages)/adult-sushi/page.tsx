/**
 * 大人の隠れ家
 * 担当する検索語: すすきの 大人 寿司（＋ 隠れ家／静か／落ち着いた）
 * 役割: 騒がしくない大人向けの寿司店を探す人へ、この店が静かである理由（決まりごと）を具体的に示す。
 * 書かないこと: 店の成り立ちや考え方は /concept。
 *              年齢・香りの決まりは data/site.ts の agePolicy / fragrancePolicy から出す。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, PhotoSplit, Section, Split } from "@/components/sections/Blocks";
import { PageHead } from "@/components/sections/PageHead";
import { PillarPosts } from "@/components/sections/PillarPosts";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { courseCommon } from "@/data/courses";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, fragrancePolicy, site, stationWalk } from "@/data/site";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.adultSushi;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function AdultSushiPage() {
  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label="鮨を選ぶ"
        title={
          <>
            <span className="ib">すすきので、大人が静かに過ごせる</span>
            <span className="ib">隠れ家寿司。</span>
          </>
        }
        lead={`にぎやかな街だからこそ、静かな席を。${site.name}が、大人のために設けている決まりごとをご案内します。`}
        photo={photos.cuisine06}
        photoPosition="50% 52%"
      />

      <Section>
        <Split
          heading={
            <>
              <span className="ib">{agePolicy.label}、</span>
              <span className="ib">という線引き。</span>
            </>
          }
        >
          <Body>
            <p>{site.name}は、{agePolicy.audience}の鮨店です。{agePolicy.sentence}ご同伴の方も、お子様も同じです。</p>
            <p>理由は、{agePolicy.reason}。店内にいるのは、いつも大人だけです。</p>
          </Body>
        </Split>
      </Section>

      <Section tone="ink-2">
        <PhotoSplit photo={photos.sushi03} ratio="3/2">
          <h2 className="t-h2">
            <span className="ib">香りにも、</span>
            <span className="ib">決まりがあります。</span>
          </h2>
          <Body className="mt-8">
            <p>{fragrancePolicy.sentence}</p>
            <p>握りは、口に入れる前の香りから始まっています。隣の席の香水ひとつで、その一貫は変わってしまう。だから、あらかじめお願いしています。</p>
          </Body>
        </PhotoSplit>
      </Section>

      <Section>
        <Split heading="静けさを、つくっているもの。">
          <Items
            items={[
              {
                key: "counter",
                title: site.seating.style,
                body: <p>大人数でにぎわうテーブル席がありません。聞こえてくるのは、包丁の音と、ほどよい話し声です。</p>,
              },
              {
                key: "course",
                title: "おまかせのコースのみ",
                body: <p>注文のやりとりが、ほとんどありません。{courseCommon.perPerson}</p>,
              },
              {
                key: "two",
                title: `${site.people.team}で営む店`,
                body: <p>目の届く広さの、小さな店です。混み合う時間帯は、お料理にお時間をいただくことがあります。</p>,
              },
              {
                key: "smoke",
                title: site.seating.smoking,
                body: <p>煙の匂いも、ありません。</p>,
              },
            ]}
          />
        </Split>
      </Section>

      <Section tone="ink-2">
        <PhotoSplit photo={photos.entrance01} ratio="4/5" position="50% 70%" side="right">
          <h2 className="t-h2">
            <span className="ib">隠れ家、</span>
            <span className="ib">と呼ばれる場所。</span>
          </h2>
          <Body className="mt-8">
            <p>店があるのは、{site.address.buildingName}の{site.address.floorText}。通りを歩いていても、外から店内は見えません。</p>
            <p>{stationWalk}。すすきののにぎわいから、ほんの少し離れたところです。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.access.path} className="more">
              アクセスを見る
            </Link>
          </p>
        </PhotoSplit>
      </Section>

      <Section>
        <Split heading="こんな夜のための、店です。">
          <Items
            items={[
              {
                key: "anniversary",
                title: <Link href={pages.anniversary.path} className="link inline-flex min-h-9 items-center">記念日</Link>,
                body: <p>言葉をゆっくり交わしたい、節目の日に。</p>,
              },
              {
                key: "date",
                title: <Link href={pages.date.path} className="link inline-flex min-h-9 items-center">デート</Link>,
                body: <p>声を張らずに話せる席で、並んで過ごす夜に。</p>,
              },
              {
                key: "business",
                title: <Link href={pages.businessDinner.path} className="link inline-flex min-h-9 items-center">接待・会食</Link>,
                body: <p>落ち着いた席で、大切なお相手をもてなす夜に。</p>,
              },
              {
                key: "solo",
                title: <Link href={pages.solo.path} className="link inline-flex min-h-9 items-center">お一人で</Link>,
                body: <p>誰にも急かされず、鮨と酒に向き合いたい夜に。</p>,
              },
            ]}
          />
        </Split>
      </Section>

      <PillarPosts path={page.path} limit={4} />
      <RelatedPages
        items={[
          { page: "concept", note: `${site.name}の考え方と、大切にしていること。` },
          { page: "space", note: "黒を基調にした、カウンター席だけの店内。" },
          { page: "omakase", note: "3つのコースの品数・料金・所要時間。" },
          { page: "reservation", note: "ご予約の方法と、ご来店前のお願い。" },
        ]}
      />
      <ReservationBlock />
    </>
  );
}
