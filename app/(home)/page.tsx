/**
 * トップページ
 * 担当する検索語: すすきの 寿司
 * 役割: どんな店かを写真と短い文で伝え、目的別のページへ送る。
 * 書かないこと: コースの細目（/omakase）、場面ごとの詳しい案内（各ページ）。ここでは繰り返さない。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CourseRows } from "@/components/sections/CourseRows";
import { Hero } from "@/components/sections/Hero";
import { JournalRows } from "@/components/sections/JournalRows";
import { MapEmbed } from "@/components/sections/MapEmbed";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { ShopFacts } from "@/components/sections/ShopFacts";
import { JsonLd } from "@/components/ui/JsonLd";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { confirmedAtLabel, courseCommon, priceMax, priceMin, signatureDish, yen } from "@/data/courses";
import { pages } from "@/data/pages";
import { photos } from "@/data/photos";
import { seasons } from "@/data/seasons";
import { agePolicy, buildingLine, hoursLine, site, stationWalk } from "@/data/site";
import { getAllPosts } from "@/lib/journal";
import { pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const page = pages.home;

export const metadata: Metadata = pageMetadata(page);

/** ご利用の場面。それぞれ、その検索意図を担当するページへ送る */
const SCENES: { name: string; text: string; href: string }[] = [
  {
    name: "記念日",
    text: "結婚記念日や誕生日に。品書きのないコースを、二人でゆっくりと。",
    href: pages.anniversary.path,
  },
  {
    name: "デート",
    text: "横に並んで、同じ一貫を味わう。会話のじゃまをしない静けさがあります。",
    href: pages.date.path,
  },
  {
    name: "接待・会食",
    text: "カウンター越しのもてなしを、大切なお相手と。貸切のご相談も承ります。",
    href: pages.businessDinner.path,
  },
  {
    name: "ご夫婦で",
    text: "夫婦で営む店で、夫婦の時間を。節目の日にも、なにもない日にも。",
    href: "/journal/fufu-counter-sushi",
  },
  {
    name: "お一人で",
    text: "出張の夜や、自分をねぎらう日に。1名様のご予約はお電話で承ります。",
    href: pages.solo.path,
  },
];

export default function HomePage() {
  const posts = getAllPosts().slice(0, 5);

  return (
    <>
      <JsonLd graph={pageGraph(page, [])} />
      <Header overHero />

      <main id="main">
        {/* 01 最初の画面 — 行動を促すものは置かない */}
        <Hero />

        {/* 02 導入 — h1 はここ */}
        <section className="section bg-ink">
          <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
            <div className="lg:col-span-7">
              <h1 className="t-h1">
                <span className="ib">すすきので味わう、</span>
                <span className="ib">大人のための</span>
                <span className="ib">おまかせ鮨</span>
              </h1>
              <div className="measure mt-10 space-y-7 lg:mt-12">
                <p>
                  札幌・すすきの。にぎわいから少し離れたビルの{site.address.floorText}に、{site.name}はあります。
                  {site.seating.style}の、小さな鮨店です。
                </p>
                <p>
                  {site.people.chefExperience}の店主が、その日の仕入れを見て握る寿司と季節の一皿を、おまかせのコースでお出ししています。記念日やデート、接待や会食といった大切な夜に。
                  {agePolicy.minAge}歳以上のお客様だけをお迎えする、静かな店です。
                </p>
              </div>
            </div>

            <Reveal className="lg:col-span-4 lg:col-start-9 lg:self-end">
              <dl className="facts text-[0.875rem]">
                <div>
                  <dt>お料理</dt>
                  <dd>
                    おまかせコースのみ
                    <span className="block">
                      {yen(priceMin)}〜{yen(priceMax)}（税込）
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>営業</dt>
                  <dd>
                    {hoursLine}・{site.hours.closedLabel}
                  </dd>
                </div>
                <div>
                  <dt>場所</dt>
                  <dd>
                    {stationWalk}
                    <span className="block">{buildingLine}</span>
                  </dd>
                </div>
                <div>
                  <dt>ご利用</dt>
                  <dd>{agePolicy.label}</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </section>

        {/* 03 コンセプト */}
        <section className="section bg-ink-2">
          <div className="wrap grid items-center gap-y-12 lg:grid-cols-12 lg:gap-x-10">
            <Reveal className="lg:col-span-6">
              <Photo
                photo={photos.chef01}
                ratio="4/5"
                position="50% 40%"
                sizes="(max-width: 1023px) calc(100vw - 2.5rem), 46vw"
              />
            </Reveal>
            <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.1}>
              <p className="label">コンセプト</p>
              <h2 className="t-h2 mt-5">
                <span className="ib">{agePolicy.minAge}歳から、</span>
                <span className="ib">と決めた店。</span>
              </h2>
              <div className="mt-8 space-y-6">
                <p>
                  {site.name}は、{agePolicy.minAge}歳未満のお客様のご入店をお断りしています。{agePolicy.reason}の、決まりごとです。
                </p>
                <p>
                  香りの強い香水もご遠慮いただき、灯りを落としたカウンターで、握りと酒に向き合っていただく。{site.people.team}で営む小さな店だからできる、大人のための時間をご用意しています。
                </p>
              </div>
              <p className="mt-10">
                <Link href={pages.concept.path} className="more">
                  コンセプトを読む
                </Link>
              </p>
            </Reveal>
          </div>
        </section>

        {/* 04 鮨と料理 */}
        <section className="section bg-ink">
          <Reveal className="wrap">
            <Photo
              photo={photos.sushi01}
              ratio="21/9"
              position="50% 56%"
              sizes="(max-width: 767px) calc(100vw - 2.5rem), (max-width: 1279px) calc(100vw - 6rem), 1216px"
              ratioSp="3/2"
            />
          </Reveal>
          <div className="wrap mt-14 grid gap-y-10 lg:mt-24 lg:grid-cols-12 lg:gap-x-10">
            <Reveal className="lg:col-span-5">
              <p className="label">鮨と料理</p>
              <h2 className="t-h2 mt-5">
                <span className="ib">旬と向き合う、</span>
                <span className="ib">一貫。</span>
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
              <div className="space-y-6">
                <p>
                  {site.techniques.join("、")}。手間を惜しまず、一貫ずつ、目の前で握ります。口に入れるとほどける銀シャリと、押し寄せる魚介の旨み。
                </p>
                <p>
                  握りの前後には、従来の手法にとらわれない季節の一皿を。盛り付けにも工夫を凝らし、目でも味わっていただけるよう仕立てています。
                </p>
              </div>
              <p className="mt-10">
                <Link href={pages.cuisine.path} className="more">
                  鮨と料理を見る
                </Link>
              </p>
            </Reveal>
          </div>
          <div className="wrap mt-16 grid grid-cols-12 gap-x-4 gap-y-6 lg:mt-24 lg:gap-x-10">
            <Reveal className="col-span-7 lg:col-span-5 lg:col-start-2">
              <Photo photo={photos.chef03} ratio="4/3" sizes="(max-width: 1023px) 58vw, 38vw" />
            </Reveal>
            <Reveal className="col-span-5 mt-16 lg:col-span-3 lg:col-start-9 lg:mt-32" delay={0.12}>
              <Photo photo={photos.cuisine05} ratio="3/4" sizes="(max-width: 1023px) 40vw, 23vw" />
            </Reveal>
          </div>
        </section>

        {/* 05 おまかせ */}
        <section className="section bg-ink-2">
          <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10">
            <div className="lg:col-span-5 lg:row-start-1">
              <Reveal>
                <p className="label">おまかせコース</p>
                <h2 className="t-h2 mt-5">
                  <span className="ib">品書きのない、</span>
                  <span className="ib">おまかせ。</span>
                </h2>
                <div className="mt-8 space-y-6">
                  <p>
                    お料理は、おまかせのコースのみ。{courseCommon.menuUndisclosed}
                  </p>
                  <p>選んでいただくのは、コースだけ。結びには、{signatureDish.label}をご用意しています。</p>
                </div>
              </Reveal>
            </div>

            <Reveal className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1" delay={0.1}>
              <CourseRows variant="brief" />
              <p className="t-note mt-5">
                {confirmedAtLabel}の料金です。{courseCommon.perPerson}
              </p>
              <p className="mt-10">
                <Link href={pages.omakase.path} className="more">
                  コースの内容を見る
                </Link>
              </p>
            </Reveal>

            <Reveal className="lg:col-span-5 lg:row-start-2">
              <Photo
                photo={photos.omakase02}
                ratio="4/5"
                position="50% 70%"
                sizes="(max-width: 1023px) 68vw, 24vw"
                className="w-[68%] lg:w-[72%]"
              />
            </Reveal>
          </div>
        </section>

        {/* 06 カウンター */}
        <section className="section bg-ink">
          <Reveal className="wrap">
            <Photo
              photo={photos.chef02}
              ratio="16/9"
              sizes="(max-width: 767px) calc(100vw - 2.5rem), (max-width: 1279px) calc(100vw - 6rem), 1216px"
              ratioSp="4/3"
            />
          </Reveal>
          <div className="wrap mt-14 grid gap-y-10 lg:mt-24 lg:grid-cols-12 lg:gap-x-10">
            <Reveal className="lg:col-span-5">
              <p className="label">カウンター</p>
              <h2 className="t-h2 mt-5">
                <span className="ib">鮨と向き合う、</span>
                <span className="ib">静かな夜。</span>
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
              <div className="space-y-6">
                <p>
                  お席は、カウンターのみ。黒を基調にした店内で、握る手もとを眺めながら、すすきのの喧騒を忘れてお過ごしください。
                </p>
                <p>
                  {site.people.team}で営んでいるため、混み合う日はお料理に少しお時間をいただくことがあります。急がない夜に、どうぞ。
                </p>
              </div>
              <p className="mt-10">
                <Link href={pages.space.path} className="more">
                  空間を見る
                </Link>
              </p>
            </Reveal>
          </div>
        </section>

        {/* 07 ご利用の場面 */}
        <section className="section bg-ink-2">
          <div className="wrap grid gap-y-12 lg:grid-cols-12 lg:gap-x-10">
            <Reveal className="lg:col-span-4">
              <p className="label">ご利用の場面</p>
              <h2 className="t-h2 mt-5">
                <span className="ib">大切な夜の、</span>
                <span className="ib">いくつかの場面。</span>
              </h2>
              <div className="mt-10 lg:mt-12">
                <Photo
                  photo={photos.entrance01}
                  ratio="3/4"
                  sizes="(max-width: 1023px) 56vw, 22vw"
                  className="w-[56%] lg:w-[78%]"
                />
              </div>
            </Reveal>
            <Reveal as="ul" className="rows lg:col-span-7 lg:col-start-6" delay={0.1}>
              {SCENES.map((s) => (
                <li key={s.name}>
                  <Link href={s.href} className="group grid gap-x-10 gap-y-2 py-8 md:grid-cols-[9em_minmax(0,1fr)] md:items-baseline md:py-10">
                    <h3 className="text-[1.25rem] tracking-[0.16em] text-paper transition-colors duration-300 group-hover:text-brass md:text-[1.375rem]">
                      {s.name}
                    </h3>
                    <p className="text-[0.9375rem] leading-[2.05]">{s.text}</p>
                  </Link>
                </li>
              ))}
            </Reveal>
          </div>
        </section>

        {/* 08 酒 */}
        <section className="section bg-ink">
          <div className="wrap grid items-center gap-y-12 lg:grid-cols-12 lg:gap-x-10">
            <Reveal className="lg:order-2 lg:col-span-7 lg:col-start-6">
              <Photo photo={photos.sake01} ratio="3/2" sizes="(max-width: 1023px) calc(100vw - 2.5rem), 54vw" />
            </Reveal>
            <Reveal className="lg:order-1 lg:col-span-4" delay={0.1}>
              <p className="label">お酒</p>
              <h2 className="t-h2 mt-5">
                <span className="ib">一貫に、</span>
                <span className="ib">一杯を。</span>
              </h2>
              <div className="mt-8 space-y-6">
                <p>
                  {site.drinks.kinds.join("、")}。握りや季節の一皿に合わせて、お選びいただけます。
                </p>
                <p>{site.drinks.bottles}</p>
              </div>
              <p className="mt-10">
                <Link href={pages.drink.path} className="more">
                  お酒について
                </Link>
              </p>
            </Reveal>
          </div>
        </section>

        {/* 09 季節 */}
        <section className="section bg-ink-2">
          <div className="wrap">
            <Reveal className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-10">
              <div className="lg:col-span-5">
                <p className="label">季節</p>
                <h2 className="t-h2 mt-5">
                  <span className="ib">北の海の、</span>
                  <span className="ib">暦。</span>
                </h2>
              </div>
              <p className="lg:col-span-6 lg:col-start-7 lg:self-end">
                おまかせに何が並ぶかは、その日の仕入れ次第。季節ごとに、北海道の海で旬を迎える魚介をいくつか挙げておきます。
              </p>
            </Reveal>

            <Reveal as="ol" className="mt-14 grid gap-y-10 md:grid-cols-2 md:gap-x-10 lg:mt-20 lg:grid-cols-4" delay={0.1}>
              {seasons.map((s) => (
                <li key={s.key} className="border-t border-line pt-7">
                  <h3 className="flex items-baseline gap-4">
                    <span className="text-[1.75rem] tracking-[0.1em] text-paper">{s.name}</span>
                    <span className="t-note">{s.months}</span>
                  </h3>
                  <p className="mt-4 text-[1rem] tracking-[0.12em] text-paper">{s.fish.join("　")}</p>
                  <p className="mt-4 text-[0.875rem] leading-[2.05]">{s.note}</p>
                </li>
              ))}
            </Reveal>

            <Reveal className="mt-12 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4">
              <p className="t-note">※ 北海道で一般に旬とされる時季です。当日のコースに入るとは限りません。</p>
              <Link href="/journal/category/season" className="more">
                旬の読みもの
              </Link>
            </Reveal>
          </div>
        </section>

        {/* 10 季節の便り */}
        {posts.length > 0 && (
          <section className="section bg-ink">
            <div className="wrap grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
              <Reveal className="lg:col-span-4">
                <p className="label">読みもの</p>
                <h2 className="t-h2 mt-5">{pages.journal.label}</h2>
                <p className="mt-6">旬の魚、鮨の仕事、酒との合わせ方。すすきのでの過ごし方も、少しずつ。</p>
                <p className="mt-8">
                  <Link href={pages.journal.path} className="more">
                    すべての便り
                  </Link>
                </p>
              </Reveal>
              <Reveal className="lg:col-span-8" delay={0.1}>
                <JournalRows posts={posts} />
              </Reveal>
            </div>
          </section>
        )}

        {/* 11 アクセス */}
        <section className="section bg-ink-2">
          <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
            <Reveal className="lg:col-span-5">
              <p className="label">アクセス</p>
              <h2 className="t-h2 mt-5">
                <span className="ib">{site.access.primary.station}から、</span>
                <span className="ib">歩いて{site.access.primary.walk.replace("徒歩", "")}。</span>
              </h2>
              <p className="mt-8">
                {site.address.locality}{site.address.district}、{site.address.buildingName}の{site.address.floorText}です。{site.access.others[0].line}「{site.access.others[0].station}」からは{site.access.others[0].walk}。
              </p>
              <div className="mt-10">
                <ShopFacts variant="short" />
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-2">
                <Link href={pages.access.path} className="more">
                  アクセスの詳細
                </Link>
                <Link href={pages.reservation.path} className="more">
                  ご予約について
                </Link>
              </div>
            </Reveal>
            <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
              <MapEmbed embedUrl={site.map.embedUrl} linkUrl={site.map.linkUrl} title={`${site.name}の地図`} />
            </Reveal>
          </div>
        </section>

        {/* 12 ご予約 */}
        <ReservationBlock />
      </main>
    </>
  );
}
