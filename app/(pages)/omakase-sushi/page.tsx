/**
 * おまかせ寿司とは
 * 担当する検索語: すすきの おまかせ寿司
 * 役割: おまかせという頼み方を体験したい人へ、流れ・所要時間・事前に伝えることを説明する。
 * 書かないこと: 料金の一覧は /omakase に置く（ここでは繰り返さず、リンクで送る）。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Items, PhotoSplit, Section, Split } from "@/components/sections/Blocks";
import { PageHead } from "@/components/sections/PageHead";
import { PillarPosts } from "@/components/sections/PillarPosts";
import { RelatedPages } from "@/components/sections/RelatedPages";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { courseById, courseCommon, courses, signatureDish } from "@/data/courses";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { site } from "@/data/site";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.omakaseSushi;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function OmakaseSushiPage() {
  const full = courseById("omakase-15");

  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs)} />

      <PageHead
        crumbs={crumbs}
        label="鮨を選ぶ"
        title={
          <>
            <span className="ib">すすきので、おまかせ寿司を。</span>
            <span className="ib">品書きのない鮨の楽しみ方。</span>
          </>
        }
        lead="選ぶのは、コースだけ。何が出てくるかは、その日の仕入れ次第。おまかせという頼み方を、気負わずに楽しむための手引きです。"
        photo={photos.cuisine02}
        photoPosition="50% 50%"
      />

      <Section>
        <Split heading="おまかせとは、何を任せるのか。">
          <Body>
            <p>任せるのは、三つです。何を出すか、どの順に出すか、どう仕立てるか。</p>
            <p>魚は、日によって状態が違います。同じ魚でも、生で握るのがよい日もあれば、昆布で〆たほうがよい日もある。その判断を、いちばんよく知っている人に委ねるのが、おまかせです。</p>
            <p>お客様が決めるのは、コースと、お酒だけ。あとは席に着いて、出てくるものを待つだけで構いません。</p>
          </Body>
        </Split>
      </Section>

      <Section tone="ink-2">
        <PhotoSplit photo={photos.omakase01} ratio="3/2">
          <h2 className="t-h2">
            <span className="ib">{site.name}の、</span>
            <span className="ib">おまかせの進み方。</span>
          </h2>
          <ol className="rows mt-8">
            <li className="grid grid-cols-[3.5em_minmax(0,1fr)] gap-x-4 py-6">
              <span className="text-paper">酒肴</span>
              <span className="text-[0.9375rem] leading-[2.05]">まずは、季節の一皿から。従来の手法にとらわれない仕立てで、お酒とともに。</span>
            </li>
            <li className="grid grid-cols-[3.5em_minmax(0,1fr)] gap-x-4 py-6">
              <span className="text-paper">握り</span>
              <span className="text-[0.9375rem] leading-[2.05]">{site.techniques.join("、")}。仕事を施した握りを、一貫ずつ、目の前から。</span>
            </li>
            <li className="grid grid-cols-[3.5em_minmax(0,1fr)] gap-x-4 py-6">
              <span className="text-paper">結び</span>
              <span className="text-[0.9375rem] leading-[2.05]">最後に、{signatureDish.label}を。</span>
            </li>
          </ol>
          <p className="t-note mt-5">
            {full.name}・{courseById("omakase-short").name}の流れです。{courseCommon.menuUndisclosed}
          </p>
        </PhotoSplit>
      </Section>

      <Section>
        <Split heading="先に、伝えておくこと。">
          <Items
            items={[
              {
                key: "allergy",
                title: "アレルギー",
                body: <p>内容をお任せいただくからこそ、食べられないものは先に。アレルギーは、ご予約の際にお知らせください。当日の食材の変更はできません。</p>,
              },
              {
                key: "dislike",
                title: "苦手な食材",
                body: <p>苦手な食材の差し替えは、いたしかねます。あらかじめご了承のうえ、ご予約ください。</p>,
              },
              {
                key: "people",
                title: "人数分のコースを",
                body: <p>{courseCommon.perPerson}一人前を取り分けるご利用は、お断りしております。</p>,
              },
              {
                key: "time",
                title: "お時間",
                body: <p>{full.notes[0]}このあとのご予定は、少し余裕を見ておくと安心です。</p>,
              },
            ]}
          />
        </Split>
      </Section>

      <Section tone="ink-2">
        <Split heading="おまかせを、気負わず楽しむために。">
          <Items
            items={[
              {
                key: "soon",
                title: "握りは、出されたらすぐに",
                body: <p>握りは、置かれた瞬間がいちばんおいしい。話の途中でも、まず一貫を。</p>,
              },
              {
                key: "hands",
                title: "手でも、箸でも",
                body: <p>どちらで召し上がっても構いません。食べやすいほうで。</p>,
              },
              {
                key: "ask",
                title: "わからないことは、尋ねる",
                body: <p>いまの魚は何か、どんな仕事がしてあるのか。尋ねることは、失礼ではありません。カウンターの楽しみのひとつです。</p>,
              },
              {
                key: "pace",
                title: "お酒の進み具合を伝える",
                body: <p>もう少しゆっくり飲みたい、そろそろ握りに移りたい。ひとこと伝えると、過ごしやすくなります。</p>,
              },
            ]}
          />
          <p className="mt-10">
            <Link href={pages.counterSushi.path} className="more">
              カウンターでの過ごし方
            </Link>
          </p>
        </Split>
      </Section>

      <Section>
        <Split heading={`コースは、${courses.length}つ。`}>
          <ul className="rows">
            {courses.map((c) => (
              <li key={c.id} className="grid gap-x-10 gap-y-1 py-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-baseline">
                <span className="text-[1.0625rem] tracking-[0.12em] text-paper">{c.name}</span>
                <span className="text-[0.9375rem] leading-[2]">
                  {c.items}　{c.contents.join("・")}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-10">
            <Link href={pages.omakase.path} className="more">
              料金と所要時間を見る
            </Link>
          </p>
        </Split>
      </Section>

      <PillarPosts path={page.path} limit={4} />
      <RelatedPages
        items={[
          { page: "omakase", note: "3つのコースの品数・料金・所要時間。" },
          { page: "cuisine", note: "握りの仕事と、季節の一皿。" },
          { page: "counterSushi", note: "カウンターで鮨を味わうということ。" },
          { page: "reservation", note: "ご予約の方法と、ご来店前のお願い。" },
        ]}
      />
      <ReservationBlock />
    </>
  );
}
