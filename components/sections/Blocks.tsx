import type { ReactNode } from "react";
import type { Photo as PhotoData } from "@/data/photos";
import { Photo } from "@/components/ui/Photo";
import { Phrase } from "@/components/ui/Phrase";
import { Reveal } from "@/components/ui/Reveal";

/**
 * ページを組むための部品。
 *
 * ・地は1色で通し、区画は余白と写真で分ける。カード・角丸・影・帯の色替えは使わない。
 * ・写真は大きく。画面の幅いっぱい（Bleed）、片側だけ端まで（Offset・PhotoEdge）、縦と横の混在。
 *   同じ大きさの写真を3つ並べる組み方はしない。
 * ・ページごとに、ここから違う組み合わせ・違う順番で選ぶ（どのページも同じ型、にしない）。
 */

/** 区画。上下の余白は globals.css の --gap（PC 160〜240px／スマートフォン 112px） */
export function Section({
  children,
  id,
  tight,
  bare,
  plain,
  className,
}: {
  children: ReactNode;
  id?: string;
  /** 見出しを持たない区画（写真だけ、など）。<section> ではなく <div> で出す */
  plain?: boolean;
  /** 余白を詰める（案内の表など） */
  tight?: boolean;
  /** 器（.wrap）で包まない。幅いっぱいの写真などを自分で置くとき */
  bare?: boolean;
  className?: string;
}) {
  const cls = [tight ? "section-tight" : "section", className ?? ""].filter(Boolean).join(" ");
  const Tag = plain ? "div" : "section";
  return (
    <Tag id={id} className={cls}>
      {bare ? children : <div className="wrap">{children}</div>}
    </Tag>
  );
}

/** 見出し。小さなラベル（任意）＋ h2 / h3 */
export function Heading({
  label,
  children,
  level: H = "h2",
  className,
}: {
  label?: string;
  children: ReactNode;
  level?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <p className="label mb-5">{label}</p>}
      <H className={H === "h2" ? "t-h2" : "t-h3"}>{typeof children === "string" ? <Phrase>{children}</Phrase> : children}</H>
    </div>
  );
}

/** 段落のまとまり */
export function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-7 ${className ?? ""}`}>{children}</div>;
}

/** 左に見出し、右に本文 */
export function Split({
  label,
  heading,
  children,
  level = "h2",
}: {
  label?: string;
  heading: ReactNode;
  children: ReactNode;
  level?: "h2" | "h3";
}) {
  return (
    <div className="grid gap-y-9 lg:grid-cols-12 lg:gap-x-10">
      <Reveal className="lg:col-span-5">
        <Heading label={label} level={level}>
          {heading}
        </Heading>
      </Reveal>
      <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.08}>
        {children}
      </Reveal>
    </div>
  );
}

const COLUMN = {
  left: "lg:col-span-6",
  center: "lg:col-span-6 lg:col-start-4",
  right: "lg:col-span-6 lg:col-start-7",
} as const;

/** 文章だけの1段。左・中央・右のどこに置くかを選べる（余白を大きく残すための組み方） */
export function Column({
  side = "right",
  label,
  heading,
  children,
}: {
  side?: keyof typeof COLUMN;
  label?: string;
  heading?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-12 lg:gap-x-10">
      <Reveal className={COLUMN[side]}>
        {heading && <Heading label={label}>{heading}</Heading>}
        <div className={heading ? "mt-9 lg:mt-11" : undefined}>{children}</div>
      </Reveal>
    </div>
  );
}

/** 区画の主張を、一文で大きく（中央）。見出しとして置く */
export function Statement({ label, children, note }: { label?: string; children: ReactNode; note?: ReactNode }) {
  return (
    <Reveal className="mx-auto max-w-[40rem] text-center">
      {label && <p className="label mb-5">{label}</p>}
      <h2 className="t-h2">{typeof children === "string" ? <Phrase>{children}</Phrase> : children}</h2>
      {note && <div className="mx-auto mt-9 max-w-[32em] space-y-7 text-left lg:mt-11">{note}</div>}
    </Reveal>
  );
}

// ---- 写真 -------------------------------------------------------------------

/** 画面の幅いっぱいの写真（1920px を超える画面では、1920px で止めて中央に置く） */
export function Bleed({
  photo,
  ratio = "21/9",
  ratioSp = "4/5",
  position,
  priority,
  caption,
}: {
  photo: PhotoData;
  ratio?: string;
  ratioSp?: string;
  position?: string;
  /** 最初の画面に入る写真だけ true（ゆっくり現す演出を掛けず、優先して読み込む） */
  priority?: boolean;
  caption?: ReactNode;
}) {
  const inner = (
    <>
      <Photo
        photo={photo}
        ratio={ratio}
        ratioSp={ratioSp}
        position={position}
        sizes="(min-width: 1920px) 1920px, 100vw"
        // 幅は 1920px まで（それ以上に広げると、元の写真の画素が足りずぼやける）
        className="frame-fit mx-auto max-w-[120rem]"
        priority={priority}
        quality={priority ? 85 : undefined}
      />
      {caption && <figcaption className="wrap t-note mt-4">{caption}</figcaption>}
    </>
  );
  return priority ? <figure>{inner}</figure> : <Reveal as="figure">{inner}</Reveal>;
}

/** 片側を器にそろえ、反対側を画面の端まで伸ばす写真。bleed＝端まで伸ばす側 */
export function Offset({
  photo,
  bleed = "right",
  ratio = "16/9",
  ratioSp = "4/3",
  position,
  caption,
}: {
  photo: PhotoData;
  bleed?: "left" | "right";
  ratio?: string;
  ratioSp?: string;
  position?: string;
  caption?: ReactNode;
}) {
  return (
    <Reveal as="figure" className={bleed === "right" ? "bleed-l" : "bleed-r"}>
      <Photo
        photo={photo}
        ratio={ratio}
        ratioSp={ratioSp}
        position={position}
        sizes="(max-width: 767px) calc(100vw - 1.5rem), (max-width: 1279px) calc(100vw - 4rem), (max-width: 1471px) calc(100vw - 6rem), calc(50vw + 40rem)"
        className="frame-fit"
      />
      {caption && <figcaption className={`t-note mt-4 ${bleed === "left" ? "pl-[var(--gutter)] lg:pl-[var(--edge-vw)]" : ""}`}>{caption}</figcaption>}
    </Reveal>
  );
}

const EDGE_COLS = {
  left: {
    narrow: "lg:grid-cols-[minmax(0,38fr)_minmax(0,62fr)]",
    half: "lg:grid-cols-[minmax(0,48fr)_minmax(0,52fr)]",
    wide: "lg:grid-cols-[minmax(0,1fr)_max(42%,var(--edge-text-min))]",
  },
  right: {
    narrow: "lg:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]",
    half: "lg:grid-cols-[minmax(0,52fr)_minmax(0,48fr)]",
    wide: "lg:grid-cols-[max(42%,var(--edge-text-min))_minmax(0,1fr)]",
  },
} as const;
const EDGE_VW = { narrow: "38vw", half: "48vw", wide: "58vw" } as const;
const EDGE_ALIGN = { center: "lg:items-center", end: "lg:items-end", start: "lg:items-start" } as const;

/**
 * 写真を画面の片側の端まで伸ばし、反対側に文章を置く。
 * 器（.wrap）の外で使う（<Section bare> の中）。スマートフォンでは写真が先、片側だけ端に付く。
 */
export function PhotoEdge({
  photo,
  side = "left",
  width = "half",
  ratio = "4/5",
  ratioSp,
  position,
  align = "center",
  children,
}: {
  photo: PhotoData;
  /** 写真の側 */
  side?: "left" | "right";
  /** 写真の幅（画面に対して 38% / 48% / 58%）。wide は、文章の列が痩せる画面幅では 58% より狭くなる */
  width?: keyof typeof EDGE_VW;
  ratio?: string;
  ratioSp?: string;
  position?: string;
  align?: keyof typeof EDGE_ALIGN;
  children: ReactNode;
}) {
  const left = side === "left";
  return (
    <div className={`grid gap-y-12 ${EDGE_ALIGN[align]} ${EDGE_COLS[side][width]}`}>
      <Reveal className={left ? "mr-[var(--gutter)] lg:mr-0" : "ml-[var(--gutter)] lg:order-2 lg:ml-0"}>
        <Photo
          photo={photo}
          ratio={ratio}
          ratioSp={ratioSp}
          position={position}
          sizes={`(max-width: 767px) calc(100vw - 1.5rem), (max-width: 1023px) calc(100vw - 4rem), ${EDGE_VW[width]}`}
          className="frame-fit"
        />
      </Reveal>
      <Reveal
        delay={0.1}
        className={`px-[var(--gutter)] ${
          left
            ? "lg:pl-[clamp(3rem,7vw,7.5rem)] lg:pr-[var(--edge-vw)]"
            : "lg:order-1 lg:pl-[var(--edge-vw)] lg:pr-[clamp(3rem,7vw,7.5rem)]"
        }`}
      >
        {children}
      </Reveal>
    </div>
  );
}

// ---- 並び -------------------------------------------------------------------

/**
 * 項目を罫で区切って並べる（見出し＋説明）。
 * 「3つの理由」のような飾りの箱にはせず、品書きのような行にする。
 * 見出しと説明を横に並べるのは、置かれた場所に 480px 以上の幅があるときだけ
 * （半分の幅の列に入ると、説明が1行 13字ほどに痩せるため。画面の幅ではなく、入れ物の幅で決める）。
 */
export function Items({
  items,
  level: H = "h3",
}: {
  items: { title: ReactNode; body: ReactNode; key: string }[];
  level?: "h3" | "h4";
}) {
  return (
    <ul className="rows @container">
      {items.map((it) => (
        <li key={it.key} className="grid gap-x-10 gap-y-2 py-7 md:py-8 @[30rem]:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <H className="text-[1.0625rem] leading-[1.9] tracking-[0.12em] text-paper md:text-[1.125rem]">
            {typeof it.title === "string" ? <Phrase>{it.title}</Phrase> : it.title}
          </H>
          <div className="text-[0.9375rem] leading-[2] md:text-[1rem]">{it.body}</div>
        </li>
      ))}
    </ul>
  );
}

/** 順に進むもの（当日の流れ・出てくる順番）。小さな数字と、縦の細い線でつなぐ */
export function Steps({ items }: { items: { title: ReactNode; body: ReactNode; key: string }[] }) {
  return (
    <ol className="steps">
      {items.map((it) => (
        <li key={it.key}>
          <h3 className="t-h3">{typeof it.title === "string" ? <Phrase>{it.title}</Phrase> : it.title}</h3>
          <div className="mt-3 text-[0.9375rem] leading-[2] md:text-[1rem]">{it.body}</div>
        </li>
      ))}
    </ol>
  );
}
