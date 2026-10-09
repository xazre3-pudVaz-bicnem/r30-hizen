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
  photo?: PhotoData;
  photoPosition?: string;
  /**
   * wide ＝見出しの下に、画面の幅いっぱいの写真（既定）
   * split＝左に見出し、右に縦位置の写真（右は画面の端まで）
   */
  layout?: "wide" | "split";
  /** 写真の比率。wide の既定は 21/9（スマートフォン 4/5）、split の既定は 4/5 */
  ratio?: string;
  ratioSp?: string;
};

const delay = (s: number) => ({ "--fade-delay": `${s}s` }) as CSSProperties;

/** 下層ページの冒頭。パンくず → 見出し（h1） → 導入 → 写真 */
export function PageHead({ crumbs, label, title, lead, photo, photoPosition, layout = "wide", ratio, ratioSp }: Props) {
  const heading = (
    <>
      {label && <p className="label fade-in">{label}</p>}
      <h1 className="t-h1 fade-in mt-5" style={delay(0.1)}>
        {typeof title === "string" ? <Phrase>{title}</Phrase> : title}
      </h1>
    </>
  );
  const leadText = typeof lead === "string" ? <Phrase>{lead}</Phrase> : lead;

  if (layout === "split" && photo) {
    return (
      <div className="grid lg:grid-cols-[minmax(0,54fr)_minmax(0,46fr)]">
        <div className="page-head flex flex-col px-[var(--gutter)] lg:pb-[clamp(3rem,6vw,5.5rem)] lg:pl-[var(--edge-vw)] lg:pr-[clamp(3rem,6vw,6rem)]">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-12 lg:mt-auto lg:pt-20">
            {heading}
            {lead && (
              <p className="t-lead measure fade-in mt-8 lg:mt-10" style={delay(0.25)}>
                {leadText}
              </p>
            )}
          </div>
        </div>
        {/* 最初の画面に入る写真。ゆっくり現す演出は掛けず、優先して読み込む */}
        <div className="ml-[var(--gutter)] lg:ml-0 lg:pt-20">
          <Photo
            photo={photo}
            ratio={ratio ?? "4/5"}
            ratioSp={ratioSp ?? "4/5"}
            position={photoPosition}
            sizes="(max-width: 767px) calc(100vw - 1.5rem), (max-width: 1023px) calc(100vw - 4rem), 46vw"
            className="frame-fit lg:max-h-[calc(100svh-5rem)] lg:min-h-[32rem] lg:w-full"
            priority
            quality={85}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="wrap page-head">
        <Breadcrumbs crumbs={crumbs} />
        <div className="mt-12 grid gap-y-8 lg:mt-20 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-7">{heading}</div>
          {lead && (
            <p className="t-lead fade-in lg:col-span-5 lg:col-start-8 lg:self-end" style={delay(0.25)}>
              {leadText}
            </p>
          )}
        </div>
      </div>
      {photo && (
        <Photo
          photo={photo}
          ratio={ratio ?? "21/9"}
          ratioSp={ratioSp ?? "4/5"}
          position={photoPosition}
          sizes="(min-width: 1920px) 1920px, 100vw"
          // 高さは画面に収まるところまで。幅は 1920px まで（それ以上に広げると、元の写真の画素が足りずぼやける）
          className="frame-fit mx-auto max-w-[120rem]"
          priority
          quality={85}
        />
      )}
    </div>
  );
}
