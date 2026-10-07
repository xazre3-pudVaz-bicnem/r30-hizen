/**
 * 空間
 * 担当する検索語: R-30 hizen 店内（雰囲気・席・禁煙など、行く前に確かめたい設備の事実）
 * 書かないこと: 「カウンター寿司とは」の一般的な話は /counter-sushi。
 *              個室・夜景・半個室など、無いものは書かない（個室は「ございません」と明記する）。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, PhotoSplit, Section, Split } from "@/components/sections/Blocks";
import { PageHead } from "@/components/sections/PageHead";
import { PillarPosts } from "@/components/sections/PillarPosts";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, fragrancePolicy, seatingLine, site } from "@/data/site";
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
        photoPosition="50% 60%"
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
              <dd>{site.seating.smoking}</dd>
            </div>
            <div>
              <dt>貸切</dt>
              <dd>{site.seating.charter}</dd>
            </div>
          </dl>
        </Split>
      </Section>

      <Section tone="ink-2">
        <PhotoSplit photo={photos.chef02} ratio="4/5" position="62% 50%">
          <h2 className="t-h2">
            <span className="ib">目の前で、</span>
            <span className="ib">仕上がっていく。</span>
          </h2>
          <Body className="mt-8">
            <p>カウンターの向こうは、そのまま仕事場です。握りは一貫ずつ、目の前からお出しします。</p>
            <p>{site.people.team}で営んでいるため、混み合う時間帯はお料理に少しお時間をいただくことがあります。その間も、手もとを眺めながらお待ちいただけたら。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.counterSushi.path} className="more">
              カウンターで味わう鮨
            </Link>
          </p>
        </PhotoSplit>
      </Section>

      <Section>
        <Split heading="落ち着いて過ごしていただくために">
          <Items
            items={[
              {
                key: "age",
                title: agePolicy.label,
                body: <p>{agePolicy.reason}の決まりです。ご同伴の方を含め、{agePolicy.sentence}</p>,
              },
              {
                key: "fragrance",
                title: "香りについて",
                body: <p>{fragrancePolicy.sentence}</p>,
              },
              {
                key: "smoking",
                title: site.seating.smoking,
                body: <p>店内は、すべてのお席で禁煙です。</p>,
              },
            ]}
          />
        </Split>
      </Section>

      <Section tone="ink-2">
        <div className="grid grid-cols-12 items-end gap-x-4 gap-y-12 lg:gap-x-10">
          <Reveal className="col-span-7 lg:col-span-4">
            <Photo photo={photos.entrance01} ratio="3/4" sizes="(max-width: 1023px) 56vw, 30vw" />
          </Reveal>
          <Reveal className="col-span-5 lg:col-span-3" delay={0.08}>
            <Photo photo={photos.entrance02} ratio="3/4" sizes="(max-width: 1023px) 40vw, 22vw" />
          </Reveal>
          <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9 lg:self-center" delay={0.12}>
            <h2 className="t-h2">
              <span className="ib">ビルの{site.address.floorText}、</span>
              <span className="ib">灯るロゴが目印。</span>
            </h2>
            <Body className="mt-8">
              <p>{site.address.buildingName}の{site.address.floorText}。入口では、壁に灯る「{site.name}」のロゴがお迎えします。</p>
              <p>通りからは見えない場所にあります。はじめての方は、アクセスのページで場所をお確かめください。</p>
            </Body>
            <p className="mt-10">
              <Link href={pages.access.path} className="more">
                アクセスを見る
              </Link>
            </p>
          </Reveal>
        </div>
      </Section>

      <PillarPosts path={page.path} />
      <RelatedPages
        items={[
          { page: "counterSushi", note: "カウンターで鮨を味わうということ。席での過ごし方。" },
          { page: "adultSushi", note: "静かに過ごしたい大人のための、店の決まりごと。" },
          { page: "businessDinner", note: "接待・会食でのご利用と、貸切のご相談。" },
        ]}
      />
      <ReservationBlock />
    </>
  );
}
