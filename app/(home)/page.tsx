/**
 * トップページ
 * 担当する検索語: すすきの 寿司（あわせて拾う語: すすきの 鮨／すすきの おまかせ寿司／札幌 寿司）
 * 役割: どんな店かを写真と短い文で伝え、目的別のページへ送る。説明はしすぎない。
 *
 * 区画は10。足すときは、どれかを下層ページへ移してからにする。
 *   01 最初の画面  02 導入（h1）  03 コンセプト  04 鮨と料理  05 おまかせ
 *   06 空間        07 ご利用の場面  08 季節の便り  09 アクセス  10 ご予約
 *
 * 書かないこと: コースの細目（/omakase）、場面ごとの詳しい案内（各ページ）、
 *              お酒の話（/drink）、旬の魚の暦（/journal）、「高級寿司とは」（/susukino-sushi）。
 * 予約への導線は、ヘッダーとページの終わりだけ。ヒーローには置かない。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Bleed, Body, Offset, PhotoEdge } from "@/components/sections/Blocks";
import { CourseRows } from "@/components/sections/CourseRows";
import { Hero } from "@/components/sections/Hero";
import { JournalRows } from "@/components/sections/JournalRows";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { ShopFacts } from "@/components/sections/ShopFacts";
import { JsonLd } from "@/components/ui/JsonLd";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { agePolicy, confirmedAtLabel, courseCommon, restaurant } from "@/data/restaurant";
import { getAllPosts } from "@/lib/journal";
import { homeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.home;

export const metadata: Metadata = pageMetadata(page);

/** ご利用の場面。それぞれ、その場面を担当するページへ送る */
const SCENES: { name: string; text: string; href: string }[] = [
  { name: pages.anniversary.label, text: "結婚記念日や誕生日に。品書きのないコースを、二人でゆっくりと。", href: pages.anniversary.path },
  { name: pages.date.label, text: "横に並んで、同じ一貫を。会話のじゃまをしない静けさがあります。", href: pages.date.path },
  { name: pages.businessDinner.label, text: "カウンター越しのもてなしを、大切なお相手と。", href: pages.businessDinner.path },
  { name: pages.solo.label, text: "出張の夜や、自分をねぎらう日に。", href: pages.solo.path },
];

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);
  const tram = restaurant.access.others[0];

  return (
    <>
      <JsonLd graph={homeGraph()} />
      <Header overHero />

      <main id="main">
        {/* 01 最初の画面 — 行動を促すものは置かない */}
        <Hero />

        {/* 02 導入 — h1 はここ。文章は 200〜350字に収める */}
        <section className="section pt-[calc(var(--gap)*0.8)]">
          <div className="wrap grid gap-y-11 lg:grid-cols-12 lg:gap-x-10">
            <h1 className="t-h1 lg:col-span-5">
              <span className="ib">すすきので味わう、</span>
              <span className="ib">大人のための</span>
              <span className="ib">おまかせ鮨</span>
            </h1>
            <div className="measure space-y-7 lg:col-span-6 lg:col-start-7 lg:pt-[clamp(4.5rem,9vw,9rem)]">
              <p>
                札幌・すすきの。にぎわいから少し離れたビルの{restaurant.address.floorText}に、{restaurant.name}はあります。
                {restaurant.seats.style}の、小さな鮨店です。
              </p>
              <p>
                {restaurant.people.chefExperience}の店主が、その日の仕入れを見て握る寿司と、季節の一皿。握りは一貫ずつ、目の前からお出しします。お料理は、おまかせのコースだけをご用意しています。
              </p>
              <p>
                お迎えするのは、{agePolicy.minAge}歳以上のお客様だけ。すすきので寿司を、静かに、ゆっくり味わいたい夜に。記念日や大切な方との会食、札幌を訪れた夜にも、どうぞ。
              </p>
            </div>
          </div>
        </section>

        {/* 03 コンセプト */}
        <section className="section">
          <PhotoEdge photo={photos.entrance01} side="left" width="narrow" ratio="3/4" ratioSp="4/5" position="50% 62%">
            <p className="label">{pages.concept.label}</p>
            <h2 className="t-h2 mt-5">
              <span className="ib">{agePolicy.minAge}歳から、</span>
              <span className="ib">と決めた店。</span>
            </h2>
            <Body className="measure mt-9">
              <p>
                {restaurant.name}は、{agePolicy.minAge}歳未満のお客様のご入店をお断りしています。{agePolicy.reason}の、決まりごとです。
              </p>
              <p>
                香りの強い香水もご遠慮いただき、灯りを落としたカウンターで、握りと酒に向き合っていただく。{restaurant.people.team}で営む小さな店だからできる、大人のための時間をご用意しています。
              </p>
            </Body>
            <p className="mt-10">
              <Link href={pages.concept.path} className="more">
                コンセプトを読む
              </Link>
            </p>
          </PhotoEdge>
        </section>

        {/* 04 鮨と料理 — 大きな写真と、短い文 */}
        <section className="section">
          <Bleed photo={photos.sushi01} ratio="21/9" ratioSp="4/5" position="42% 56%" />
          <div className="wrap mt-14 grid gap-y-9 lg:mt-24 lg:grid-cols-12 lg:gap-x-10">
            <Reveal className="lg:col-span-4 lg:col-start-2">
              <p className="label">{pages.cuisine.label}</p>
              <h2 className="t-h2 mt-5">
                <span className="ib">旬と向き合う、</span>
                <span className="ib">一貫。</span>
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-5 lg:col-start-7" delay={0.1}>
              <Body>
                <p>{restaurant.techniques.join("、")}。手間を惜しまず、一貫ずつ、目の前で握ります。</p>
                <p>握りの前後には、従来の手法にとらわれない季節の一皿を。器の上の景色も、どうぞ。</p>
              </Body>
              <p className="mt-10">
                <Link href={pages.cuisine.path} className="more">
                  鮨と料理を見る
                </Link>
              </p>
            </Reveal>
          </div>
        </section>

        {/* 05 おまかせ — 料金表にしない。品書きのように、名前を主に */}
        <section className="section">
          <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10">
            <Reveal className="lg:col-span-5 lg:row-start-1">
              <p className="label">{pages.omakase.label}</p>
              <h2 className="t-h2 mt-5">
                <span className="ib">品書きのない、</span>
                <span className="ib">おまかせ。</span>
              </h2>
              <p className="measure mt-9">お料理は、おまかせのコースのみ。{courseCommon.menuUndisclosed}</p>
            </Reveal>

            <Reveal className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:pt-[clamp(3rem,7vw,7rem)]" delay={0.1}>
              <CourseRows variant="brief" />
              <p className="t-note mt-5">料金は税込です（{confirmedAtLabel}）。</p>
              <p className="mt-9">
                <Link href={pages.omakase.path} className="more">
                  コースの内容を見る
                </Link>
              </p>
            </Reveal>

            <Reveal className="lg:col-span-5 lg:row-start-2 lg:self-end">
              <Photo
                photo={photos.omakase02}
                ratio="4/5"
                position="50% 70%"
                sizes="(max-width: 1023px) 72vw, 30vw"
                className="w-[76%] lg:w-[84%]"
              />
            </Reveal>
          </div>
        </section>

        {/* 06 空間 */}
        <section className="section">
          <Offset photo={photos.chef02} bleed="right" ratio="16/9" ratioSp="1/1" position="50% 50%" />
          <div className="wrap mt-14 grid gap-y-9 lg:mt-24 lg:grid-cols-12 lg:gap-x-10">
            <Reveal className="lg:col-span-5">
              <p className="label">{pages.space.label}</p>
              <h2 className="t-h2 mt-5">
                <span className="ib">鮨と向き合う、</span>
                <span className="ib">静かな夜。</span>
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-5 lg:col-start-7" delay={0.1}>
              <p>
                お席は、カウンターのみ。黒を基調にした店内で、握る手もとを眺めながら、すすきのの喧騒を忘れてお過ごしください。
              </p>
              <p className="mt-10">
                <Link href={pages.space.path} className="more">
                  空間を見る
                </Link>
              </p>
            </Reveal>
          </div>
        </section>

        {/* 07 ご利用の場面 — 大きな写真と文。箱を並べない */}
        <section className="section">
          <PhotoEdge photo={photos.cuisine06} side="right" width="wide" ratio="5/4" ratioSp="4/5" position="46% 50%" align="end">
            <p className="label">ご利用の場面</p>
            <h2 className="t-h2 mt-5">
              <span className="ib">大切な夜の、</span>
              <span className="ib">いくつかの場面。</span>
            </h2>
            <p className="measure mt-9">並んで座るカウンターは、二人の夜にも、もてなしの席にも、一人の夜にも。</p>
            <ul className="rows mt-10 @container">
              {SCENES.map((s) => (
                <li key={s.name}>
                  <Link href={s.href} className="group block py-6 @md:grid @md:grid-cols-[7.5em_minmax(0,1fr)] @md:items-baseline @md:gap-x-6">
                    <h3 className="text-[1.0625rem] tracking-[0.16em] text-paper transition-colors duration-300 group-hover:text-brass md:text-[1.125rem]">
                      {s.name}
                    </h3>
                    <p className="mt-1 text-[0.9375rem] leading-[1.95] @md:mt-0">{s.text}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </PhotoEdge>
        </section>

        {/* 08 季節の便り — 新しいものを3本だけ */}
        {posts.length > 0 && (
          <section className="section">
            <div className="wrap grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
              <Reveal className="lg:col-span-4">
                <p className="label">読みもの</p>
                <h2 className="t-h2 mt-5">{pages.journal.label}</h2>
                <p className="mt-7">旬の魚、鮨の仕事、酒との合わせ方。店からの便りを、少しずつ。</p>
                <p className="mt-8">
                  <Link href={pages.journal.path} className="more">
                    すべての便り
                  </Link>
                </p>
              </Reveal>
              <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.1}>
                <JournalRows posts={posts} />
              </Reveal>
            </div>
          </section>
        )}

        {/* 09 アクセス */}
        <section className="section">
          <div className="wrap grid gap-y-12 lg:grid-cols-12 lg:items-end lg:gap-x-10">
            <Reveal className="lg:col-span-4">
              <Photo
                photo={photos.entrance02}
                ratio="3/4"
                position="50% 40%"
                sizes="(max-width: 1023px) 62vw, 28vw"
                className="w-[66%] lg:w-full"
              />
            </Reveal>
            <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
              <p className="label">{pages.access.label}</p>
              <h2 className="t-h2 mt-5">
                <span className="ib">{restaurant.access.primary.station}から、</span>
                <span className="ib">歩いて{restaurant.access.primary.walk.replace("徒歩", "")}。</span>
              </h2>
              <p className="mt-9">
                {restaurant.address.locality}
                {restaurant.address.district}、{restaurant.address.buildingName}の{restaurant.address.floorText}です。{tram.line}「{tram.station}」からは{tram.walk}。
              </p>
              <div className="mt-10">
                <ShopFacts variant="short" />
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-10 gap-y-1">
                <Link href={pages.access.path} className="more">
                  地図と店舗情報
                </Link>
                <a href={restaurant.map.linkUrl} target="_blank" rel="noopener noreferrer" className="more">
                  Googleマップで開く
                  <span className="sr-only">（別のタブで開きます）</span>
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 10 ご予約 */}
        <ReservationBlock />
      </main>
    </>
  );
}
