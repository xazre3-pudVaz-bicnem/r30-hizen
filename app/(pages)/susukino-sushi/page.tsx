/**
 * すすきのの高級寿司
 * 担当する検索語: すすきの 高級寿司（あわせて拾う語: すすきの 高級鮨／すすきの おまかせ寿司／すすきの カウンター寿司）
 * 役割: 「すすきので、きちんとした高級な鮨店を探している」人へ、この店の「高級」の中身
 *       （何に手間と時間をかけているか）と、料金・時間・向く夜を伝える。
 *
 * トップ（すすきの 寿司）との分担
 *   トップ   … 店の全体像を、写真と短い文で。
 *   このページ … 「高級寿司」という切り口の読みもの。トップの文章や区画を繰り返さない。
 *
 * 書かないこと: おまかせの仕組み（/omakase-sushi）、カウンターの作法（/counter-sushi）、
 *              場面ごとの案内（各ページ）は、リンクで送る。
 *              他店の名前・ランキング・「一番」「人気」といった比較は書かない。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Column, Items, Offset, PhotoEdge, Section, Split, Statement } from "@/components/sections/Blocks";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import {
  agePolicy,
  confirmedAtLabel,
  courses,
  fragrancePolicy,
  hoursLine,
  priceMax,
  priceMin,
  restaurant,
  seatingLine,
  yen,
} from "@/data/restaurant";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.susukinoSushi;
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

export default function SusukinoSushiPage() {
  const stays = [...new Set(courses.map((c) => c.stay))];
  const itemCounts = courses.map((c) => c.items);

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label="はじめての方へ"
        title={
          <>
            <span className="ib">すすきので高級寿司を</span>
            <span className="ib">味わう、ということ。</span>
          </>
        }
        lead={`値段が高いから、高級なのではありません。何に手間と時間をかけているか。すすきので高級鮨の店をお探しの方へ、${restaurant.name}の場合をお話しします。`}
        photo={photos.sushi01}
        photoPosition="42% 56%"
      />

      <Section>
        <Column side="left" heading="「高級」は、どこにあるのか。">
          <Body>
            <p>寿司店の料金は、魚の値段だけでは決まりません。仕込みにかける手間、一貫ずつ握って出すための時間、一度にお迎えする席の数。目に見えにくいものが、そこに含まれています。</p>
            <p>
              {restaurant.name}が手間と時間をかけているのは、三つです。握りの仕事、カウンターという席、そして静けさ。順にお話しします。
            </p>
          </Body>
        </Column>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.sushi02} side="right" width="half" ratio="4/5" ratioSp="1/1" position="44% 50%">
          <p className="label">一、仕事</p>
          <h2 className="t-h2 mt-5">
            <span className="ib">握る前に、</span>
            <span className="ib">ひと手間。</span>
          </h2>
          <Body className="measure mt-9">
            <p>
              {restaurant.techniques.join("、")}。食材に合わせて仕事を施してから、握ります。{restaurant.people.chefExperience}の店主が、一貫ずつ、目の前で。
            </p>
            <p>握りの前後には、従来の手法にとらわれない季節の一皿も。鮨だけで終わらないのが、この店のおまかせです。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.cuisine.path} className="more">
              握りの仕事を見る
            </Link>
          </p>
        </PhotoEdge>
      </Section>

      <Section bare>
        <Offset photo={photos.counter01} bleed="left" ratio="16/9" ratioSp="4/3" position="50% 64%" />
        <div className="wrap mt-14 lg:mt-24">
          <Column side="right" label="二、席" heading="席は、カウンターだけ。">
            <Body>
              <p>
                お席は{seatingLine}。テーブル席も、個室もありません。握りたてを、握った手から受け取っていただくための形です。
              </p>
              <p>{restaurant.people.team}で営む、目の届く広さの店です。そのぶん、混み合う時間帯はお料理に少しお時間をいただくことがあります。</p>
            </Body>
            <p className="mt-10">
              <Link href={pages.counterSushi.path} className="more">
                カウンター寿司の過ごし方
              </Link>
            </p>
          </Column>
        </div>
      </Section>

      <Section>
        <Statement
          label="三、静けさ"
          note={
            <>
              <p>
                三つめは、静けさです。{restaurant.name}は{agePolicy.audience}。{agePolicy.reason}の決まりです。
              </p>
              <p>{fragrancePolicy.sentence}</p>
              <p>
                <Link href={pages.adultSushi.path} className="more">
                  大人のための決まりごと
                </Link>
              </p>
            </>
          }
        >
          <span className="ib">{agePolicy.label}。</span>
          <span className="ib">香りにも、決まりがあります。</span>
        </Statement>
      </Section>

      <Section>
        <Split heading="料金と、時間。">
          <dl className="facts">
            <div>
              <dt>お料理</dt>
              <dd>
                おまかせのコースのみ（{courses.length}種類）
                <span className="block">{itemCounts.join("・")}</span>
              </dd>
            </div>
            <div>
              <dt>料金</dt>
              <dd>
                {yen(priceMin)}〜{yen(priceMax)}
                <span className="t-note ml-2">（税込・{confirmedAtLabel}）</span>
              </dd>
            </div>
            <div>
              <dt>お時間</dt>
              <dd>ご滞在は、コースにより{stays.join("・")}まで</dd>
            </div>
            <div>
              <dt>営業</dt>
              <dd>
                {hoursLine}・{restaurant.hours.closedLabel}
              </dd>
            </div>
          </dl>
          <p className="mt-9">
            何が並ぶかは、その日の仕入れ次第です。<T to="omakaseSushi">おまかせ寿司</T>という頼み方がはじめての方は、先に流れをご覧ください。
          </p>
          <p className="mt-9">
            <Link href={pages.omakase.path} className="more">
              コースと料金を見る
            </Link>
          </p>
        </Split>
      </Section>

      <Section>
        <Split heading="向く夜、向かない夜。">
          <Items
            items={[
              {
                key: "yes",
                title: "向く夜",
                body: (
                  <p>
                    <T to="anniversary">記念日</T>や<T to="date">デート</T>、大切なお相手との<T to="businessDinner">会食</T>、<T to="solo">お一人</T>で鮨と酒に向き合いたい夜。時間にゆとりのある日に、どうぞ。
                  </p>
                ),
              },
              {
                key: "no",
                title: "向かない夜",
                body: <p>大人数でにぎやかに楽しみたい夜、食事を手早く済ませたい夜、個室でお話をされたい席には、向きません。先にお伝えしておきます。</p>,
              },
            ]}
          />
        </Split>
      </Section>

      <Onward pillar={page.path} items={["omakase", "access", "reservation"]} />
      <ReservationBlock />
    </>
  );
}
