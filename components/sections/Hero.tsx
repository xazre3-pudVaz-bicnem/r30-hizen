import type { CSSProperties } from "react";
import { getImageProps } from "next/image";
import { photos } from "@/data/photos";
import { restaurant } from "@/data/restaurant";
import { Logo } from "@/components/layout/Logo";

/**
 * トップの最初の画面。
 *
 * ・行動を促すもの（予約・お問い合わせ・詳しく見る）は置かない。写真と、短いことばだけ。
 * ・伝えるのは3つ。どんな店か（縦書きのことば）、店の名前（ロゴ）、どこの何の店か（ロゴの下の添え書き）。
 *   検索語を並べる場所にはしない。
 * ・映像（YouTube）は置かない。静止画を1枚だけ、最優先で読み込む。
 * ・見出し（h1）はこの下の導入区画にある。ここのことばは段落として置く。
 * ・PC は横位置、スマートフォンは同じ写真の中央を縦位置に切り出したものを出し分ける
 *   （<picture> なので、読み込まれるのは片方だけ）。
 */
export function Hero() {
  const common = { alt: photos.counter01.alt, sizes: "100vw", quality: 85 } as const;
  // srcset と sizes は <source> に持たせる。<img> に sizes だけが残ると HTML の文法違反になるので、両方とも外す
  const {
    props: { srcSet: desktopSet, sizes: _sizes, ...desktop },
  } = getImageProps({ ...common, src: photos.counter01.image });
  void _sizes;
  const {
    props: { srcSet: mobileSet },
  } = getImageProps({ ...common, src: photos.counter01Portrait.image });

  const MOBILE = "(max-width: 767px)";
  const DESKTOP = "(min-width: 768px)";

  return (
    <section data-hero="" className="hero" aria-label={restaurant.name}>
      <picture className="hero-media">
        <source media={MOBILE} srcSet={mobileSet} sizes="100vw" />
        <source media={DESKTOP} srcSet={desktopSet} sizes="100vw" />
        {/* いちばん大きな要素（LCP）になる写真。遅延させず、優先して読み込む。値は getImageProps で最適化済み */}
        <img {...desktop} alt={common.alt} loading="eager" fetchPriority="high" decoding="async" />
      </picture>
      <div className="hero-shade" aria-hidden="true" />

      <div className="wrap relative h-full">
        <p
          className="v-text hero-copy fade-in absolute right-0 top-[15%] md:right-[1%] md:top-1/2 md:-translate-y-[57%] lg:right-[3%]"
          style={{ "--fade-delay": "0.6s" } as CSSProperties}
        >
          大人だけに許された、
          <br />
          すすきのの鮨時間。
        </p>

        <div className="fade-in absolute bottom-10 left-0 md:bottom-16" style={{ "--fade-delay": "1.1s" } as CSSProperties}>
          <Logo width={208} priority className="h-auto w-[136px] md:w-[184px] lg:w-[208px]" />
          <p className="hero-sign mt-6 md:mt-7">
            <span>札幌・すすきの</span> <span>鮨</span>
          </p>
        </div>
      </div>
    </section>
  );
}
