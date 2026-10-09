/**
 * サイトの設計上の決まりを、データの段階で確かめる（ビルド前でも走る）。
 *   npm run seo:audit
 *
 * ・検索意図マップ（固定ページどうし／固定ページと記事／記事どうしで、担当する検索語が重なっていないか）
 * ・title・description の重複と長さ
 * ・固定ページの登録と、実際のページファイルの対応
 * ・ヘッダーのメニュー（店の案内の6つだけ。場面別のページを足していないか）
 * ・記事の「柱のページ」「見出し写真」の実在
 * ・店舗情報の一元管理（住所・電話番号・料金・時刻・人数などを、data/restaurant.ts 以外に直接書いていないか）
 * ・店名・住所・電話番号・営業時間が、Google ビジネスプロフィールの登録と食い違っていないか
 *
 * ビルド後の HTML を見る点検（canonical・JSON-LD・h1 の数など）は scripts/check-site.ts。
 */
import fs from "node:fs";
import path from "node:path";
import { categoryBySlug } from "../../data/journal-categories";
import { footerNav, headerNav, intentConflicts, linkablePages, pageList, pages, type PageKey } from "../../data/pages";
import { addressLine, agePolicy, alternateNames, courses, postalLine, restaurant } from "../../data/restaurant";
import { loadPosts } from "../../lib/journal-core";
import { findKeywordConflicts } from "../../lib/keywords";
import { PRODUCTION_URL } from "../../next.config";

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

// ---------------------------------------------------------------------------
console.log("\n検索意図マップ（1ページ1語・食い合いなし）");
check(
  "固定ページどうしで、担当する検索語が重なっていない",
  intentConflicts.map((c) => `${c.first.where}（${c.first.keyword}）と ${c.second.where}（${c.second.keyword}）`),
);
const allOwners = [
  ...pageList.map((p) => ({ where: p.path, keyword: p.primaryKeyword })),
  ...posts.map((p) => ({ where: `/journal/${p.slug}`, keyword: p.primaryKeyword })),
];
check(
  "固定ページと記事・記事どうしで、担当する検索語が重なっていない",
  findKeywordConflicts(allOwners).map((c) => `${c.first.where}（${c.first.keyword}）と ${c.second.where}（${c.second.keyword}）`),
);
check(
  "トップは「すすきの 寿司」、/susukino-sushi は「すすきの 高級寿司」を担当している",
  [
    ...(pages.home.primaryKeyword === "すすきの 寿司" ? [] : [`トップの担当語: ${pages.home.primaryKeyword}`]),
    ...(pages.susukinoSushi.primaryKeyword === "すすきの 高級寿司" ? [] : [`/susukino-sushi の担当語: ${pages.susukinoSushi.primaryKeyword}`]),
    ...(pages.susukinoSushi.title.includes("高級寿司") ? [] : ["/susukino-sushi の title に「高級寿司」が無い"]),
    ...(pages.home.title.includes("高級") ? ["トップの title に「高級」が入っている（/susukino-sushi の担当）"] : []),
  ],
);

// ---------------------------------------------------------------------------
console.log("\ntitle・description");
const metas = [
  ...pageList.map((p) => ({ where: p.path, title: p.title, description: p.description })),
  ...posts.map((p) => ({ where: `/journal/${p.slug}`, title: `${p.title}｜${restaurant.name}`, description: p.description })),
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
  pageList.filter((p) => !p.title.includes(restaurant.name)).map((p) => p.path),
);
check("関連リンクに添える一文（teaser）が全ページにある", pageList.filter((p) => !p.teaser.trim()).map((p) => p.path));

// ---------------------------------------------------------------------------
console.log("\n固定ページの登録・メニュー");
const appDir = path.join(process.cwd(), "app");
const routeFile = (p: string) =>
  p === "/" ? path.join(appDir, "(home)", "page.tsx") : path.join(appDir, "(pages)", ...p.slice(1).split("/"), "page.tsx");
check("登録したページのファイルがある", pageList.filter((p) => !fs.existsSync(routeFile(p.path))).map((p) => p.path));
check("パスが重なっていない", duplicates(pageList, (p) => p.path, (p) => p.label));
check(
  "OGP 画像がある",
  pageList.filter((p) => !fs.existsSync(path.join(process.cwd(), "public", p.ogImage))).map((p) => `${p.path}: ${p.ogImage}`),
);
// ヘッダーのメニューは、店の案内の6つだけ。場面別・はじめての方へのページを足さない
const NAV_ALLOWED: PageKey[] = ["concept", "cuisine", "omakase", "space", "journal", "access"];
check(
  "ヘッダーのメニューは、店の案内の6つだけ",
  [
    ...headerNav.filter((n) => !NAV_ALLOWED.includes(n.key)).map((n) => `メニューに足されている: ${pages[n.key].path}`),
    ...(headerNav.length === NAV_ALLOWED.length ? [] : [`項目数が ${headerNav.length}`]),
  ],
);
const inFooter = new Set(footerNav.flatMap((g) => g.items));
check(
  "メニューに出していないページは、フッターからたどれる",
  (Object.keys(pages) as PageKey[]).filter((k) => k !== "home" && !inFooter.has(k)).map((k) => pages[k].path),
);

// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
console.log("\n店舗情報の一元管理");
// ページ・部品・指示文に、店の事実を直接書いていないか（data/restaurant.ts から参照するのが決まり）
const { web, sameDayDeadline } = restaurant.reservation;
const LITERALS = [
  restaurant.phone.display,
  restaurant.address.street,
  restaurant.address.buildingName,
  restaurant.address.postalCode,
  ...courses.map((c) => c.price.toLocaleString("ja-JP")),
  ...courses.map((c) => String(c.price)),
  `${agePolicy.minAge}歳`,
  restaurant.hours.opens,
  restaurant.hours.closes,
  sameDayDeadline,
  restaurant.access.primary.walk,
  `${web.partySize}名様`,
  `${web.partySize + 1}名様`,
  `${restaurant.seats.charterMax}名`,
  restaurant.reservation.web.url,
];
const FORMER_ADDRESS = new RegExp(restaurant.legacy.formerAddressPatterns.join("|"));
/** コメントを外す（説明のために値を書いているコメントは対象にしない） */
const withoutComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
const offenders: string[] = [];
const SKIP = new Set([path.join("data", "restaurant.ts"), path.join("scripts", "journal", "selftest.ts")]);
function walk(dir: string) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(process.cwd(), full);
    if (fs.statSync(full).isDirectory()) {
      if (name !== "fixtures") walk(full);
    } else if (/\.(tsx?|css|mjs)$/.test(name) && !SKIP.has(rel)) {
      const raw = fs.readFileSync(full, "utf8");
      const src = withoutComments(raw);
      for (const lit of LITERALS) {
        if (src.includes(lit)) offenders.push(`${rel} に「${lit}」が直接書かれている`);
      }
      if (FORMER_ADDRESS.test(raw)) offenders.push(`${rel} に移転前の住所がある`);
    }
  }
}
for (const d of ["app", "components", "lib", "data", path.join("scripts", "journal"), path.join("scripts", "seo")]) walk(path.join(process.cwd(), d));
check("住所・電話番号・料金・時刻・人数が、data/restaurant.ts 以外に直接書かれていない", offenders);

// ---------------------------------------------------------------------------
console.log("\nGoogle ビジネスプロフィールとの一致（NAP）");
/** 全角・半角、ハイフンの種類、スペースの違いを吸収する */
const fold = (s: string) => s.normalize("NFKC").replace(/[‐‑‒–—―−ー-]/g, "-").replace(/\s+/g, "");
const gbp = restaurant.googleBusinessProfile;
// 店名は「まったく同じ」か「サイトの店名＋地名などの添え書き」までを通す（例：R-30 hizen ／ R-30 hizen すすきの店）。
// 添え書きがある場合は、構造化データの alternateName に GBP の名前が入っていることも確かめる。
const sameName = fold(gbp.name) === fold(restaurant.name);
const suffixed = !sameName && fold(gbp.name).startsWith(fold(restaurant.name));
check("店名が同じ（または、サイトの店名に添え書きが付いただけ）", sameName || suffixed ? [] : [`サイト「${restaurant.name}」／GBP「${gbp.name}」`]);
if (suffixed) {
  check(`GBP の店名「${gbp.name}」が、構造化データの alternateName に入っている`, alternateNames.includes(gbp.name) ? [] : [`alternateName: ${JSON.stringify(alternateNames)}`]);
  console.log(`       メモ: GBP の店名は「${gbp.name}」、サイトは「${restaurant.name}」。そろえるかどうかは docs/TODO.md の C を参照`);
}
check(
  "住所が同じ（表記の全角・半角・スペースは同じものとして比べる）",
  fold(gbp.address) === fold(`${postalLine} ${addressLine}`) ? [] : [`サイト「${postalLine} ${addressLine}」／GBP「${gbp.address}」`],
);
check("電話番号が同じ", fold(gbp.phone) === fold(restaurant.phone.display) ? [] : [`サイト「${restaurant.phone.display}」／GBP「${gbp.phone}」`]);
check(
  "営業時間が同じ",
  gbp.opens === restaurant.hours.opens && gbp.closes === restaurant.hours.closes ? [] : [`サイト ${restaurant.hours.opens}〜${restaurant.hours.closes}／GBP ${gbp.opens}〜${gbp.closes}`],
);
// GBP に登録の Web サイト：本番のドメインか、旧サイトのドメインであること。どちらでもなければ落とす。
// 旧サイトは残したまま運用する方針なので、旧サイトを指しているあいだは、落とさずにメモを出す
// （どちらを載せるかを決めるのは店舗。docs/TODO.md の F）。
const domainOf = (u: string) => new URL(u).host.replace(/^www\./, "");
const gbpDomain = domainOf(gbp.website);
const onProduction = gbpDomain === domainOf(PRODUCTION_URL);
const onFormerSite = gbpDomain === domainOf(restaurant.legacy.formerSiteUrl);
check(
  "GBP に登録の Web サイトが、本番のドメイン（または、まだ旧サイトのドメイン）",
  onProduction || onFormerSite ? [] : [`GBP「${gbp.website}」／本番 ${PRODUCTION_URL}`],
);
if (!onProduction && onFormerSite) {
  console.log(`       メモ: GBP の Web サイトは旧サイト（${gbp.website}）を指している。本番（${PRODUCTION_URL}）に替えるかどうかは docs/TODO.md の F を参照`);
}

console.log(failures === 0 ? "\nすべて通りました。" : `\n${failures} 件の不備があります。`);
if (failures > 0) process.exit(1);
