import Image from "next/image";
import { site } from "@/data/site";

/**
 * ロゴ。旧公式サイトのロゴ画像を輪郭トレースした SVG（public/brand/r30-hizen-logo.svg）。
 * 元の比率は 1610:680。
 */
export function Logo({ width, priority, className }: { width: number; priority?: boolean; className?: string }) {
  return (
    <Image
      src="/brand/r30-hizen-logo.svg"
      alt={site.name}
      width={width}
      height={Math.round((width * 680) / 1610)}
      loading={priority ? "eager" : "lazy"}
      className={className}
    />
  );
}
