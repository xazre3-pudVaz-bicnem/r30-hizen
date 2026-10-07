import type { CSSProperties, ReactNode } from "react";
import type { Photo as PhotoData } from "@/data/photos";
import type { Crumb } from "@/lib/schema";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Photo } from "@/components/ui/Photo";
import { Phrase } from "@/components/ui/Phrase";

type Props = {
  crumbs: Crumb[];
  /** 小さな区画名（例：ご利用の場面） */
  label?: string;
  /** h1。語の途中で折り返さないよう、<span className="ib"> で区切って渡す */
  title: ReactNode;
  /** 導入の一段落 */
  lead?: ReactNode;
  /** 見出しの下に大きく置く写真 */
  photo?: PhotoData;
  photoPosition?: string;
};

/** 下層ページの冒頭。パンくず → 見出し（h1） → 導入 → 写真 */
export function PageHead({ crumbs, label, title, lead, photo, photoPosition }: Props) {
  return (
    <div className="bg-ink">
      <div className="wrap page-head">
        <Breadcrumbs crumbs={crumbs} />
        <div className="mt-12 lg:mt-16">
          {label && <p className="label rise">{label}</p>}
          <h1 className="t-h1 rise mt-5" style={{ "--rise-delay": "0.1s" } as CSSProperties}>
            {typeof title === "string" ? <Phrase>{title}</Phrase> : title}
          </h1>
          {lead && (
            <p className="t-lead measure rise mt-8 lg:mt-10" style={{ "--rise-delay": "0.25s" } as CSSProperties}>
              {typeof lead === "string" ? <Phrase>{lead}</Phrase> : lead}
            </p>
          )}
        </div>
      </div>
      {photo && (
        <div className="wrap">
          <Photo
            photo={photo}
            ratio="16/9"
            sizes="(max-width: 767px) calc(100vw - 2.5rem), (max-width: 1279px) calc(100vw - 6rem), 1216px"
            position={photoPosition}
            priority
            quality={85}
            ratioSp="4/3"
          />
        </div>
      )}
    </div>
  );
}
