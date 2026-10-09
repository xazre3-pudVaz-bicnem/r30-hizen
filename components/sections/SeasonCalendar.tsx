import { seasons } from "@/data/seasons";
import { Reveal } from "@/components/ui/Reveal";

/**
 * 北の海の暦。北海道で一般に旬とされる魚介を、季節ごとに挙げたもの（data/seasons.ts）。
 * 以前はトップページに置いていたが、説明が長く続くため「季節の便り」の一覧へ移した。
 * 店の品書きではないので、「当日のコースに入るとは限らない」ことを必ず添える。
 */
export function SeasonCalendar() {
  return (
    <section aria-labelledby="season-heading" className="section border-t border-line">
      <div className="wrap">
        <Reveal className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-5">
            <p className="label">季節</p>
            <h2 id="season-heading" className="t-h2 mt-5">
              <span className="ib">北の海の、</span>
              <span className="ib">暦。</span>
            </h2>
          </div>
          <p className="lg:col-span-6 lg:col-start-7 lg:self-end">
            おまかせに何が並ぶかは、その日の仕入れ次第。季節ごとに、北海道の海で旬を迎える魚介をいくつか挙げておきます。
          </p>
        </Reveal>

        <Reveal as="ol" className="rows mt-12 lg:mt-16" delay={0.08}>
          {seasons.map((s) => (
            <li key={s.key} className="grid gap-x-10 gap-y-3 py-8 md:grid-cols-[9rem_minmax(0,5fr)_minmax(0,7fr)] md:items-baseline md:py-10">
              <h3 className="flex items-baseline gap-4 md:block">
                <span className="text-[1.75rem] leading-none tracking-[0.1em] text-paper">{s.name}</span>{" "}
                <span className="t-note md:mt-3 md:block">{s.months}</span>
              </h3>
              <p className="text-[1.0625rem] tracking-[0.14em] text-paper">{s.fish.join("　")}</p>
              <p className="text-[0.9375rem] leading-[2] md:text-[1rem]">{s.note}</p>
            </li>
          ))}
        </Reveal>

        <p className="t-note mt-8">※ 北海道で一般に旬とされる時季です。当日のコースに入るとは限りません。</p>
      </div>
    </section>
  );
}
