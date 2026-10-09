import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { pages } from "@/data/pages";
import { restaurant } from "@/data/restaurant";
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
  applicationName: restaurant.name,
  formatDetection: { telephone: false, address: false, email: false },
  verification: { google: restaurant.googleSiteVerification },
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

/**
 * 最初の表示のあいだだけ、画面の外の区画の描画を後回しにする（globals.css の html[data-cv] と対）。
 *
 * 1. 初めて開いたとき（再読み込み・「戻る」・# 付きの URL ではないとき）だけ、html に data-cv を付ける。
 *    再読み込みや「戻る」では付けない。付けると、ブラウザが元の位置へ戻したときに、
 *    描く前の区画の仮の高さのせいで、見ていた場所から数百px ずれるため。
 * 2. 読み込みが済んだら、手の空いたときに1区画ずつ data-cv-done を付けて、通常の描画に戻していく
 *    （まとめて戻すと、その1回が長い処理になる）。全部済んだら data-cv を外す。
 * 3. 戻し終わる前に、位置が大きく動く操作（ページ内リンク・「戻る」・キー操作）があったら、その場で全部外す。
 *
 * JavaScript が無ければ何も付かず、最初からすべて描かれる。
 */
const CV_SCRIPT = `(function(){var d=document,h=d.documentElement,w=window;try{var n=performance.getEntriesByType('navigation')[0];if(!n||(n.type!=='navigate'&&n.type!=='prerender')||location.hash)return}catch(e){return}if(!w.requestAnimationFrame)return;h.setAttribute('data-cv','');var S='.section:not(.no-cv):not([data-cv-done]),.section-tight:not(.no-cv):not([data-cv-done]),.prose>section:not([data-cv-done])',stop=false;function off(){if(stop)return;stop=true;h.removeAttribute('data-cv')}function step(){if(stop)return;var el=d.querySelector(S);if(!el){off();return}el.setAttribute('data-cv-done','');next()}function next(){if(w.requestIdleCallback)w.requestIdleCallback(step,{timeout:600});else w.requestAnimationFrame(function(){setTimeout(step,0)})}function start(){w.requestAnimationFrame(function(){setTimeout(next,0)})}if(d.readyState==='complete')start();else w.addEventListener('load',start,{once:true});w.addEventListener('popstate',off);w.addEventListener('hashchange',off);w.addEventListener('keydown',off,true);w.addEventListener('click',function(e){var t=e.target;if(t&&t.closest&&t.closest('a[href*="#"]'))off()},true)})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={cormorant.variable} suppressHydrationWarning>
      <body>
        {/* 2つは別々の script にする（片方で例外が出ても、もう片方は動くように） */}
        <script dangerouslySetInnerHTML={{ __html: CV_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
