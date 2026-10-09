import Image from "next/image";
import { restaurant } from "@/data/restaurant";

/**
 * ロゴ。旧公式サイトのロゴ画像を輪郭トレースした SVG（public/brand/r30-hizen-logo.svg）。
 * 元の比率は 1610:680。
 *
 * priority＝最初の画面に入るロゴ（ヘッダー・ヒーロー）。遅延させずに読むが、先読み（preload）は付けさせない。
 * 先読みするのは、そのページでいちばん大きな写真（LCP）だけにするため、取得の優先度を low にしている
 * （数 KB の SVG なので、表示が遅れることはない）。
 */
export function Logo({ width, priority, className }: { width: number; priority?: boolean; className?: string }) {
  return (
    <Image
      src="/brand/r30-hizen-logo.svg"
      alt={restaurant.name}
      width={width}
      height={Math.round((width * 680) / 1610)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "low" : undefined}
      className={className}
    />
  );
}
