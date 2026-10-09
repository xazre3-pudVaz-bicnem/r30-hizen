"use client";

import { useState, type ReactNode } from "react";

type Props = {
  youtubeId: string;
  title: string;
  /** 再生前に見せる写真（サーバー側で描いた <Photo> を渡す） */
  poster: ReactNode;
};

/**
 * 店舗紹介の映像。押されるまで YouTube は読み込まない。
 * （旧サイトは最初の画面で YouTube の iframe を直接読んでいて、表示を重くしていた）
 */
export function VideoFacade({ youtubeId, title, poster }: Props) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="frame aspect-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    // 写真（<div> の枠）は <button> の中に入れられないので、写真の上にボタンを重ねる
    <div className="group relative">
      {poster}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink/35 transition-colors duration-700 group-hover:bg-ink/20" />
      <button type="button" onClick={() => setPlaying(true)} className="absolute inset-0 flex w-full flex-col items-center justify-center gap-5 text-paper">
        <span
          aria-hidden="true"
          className="flex size-16 items-center justify-center rounded-full border border-paper/70 transition-colors duration-500 group-hover:border-brass lg:size-20"
        >
          <span className="ml-1 block border-y-[7px] border-l-[11px] border-y-transparent border-l-paper" />
        </span>
        <span className="text-[0.8125rem] tracking-[0.3em]">映像を再生する</span>
      </button>
    </div>
  );
}
