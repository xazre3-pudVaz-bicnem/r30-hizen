import type { NextConfig } from "next";

/**
 * 本番の URL。
 * 旧サイトと同じく www なしで公開する（www.hizen-susukino.com は名前解決されない。2026-10-07 確認）。
 * Vercel でドメインをつなぐときは、hizen-susukino.com を主にし、www を足す場合は www → なし へ転送する。
 */
const PRODUCTION_URL = "https://hizen-susukino.com";

/**
 * canonical・OGP・sitemap・構造化データに使う URL。
 * - Vercel の本番デプロイでは、環境変数を入れなくても PRODUCTION_URL になる
 * - プレビューと手元では空のまま。空の間は canonical も sitemap も出さず、noindex にする
 *   （プレビューの URL が検索結果に出るのを防ぐ）
 * - 手元で本番と同じ出力を確かめたいときだけ NEXT_PUBLIC_SITE_URL を指定する
 */
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_ENV === "production" ? PRODUCTION_URL : "")
).replace(/\/+$/, "");

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
    // 旧サイト（静的 HTML）の URL を、新しいページへ恒久転送する。検索結果とブックマークを引き継ぐため。
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/concept.html", destination: "/concept", permanent: true },
      { source: "/course.html", destination: "/omakase", permanent: true },
      { source: "/lunch.html", destination: "/omakase", permanent: true },
      { source: "/drink.html", destination: "/drink", permanent: true },
      { source: "/gallery.html", destination: "/cuisine", permanent: true },
      { source: "/access.html", destination: "/access", permanent: true },
    ];
  },
};

export default nextConfig;
