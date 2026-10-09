import { pages } from "@/data/pages";
import { restaurant } from "@/data/restaurant";
import { getAllPosts } from "@/lib/journal";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** 季節の便りの RSS。新しい記事を、検索エンジンや RSS リーダーへ早く知らせるため */
export function GET() {
  const posts = getAllPosts().slice(0, 30);
  const home = absoluteUrl("/") ?? "/";
  const self = absoluteUrl("/journal/feed.xml") ?? "/journal/feed.xml";

  const items = posts
    .map((p) => {
      const url = absoluteUrl(`/journal/${p.slug}`) ?? `/journal/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${p.date}T09:00:00+09:00`).toUTCString()}</pubDate>
      <description>${esc(p.summary)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${pages.journal.label}｜${restaurant.name}`)}</title>
    <link>${home}</link>
    <description>${esc(pages.journal.description)}</description>
    <language>ja</language>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
