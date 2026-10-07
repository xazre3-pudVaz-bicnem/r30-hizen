import type { CSSProperties, ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** li や div など、そのまま並びの要素にしたいとき（ol > div > li のような入れ子を作らないため） */
  as?: ElementType;
  className?: string;
  /** 現れるまでの遅れ（秒） */
  delay?: number;
};

/**
 * 画面に入ったら、ゆっくり現れる箱。
 *
 * 仕組みは app/layout.tsx の小さなスクリプト（IntersectionObserver）で、React のクライアント部品ではない。
 * スクリプトが動かない環境では、最初から見えている。
 * 最初の画面に入る要素（ページの見出しなど）には使わない。
 */
export function Reveal({ children, as: Tag = "div", className, delay }: Props) {
  const style = delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined;
  return (
    // スクリプトが class を足すので、ハイドレーション時の差分の警告を抑える
    <Tag data-reveal="" className={className} style={style} suppressHydrationWarning>
      {children}
    </Tag>
  );
}
