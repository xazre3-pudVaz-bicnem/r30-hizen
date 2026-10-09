/**
 * 大人の隠れ家
 * 担当する検索語: すすきの 大人 寿司（＋ 隠れ家／静か／落ち着いた）
 * 役割: 騒がしくない大人向けの寿司店を探す人へ、この店が静かである理由（決まりごと）を具体的に示す。
 *       年齢の線引き ／ 香りの決まり ／ 静けさをつくっているもの ／ 隠れ家と呼ばれる場所。
 * 書かないこと: 店の成り立ちや考え方は /concept。
 *              年齢・香りの決まりは data/restaurant.ts の agePolicy / fragrancePolicy から出す。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Column, Items, PhotoEdge, Section, Split, Statement } from "@/components/sections/Blocks";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, courseCommon, fragrancePolicy, restaurant, stationWalk } from "@/data/restaurant";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.adultSushi;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

/** 文中のリンク */
function T({ to, children }: { to: keyof typeof pages; children: string }) {
  return (
    <Link href={pages[to].path} className="link">
      {children}
    </Link>
  );
}

export default function AdultSushiPage() {
  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        layout="split"
        crumbs={crumbs}
        label="はじめての方へ"
        title={
          <>
            <span className="ib">すすきので、</span>
            <span className="ib">大人が静かに過ごせる</span>
            <span className="ib">隠れ家寿司。</span>
          </>
        }
        lead={`にぎやかな街だからこそ、静かな席を。${restaurant.name}が、大人のために設けている決まりごとをご案内します。`}
        photo={photos.entrance01}
        photoPosition="50% 64%"
      />

      <Section>
        <Statement
          note={
            <>
              <p>
                {restaurant.name}は、{agePolicy.audience}の鮨店です。{agePolicy.sentence}ご同伴の方も、お子様も同じです。
              </p>
              <p>理由は、{agePolicy.reason}。店内にいるのは、いつも大人だけです。</p>
            </>
          }
        >
          <span className="ib">{agePolicy.label}、</span>
          <span className="ib">という線引き。</span>
        </Statement>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.chef01} side="right" width="half" ratio="4/5" ratioSp="1/1" position="46% 42%">
          <h2 className="t-h2">
            <span className="ib">香りにも、</span>
            <span className="ib">決まりがあります。</span>
          </h2>
          <Body className="measure mt-9">
            <p>{fragrancePolicy.sentence}</p>
            <p>握りは、口に入れる前の香りから始まっています。隣の席の香水ひとつで、その一貫は変わってしまう。だから、あらかじめお願いしています。</p>
          </Body>
        </PhotoEdge>
      </Section>

      <Section>
        <Split heading="静けさを、つくっているもの。">
          <Items
            items={[
              {
                key: "counter",
                title: restaurant.seats.style,
                body: <p>大人数でにぎわうテーブル席がありません。聞こえてくるのは、包丁の音と、ほどよい話し声です。</p>,
              },
              {
                key: "course",
                title: "おまかせのコースのみ",
                body: <p>注文のやりとりが、ほとんどありません。{courseCommon.perPerson}</p>,
              },
              {
                key: "two",
                title: `${restaurant.people.team}で営む店`,
                body: <p>目の届く広さの、小さな店です。混み合う時間帯は、お料理にお時間をいただくことがあります。</p>,
              },
              {
                key: "smoke",
                title: restaurant.seats.smoking,
                body: <p>煙の匂いも、ありません。</p>,
              },
            ]}
          />
        </Split>
      </Section>

      <Section>
        <Column
          side="left"
          heading={
            <>
              <span className="ib">隠れ家、</span>
              <span className="ib">と呼ばれる場所。</span>
            </>
          }
        >
          <Body>
            <p>
              店があるのは、{restaurant.address.buildingName}の{restaurant.address.floorText}。通りを歩いていても、外から店内は見えません。
            </p>
            <p>{stationWalk}。すすきののにぎわいから、ほんの少し離れたところです。</p>
            <p>
              <T to="anniversary">記念日</T>や<T to="date">デート</T>、<T to="businessDinner">接待・会食</T>、<T to="solo">お一人</T>の夜に。声を張らずに話せる席を、ご用意しています。
            </p>
          </Body>
          <p className="mt-10">
            <Link href={pages.access.path} className="more">
              地図と店舗情報
            </Link>
          </p>
        </Column>
      </Section>

      <Onward pillar={page.path} items={["concept", "space", "susukinoSushi"]} />
      <ReservationBlock />
    </>
  );
}
