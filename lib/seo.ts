import type { Metadata } from "next";
import { site } from "@/data/site";
import type { PageDef } from "@/data/pages";

/**
 * 公開 URL。next.config.ts が決めた値が入る（プレビュー・手元では undefined）。
 * undefined の間は canonical / og:url / sitemap を出さず、全ページ noindex になる。
 */
export const SITE_URL: string | undefined = process.env.NEXT_PUBLIC_SITE_URL || undefined;

/** 検索エンジンに載せてよい状態か */
export const isIndexable = Boolean(SITE_URL);

/** パスを絶対 URL にする。公開 URL が決まっていなければ undefined */
export function absoluteUrl(path = "/"): string | undefined {
  if (!SITE_URL) return undefined;
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

export const OG_SIZE = { width: 1200, height: 630 } as const;

type BuildArgs = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  ogImageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** 記事数が少ない一覧など、載せたくないページ */
  noindex?: boolean;
};

/** 全ページ共通の metadata の組み立て。title は完成形を渡す（サイト名の付け足しはしない） */
export function buildMetadata(args: BuildArgs): Metadata {
  const url = absoluteUrl(args.path);
  const images = args.ogImage
    ? [{ url: args.ogImage, ...OG_SIZE, alt: args.ogImageAlt ?? args.title }]
    : undefined;

  return {
    title: { absolute: args.title },
    description: args.description,
    keywords: args.keywords,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title: args.title,
      description: args.description,
      url,
      siteName: site.name,
      locale: "ja_JP",
      type: args.type ?? "website",
      // images のキーは、値があるときだけ置く。undefined でもキーがあると、
      // 同じフォルダーの opengraph-image.tsx（記事ごとの OGP 画像）が使われなくなる
      ...(images ? { images } : {}),
      ...(args.type === "article"
        ? { publishedTime: args.publishedTime, modifiedTime: args.modifiedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description: args.description,
      ...(args.ogImage ? { images: [args.ogImage] } : {}),
    },
    // 公開 URL が無い（プレビュー・手元）なら全面的に載せない。本番で個別に外すページは、リンクだけは辿らせる
    robots: !isIndexable
      ? { index: false, follow: false }
      : args.noindex
        ? { index: false, follow: true }
        : undefined,
  };
}

/** 固定ページの metadata（data/pages.ts の登録から作る） */
export function pageMetadata(page: PageDef): Metadata {
  return buildMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    keywords: [page.primaryKeyword, ...page.secondaryKeywords],
    ogImage: page.ogImage,
    ogImageAlt: `${site.name}｜${page.label}`,
  });
}
