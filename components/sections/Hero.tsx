import type { CSSProperties } from "react";
import { getImageProps } from "next/image";
import { photos } from "@/data/photos";
import { Logo } from "@/components/layout/Logo";

/**
 * トップの最初の画面。
 *
 * ・行動を促すもの（予約・お問い合わせ・詳しく見る）は置かない。写真と、短いことばだけ。
 * ・映像（YouTube）は置かない。静止画を1枚だけ、最優先で読み込む。
 * ・見出し（h1）はこの下の導入区画にある。ここのことばは段落として置く。
 * ・PC は横位置、スマートフォンは同じ写真の中央を縦位置に切り出したものを出し分ける
 *   （<picture> なので、読み込まれるのは片方だけ）。
 */
export function Hero() {
  const common = { alt: photos.counter01.alt, sizes: "100vw", quality: 85 } as const;
  const {
    props: { srcSet: desktopSet, ...desktop },
  } = getImageProps({ ...common, src: photos.counter01.image });
  const {
    props: { srcSet: mobileSet },
  } = getImageProps({ ...common, src: photos.counter01Portrait.image });

  const MOBILE = "(max-width: 767px)";
  const DESKTOP = "(min-width: 768px)";

  return (
    <section data-hero="" className="hero" aria-label="R-30 hizen">
      <picture className="hero-media">
        <source media={MOBILE} srcSet={mobileSet} sizes="100vw" />
        <source media={DESKTOP} srcSet={desktopSet} sizes="100vw" />
        {/* いちばん大きな要素（LCP）になる写真。遅延させず、優先して読み込む。値は getImageProps で最適化済み */}
        <img {...desktop} alt={common.alt} loading="eager" fetchPriority="high" decoding="async" />
      </picture>
      <div className="hero-shade" aria-hidden="true" />

      <div className="wrap relative h-full">
        <p
          className="v-text hero-copy rise absolute right-0 top-[14%] md:right-[3%] md:top-1/2 md:-translate-y-[54%] lg:right-[5%]"
          style={{ "--rise-delay": "0.5s" } as CSSProperties}
        >
          大人だけに許された、
          <br />
          すすきのの鮨時間。
        </p>

        <div
          className="rise absolute bottom-10 left-0 md:bottom-14"
          style={{ "--rise-delay": "0.9s" } as CSSProperties}
        >
          <Logo width={176} priority className="h-auto w-[124px] md:w-[176px]" />
          <p className="latin mt-5 text-[0.6875rem] text-paper md:text-[0.75rem]">SUSUKINO / SAPPORO</p>
        </div>
      </div>
    </section>
  );
}
