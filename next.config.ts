import type { NextConfig } from "next";

/**
 * 本番の URL（canonical・OGP・sitemap・構造化データの向き先）。ドメインを変えるときは、ここだけを直す。
 *
 * 本番ドメインは www.hizen-susukino.jp（2026-10-09 に確認）。
 * Vercel では www ありが主で、www なし（hizen-susukino.jp）は www ありへ転送される。
 *
 * 旧サイトのドメイン（hizen-susukino.com）ではない。新しいサイトは、別のドメインで公開している。
 * 以前はここが旧ドメインになっていて、本番の canonical・OGP・sitemap がすべて旧サイトを指していた。
 */
export const PRODUCTION_URL = "https://www.hizen-susukino.jp";

/**
 * canonical・OGP・sitemap・構造化データに使う URL。
 * - Vercel の本番デプロイでは、環境変数を入れなくても PRODUCTION_URL になる
 * - プレビューと手元では空のまま。空の間は canonical も sitemap も出さず、noindex にする
 *   （プレビューの URL が検索結果に出るのを防ぐ）
 * - 手元で本番と同じ出力を確かめたいときだけ NEXT_PUBLIC_SITE_URL を指定する
 *   （Vercel の環境変数に NEXT_PUBLIC_SITE_URL を入れると、そちらが優先される。入れるなら本番ドメインと同じ値に）
 */
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_ENV === "production" ? PRODUCTION_URL : "")
).replace(/\/+$/, "");

/**
 * Vercel の本番ビルドで、canonical の向き先が「このプロジェクトにつないである本番ドメイン」と違っていたら知らせる。
 * 違ったまま公開すると、検索エンジンに「正しい URL はよそのドメインにある」と伝えてしまう。
 * VERCEL_PROJECT_PRODUCTION_URL は Vercel が入れる値（つないである本番ドメインのうち、いちばん短いもの）。
 * www の有無は同じドメインとして比べる。ビルドは止めない（ドメインを足しただけで公開が止まらないように）。
 */
const withoutWww = (host: string) => host.replace(/^www\./, "");
const connectedDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
if (process.env.VERCEL_ENV === "production" && siteUrl && connectedDomain && !connectedDomain.endsWith(".vercel.app")) {
  if (withoutWww(new URL(siteUrl).host) !== withoutWww(connectedDomain)) {
    console.warn(
      `\n[注意] canonical の向き先（${siteUrl}）が、Vercel につないである本番ドメイン（${connectedDomain}）と違います。` +
        `next.config.ts の PRODUCTION_URL を確かめてください。\n`,
    );
  }
}

/**
 * 旧サイト（静的 HTML）の URL → 新しいページ。301 で恒久転送し、検索結果・被リンク・ブックマークを引き継ぐ。
 * すべてをトップへ送らず、内容がいちばん近いページへ送る。
 *
 * 出どころ
 *   現行の旧サイト（2026-10-07 時点で 200 を返していた URL と、その sitemap.xml）
 *   Wayback Machine に残る移転前（2022年〜）の URL … menu / policy / contact
 *
 * scripts/check-site.ts が、ここにある全行の転送先とステータスを確かめる。
 */
export const LEGACY_REDIRECTS: [source: string, destination: string][] = [
  ["/index.html", "/"],
  ["/concept.html", "/concept"],
  // 旧「こだわり」（創作和食・空間・握りへの考え方）
  ["/policy.html", "/concept"],
  ["/course.html", "/omakase"],
  // 旧「コースメニュー」
  ["/menu.html", "/omakase"],
  // 旧 sitemap.xml にだけ載っていたページ（中身はコース）
  ["/lunch.html", "/omakase"],
  ["/drink.html", "/drink"],
  ["/gallery.html", "/cuisine"],
  ["/access.html", "/access"],
  // 旧「お問い合わせ」（電話番号の案内だけのページ）
  ["/contact.html", "/reservation"],
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  poweredByHeader: false,
  // 親フォルダーに別の package-lock.json があっても、このフォルダーを起点にする
  turbopack: { root: process.cwd() },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    // 写真はファイル名に内容のハッシュが付くので、長く持たせてよい
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // *.vercel.app で配信される分は、設定に関係なく検索エンジンに載せない
        source: "/:path*",
        has: [{ type: "host", value: "(?<sub>.*)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return LEGACY_REDIRECTS.map(([source, destination]) => ({ source, destination, statusCode: 301 as const }));
  },
};

export default nextConfig;
