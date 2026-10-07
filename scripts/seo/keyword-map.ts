/**
 * サイト全体のキーワードマップを出す。
 *   npm run seo:map            … 画面に表示
 *   npm run seo:map -- --write … docs/KEYWORD_MAP.md に書き出す
 *
 * 正本は data/pages.ts（固定ページ）、content/journal の frontmatter（記事）、data/journal-topics.ts（これから書く題材）。
 * この表は、そこから作る「読むための写し」。直すときは正本を直す。
 */
import fs from "node:fs";
import path from "node:path";
import { categoryBySlug } from "../../data/journal-categories";
import { topics } from "../../data/journal-topics";
import { pageList } from "../../data/pages";
import { loadPosts, todayJst } from "../../lib/journal-core";

const posts = loadPosts();
const usedTopicIds = new Set([...posts.map((p) => p.topicId), ...posts.map((p) => p.slug)]);
const lines: string[] = [];
const out = (s = "") => lines.push(s);

out("# キーワードマップ");
out();
out(`${todayJst()} 時点。\`npm run seo:map -- --write\` で作り直せます。`);
out();
out("1ページ・1記事につき、担当する検索語は1つ。同じ語を2か所に持たせません（`npm run seo:audit` が確かめます）。");
out();
out("## 固定ページ");
out();
out("| ページ | 担当する検索語 | あわせて拾う語 | 検索意図 |");
out("| --- | --- | --- | --- |");
for (const p of pageList) {
  out(`| \`${p.path}\` ${p.label} | **${p.primaryKeyword}** | ${p.secondaryKeywords.join("、")} | ${p.intent} |`);
}
out();
out(`## 記事（公開済み ${posts.length} 本）`);
out();
out("| 記事 | 分類 | 担当する検索語 | 支える固定ページ | 公開日 |");
out("| --- | --- | --- | --- | --- |");
for (const p of posts) {
  out(`| \`/journal/${p.slug}\` ${p.title} | ${categoryBySlug(p.category)?.name ?? p.category} | **${p.primaryKeyword}** | \`${p.pillar}\` | ${p.date} |`);
}
out();
const rest = topics.filter((t) => !usedTopicIds.has(t.id));
out(`## これから書く題材（残り ${rest.length} 本）`);
out();
out("| 題材 | 分類 | 担当する検索語 | 出す月 |");
out("| --- | --- | --- | --- |");
for (const t of rest) {
  out(`| \`${t.id}\` | ${categoryBySlug(t.category)?.name ?? t.category} | ${t.primaryKeyword} | ${t.months ? t.months.join("・") + "月" : "通年"} |`);
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
