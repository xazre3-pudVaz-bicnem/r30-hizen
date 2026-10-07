import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexable, SITE_URL } from "@/lib/seo";

/**
 * robots.txt。
 * 公開 URL が決まっている環境（本番）だけ、全ページのクロールを許可して sitemap を知らせる。
 * プレビュー・手元では全面的に拒否する。
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
