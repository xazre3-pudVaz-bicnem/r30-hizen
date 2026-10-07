/**
 * カウンター寿司
 * 担当する検索語: すすきの カウンター 寿司
 * 役割: カウンターで寿司を食べたい人へ、どんな体験か・緊張せずに過ごすには、を伝える。
 * 書かないこと: 店内の設備の事実（席・禁煙・個室の有無）は /space、一人での利用は /solo。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, PhotoSplit, Section, Split } from "@/components/sections/Blocks";
import { PageHead } from "@/components/sections/PageHead";
import { PillarPosts } from "@/components/sections/PillarPosts";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { fragrancePolicy, site } from "@/data/site";
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
        label="鮨を選ぶ"
        title={
          <>
            <span className="ib">すすきので、カウンター寿司を。</span>
            <span className="ib">目の前で握る鮨の時間。</span>
          </>
        }
        lead="握りたてを、握った手から。カウンターには、テーブルでは味わえない間合いがあります。"
        photo={photos.chef02}
        photoPosition="50% 58%"
      />

      <Section>
        <Split heading="カウンターでしか、味わえないもの。">
          <Items
            items={[
              {
                key: "temp",
                title: "握りたての温度",
                body: <p>握られてから口に入るまで、数秒。シャリがほどよく温かく、ほどける瞬間を逃しません。</p>,
              },
              {
                key: "work",
                title: "目の前の仕事",
                body: <p>包丁を入れる、握る、たれを引く。一貫ができあがるまでの所作が、そのまま食事の一部になります。</p>,
              },
              {
                key: "talk",
                title: "ひとことの距離",
                body: <p>いまの魚のこと、合わせるお酒のこと。尋ねれば答えが返ってくる近さが、カウンターにはあります。</p>,
              },
            ]}
          />
        </Split>
      </Section>

      <Section tone="ink-2">
        <PhotoSplit photo={photos.counter01} ratio="3/2" position="50% 62%">
          <h2 className="t-h2">
            <span className="ib">{site.name}の</span>
            <span className="ib">カウンター。</span>
          </h2>
          <Body className="mt-8">
            <p>ゆるやかに弧を描くカウンター。握りは一貫ずつ丁寧に、お客様の目の前からお出しします。テーブル席や個室はございません。</p>
            <p>黒を基調にした内装は、料理の彩りを引き立てるため。{site.people.team}で営む、小さな店です。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.space.path} className="more">
              店内を見る
            </Link>
          </p>
        </PhotoSplit>
      </Section>

      <Section>
        <Split heading="席での過ごし方。ささやかな作法。">
          <p>むずかしい決まりはありません。まわりのお客様と、握りそのものへの気づかいだけです。</p>
          <div className="mt-8">
            <Items
              items={[
                {
                  key: "soon",
                  title: "握りは、置かれたらすぐに",
                  body: <p>時間が経つほど、シャリは冷め、ネタは乾いていきます。いちばんおいしいうちに。</p>,
                },
                {
                  key: "scent",
                  title: "香りを持ち込まない",
                  body: <p>鮨は香りの料理でもあります。{fragrancePolicy.sentence}</p>,
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
        </Split>
      </Section>

      <Section tone="ink-2">
        <Split heading="はじめてのカウンターでも。">
          <Body>
            <p>何を頼めばよいかわからない、という心配はいりません。{site.name}のお料理は、おまかせのコースのみ。席に着いたら、あとは出てくるものを味わうだけです。</p>
            <p>手で食べても、箸で食べても構いません。わからないことは、どうぞお尋ねください。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.omakaseSushi.path} className="more">
              おまかせ寿司とは
            </Link>
          </p>
        </Split>
      </Section>

      <PillarPosts path={page.path} limit={4} />
      <RelatedPages
        items={[
          { page: "space", note: "お席・禁煙・個室の有無など、店内の設備について。" },
          { page: "solo", note: "お一人でカウンターに座る夜に。" },
          { page: "omakase", note: "3つのコースの品数・料金・所要時間。" },
          { page: "reservation", note: "ご予約の方法と、ご来店前のお願い。" },
        ]}
      />
      <ReservationBlock />
    </>
  );
}
