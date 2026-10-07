import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { pages } from "@/data/pages";
import { site } from "@/data/site";
import { isIndexable, SITE_URL } from "@/lib/seo";
import "./globals.css";

/**
 * 欧文だけの書体（小さなラベルと、料金の数字に使う）。
 * 和文は端末の明朝を使い、Webフォントは読み込まない（日本語フォントは表示を大きく遅らせるため）。
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  // 太さは1つだけ（ファイルを1つにするため）
  weight: ["500"],
  display: "swap",
  variable: "--font-cormorant",
  // 先読みはしない。最初の画面でいちばん大切なのは写真なので、回線をそちらに譲る
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: { absolute: pages.home.title },
  description: pages.home.description,
  applicationName: site.name,
  formatDetection: { telephone: false, address: false, email: false },
  verification: { google: site.googleSiteVerification },
  robots: isIndexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

/**
 * 画面に入った要素をゆっくり現すための小さなスクリプト（components/ui/Reveal.tsx と対）。
 * - html に .js を付ける。付いたときだけ、CSS が [data-reveal] をいったん隠す（JS が無ければ最初から見える）
 * - ページ移動で後から入る要素も MutationObserver で拾う
 */
const REVEAL_SCRIPT = `(function(){var d=document,h=d.documentElement;if(!('IntersectionObserver'in window)||!('MutationObserver'in window))return;h.classList.add('js');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px',threshold:0.05});function scan(r){if(r.nodeType!==1)return;if(r.hasAttribute('data-reveal'))io.observe(r);var l=r.querySelectorAll('[data-reveal]');for(var i=0;i<l.length;i++)io.observe(l[i])}new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var a=ms[i].addedNodes;for(var j=0;j<a.length;j++)scan(a[j])}}).observe(h,{childList:true,subtree:true})})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={cormorant.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
