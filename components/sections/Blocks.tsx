import type { ReactNode } from "react";
import type { Photo as PhotoData } from "@/data/photos";
import { Photo } from "@/components/ui/Photo";
import { Phrase } from "@/components/ui/Phrase";
import { Reveal } from "@/components/ui/Reveal";

/**
 * 下層ページを組むための部品。
 * どのページも同じ部品で組むことで、紙面の調子（余白・罫・文字の大きさ）をそろえる。
 * カード・角丸・影・飾りの線は使わない。
 */

type Tone = "ink" | "ink-2";
const TONE: Record<Tone, string> = { ink: "bg-ink", "ink-2": "bg-ink-2" };

/** 区画。tone で地の色を1段だけ切り替える */
export function Section({
  tone = "ink",
  tight,
  children,
  id,
  eager,
}: {
  tone?: Tone;
  tight?: boolean;
  children: ReactNode;
  id?: string;
  /** 画面の外でも最初から描画する（ページ内リンクの飛び先がある区画に付ける） */
  eager?: boolean;
}) {
  return (
    <section
      id={id}
      className={`${TONE[tone]} ${tight ? "section-tight" : "section"} ${id ? "scroll-mt-20" : ""} ${eager || id ? "no-cv" : ""}`}
    >
      <div className="wrap">{children}</div>
    </section>
  );
}

/** 左に見出し、右に本文 */
export function Split({
  label,
  heading,
  children,
  level: H = "h2",
}: {
  label?: string;
  heading: ReactNode;
  children: ReactNode;
  level?: "h2" | "h3";
}) {
  return (
    <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-10">
      <Reveal className="lg:col-span-5">
        {label && <p className="label mb-5">{label}</p>}
        <H className={H === "h2" ? "t-h2" : "t-h3"}>{typeof heading === "string" ? <Phrase>{heading}</Phrase> : heading}</H>
      </Reveal>
      <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.08}>
        {children}
      </Reveal>
    </div>
  );
}

/** 写真と文章を左右に。side は写真の側 */
export function PhotoSplit({
  photo,
  ratio = "4/5",
  ratioSp,
  position,
  side = "left",
  children,
}: {
  photo: PhotoData;
  ratio?: string;
  ratioSp?: string;
  position?: string;
  side?: "left" | "right";
  children: ReactNode;
}) {
  const left = side === "left";
  return (
    <div className="grid items-center gap-y-12 lg:grid-cols-12 lg:gap-x-10">
      <Reveal className={left ? "lg:col-span-6" : "lg:order-2 lg:col-span-6 lg:col-start-7"}>
        <Photo
          photo={photo}
          ratio={ratio}
          ratioSp={ratioSp}
          position={position}
          sizes="(max-width: 1023px) calc(100vw - 2.5rem), 46vw"
        />
      </Reveal>
      <Reveal className={left ? "lg:col-span-5 lg:col-start-8" : "lg:order-1 lg:col-span-5"} delay={0.08}>
        {children}
      </Reveal>
    </div>
  );
}

/** 段落のまとまり */
export function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-6 ${className ?? ""}`}>{children}</div>;
}

/** 幅いっぱいの写真 */
export function WidePhoto({
  photo,
  ratio = "16/9",
  ratioSp = "4/3",
  position,
}: {
  photo: PhotoData;
  ratio?: string;
  ratioSp?: string;
  position?: string;
}) {
  return (
    <Reveal>
      <Photo
        photo={photo}
        ratio={ratio}
        ratioSp={ratioSp}
        position={position}
        sizes="(max-width: 767px) calc(100vw - 2.5rem), (max-width: 1279px) calc(100vw - 6rem), 1216px"
      />
    </Reveal>
  );
}

/**
 * 項目を罫で区切って並べる（見出し＋説明）。
 * 「3つの理由」のような飾りの箱にはせず、品書きのような行にする。
 */
export function Items({
  items,
  level: H = "h3",
}: {
  items: { title: ReactNode; body: ReactNode; key: string }[];
  level?: "h3" | "h4";
}) {
  return (
    <ul className="rows">
      {items.map((it) => (
        <li key={it.key} className="grid gap-x-10 gap-y-2 py-7 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:py-8">
          <H className="text-[1.0625rem] leading-[1.9] tracking-[0.12em] text-paper">
            {typeof it.title === "string" ? <Phrase>{it.title}</Phrase> : it.title}
          </H>
          <div className="text-[0.9375rem] leading-[2.1]">{it.body}</div>
        </li>
      ))}
    </ul>
  );
}
