/**
 * ビルドしたサイトを、動いているサーバーに対して点検する（JS を実行しない、生の HTML を見る）。
 *
 *   1) NEXT_PUBLIC_SITE_URL=https://hizen-susukino.com npm run build
 *   2) npx next start -p 4318
 *   3) npm run site:check                 （既定は http://localhost:4318）
 *      BASE=http://localhost:3000 npm run site:check
 *
 * 見ていること
 *   ・全ページが 200／内部リンク切れ・旧 URL の転送・404
 *   ・h1 が1つで <main> の中にある／見出しの階層
 *   ・title・description・canonical・OGP（重複なし）
 *   ・JSON-LD が読めて、店舗の住所・電話番号が data/site.ts と一致する
 *   ・移転前の住所が、どのページにも残っていない
 *   ・画像の alt／ヒーローに行動を促すリンクやボタンが無い
 *   ・robots.txt／sitemap.xml／*.vercel.app では noindex
 */
import http from "node:http";
import { journalCategories, MIN_POSTS_TO_INDEX } from "../data/journal-categories";
import { pageList } from "../data/pages";
import { addressLine, postalLine, site, streetLine } from "../data/site";
import { loadPosts } from "../lib/journal-core";

const BASE = (process.env.BASE || "http://localhost:4318").replace(/\/$/, "");
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hizen-susukino.com").replace(/\/$/, "");

let failures = 0;
const notes: string[] = [];
const ok = (name: string) => console.log(`  ok   ${name}`);
const ng = (name: string, detail: string[]) => {
  failures++;
  console.log(`  NG   ${name}`);
  for (const d of detail.slice(0, 12)) console.log(`         ${d}`);
  if (detail.length > 12) console.log(`         …ほか ${detail.length - 12} 件`);
};
const check = (name: string, problems: string[]) => (problems.length ? ng(name, problems) : ok(name));

const strip = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
const textOf = (html: string) => strip(html).replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, "");
const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

async function get(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual", ...init });
  return { status: res.status, headers: res.headers, body: res.status < 300 || res.status >= 400 ? await res.text() : "" };
}

/** Host ヘッダーを差し替えて HEAD で叩く（fetch では Host を変えられないため） */
function headWithHost(host: string): Promise<http.IncomingHttpHeaders> {
  const url = new URL(BASE);
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: url.hostname, port: url.port || 80, path: "/", method: "HEAD", headers: { Host: host } },
      (res) => {
        res.resume();
        resolve(res.headers);
      },
    );
    req.on("error", reject);
    req.end();
  });
}

type PageInfo = {
  path: string;
  html: string;
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
};

async function main() {
  console.log(`サイト点検 — ${BASE}（公開 URL: ${SITE_URL}）`);

  // ---- 対象のページ --------------------------------------------------------
  const posts = loadPosts();
  const expected = [
    ...pageList.map((p) => p.path),
    ...posts.map((p) => `/journal/${p.slug}`),
    ...journalCategories.filter((c) => posts.some((p) => p.category === c.slug)).map((c) => `/journal/category/${c.slug}`),
  ];
  const noindexExpected = new Set(
    journalCategories
      .filter((c) => posts.filter((p) => p.category === c.slug).length < MIN_POSTS_TO_INDEX)
      .map((c) => `/journal/category/${c.slug}`),
  );

  const infos: PageInfo[] = [];
  const bad: string[] = [];
  for (const path of expected) {
    const r = await get(path);
    if (r.status !== 200) {
      bad.push(`${path} → ${r.status}`);
      continue;
    }
    const head = r.body.slice(0, r.body.indexOf("</head>"));
    infos.push({
      path,
      html: r.body,
      title: decode(head.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""),
      description: decode(attr(head.match(/<meta name="description"[^>]*>/)?.[0] ?? "", "content") ?? ""),
      canonical: attr(head.match(/<link rel="canonical"[^>]*>/)?.[0] ?? "", "href"),
      robots: attr(head.match(/<meta name="robots"[^>]*>/)?.[0] ?? "", "content"),
    });
  }
  console.log(`\nページ（${expected.length}）`);
  check("すべて 200 で返る", bad);

  // ---- 見出し --------------------------------------------------------------
  console.log("\n見出し");
  const h1Problems: string[] = [];
  const orderProblems: string[] = [];
  for (const p of infos) {
    const main = p.html.match(/<main[\s\S]*<\/main>/)?.[0] ?? "";
    const all = (strip(p.html).match(/<h1[\s>]/g) ?? []).length;
    const inMain = (strip(main).match(/<h1[\s>]/g) ?? []).length;
    if (all !== 1 || inMain !== 1) h1Problems.push(`${p.path}: h1 が ${all} 個（main の中に ${inMain} 個）`);
    let prev = 0;
    for (const m of strip(main).matchAll(/<h([1-6])[\s>]/g)) {
      const level = Number(m[1]);
      if (prev && level > prev + 1) {
        orderProblems.push(`${p.path}: h${prev} の次が h${level}`);
        break;
      }
      prev = level;
    }
  }
  check("h1 は各ページに1つ、<main> の中", h1Problems);
  check("見出しの階層が飛んでいない", orderProblems);
  check(
    "本文が HTML の中にある（遅延差し込みになっていない）",
    infos.filter((p) => /<template id="B:|<div hidden id="S:/.test(p.html)).map((p) => p.path),
  );

  // ---- メタ情報 ------------------------------------------------------------
  console.log("\ntitle・description・canonical・OGP");
  const dup = (key: (p: PageInfo) => string | undefined, label: string) => {
    const seen = new Map<string, string>();
    const out: string[] = [];
    for (const p of infos) {
      const k = key(p);
      if (!k) out.push(`${p.path}: ${label} が無い`);
      else if (seen.has(k)) out.push(`${seen.get(k)} と ${p.path} が同じ`);
      else seen.set(k, p.path);
    }
    return out;
  };
  check("title が全ページにあり、重複しない", dup((p) => p.title, "title"));
  check("description が全ページにあり、重複しない", dup((p) => p.description, "description"));
  check(
    "description は 120 字以内",
    infos.filter((p) => [...(p.description ?? "")].length > 120).map((p) => `${p.path}: ${[...(p.description ?? "")].length}字`),
  );
  check(
    "canonical が自分自身の公開 URL を指す",
    infos
      .filter((p) => p.canonical !== (p.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${p.path}`) && p.canonical !== `${SITE_URL}${p.path === "/" ? "" : p.path}`)
      .map((p) => `${p.path}: ${p.canonical ?? "（無し）"}`),
  );
  check(
    "noindex は、記事の少ない分類ページだけ",
    infos
      .filter((p) => /noindex/.test(p.robots ?? "") !== noindexExpected.has(p.path))
      .map((p) => `${p.path}: robots="${p.robots ?? ""}"`),
  );
  const ogProblems: string[] = [];
  const ogImages = new Set<string>();
  for (const p of infos) {
    for (const prop of ["og:title", "og:description", "og:image", "og:url", "og:site_name", "og:locale"]) {
      const tag = p.html.match(new RegExp(`<meta property="${prop}"[^>]*>`))?.[0];
      if (!tag) ogProblems.push(`${p.path}: ${prop} が無い`);
      else if (prop === "og:image") ogImages.add(attr(tag, "content") ?? "");
    }
    if (!/<meta name="twitter:card" content="summary_large_image"/.test(p.html)) ogProblems.push(`${p.path}: twitter:card が無い`);
  }
  check("OGP が全ページにある", ogProblems);
  const ogBad: string[] = [];
  for (const url of ogImages) {
    const local = decode(url).replace(SITE_URL, "");
    const r = await fetch(`${BASE}${local}`);
    const type = r.headers.get("content-type") ?? "";
    if (r.status !== 200 || !/image\/(jpeg|png)/.test(type)) ogBad.push(`${local} → ${r.status} ${type}`);
    await r.arrayBuffer();
  }
  check(`OGP 画像が実在し、JPEG か PNG（${ogImages.size} 枚）`, ogBad);

  // ---- 構造化データと NAP --------------------------------------------------
  console.log("\n構造化データ・店名／住所／電話番号");
  const ldProblems: string[] = [];
  const types = new Set<string>();
  for (const p of infos) {
    const blocks = [...p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (blocks.length === 0) {
      ldProblems.push(`${p.path}: JSON-LD が無い`);
      continue;
    }
    for (const b of blocks) {
      let data: { "@graph"?: Record<string, unknown>[] };
      try {
        data = JSON.parse(b[1]);
      } catch {
        ldProblems.push(`${p.path}: JSON-LD を解釈できない`);
        continue;
      }
      const graph = data["@graph"] ?? [];
      for (const node of graph) types.add(String(node["@type"]));
      const r = graph.find((n) => n["@type"] === "Restaurant") as Record<string, unknown> | undefined;
      if (!r) {
        ldProblems.push(`${p.path}: Restaurant が無い`);
        continue;
      }
      const a = r.address as Record<string, string>;
      if (r.name !== site.name) ldProblems.push(`${p.path}: name が違う（${r.name}）`);
      if (r.telephone !== site.tel.e164) ldProblems.push(`${p.path}: telephone が違う（${r.telephone}）`);
      if (a?.streetAddress !== streetLine) ldProblems.push(`${p.path}: streetAddress が違う（${a?.streetAddress}）`);
      if (a?.postalCode !== site.address.postalCode) ldProblems.push(`${p.path}: postalCode が違う`);
      if (a?.addressLocality !== site.address.locality || a?.addressRegion !== site.address.region) ldProblems.push(`${p.path}: 市区町村・都道府県が違う`);
      if (!graph.some((n) => n["@type"] === "WebSite")) ldProblems.push(`${p.path}: WebSite が無い`);
      if (p.path !== "/" && !graph.some((n) => n["@type"] === "BreadcrumbList")) ldProblems.push(`${p.path}: BreadcrumbList が無い`);
      if (p.path.startsWith("/journal/") && !p.path.includes("/category/") && !graph.some((n) => n["@type"] === "BlogPosting")) {
        ldProblems.push(`${p.path}: BlogPosting が無い`);
      }
    }
  }
  check("JSON-LD が全ページにあり、店舗の値が data/site.ts と一致する", ldProblems);
  notes.push(`JSON-LD の型: ${[...types].sort().join(", ")}`);

  const napProblems: string[] = [];
  const addressCompact = addressLine.replace(/\s+/g, "");
  for (const p of infos) {
    const t = textOf(p.html);
    if (!t.includes(site.name.replace(/\s+/g, ""))) napProblems.push(`${p.path}: 店名が無い`);
    if (!t.includes(`${site.address.region}${site.address.locality}${site.address.street}`)) napProblems.push(`${p.path}: 住所が無い`);
    if (!t.includes(site.tel.display)) napProblems.push(`${p.path}: 電話番号が無い`);
    // 住所らしい文字列が、正しい表記以外で出ていないか
    for (const m of t.matchAll(/南[0-9０-９一二三四五六七八九]+条西[0-9０-９一二三四五六七八九]+丁目[0-9-]*/g)) {
      if (!addressCompact.includes(m[0]) && m[0] !== site.address.district) napProblems.push(`${p.path}: 住所の表記ゆれ「${m[0]}」`);
    }
    for (const m of t.matchAll(/0\d{1,3}-\d{2,4}-\d{4}/g)) {
      if (m[0] !== site.tel.display) napProblems.push(`${p.path}: 別の電話番号「${m[0]}」`);
    }
  }
  check("店名・住所・電話番号が全ページで同じ表記", napProblems);
  check(
    "移転前の住所が残っていない",
    infos.filter((p) => /南5条|南五条|南５条|Nスター|Ｎスター/.test(p.html)).map((p) => p.path),
  );
  notes.push(`住所の表記: ${postalLine} ${addressLine}／電話: ${site.tel.display}（JSON-LD は ${site.tel.e164}）`);

  // ---- 画像・ヒーロー ------------------------------------------------------
  console.log("\n画像・最初の画面");
  const altProblems: string[] = [];
  for (const p of infos) {
    for (const m of strip(p.html).matchAll(/<img\b[^>]*>/g)) {
      const alt = m[0].match(/\balt="([^"]*)"/);
      if (!alt) altProblems.push(`${p.path}: alt 属性が無い ${m[0].slice(0, 60)}`);
      else if (alt[1].trim() === "" && !/aria-hidden="true"|role="presentation"/.test(m[0])) altProblems.push(`${p.path}: alt が空 ${m[0].slice(0, 60)}`);
      else if (/^(寿司|料理|店内|ドリンク|画像|写真)$/.test(alt[1].trim())) altProblems.push(`${p.path}: alt が一語だけ「${alt[1]}」`);
    }
  }
  check("画像に、内容を表す alt がある", altProblems);

  const home = infos.find((p) => p.path === "/");
  const hero = home?.html.match(/<section[^>]*data-hero[\s\S]*?<\/section>/)?.[0] ?? "";
  check("トップにヒーローがある", hero ? [] : ["data-hero の区画が見つからない"]);
  check(
    "ヒーローに、リンクもボタンも無い（行動を促すものを置かない）",
    [...hero.matchAll(/<(a|button)\b[^>]*>/g)].map((m) => m[0].slice(0, 80)),
  );
  check("ヒーローに YouTube の埋め込みが無い", /youtube|<iframe/i.test(hero) ? ["iframe か YouTube がある"] : []);
  check(
    "どのページも、最初から YouTube・地図の iframe を読み込まない",
    infos.filter((p) => /<iframe/i.test(p.html)).map((p) => p.path),
  );

  // ---- 内部リンク ----------------------------------------------------------
  console.log("\n内部リンク");
  const linkSources = new Map<string, string>();
  for (const p of infos) {
    for (const m of strip(p.html).matchAll(/<a\b[^>]*href="(\/[^"#?]*)[^"]*"/g)) {
      const href = m[1].replace(/\/$/, "") || "/";
      if (!linkSources.has(href)) linkSources.set(href, p.path);
    }
  }
  const broken: string[] = [];
  const known = new Set(infos.map((p) => p.path));
  for (const [href, from] of linkSources) {
    if (known.has(href)) continue;
    const r = await get(href);
    if (r.status !== 200) broken.push(`${href} → ${r.status}（${from} から）`);
  }
  check(`内部リンクがすべて生きている（${linkSources.size} 件）`, broken);
  const orphans = expected.filter((p) => p !== "/" && !linkSources.has(p));
  check("どこからもリンクされていないページが無い", orphans);

  const flow: string[] = [];
  for (const p of infos.filter((x) => x.path.startsWith("/journal/") && !x.path.includes("/category/"))) {
    const main = p.html.match(/<main[\s\S]*<\/main>/)?.[0] ?? "";
    if (!/href="\/reservation"/.test(main) && !/href="tel:/.test(main)) flow.push(`${p.path}: 予約への導線が無い`);
    if (!/href="\/omakase"/.test(main)) flow.push(`${p.path}: コースへの導線が無い`);
    if (!/href="\/access"/.test(main)) flow.push(`${p.path}: アクセスへの導線が無い`);
  }
  check("記事から、コース・アクセス・予約へ進める", flow);

  // ---- robots・sitemap・転送 ----------------------------------------------
  console.log("\nrobots.txt・sitemap.xml・旧 URL");
  const robots = await get("/robots.txt");
  check("robots.txt が全ページを許可し、sitemap を知らせている", [
    ...(/Allow: \//.test(robots.body) ? [] : ["Allow: / が無い"]),
    ...(/Disallow: \/\s*$/m.test(robots.body) ? ["Disallow: / になっている"] : []),
    ...(robots.body.includes(`Sitemap: ${SITE_URL}/sitemap.xml`) ? [] : ["Sitemap の行が無い"]),
  ]);
  const sitemap = await get("/sitemap.xml");
  const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE_URL, "").replace(/\/$/, "") || "/");
  const shouldList = expected.filter((p) => !noindexExpected.has(p));
  check("sitemap.xml に、載せるべきページが全部ある", shouldList.filter((p) => !locs.includes(p)));
  check("sitemap.xml に、noindex のページや存在しないページが無い", locs.filter((p) => !shouldList.includes(p)));

  const redirects: [string, string][] = [
    ["/index.html", "/"],
    ["/concept.html", "/concept"],
    ["/course.html", "/omakase"],
    ["/drink.html", "/drink"],
    ["/gallery.html", "/cuisine"],
    ["/access.html", "/access"],
    ["/lunch.html", "/omakase"],
  ];
  const redirectProblems: string[] = [];
  for (const [from, to] of redirects) {
    const r = await get(from);
    const loc = (r.headers.get("location") ?? "").replace(BASE, "");
    if (r.status !== 308 && r.status !== 301) redirectProblems.push(`${from} → ${r.status}`);
    else if (loc !== to) redirectProblems.push(`${from} → ${loc}（期待 ${to}）`);
  }
  check("旧サイトの URL が、新しいページへ恒久転送される", redirectProblems);

  const nf = await get("/this-page-does-not-exist");
  check("存在しない URL は 404", nf.status === 404 ? [] : [`${nf.status}`]);

  const prod = await headWithHost(new URL(SITE_URL).host);
  check("本番のホストには X-Robots-Tag: noindex が付かない", prod["x-robots-tag"] ? [String(prod["x-robots-tag"])] : []);
  const preview = await headWithHost("hizen-susukino-preview.vercel.app");
  check(
    "*.vercel.app のホストには X-Robots-Tag: noindex が付く",
    /noindex/.test(String(preview["x-robots-tag"] ?? "")) ? [] : [`x-robots-tag: ${preview["x-robots-tag"] ?? "（無し）"}`],
  );

  console.log("\nメモ");
  for (const n of notes) console.log(`  - ${n}`);
  console.log(failures === 0 ? "\nすべて通りました。" : `\n${failures} 件の不備があります。`);
  if (failures > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
