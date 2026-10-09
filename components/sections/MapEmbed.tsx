"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Google ビジネスプロフィールの埋め込み URL（data/restaurant.ts の map.embedUrl） */
  embedUrl: string;
  /** Google マップで開くリンク */
  linkUrl: string;
  title: string;
  /** 縦に大きく出す（アクセスのページ用）。PC では画面に残して追従させるので、高さは画面に収まるところまで */
  tall?: boolean;
};

/**
 * 地図。枠が画面に近づいてから iframe を読む。
 * 最初から読むと、地図の外部スクリプトがページの表示を遅らせるため。
 */
export function MapEmbed({ embedUrl, linkUrl, title, tall }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div>
      <div ref={ref} className={`frame ${tall ? "aspect-[4/5] md:aspect-[4/3] lg:aspect-[5/6] lg:max-h-[calc(100svh-15rem)]" : "aspect-[4/3] md:aspect-[16/9]"}`}>
        {show ? (
          <iframe
            src={embedUrl}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0 grayscale-[0.35] contrast-[1.05]"
          />
        ) : null}
      </div>
      <p className="mt-4">
        <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="more">
          Googleマップで開く
          <span className="sr-only">（別のタブで開きます）</span>
        </a>
      </p>
    </div>
  );
}
