/**
 * カウンター寿司
 * 担当する検索語: すすきの カウンター 寿司
 * 役割: カウンターで寿司を食べたい人へ。このページで答えるのは4つ。
 *       握りたてということ ／ 職人との距離 ／ この店の席 ／ 席でのささやかな作法。
 * 書かないこと: 店内の設備の事実（禁煙・貸切など）は /space、一人での利用は /solo、
 *              おまかせの仕組みは /omakase-sushi。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Column, Items, Offset, PhotoEdge, Section, Split } from "@/components/sections/Blocks";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { fragrancePolicy, restaurant } from "@/data/restaurant";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.counterSushi;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function CounterSushiPage() {
  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label="はじめての方へ"
        title={
          <>
            <span className="ib">握りたてを、目の前で。</span>
            <span className="ib">すすきののカウンター寿司。</span>
          </>
        }
        lead="握った手から、そのまま口へ。カウンターには、テーブルでは味わえない間合いがあります。"
        photo={photos.chef02}
        photoPosition="50% 88%"
        ratio="2/1"
        ratioSp="1/1"
      />

      <Section>
        <Column side="right" heading="握りたて、ということ。">
          <Body>
            <p>握られてから口に入るまで、数秒。シャリはほどよく温かく、口のなかでほどける瞬間を逃しません。</p>
            <p>時間が経つほど、シャリは冷め、ネタは乾いていきます。握りは、置かれたらすぐに。話の途中でも、まず一貫を。</p>
          </Body>
        </Column>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.chef03} side="left" width="narrow" ratio="3/2" position="50% 50%">
          <h2 className="t-h2">
            <span className="ib">職人との、</span>
            <span className="ib">ひとことの距離。</span>
          </h2>
          <Body className="measure mt-9">
            <p>包丁を入れる、握る、たれを引く。一貫ができあがるまでの所作が、そのまま食事の一部になります。</p>
            <p>いまの魚のこと、合わせるお酒のこと。尋ねれば答えが返ってくる近さが、カウンターにはあります。尋ねることは、失礼ではありません。</p>
          </Body>
        </PhotoEdge>
      </Section>

      <Section bare>
        <Offset photo={photos.counter01} bleed="right" ratio="16/9" ratioSp="4/3" position="50% 62%" />
        <div className="wrap mt-14 lg:mt-24">
          <Split
            heading={
              <>
                <span className="ib">{restaurant.name}の</span>
                <span className="ib">席。</span>
              </>
            }
          >
            <Body>
              <p>ゆるやかに弧を描くカウンター。握りは一貫ずつ丁寧に、お客様の目の前からお出しします。テーブル席や個室はございません。</p>
              <p>黒を基調にした内装は、料理の彩りを引き立てるため。{restaurant.people.team}で営む、小さな店です。</p>
            </Body>
            <p className="mt-10">
              <Link href={pages.space.path} className="more">
                店内を見る
              </Link>
            </p>
          </Split>
        </div>
      </Section>

      <Section>
        <Split heading="席での、ささやかな作法。">
          <p>むずかしい決まりはありません。まわりのお客様と、握りそのものへの気づかいだけです。</p>
          <div className="mt-9">
            <Items
              items={[
                {
                  key: "scent",
                  title: "香りを持ち込まない",
                  body: <p>鮨は香りの料理でもあります。{fragrancePolicy.sentence}</p>,
                },
                {
                  key: "hands",
                  title: "手でも、箸でも",
                  body: <p>どちらで召し上がっても構いません。食べやすいほうで。</p>,
                },
                {
                  key: "photo",
                  title: "写真は、ひとこと断ってから",
                  body: <p>撮ってよいかどうかは、店にひとこと尋ねてから。まわりのお客様が写り込まない気づかいも、忘れずに。</p>,
                },
                {
                  key: "pace",
                  title: "急がない",
                  body: <p>混み合う時間帯は、お料理の提供にお時間をいただくことがあります。待つ時間も、お酒とともに。</p>,
                },
              ]}
            />
          </div>
          <p className="mt-10">
            何を頼めばよいかわからない、という心配はいりません。{restaurant.name}のお料理は、おまかせのコースのみ。席に着いたら、あとは出てくるものを味わうだけです。
          </p>
          <p className="mt-9">
            <Link href={pages.omakaseSushi.path} className="more">
              おまかせ寿司とは
            </Link>
          </p>
        </Split>
      </Section>

      <Onward pillar={page.path} items={["space", "solo", "omakase"]} />
      <ReservationBlock />
    </>
  );
}
