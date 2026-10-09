import type { CSSProperties } from "react";
import Image from "next/image";
import type { Photo as PhotoData } from "@/data/photos";

type Props = {
  photo: PhotoData;
  /**
   * 表示される幅。Tailwind の lg は 1024px からなので、境界は 1023px で書く。
   * 例: "(max-width: 1023px) 100vw, 50vw"
   */
  sizes: string;
  /** 枠の縦横比。"3/2" など。省くと写真そのままの比率 */
  ratio?: string;
  /** スマートフォン（767px 以下）だけ別の比率にするとき */
  ratioSp?: string;
  /** 枠（外側）に付ける class。position 系（absolute など）は渡さない。全面に敷くときは外側を div で包む */
  className?: string;
  /** 切り抜きの位置。"50% 30%" など */
  position?: string;
  /** 最初の画面に入る写真だけ true（遅延読み込みをやめ、優先して読み込む） */
  priority?: boolean;
  quality?: 75 | 85;
};

/** "4/5" → 0.8 */
function toNumber(ratio: string): number {
  const [w, h] = ratio.split("/").map(Number);
  return w > 0 && h > 0 ? w / h : NaN;
}

/**
 * 横位置の写真を縦長の枠に入れると、写真は枠の高さに合わせて拡大され、左右が切り落とされる。
 * このとき必要な画素数は「枠の幅」ではなく「拡大後の写真の幅」で決まるので、sizes に倍率を掛けて伝える
 * （掛けないと、枠の幅ぶんの小さな画像が届き、PC の画面でぼやける）。
 *
 * ・掛けるのはタブレット以上（768px〜）だけ。スマートフォンは画面の密度が高く、そのままで足りている。
 * ・倍率は 1.6 まで。枠には高さの上限（.frame-fit）があり、実際の拡大は計算より小さくなるため。
 */
function cropAwareSizes(sizes: string, imageRatio: number, frameRatio: number): string {
  const factor = imageRatio / frameRatio;
  if (!(factor > 1.15)) return sizes;
  const k = Math.min(factor, 1.6).toFixed(2);
  return sizes
    .split(",")
    .map((raw) => {
      const entry = raw.trim();
      const m = entry.match(/^(\(.+?\))\s+(\S.*)$/);
      if (!m) return `calc(${entry} * ${k})`;
      const max = m[1].match(/max-width:\s*(\d+)px/);
      if (max && Number(max[1]) <= 767) return entry;
      return `${m[1]} calc(${m[2]} * ${k})`;
    })
    .join(", ");
}

/** 写真。角は落とさず、影も付けない */
export function Photo({ photo, sizes, ratio, ratioSp, className, position, priority, quality }: Props) {
  const { image } = photo;
  const natural = image.width / image.height;
  const base = ratio ?? `${image.width}/${image.height}`;
  const frame = ratio ? toNumber(ratio) : natural;
  return (
    <div
      className={`frame ${className ?? ""}`}
      style={{ "--ar": base, ...(ratioSp ? { "--ar-sp": ratioSp } : {}) } as CSSProperties}
    >
      <Image
        src={image}
        alt={photo.alt}
        sizes={Number.isFinite(frame) ? cropAwareSizes(sizes, natural, frame) : sizes}
        quality={quality}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        placeholder="empty"
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  );
}
