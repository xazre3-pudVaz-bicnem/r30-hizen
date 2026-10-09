/**
 * 空間
 * 担当する検索語: R-30 hizen 店内（雰囲気・席・禁煙など、行く前に確かめたい設備の事実）
 * 書かないこと: 「カウンター寿司とは」の一般的な話は /counter-sushi。場所と目印は /access。
 *              個室・夜景・半個室など、無いものは書かない（個室は「ございません」と明記する）。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, Offset, PhotoEdge, Section, Split } from "@/components/sections/Blocks";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, fragrancePolicy, restaurant, seatingLine } from "@/data/restaurant";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.space;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function SpacePage() {
  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label={page.label}
        title={
          <>
            <span className="ib">黒を基調にした、</span>
            <span className="ib">カウンターだけの店内。</span>
          </>
        }
        lead="灯りを落とした店内に、弧を描くカウンター。黒を基調にした内装が、料理の彩りを引き立てます。"
        photo={photos.counter01}
        photoPosition="50% 62%"
      />

      <Section>
        <Split heading="お席は、カウンターのみ。">
          <Body>
            <p>テーブル席や個室はございません。握る手もとも、盛り付ける所作も、すべて目の前でご覧いただけます。</p>
            <p>黒を基調としたシックな内装は、料理の彩りと華やかさを引き立てるためのもの。落ち着いた雰囲気のなかで、ゆっくりとお過ごしください。</p>
          </Body>
          <dl className="facts mt-10">
            <div>
              <dt>お席</dt>
              <dd>{seatingLine}</dd>
            </div>
            <div>
              <dt>個室</dt>
              <dd>ございません</dd>
            </div>
            <div>
              <dt>禁煙・喫煙</dt>
              <dd>{restaurant.seats.smoking}</dd>
            </div>
            <div>
              <dt>貸切</dt>
              <dd>{restaurant.seats.charter}</dd>
            </div>
          </dl>
        </Split>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.chef02} side="left" width="half" ratio="4/5" ratioSp="1/1" position="60% 50%">
          <h2 className="t-h2">
            <span className="ib">目の前で、</span>
            <span className="ib">仕上がっていく。</span>
          </h2>
          <Body className="measure mt-9">
            <p>カウンターの向こうは、そのまま仕事場です。握りは一貫ずつ、目の前からお出しします。</p>
            <p>
              {restaurant.people.team}で営んでいるため、混み合う時間帯はお料理に少しお時間をいただくことがあります。その間も、手もとを眺めながらお待ちいただけたら。
            </p>
          </Body>
          <p className="mt-10">
            <Link href={pages.counterSushi.path} className="more">
              カウンターで味わう鮨
            </Link>
          </p>
        </PhotoEdge>
      </Section>

      <Section>
        <Split heading="落ち着いて過ごしていただくために">
          <Items
            items={[
              {
                key: "age",
                title: agePolicy.label,
                body: (
                  <p>
                    {agePolicy.reason}の決まりです。ご同伴の方を含め、{agePolicy.sentence}
                  </p>
                ),
              },
              {
                key: "fragrance",
                title: "香りについて",
                body: <p>{fragrancePolicy.sentence}</p>,
              },
              {
                key: "smoking",
                title: restaurant.seats.smoking,
                body: <p>店内は、すべてのお席で禁煙です。</p>,
              },
            ]}
          />
        </Split>
      </Section>

      <Section bare plain>
        <Offset
          photo={photos.counter02}
          bleed="left"
          ratio="16/9"
          ratioSp="4/3"
          position="50% 58%"
          caption={
            <>
              はじめての方は、
              <Link href={pages.access.path} className="link">
                アクセス
              </Link>
              のページで、場所と入口の目印をお確かめください。
            </>
          }
        />
      </Section>

      <Onward pillar={page.path} items={["counterSushi", "adultSushi", "businessDinner"]} />
      <ReservationBlock />
    </>
  );
}
