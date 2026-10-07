/**
 * サイトの設計上の決まりを、データの段階で確かめる（ビルド前でも走る）。
 *   npm run seo:audit
 *
 * ・検索語の食い合い（固定ページどうし／固定ページと記事／記事どうし）
 * ・title・description の重複と長さ
 * ・固定ページの登録と、実際のページファイルの対応
 * ・記事の「柱のページ」「見出し写真」の実在
 * ・店舗情報の一元管理（ページのファイルに、住所や電話番号・料金が直接書かれていないか）
 *
 * ビルド後の HTML を見る点検（canonical・JSON-LD・h1 の数など）は scripts/check-site.mjs。
 */
import fs from "node:fs";
import path from "node:path";
import { courses } from "../../data/courses";
import { categoryBySlug } from "../../data/journal-categories";
import { linkablePages, pageList, pages } from "../../data/pages";
import { site } from "../../data/site";
import { loadPosts } from "../../lib/journal-core";
import { keywordKey } from "../journal/lib/text";

let failures = 0;
const ok = (name: string) => console.log(`  ok   ${name}`);
const ng = (name: string, detail: string) => {
  failures++;
  console.log(`  NG   ${name}\n         ${detail}`);
};
const check = (name: string, problems: string[]) => (problems.length ? ng(name, problems.join("\n         ")) : ok(name));

const posts = loadPosts();
const len = (s: string) => [...s].length;

function duplicates<T>(items: T[], key: (x: T) => string, label: (x: T) => string): string[] {
  const seen = new Map<string, string>();
  const out: string[] = [];
  for (const it of items) {
    const k = key(it);
    if (seen.has(k)) out.push(`${seen.get(k)} と ${label(it)} が同じ（${k}）`);
    else seen.set(k, label(it));
  }
  return out;
}

console.log("\n検索語（1ページ1語・食い合いなし）");
const entries = [
  ...pageList.map((p) => ({ where: p.path, keyword: p.primaryKeyword })),
  ...posts.map((p) => ({ where: `/journal/${p.slug}`, keyword: p.primaryKeyword })),
];
check("担当する検索語が重なっていない", duplicates(entries, (e) => keywordKey(e.keyword), (e) => e.where));

console.log("\ntitle・description");
const metas = [
  ...pageList.map((p) => ({ where: p.path, title: p.title, description: p.description })),
  ...posts.map((p) => ({ where: `/journal/${p.slug}`, title: `${p.title}｜${site.name}`, description: p.description })),
];
check("title が重なっていない", duplicates(metas, (m) => m.title, (m) => m.where));
check("description が重なっていない", duplicates(metas, (m) => m.description, (m) => m.where));
check(
  "description は 60〜120 字",
  metas.filter((m) => len(m.description) < 60 || len(m.description) > 120).map((m) => `${m.where}: ${len(m.description)}字`),
);
check(
  "title は 15〜48 字",
  metas.filter((m) => len(m.title) < 15 || len(m.title) > 48).map((m) => `${m.where}: ${len(m.title)}字「${m.title}」`),
);
check(
  "固定ページの title に店名が入っている",
  pageList.filter((p) => !p.title.includes(site.name)).map((p) => p.path),
);

console.log("\n固定ページの登録");
const appDir = path.join(process.cwd(), "app");
const routeFile = (p: string) =>
  p === "/" ? path.join(appDir, "(home)", "page.tsx") : path.join(appDir, "(pages)", ...p.slice(1).split("/"), "page.tsx");
check("登録したページのファイルがある", pageList.filter((p) => !fs.existsSync(routeFile(p.path))).map((p) => p.path));
check("パスが重なっていない", duplicates(pageList, (p) => p.path, (p) => p.label));
check(
  "OGP 画像がある",
  pageList.filter((p) => !fs.existsSync(path.join(process.cwd(), "public", p.ogImage))).map((p) => `${p.path}: ${p.ogImage}`),
);

console.log("\n記事");
const fixedPaths = new Set(linkablePages.map((k) => pages[k].path));
check("柱のページが実在する", posts.filter((p) => !fixedPaths.has(p.pillar)).map((p) => `${p.slug}: ${p.pillar}`));
check("分類が登録にある", posts.filter((p) => !categoryBySlug(p.category)).map((p) => `${p.slug}: ${p.category}`));
check(
  "見出し写真（OGP 用の切り出し）がある",
  posts
    .filter((p) => !fs.existsSync(path.join(process.cwd(), "assets", "og-photos", `${p.photo}.jpg`)))
    .map((p) => `${p.slug}: ${p.photo}`),
);

console.log("\n店舗情報の一元管理");
// ページや部品のファイルに、住所・電話番号・料金を直接書いていないか（data/ から参照するのが決まり）
const NAP_LITERALS = [site.tel.display, site.address.street, site.address.buildingName, site.address.postalCode, ...courses.map((c) => c.price.toLocaleString("ja-JP"))];
const offenders: string[] = [];
function walk(dir: string) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.(tsx?|css)$/.test(name)) {
      const src = fs.readFileSync(full, "utf8");
      for (const lit of NAP_LITERALS) {
        if (src.includes(lit)) offenders.push(`${path.relative(process.cwd(), full)} に「${lit}」が直接書かれている`);
      }
      if (/南5条|南五条|Nスター/.test(src)) offenders.push(`${path.relative(process.cwd(), full)} に移転前の住所がある`);
    }
  }
}
for (const d of ["app", "components", "lib"]) walk(path.join(process.cwd(), d));
check("住所・電話番号・料金が、ページに直接書かれていない", offenders);

console.log(failures === 0 ? "\nすべて通りました。" : `\n${failures} 件の不備があります。`);
if (failures > 0) process.exit(1);
