/**
 * サイト全体の検索意図マップ（キーワードマップ）を出す。
 *   npm run seo:map            … 画面に表示
 *   npm run seo:map -- --write … docs/KEYWORD_MAP.md に書き出す
 *
 * 正本は data/pages.ts（固定ページ）、content/journal の frontmatter（記事）、data/journal-topics.ts（これから書く題材）、
 * data/shop-notes.ts（店からのメモ）。この表は、そこから作る「読むための写し」。直すときは正本を直す。
 */
import fs from "node:fs";
import path from "node:path";
import { categoryBySlug } from "../../data/journal-categories";
import { topics } from "../../data/journal-topics";
import { headerNav, pageList, pages } from "../../data/pages";
import { shopNotes } from "../../data/shop-notes";
import { loadPosts, todayJst } from "../../lib/journal-core";
import { tierOfPost } from "../journal/lib/select";

const posts = loadPosts();
const usedTopicIds = new Set([...posts.map((p) => p.topicId), ...posts.map((p) => p.slug)]);
const inNav = new Set(headerNav.map((n) => pages[n.key].path));
const lines: string[] = [];
const out = (s = "") => lines.push(s);
const cell = (s: string) => s.replace(/\|/g, "｜");

out("# 検索意図マップ（キーワードマップ）");
out();
out(`${todayJst()} 時点。\`npm run seo:map -- --write\` で作り直せます。`);
out();
out("1ページ・1記事につき、担当する検索語は1つ。同じ語を2か所に持たせません。");
out("重なると、`next dev`／`next build` のときに警告が出て、`npm run seo:audit`（= `npm run check`・毎日の自動投稿の前）が止めます。");
out("「あわせて拾う語」は、ほかのページの担当語と重なってかまいません（そのページへリンクで送ります）。");
out();
out("## 固定ページ");
out();
out("「メニュー」が ○ のページだけ、ヘッダーのメニューに出しています。ほかのページは、本文中のリンク・フッター・パンくず・季節の便りからたどります。");
out();
out("| ページ | メニュー | 担当する検索語 | あわせて拾う語 | 検索意図 | ここでは書かないこと |");
out("| --- | --- | --- | --- | --- | --- |");
for (const p of pageList) {
  const nav = inNav.has(p.path) ? "○" : p.path === pages.reservation.path ? "○（ご予約）" : "—";
  out(`| \`${p.path}\` ${p.label} | ${nav} | **${p.primaryKeyword}** | ${p.secondaryKeywords.join("、")} | ${cell(p.intent)} | ${cell(p.notHere)} |`);
}
out();
out(`## 記事（公開済み ${posts.length} 本）`);
out();
out("優先度: A＝この店にしか書けない話／B＝すすきのでの場面／C＝鮨と酒の一般知識");
out();
out("| 記事 | 分類 | 優先度 | 担当する検索語 | 答えている問い | 支える固定ページ | 公開日 |");
out("| --- | --- | --- | --- | --- | --- | --- |");
for (const p of posts) {
  out(
    `| \`/journal/${p.slug}\` ${cell(p.title)} | ${categoryBySlug(p.category)?.name ?? p.category} | ${tierOfPost(p)} | **${p.primaryKeyword}** | ${cell(p.semanticTopic ?? "")} | \`${p.pillar}\` | ${p.date} |`,
  );
}
out();
out(`## 店からのメモ（${shopNotes.length} 件）`);
out();
out("`data/shop-notes.ts`。店から聞き取った一次情報。まだ記事にしていないメモがあれば、ほかの題材より先に書きます。");
out();
if (shopNotes.length === 0) {
  out("いまは空です。");
} else {
  out("| メモ | 種類 | 題材 | 担当する検索語 | 期限 | 記事 |");
  out("| --- | --- | --- | --- | --- | --- |");
  for (const n of shopNotes) {
    out(`| \`${n.id}\` | ${n.kind} | ${cell(n.subject)} | ${n.primaryKeyword} | ${n.until ?? "なし"} | ${usedTopicIds.has(n.id) ? "公開済み" : "未"} |`);
  }
}
out();
const rest = topics.filter((t) => !usedTopicIds.has(t.id));
const count = (tier: string) => rest.filter((t) => t.tier === tier).length;
out(`## これから書く題材（残り ${rest.length} 本：A ${count("A")}／B ${count("B")}／C ${count("C")}）`);
out();
out("| 題材 | 分類 | 優先度 | 担当する検索語 | 出す月 |");
out("| --- | --- | --- | --- | --- |");
for (const t of rest) {
  out(`| \`${t.id}\` | ${categoryBySlug(t.category)?.name ?? t.category} | ${t.tier} | ${t.primaryKeyword} | ${t.months ? t.months.join("・") + "月" : "通年"} |`);
}
out();

const text = lines.join("\n");
if (process.argv.includes("--write")) {
  const file = path.join(process.cwd(), "docs", "KEYWORD_MAP.md");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, "utf8");
  console.log(`書き出しました: docs/KEYWORD_MAP.md（固定 ${pageList.length}／記事 ${posts.length}／残りの題材 ${rest.length}）`);
} else {
  console.log(text);
}
