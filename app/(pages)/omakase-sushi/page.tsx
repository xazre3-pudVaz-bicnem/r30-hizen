/**
 * おまかせ寿司とは
 * 担当する検索語: すすきの おまかせ寿司
 * 役割: おまかせという頼み方を体験したい人へ。このページで答えるのは4つ。
 *       おまかせの仕組み ／ 出てくる順番 ／ 3つのコースのちがい ／ 先に伝えておくこと。
 * 書かないこと: 料金の一覧は /omakase に置く（ここでは繰り返さず、リンクで送る）。
 *              席での作法（出されたらすぐに・手でも箸でも…）は /counter-sushi。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Column, Items, PhotoEdge, Section, Split, Steps } from "@/components/sections/Blocks";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { JsonLd } from "@/components/ui/JsonLd";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { courseById, courseCommon, courses, coursesWithSignatureDish, firstSentence, restaurant, signatureDish } from "@/data/restaurant";
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
        label="はじめての方へ"
        title={
          <>
            <span className="ib">すすきののおまかせ寿司。</span>
            <span className="ib">品書きのない鮨の、</span>
            <span className="ib">すすみ方。</span>
          </>
        }
        lead="選ぶのは、コースだけ。何が出てくるかは、その日の仕入れ次第。おまかせという頼み方を、気負わずに楽しむための手引きです。"
      />

      <Section className="pt-0">
        <Column side="right" heading="おまかせとは、何を任せるのか。">
          <Body>
            <p>任せるのは、三つです。何を出すか、どの順に出すか、どう仕立てるか。</p>
            <p>魚は、日によって状態が違います。同じ魚でも、生で握るのがよい日もあれば、昆布で〆たほうがよい日もある。その判断を、いちばんよく知っている人に委ねるのが、おまかせです。</p>
            <p>お客様が決めるのは、コースと、お酒だけ。あとは席に着いて、出てくるものを待つだけで構いません。</p>
          </Body>
        </Column>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.omakase01} side="left" width="narrow" ratio="3/2" position="50% 50%" align="start">
          <h2 className="t-h2">
            <span className="ib">出てくる順番。</span>
          </h2>
          <div className="mt-10">
            <Steps
              items={[
                {
                  key: "shuko",
                  title: "酒肴",
                  body: <p>まずは、季節の一皿から。従来の手法にとらわれない仕立てで、お酒とともに。</p>,
                },
                {
                  key: "nigiri",
                  title: "握り",
                  body: <p>{restaurant.techniques.join("、")}。仕事を施した握りを、一貫ずつ、目の前から。</p>,
                },
                {
                  key: "musubi",
                  title: "結び",
                  body: <p>最後に、{signatureDish.label}を。</p>,
                },
              ]}
            />
          </div>
          <p className="t-note mt-8">
            {coursesWithSignatureDish.map((c) => c.name).join("・")}の流れです。{full.name}は、{full.contents.slice(0, 2).join("、")}。{courseCommon.menuUndisclosed}
          </p>
        </PhotoEdge>
      </Section>

      <Section>
        <Split heading={`${courses.length}つのコースの、ちがい。`}>
          <ul className="rows">
            {courses.map((c) => (
              <li key={c.id} className="py-7 md:py-8">
                <h3 className="text-[1.0625rem] tracking-[0.12em] text-paper md:text-[1.125rem]">{c.name}</h3>
                <p className="t-note mt-2">
                  {c.items}
                  <span className="mx-3" aria-hidden="true">
                    ／
                  </span>
                  {c.contents.join("、")}
                </p>
                <p className="mt-2 text-[0.9375rem] leading-[1.95] md:text-[1rem]">{c.suits}。</p>
              </li>
            ))}
          </ul>
          <p className="mt-9">
            <Link href={pages.omakase.path} className="more">
              料金と所要時間を見る
            </Link>
          </p>
        </Split>
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
                body: <p>{full.name}は、{firstSentence(full.notes[0])}このあとのご予定は、少し余裕を見ておくと安心です。</p>,
              },
            ]}
          />
          <p className="mt-10">
            席での過ごし方は、
            <Link href={pages.counterSushi.path} className="link">
              {pages.counterSushi.label}
            </Link>
            のページにまとめています。
          </p>
        </Split>
      </Section>

      <Onward pillar={page.path} items={["omakase", "cuisine", "susukinoSushi"]} />
      <ReservationBlock />
    </>
  );
}
