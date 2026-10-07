/**
 * 鮨と料理
 * 担当する検索語: すすきの 創作和食（「すすきの 寿司／鮨」はトップの担当）
 * 役割: 握りの仕事と料理の方向性を、写真とともに伝える。
 * 書かないこと: コースの構成と料金（/omakase）、酒との合わせ（/drink）。
 *              魚の名前・産地・仕入先は、確認できていないので書かない。
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
import { courses, signatureDish } from "@/data/courses";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { site } from "@/data/site";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.cuisine;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

/** 握りの仕事。手法の名前は data/site.ts（旧公式サイトの記載）から。説明は一般的な意味 */
const TECHNIQUE_NOTES: Record<string, string> = {
  隠し包丁: "身に細かく包丁を入れておく仕事です。歯切れがよくなり、シャリとのなじみも変わります。",
  昆布〆: "昆布で身を挟み、余分な水分を抜きながら旨みを移します。淡い味わいの身に、奥行きが生まれます。",
  煮ツメ: "煮汁を煮詰めてつくる、甘みのあるたれ。握りの上に、ひと刷毛で仕上げます。",
};

export default function CuisinePage() {
  const withDon = courses.filter((c) => c.contents.some((x) => x.includes(signatureDish.name)));

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label={page.label}
        title={
          <>
            <span className="ib">すすきので握る、</span>
            <span className="ib">手間を惜しまない鮨。</span>
          </>
        }
        lead={`${site.techniques.join("、")}。${site.name}の握りは、目の前で、一貫ずつ仕上げます。`}
        photo={photos.sushi01}
        photoPosition="50% 56%"
      />

      <Section>
        <Split heading="握りの仕事">
          <Items
            items={site.techniques.map((t) => ({ key: t, title: t, body: TECHNIQUE_NOTES[t] }))}
          />
          <Body className="mt-10">
            <p>どれも、鮨の世界で受け継がれてきた仕事です。手間を惜しむことなく、一貫ずつ丁寧に握り、目の前からお出しします。</p>
          </Body>
        </Split>
      </Section>

      <Section tone="ink-2">
        <PhotoSplit photo={photos.sushi02} ratio="4/5" position="56% 50%">
          <h2 className="t-h2">
            <span className="ib">ほどける、</span>
            <span className="ib">銀シャリ。</span>
          </h2>
          <Body className="mt-8">
            <p>口に入れた瞬間に、ほろりとほどける銀シャリ。そこへ、魚介の旨みが押し寄せます。</p>
            <p>お好みのお酒と合わせれば、いっそう。すべてに妥協しない握りを、カウンターで確かめてください。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.drink.path} className="more">
              お酒について
            </Link>
          </p>
        </PhotoSplit>
      </Section>

      <Section>
        <Split
          heading={
            <>
              <span className="ib">従来の手法にとらわれない、</span>
              <span className="ib">季節の一皿。</span>
            </>
          }
        >
          <Body>
            <p>握りの前後にお出しするのは、従来の手法や常識にとらわれない創作の一皿です。和食を土台に、新しいアイデアや調理法を取り入れ、{site.people.chefExperience}で培った技を随所に施しています。</p>
            <p>盛り付けにも工夫を凝らしました。器の上の景色も、どうぞお楽しみください。</p>
          </Body>
        </Split>

        <div className="mt-16 grid grid-cols-12 gap-x-4 gap-y-10 lg:mt-24 lg:gap-x-10">
          <Reveal className="col-span-12 lg:col-span-7">
            <Photo photo={photos.cuisine01} ratio="3/2" sizes="(max-width: 1023px) calc(100vw - 2.5rem), 54vw" />
          </Reveal>
          <Reveal className="col-span-6 lg:col-span-4 lg:col-start-9 lg:mt-28" delay={0.1}>
            <Photo photo={photos.cuisine06} ratio="4/5" sizes="(max-width: 1023px) 46vw, 30vw" />
          </Reveal>
          <Reveal className="col-span-6 lg:col-span-4 lg:col-start-2" delay={0.05}>
            <Photo photo={photos.cuisine03} ratio="4/5" sizes="(max-width: 1023px) 46vw, 30vw" />
          </Reveal>
          <Reveal className="col-span-7 lg:col-span-5 lg:col-start-7 lg:mt-16" delay={0.1}>
            <Photo photo={photos.cuisine02} ratio="3/2" sizes="(max-width: 1023px) 56vw, 38vw" />
          </Reveal>
        </div>
        <p className="t-note mt-8">写真は一例です。お料理の内容は、その日の仕入れによって替わります。</p>
      </Section>

      <Section tone="ink-2">
        <PhotoSplit photo={photos.omakase02} ratio="4/5" position="50% 72%" side="right">
          <h2 className="t-h2">
            <span className="ib">結びは、</span>
            <span className="ib">{signatureDish.name}。</span>
          </h2>
          <Body className="mt-8">
            <p>コースの結びには、{signatureDish.label}を。{site.name}の名物です。</p>
            <p>{withDon.map((c) => c.name).join("と")}の最後にご用意しています。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.omakase.path} className="more">
              コースの内容を見る
            </Link>
          </p>
        </PhotoSplit>
      </Section>

      <Section>
        <PhotoSplit photo={photos.season01} ratio="4/5" position="50% 60%">
          <h2 className="t-h2">
            <span className="ib">旬の魚介と、</span>
            <span className="ib">季節の野菜。</span>
          </h2>
          <Body className="mt-8">
            <p>春夏秋冬、それぞれの食材をいちばんよい状態で味わっていただきたい。その思いから、お料理はおまかせのコースのみでご用意しています。</p>
            <p>その時季にしか出合えない魚介と旬の野菜を、存分に。何が並ぶかは、ご来店までのお楽しみです。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.omakaseSushi.path} className="more">
              おまかせという頼み方
            </Link>
          </p>
        </PhotoSplit>
      </Section>

      <PillarPosts path={page.path} limit={4} />
      <RelatedPages
        items={[
          { page: "omakase", note: "3つのコースの品数・料金・所要時間。" },
          { page: "drink", note: "握りと一皿に合わせる、日本酒とワイン。" },
          { page: "counterSushi", note: "目の前で握る鮨を、カウンターで味わうということ。" },
        ]}
      />
      <ReservationBlock />
    </>
  );
}
