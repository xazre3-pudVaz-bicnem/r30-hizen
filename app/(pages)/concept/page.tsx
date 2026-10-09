/**
 * コンセプト
 * 担当する検索語: R-30 hizen（店名で調べた人が、店の考え方を知る）
 * 書かないこと: 「大人の隠れ家寿司を探す」一般の検索は /adult-sushi。料金は /omakase。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Body, Column, PhotoEdge, Section, Split } from "@/components/sections/Blocks";
import { NoticeList } from "@/components/sections/NoticeList";
import { Onward } from "@/components/sections/Onward";
import { PageHead } from "@/components/sections/PageHead";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { VideoFacade } from "@/components/sections/VideoFacade";
import { JsonLd } from "@/components/ui/JsonLd";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, fragrancePolicy, restaurant } from "@/data/restaurant";
import { crumbsFor, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.concept;
const crumbs = crumbsFor(page);

export const metadata: Metadata = pageMetadata(page);

export default function ConceptPage() {
  return (
    <>
      <JsonLd graph={pageGraph(page, crumbs, [], { type: "AboutPage" })} />

      <PageHead
        layout="split"
        crumbs={crumbs}
        label={page.label}
        title={
          <>
            <span className="ib">大人だけの、</span>
            <span className="ib">隠れ家鮨。</span>
          </>
        }
        lead={`すすきのの一角、ビルの${restaurant.address.floorText}。${restaurant.name}は、${agePolicy.minAge}歳以上のお客様だけをお迎えする鮨店です。`}
        photo={photos.chef01}
        photoPosition="46% 40%"
      />

      <Section>
        <Split
          heading={
            <>
              <span className="ib">{agePolicy.minAge}歳から、</span>
              <span className="ib">という決まり。</span>
            </>
          }
        >
          <Body>
            <p>店名に掲げた「R-30」のとおり、{agePolicy.sentence}ご同伴の方も同じです。</p>
            <p>{agePolicy.reason}に設けた決まりです。リラックスしてお食事していただけるよう、落ち着いた雰囲気でお迎えします。</p>
            <p>あわせて、香りについてもお願いがあります。{fragrancePolicy.sentence}</p>
          </Body>
        </Split>
      </Section>

      <Section bare>
        <PhotoEdge photo={photos.cuisine04} side="right" width="wide" ratio="5/4" ratioSp="1/1" position="50% 50%">
          <h2 className="t-h2">
            <span className="ib">従来の手法に、</span>
            <span className="ib">とらわれない。</span>
          </h2>
          <Body className="measure mt-9">
            <p>
              握りにも一品にも、確かな技術があってこそできる仕事があります。{restaurant.people.chefExperience}の店主が、従来の手法や常識にとらわれずに手がける鮨と料理。新しいアイデアや調理法を取り入れながら、随所に長年培った技を施しています。
            </p>
            <p>味はもちろん、盛り付けにも工夫を。その時季にしか味わえない食材との一期一会を、目でも楽しんでいただけます。</p>
          </Body>
          <p className="mt-10">
            <Link href={pages.cuisine.path} className="more">
              鮨と料理を見る
            </Link>
          </p>
        </PhotoEdge>
      </Section>

      <Section>
        <Column
          side="left"
          heading={
            <>
              <span className="ib">{restaurant.people.team}の、</span>
              <span className="ib">小さな店。</span>
            </>
          }
        >
          <Body>
            <p>
              {restaurant.name}は、{restaurant.people.team}で営んでいます。お席は{restaurant.seats.style}。一貫ずつ、一皿ずつ、目の前からお出しします。
            </p>
            <p>そのぶん、混み合う時間帯はお料理の提供にお時間をいただくことがあります。時間にゆとりのある夜に、お越しいただけたら幸いです。</p>
          </Body>
        </Column>
      </Section>

      <Section>
        <div className="grid gap-y-10 lg:grid-cols-12 lg:items-end lg:gap-x-10">
          <Reveal className="lg:col-span-8">
            <VideoFacade
              youtubeId={restaurant.video.youtubeId}
              title={`${restaurant.name} 店舗紹介の映像`}
              poster={<Photo photo={photos.sushi04} ratio="16/9" sizes="(max-width: 1023px) calc(100vw - 3rem), 52vw" />}
            />
          </Reveal>
          <Reveal className="lg:col-span-3 lg:col-start-10" delay={0.08}>
            <h2 className="t-h3">
              <span className="ib">映像で見る、</span>
              <span className="ib">{restaurant.name}。</span>
            </h2>
            <p className="mt-5">握りを仕上げる手もとと、料理の表情を収めた映像です。</p>
            <p className="t-note mt-4">再生すると、YouTube の映像が読み込まれます。</p>
          </Reveal>
        </div>
      </Section>

      <Section>
        <Split heading="お越しになる前に">
          <NoticeList only={["age", "fragrance", "course-only", "per-person"]} />
          <p className="mt-9">
            <Link href={pages.reservation.path} className="more">
              すべてのお願いを見る
            </Link>
          </p>
        </Split>
      </Section>

      <Onward
        pillar={page.path}
        items={["cuisine", "space", "adultSushi"]}
      />
      <ReservationBlock />
    </>
  );
}
