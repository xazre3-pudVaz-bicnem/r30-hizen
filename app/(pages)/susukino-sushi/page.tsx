/**
 * すすきので寿司を選ぶ
 * 担当する検索語: すすきの 高級寿司（＋ すすきの 寿司 おすすめ／ディナー）
 * 役割: 「すすきので良い寿司店を探している」人に、選び方の軸を渡し、この店の立ち位置を示す総まとめ。
 * 書かないこと: 記念日・デート・接待・一人は各ページへ送る（ここで詳しく書かない）。
 *              他店の名前・ランキング・「一番」「人気」といった比較は書かない。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, PhotoSplit, Section, Split } from "@/components/sections/Blocks";
import { PageHead } from "@/components/sections/PageHead";
import { PillarPosts } from "@/components/sections/PillarPosts";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { courses, priceMax, priceMin, yen } from "@/data/courses";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, hoursLine, seatingLine, site, stationWalk } from "@/data/site";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.susukinoSushi;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function SusukinoSushiPage() {
  const stays = courses.map((c) => c.stay);

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label="鮨を選ぶ"
        title={
          <>
            <span className="ib">すすきので高級寿司を</span>
            <span className="ib">選ぶ夜に。</span>
          </>
        }
        lead="北海道を代表する繁華街、すすきの。寿司店の数が多い街だからこそ、何を基準に選ぶかで、夜の過ごし方は変わります。"
        photo={photos.sushi02}
        photoPosition="50% 52%"
      />

      <Section>
        <Split heading="まず、頼み方で選ぶ。">
          <Body>
            <p>寿司店の頼み方は、大きく二つあります。食べたいものを一貫ずつ頼む「お好み」と、内容を店に委ねる「おまかせ」。</p>
            <p>お好みは、好きなものを好きなだけ。おまかせは、その日いちばん良いものを、店が考えた順番で。高級寿司と呼ばれる店では、おまかせのコースを軸にしていることが少なくありません。</p>
            <p>{site.name}は、おまかせのコースのみでご用意しています。選んでいただくのは、品数の違う{courses.length}つのコースだけです。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.omakaseSushi.path} className="more">
              おまかせ寿司とは
            </Link>
          </p>
        </Split>
      </Section>

      <Section tone="ink-2">
        <PhotoSplit photo={photos.counter02} ratio="3/2">
          <h2 className="t-h2">
            <span className="ib">次に、</span>
            <span className="ib">席で選ぶ。</span>
          </h2>
          <Body className="mt-8">
            <p>カウンターか、テーブルや個室か。握りたてをすぐに味わえるのは、カウンターです。職人の仕事を目の前で眺められるのも、カウンターならでは。</p>
            <p>いっぽうで、人目を気にせず話したい席には個室が向いています。目的に合わせて、席の形を先に確かめておくと安心です。</p>
            <p>{site.name}のお席は、{seatingLine}。個室はございません。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.counterSushi.path} className="more">
              カウンター寿司の過ごし方
            </Link>
          </p>
        </PhotoSplit>
      </Section>

      <Section>
        <Split heading="時間と予算を、先に確かめる。">
          <Body>
            <p>おまかせのコースは、一時間半から二時間半ほどかけて進むのが一般的です。二軒目の予定がある夜と、腰を据えたい夜とでは、選ぶコースが変わってきます。</p>
            <p>予算も同じです。料金を公開している店なら、あらかじめ確かめておけます。</p>
          </Body>
          <dl className="facts mt-10">
            <div>
              <dt>料金</dt>
              <dd>
                {yen(priceMin)}〜{yen(priceMax)}（税込・コースのみ）
              </dd>
            </div>
            <div>
              <dt>お時間</dt>
              <dd>ご滞在は、コースにより{[...new Set(stays)].join("・")}まで</dd>
            </div>
            <div>
              <dt>営業</dt>
              <dd>
                {hoursLine}・{site.hours.closedLabel}
              </dd>
            </div>
          </dl>
          <p className="mt-10">
            <Link href={pages.omakase.path} className="more">
              コースと料金を見る
            </Link>
          </p>
        </Split>
      </Section>

      <Section tone="ink-2">
        <Split heading="誰と行くかで、選ぶ。">
          <Items
            items={[
              {
                key: "anniversary",
                title: <Link href={pages.anniversary.path} className="link inline-flex min-h-9 items-center">記念日に</Link>,
                body: <p>結婚記念日や誕生日。二人で同じ料理を、同じ速さで味わう席を。</p>,
              },
              {
                key: "date",
                title: <Link href={pages.date.path} className="link inline-flex min-h-9 items-center">デートに</Link>,
                body: <p>横に並ぶカウンターは、会話のきっかけに困りません。</p>,
              },
              {
                key: "business",
                title: <Link href={pages.businessDinner.path} className="link inline-flex min-h-9 items-center">接待・会食に</Link>,
                body: <p>人数、席の形、お会計。幹事の方が先に確かめておきたいこと。</p>,
              },
              {
                key: "solo",
                title: <Link href={pages.solo.path} className="link inline-flex min-h-9 items-center">お一人で</Link>,
                body: <p>出張や旅の夜に。一人で座るカウンターの楽しみ。</p>,
              },
            ]}
          />
        </Split>
      </Section>

      <Section>
        <Split
          heading={
            <>
              <span className="ib">{site.name}は、</span>
              <span className="ib">こういう店です。</span>
            </>
          }
        >
          <dl className="facts">
            <div>
              <dt>頼み方</dt>
              <dd>おまかせのコースのみ（{courses.length}種類）</dd>
            </div>
            <div>
              <dt>お席</dt>
              <dd>{seatingLine}・{site.seating.smoking}</dd>
            </div>
            <div>
              <dt>ご利用</dt>
              <dd>{agePolicy.label}</dd>
            </div>
            <div>
              <dt>握り</dt>
              <dd>{site.people.chefExperience}の店主が、目の前で</dd>
            </div>
            <div>
              <dt>場所</dt>
              <dd>
                {stationWalk}・{site.address.buildingName} {site.address.floor}
              </dd>
            </div>
          </dl>
          <Body className="mt-10">
            <p>にぎやかに楽しむ夜には、向きません。静かに、鮨と酒に向き合いたい大人のための店です。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.adultSushi.path} className="more">
              大人の隠れ家として
            </Link>
          </p>
        </Split>
      </Section>

      <PillarPosts path={page.path} limit={4} />
      <RelatedPages
        items={[
          { page: "omakase", note: "3つのコースの品数・料金・所要時間。" },
          { page: "cuisine", note: "握りの仕事と、季節の一皿。" },
          { page: "access", note: `${stationWalk}。地図と店舗情報。` },
          { page: "reservation", note: "お電話・Web予約の方法と、ご来店前のお願い。" },
        ]}
      />
      <ReservationBlock />
    </>
  );
}
