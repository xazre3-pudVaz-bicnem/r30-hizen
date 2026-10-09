/**
 * お酒
 * 担当する検索語: すすきの 寿司 日本酒（＋ワイン）
 * 役割: 鮨と一緒にどんなお酒を楽しめるかを伝える。
 * 書かないこと: 銘柄の一覧（確認できた品書きが無い。写真に写る瓶も、常に置いているとは限らない）。
 *              合わせ方の説明は一般的な考え方として書き、「店がこう合わせている」とは書かない。
 * ヘッダーのメニューには出していない。鮨と料理・おまかせ・フッターからたどる。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, PhotoEdge, Section, Split } from "@/components/sections/Blocks";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { bookingLabel, courseById, priceLabel, restaurant } from "@/data/restaurant";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.drink;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function DrinkPage() {
  const set = courseById("hassun-set");

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label={page.label}
        title={
          <>
            <span className="ib">すすきので、</span>
            <span className="ib">鮨に日本酒とワインを。</span>
          </>
        }
        lead="握りにも、季節の一皿にも。素材の味を引き立てるお酒を取りそろえています。"
        photo={photos.sake01}
        photoPosition="50% 58%"
        ratioSp="1/1"
      />

      <Section>
        <Split heading="取りそろえているお酒">
          <p className="text-[1.0625rem] leading-[2.1] tracking-[0.14em] text-paper md:text-[1.125rem]">
            {restaurant.drinks.kinds.join("　／　")}
          </p>
          <Body className="mt-9">
            <p>日本酒とワインを中心に、焼酎やウイスキー、ビールまで。握りの合間にも、季節の一皿にも合わせていただけます。</p>
            <p>銘柄やお料理との相性は、カウンターでお気軽にお尋ねください。</p>
          </Body>
        </Split>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.cuisine01} side="left" width="half" ratio="4/5" ratioSp="1/1" position="78% 50%">
          <h2 className="t-h2">
            <span className="ib">ワインと、</span>
            <span className="ib">シャンパンも。</span>
          </h2>
          <Body className="measure mt-9">
            <p>
              お料理と相性のよいワインもご用意しています。従来の手法にとらわれない、{restaurant.name}ならではの組み合わせをお楽しみください。
            </p>
            <p>{restaurant.drinks.bottles}記念日の乾杯にも、どうぞ。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.anniversary.path} className="more">
              記念日のご利用
            </Link>
          </p>
        </PhotoEdge>
      </Section>

      <Section>
        <Split heading="鮨とお酒の、合わせかた">
          <p>決まりはありません。そのうえで、迷ったときの手がかりをいくつか。</p>
          <div className="mt-9">
            <Items
              items={[
                {
                  key: "white",
                  title: "淡い味わいの握りに",
                  body: <p>白身や烏賊のように淡い味わいには、香りが穏やかで後口のきれいなお酒を。魚の甘みが、すっと立ちます。</p>,
                },
                {
                  key: "fat",
                  title: "脂ののった握りに",
                  body: <p>脂の強い身には、米の旨みがしっかりしたお酒や、酸のあるお酒を。口の中がさっぱりと切り替わります。</p>,
                },
                {
                  key: "sparkling",
                  title: "泡のあるお酒",
                  body: <p>シャンパンの泡と酸は、貝や白身の甘み、酢のきいたシャリとよく合います。最初の一杯にも。</p>,
                },
                {
                  key: "nitsume",
                  title: "たれを引いた握りに",
                  body: <p>煮ツメを引いた握りのように甘みのあるものには、熟成感のある日本酒や、コクのあるワインが寄り添います。</p>,
                },
              ]}
            />
          </div>
          <p className="t-note mt-6">一般的な考え方です。その日の握りとの相性は、店主にお尋ねください。</p>
        </Split>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.counter02} side="right" width="half" ratio="3/2" ratioSp="4/3" position="30% 50%">
          <h2 className="t-h2">
            <span className="ib">お酒を中心に、</span>
            <span className="ib">過ごす夜に。</span>
          </h2>
          <Body className="measure mt-9">
            <p>
              杯を重ねたい夜には「{set.name}」を。{set.lead}
            </p>
            <p>
              {set.items}・{priceLabel(set.price)}。{bookingLabel(set)}です。
            </p>
          </Body>
          <p className="mt-10">
            <Link href={`${pages.omakase.path}#${set.id}`} className="more">
              コースの内容を見る
            </Link>
          </p>
        </PhotoEdge>
      </Section>

      <Onward pillar={page.path} items={["cuisine", "omakase", { page: "date", note: "お酒とともに過ごす、二人のカウンター。" }]} />
      <ReservationBlock />
    </>
  );
}
