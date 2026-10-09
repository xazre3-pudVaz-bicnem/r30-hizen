/**
 * ビルドしたサイトを、動いているサーバーに対して点検する（JS を実行しない、生の HTML を見る）。
 *
 *   1) NEXT_PUBLIC_SITE_URL=https://www.hizen-susukino.jp npm run build
 *   2) npx next start -p 4318
 *   3) npm run site:check                 （既定は http://localhost:4318）
 *      BASE=http://localhost:3000 npm run site:check
 *      npm run site:check -- --inventory  （全 URL の一覧表を docs/URL_INVENTORY.md に書き出す）
 *
 *   公開したあとは、本番そのものにも掛ける：
 *      BASE=https://www.hizen-susukino.jp npm run site:check
 *   このときは「配信しているドメイン」と「canonical の向き先」が同じかも確かめる
 *   （canonical がよそのドメインを指したまま公開されていたことがあるため）。
 *
 * 見ていること
 *   ・全ページが 200／内部リンク切れ・旧 URL の 301 転送・404
 *   ・h1 が1つで <main> の中にある／見出しの階層
 *   ・title・description・h1・canonical・OGP（重複なし）
 *   ・JSON-LD の配置（トップとアクセスだけ Restaurant、ほかは Organization。パンくず・記事・コース・FAQ）と、
 *     店舗の住所・電話番号・座標・営業時間が data/restaurant.ts と一致すること
 *   ・移転前の住所が、どのページにも残っていない
 *   ・ヘッダーのメニューが6項目＋ご予約だけ／予約の行動が1ページに1か所まで
 *   ・画像の alt／先読みする画像は1枚まで／ヒーローに行動を促すリンクやボタンが無い
 *   ・robots.txt／sitemap.xml／*.vercel.app では noindex
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { journalCategories, MIN_POSTS_TO_INDEX } from "../data/journal-categories";
import { headerNav, pageByPath, pageList, pages } from "../data/pages";
import { addressLine, postalLine, restaurant, streetLine } from "../data/restaurant";
import { loadPosts } from "../lib/journal-core";
import { LEGACY_REDIRECTS, PRODUCTION_URL } from "../next.config";

const BASE = (process.env.BASE || "http://localhost:4318").replace(/\/$/, "");
/** 公開 URL（canonical の向き先）。指定が無ければ、next.config.ts の本番 URL */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_URL).replace(/\/$/, "");
/** 手元のサーバーではなく、公開中のサイトを点検しているか */
const LIVE = !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(new URL(BASE).hostname);
const WRITE_INVENTORY = process.argv.includes("--inventory");

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
const tagsOff = (html: string) => html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "");
const textOf = (html: string) => tagsOff(strip(html)).replace(/&amp;/g, "&").replace(/\s+/g, "");
const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const FORMER_ADDRESS = new RegExp(restaurant.legacy.formerAddressPatterns.join("|"));

async function get(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual", ...init });
  return { status: res.status, headers: res.headers, body: res.status < 300 || res.status >= 400 ? await res.text() : "" };
}

/** Host ヘッダーを差し替えて HEAD で叩く（fetch では Host を変えられないため） */
function headWithHost(host: string): Promise<http.IncomingHttpHeaders> {
  const url = new URL(BASE);
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: url.hostname, port: url.port || 80, path: "/", method: "HEAD", headers: { Host: host } }, (res) => {
      res.resume();
      resolve(res.headers);
    });
    req.on("error", reject);
    req.end();
  });
}

type Node = Record<string, unknown>;
type PageInfo = {
  path: string;
  html: string;
  main: string;
  title?: string;
  description?: string;
  h1?: string;
  canonical?: string;
  robots?: string;
  graph: Node[];
};

const typeOf = (n: Node) => String(n["@type"]);

async function main() {
  console.log(`サイト点検 — ${BASE}（公開 URL: ${SITE_URL}）`);

  // ---- 対象のページ --------------------------------------------------------
  const posts = loadPosts();
  const postPaths = new Set(posts.map((p) => `/journal/${p.slug}`));
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
  const ldBroken: string[] = [];
  for (const path of expected) {
    const r = await get(path);
    if (r.status !== 200) {
      bad.push(`${path} → ${r.status}`);
      continue;
    }
    const head = r.body.slice(0, r.body.indexOf("</head>"));
    const main = r.body.match(/<main[\s\S]*<\/main>/)?.[0] ?? "";
    const graph: Node[] = [];
    for (const b of r.body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        graph.push(...((JSON.parse(b[1]) as { "@graph"?: Node[] })["@graph"] ?? []));
      } catch {
        ldBroken.push(`${path}: JSON-LD を解釈できない`);
      }
    }
    infos.push({
      path,
      html: r.body,
      main,
      title: decode(head.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""),
      description: decode(attr(head.match(/<meta name="description"[^>]*>/)?.[0] ?? "", "content") ?? ""),
      h1: decode(tagsOff(strip(main).match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? "").replace(/\s+/g, "")),
      canonical: attr(head.match(/<link rel="canonical"[^>]*>/)?.[0] ?? "", "href"),
      robots: attr(head.match(/<meta name="robots"[^>]*>/)?.[0] ?? "", "content"),
      graph,
    });
  }
  console.log(`\nページ（${expected.length}）`);
  check("すべて 200 で返る", bad);

  // ---- 見出し --------------------------------------------------------------
  console.log("\n見出し");
  const h1Problems: string[] = [];
  const orderProblems: string[] = [];
  for (const p of infos) {
    const all = (strip(p.html).match(/<h1[\s>]/g) ?? []).length;
    const inMain = (strip(p.main).match(/<h1[\s>]/g) ?? []).length;
    if (all !== 1 || inMain !== 1) h1Problems.push(`${p.path}: h1 が ${all} 個（main の中に ${inMain} 個）`);
    let prev = 0;
    for (const m of strip(p.main).matchAll(/<h([1-6])[\s>]/g)) {
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
  console.log("\ntitle・description・h1・canonical・OGP");
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
  check("h1 が全ページにあり、重複しない", dup((p) => p.h1, "h1"));
  check(
    "description は 120 字以内",
    infos.filter((p) => [...(p.description ?? "")].length > 120).map((p) => `${p.path}: ${[...(p.description ?? "")].length}字`),
  );
  check(
    "canonical が自分自身の公開 URL を指す",
    infos.filter((p) => p.canonical !== (p.path === "/" ? SITE_URL : `${SITE_URL}${p.path}`)).map((p) => `${p.path}: ${p.canonical ?? "（無し）"}`),
  );
  check(
    "noindex は、記事の少ない分類ページだけ",
    infos.filter((p) => /noindex/.test(p.robots ?? "") !== noindexExpected.has(p.path)).map((p) => `${p.path}: robots="${p.robots ?? ""}"`),
  );
  const ogProblems: string[] = [];
  const ogImages = new Set<string>();
  for (const p of infos) {
    for (const prop of ["og:title", "og:description", "og:image", "og:url", "og:site_name", "og:locale"]) {
      const tag = p.html.match(new RegExp(`<meta property="${prop}"[^>]*>`))?.[0];
      if (!tag) ogProblems.push(`${p.path}: ${prop} が無い`);
      else if (prop === "og:image") ogImages.add(attr(tag, "content") ?? "");
      else if (prop === "og:url" && attr(tag, "content") !== p.canonical) ogProblems.push(`${p.path}: og:url が canonical と違う`);
    }
    if (!/<meta name="twitter:card" content="summary_large_image"/.test(p.html)) ogProblems.push(`${p.path}: twitter:card が無い`);
  }
  check("OGP が全ページにあり、og:url は canonical と同じ", ogProblems);
  const ogBad: string[] = [];
  for (const url of ogImages) {
    const local = decode(url).replace(SITE_URL, "");
    if (!decode(url).startsWith(SITE_URL)) {
      // よそのドメインを指している画像は、ここで止める（そのまま取りに行くと、点検先の URL と混ざって壊れる）
      ogBad.push(`${url}: 公開 URL で始まっていない`);
      continue;
    }
    const r = await fetch(`${BASE}${local}`);
    const type = r.headers.get("content-type") ?? "";
    if (r.status !== 200 || !/image\/(jpeg|png)/.test(type)) ogBad.push(`${local} → ${r.status} ${type}`);
    await r.arrayBuffer();
  }
  check(`OGP 画像が実在し、JPEG か PNG（${ogImages.size} 枚）`, ogBad);

  // ---- 構造化データ --------------------------------------------------------
  console.log("\n構造化データ");
  check("JSON-LD が読める", [...ldBroken, ...infos.filter((p) => p.graph.length === 0).map((p) => `${p.path}: JSON-LD が無い`)]);

  const RESTAURANT_PAGES = new Set([pages.home.path, pages.access.path]);
  const placement: string[] = [];
  const allTypes = new Set<string>();
  for (const p of infos) {
    const types = p.graph.map(typeOf);
    for (const t of types) allTypes.add(t);
    const has = (t: string) => types.includes(t);
    const isPost = postPaths.has(p.path);

    if (RESTAURANT_PAGES.has(p.path) !== has("Restaurant")) placement.push(`${p.path}: Restaurant は、トップとアクセスにだけ出す`);
    if (!RESTAURANT_PAGES.has(p.path) && !has("Organization")) placement.push(`${p.path}: Organization が無い`);
    if (!has("WebSite")) placement.push(`${p.path}: WebSite が無い`);
    if ((p.path !== "/") !== has("BreadcrumbList")) placement.push(`${p.path}: BreadcrumbList は、トップ以外の全ページに出す`);
    if (isPost !== has("BlogPosting")) placement.push(`${p.path}: BlogPosting は、記事にだけ出す`);
    if ((p.path === pages.omakase.path) !== has("Menu")) placement.push(`${p.path}: Menu は、おまかせコースにだけ出す`);
    if ((p.path === pages.reservation.path) !== has("FAQPage")) placement.push(`${p.path}: FAQPage は、ご予約にだけ出す`);
    const ids = p.graph.map((n) => String(n["@id"] ?? "")).filter(Boolean);
    if (new Set(ids).size !== ids.length) placement.push(`${p.path}: 同じ @id のノードが2つある`);

    if (isPost) {
      const a = p.graph.find((n) => typeOf(n) === "BlogPosting") as Node | undefined;
      const author = a?.author as Node | undefined;
      if (author?.name !== restaurant.author) placement.push(`${p.path}: 記事の書き手が「${restaurant.author}」になっていない（${String(author?.name)}）`);
      if (!a?.datePublished || !a?.headline || !a?.image) placement.push(`${p.path}: BlogPosting の必須項目（headline・image・datePublished）が欠けている`);
    }
    const crumbs = p.graph.find((n) => typeOf(n) === "BreadcrumbList") as Node | undefined;
    if (crumbs) {
      const items = crumbs.itemListElement as Node[];
      if (!Array.isArray(items) || items.length < 2 || items.some((it, i) => it.position !== i + 1 || !it.name || !String(it.item).startsWith(SITE_URL))) {
        placement.push(`${p.path}: BreadcrumbList の並びが正しくない`);
      }
    }
  }
  check("構造化データの配置が決まりどおり（Restaurant はトップとアクセスだけ、など）", placement);
  notes.push(`JSON-LD の型: ${[...allTypes].sort().join(", ")}`);

  const restaurantProblems: string[] = [];
  for (const p of infos.filter((x) => RESTAURANT_PAGES.has(x.path))) {
    const r = p.graph.find((n) => typeOf(n) === "Restaurant") as Node | undefined;
    if (!r) continue;
    const a = r.address as Record<string, string>;
    const geo = r.geo as Record<string, number>;
    const hours = (r.openingHoursSpecification as Node[])?.[0];
    const sameAs = (r.sameAs as string[]) ?? [];
    const want: [string, unknown, unknown][] = [
      ["name", r.name, restaurant.name],
      ["url", r.url, SITE_URL],
      ["telephone", r.telephone, restaurant.phone.e164],
      ["streetAddress", a?.streetAddress, streetLine],
      ["postalCode", a?.postalCode, restaurant.address.postalCode],
      ["addressLocality", a?.addressLocality, restaurant.address.locality],
      ["addressRegion", a?.addressRegion, restaurant.address.region],
      ["addressCountry", a?.addressCountry, restaurant.address.country],
      ["geo.latitude", geo?.latitude, restaurant.map.geo.latitude],
      ["geo.longitude", geo?.longitude, restaurant.map.geo.longitude],
      ["opens", hours?.opens, restaurant.hours.opens],
      ["closes", hours?.closes, restaurant.hours.closes],
      ["acceptsReservations", r.acceptsReservations, true],
    ];
    for (const [name, actual, wanted] of want) if (actual !== wanted) restaurantProblems.push(`${p.path}: ${name} が違う（${String(actual)}）`);
    if (!sameAs.includes(restaurant.social.instagram)) restaurantProblems.push(`${p.path}: sameAs に Instagram が無い`);
    if (!r.priceRange || !r.servesCuisine || !Array.isArray(r.image) || (r.image as string[]).length === 0) {
      restaurantProblems.push(`${p.path}: priceRange・servesCuisine・image のどれかが無い`);
    }
    if ((hours?.dayOfWeek as string[] | undefined)?.length !== 7) restaurantProblems.push(`${p.path}: 営業日が7日ぶん入っていない`);
    // 確かめられない項目（評価・受賞）と、Restaurant では定義されていない項目（audience）
    for (const key of ["aggregateRating", "review", "award", "starRating", "audience"]) {
      if (key in r) restaurantProblems.push(`${p.path}: 入れてはいけない項目（${key}）が入っている`);
    }
  }
  check("Restaurant の値が data/restaurant.ts と一致する（住所・電話・座標・営業時間・Instagram）", restaurantProblems);

  // ---- 店名・住所・電話番号 ------------------------------------------------
  console.log("\n店名／住所／電話番号（NAP）");
  const napProblems: string[] = [];
  const addressCompact = addressLine.replace(/\s+/g, "");
  for (const p of infos) {
    const t = textOf(p.html);
    if (!t.includes(restaurant.name.replace(/\s+/g, ""))) napProblems.push(`${p.path}: 店名が無い`);
    if (!t.includes(`${restaurant.address.region}${restaurant.address.locality}${restaurant.address.street}`)) napProblems.push(`${p.path}: 住所が無い`);
    if (!t.includes(restaurant.phone.display)) napProblems.push(`${p.path}: 電話番号が無い`);
    // 住所らしい文字列が、正しい表記以外で出ていないか
    for (const m of t.matchAll(/南[0-9０-９一二三四五六七八九]+条西[0-9０-９一二三四五六七八九]+丁目[0-9-]*/g)) {
      if (!addressCompact.includes(m[0]) && m[0] !== restaurant.address.district) napProblems.push(`${p.path}: 住所の表記ゆれ「${m[0]}」`);
    }
    for (const m of t.matchAll(/0\d{1,3}-\d{2,4}-\d{4}/g)) {
      if (m[0] !== restaurant.phone.display) napProblems.push(`${p.path}: 別の電話番号「${m[0]}」`);
    }
  }
  check("店名・住所・電話番号が全ページで同じ表記", napProblems);
  check("移転前の住所が残っていない", infos.filter((p) => FORMER_ADDRESS.test(p.html)).map((p) => p.path));
  notes.push(`住所の表記: ${postalLine} ${addressLine}／電話: ${restaurant.phone.display}（JSON-LD は ${restaurant.phone.e164}）`);

  // ---- ナビ・予約の導線 ----------------------------------------------------
  console.log("\nメニュー・予約の導線");
  const navWanted = headerNav.map((n) => pages[n.key].path);
  const navProblems: string[] = [];
  const ctaProblems: string[] = [];
  for (const p of infos) {
    const header = p.html.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0] ?? "";
    const hrefs = [...new Set([...header.matchAll(/<a\b[^>]*href="(\/[^"#?]*)"/g)].map((m) => m[1]))].filter((h) => h !== "/");
    const allowed = new Set([...navWanted, pages.reservation.path]);
    const extra = hrefs.filter((h) => !allowed.has(h));
    const missing = [...allowed].filter((h) => !hrefs.includes(h));
    if (extra.length) navProblems.push(`${p.path}: ヘッダーに余分なリンク ${extra.join(", ")}`);
    if (missing.length) navProblems.push(`${p.path}: ヘッダーに無いリンク ${missing.join(", ")}`);
    // 予約の行動（Web予約へのボタン）は、1ページに1か所まで
    const web = (p.main.match(new RegExp(`href="${restaurant.reservation.web.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g")) ?? []).length;
    if (web > 1) ctaProblems.push(`${p.path}: Web予約のボタンが ${web} か所`);
    if (/position:\s*fixed|class="[^"]*\bfixed\b[^"]*"/.test(p.main)) ctaProblems.push(`${p.path}: 本文に固定表示の要素がある`);
  }
  check(`ヘッダーのメニューは ${navWanted.length} 項目＋ご予約だけ`, navProblems);
  check("予約のボタンは1ページに1か所まで。固定表示のボタンは無い", ctaProblems);

  // ---- 画像・ヒーロー ------------------------------------------------------
  console.log("\n画像・最初の画面");
  const altProblems: string[] = [];
  const preloadProblems: string[] = [];
  for (const p of infos) {
    for (const m of strip(p.html).matchAll(/<img\b[^>]*>/g)) {
      const alt = m[0].match(/\balt="([^"]*)"/);
      if (!alt) altProblems.push(`${p.path}: alt 属性が無い ${m[0].slice(0, 60)}`);
      else if (alt[1].trim() === "" && !/aria-hidden="true"|role="presentation"/.test(m[0])) altProblems.push(`${p.path}: alt が空 ${m[0].slice(0, 60)}`);
      else if (/^(寿司|料理|店内|ドリンク|画像|写真)$/.test(alt[1].trim())) altProblems.push(`${p.path}: alt が一語だけ「${alt[1]}」`);
    }
    const preloads = (p.html.match(/<link rel="preload"[^>]*as="image"[^>]*>/g) ?? []).length;
    const high = (strip(p.main).match(/<img\b[^>]*fetchPriority="high"[^>]*>|<img\b[^>]*fetchpriority="high"[^>]*>/g) ?? []).length;
    if (preloads > 1) preloadProblems.push(`${p.path}: 画像の先読みが ${preloads} 件`);
    if (high > 1) preloadProblems.push(`${p.path}: 優先読み込みの画像が ${high} 枚`);
    for (const m of strip(p.main).matchAll(/<img\b[^>]*>/g)) {
      const src = attr(m[0], "src") ?? "";
      if (/^https?:\/\//.test(src)) preloadProblems.push(`${p.path}: 外部の画像を直接読んでいる ${src.slice(0, 60)}`);
      if (!/\/_next\/image|\.svg/.test(src)) preloadProblems.push(`${p.path}: 最適化を通っていない画像 ${src.slice(0, 60)}`);
    }
  }
  check("画像に、内容を表す alt がある", altProblems);
  check("優先して読む画像は1ページ1枚まで。写真はすべて最適化を通っている", preloadProblems);

  const home = infos.find((p) => p.path === "/");
  const hero = home?.html.match(/<section[^>]*data-hero[\s\S]*?<\/section>/)?.[0] ?? "";
  check("トップにヒーローがある", hero ? [] : ["data-hero の区画が見つからない"]);
  check(
    "ヒーローに、リンクもボタンも無い（行動を促すものを置かない）",
    [...hero.matchAll(/<(a|button)\b[^>]*>/g)].map((m) => m[0].slice(0, 80)),
  );
  check("ヒーローに YouTube の埋め込みが無い", /youtube|<iframe/i.test(hero) ? ["iframe か YouTube がある"] : []);
  const homeSections = (strip(home?.main ?? "").match(/<section[\s>]/g) ?? []).length;
  check("トップページの区画は 10", homeSections === 10 ? [] : [`いま ${homeSections} 区画`]);
  check(
    "どのページも、最初から YouTube・地図の iframe を読み込まない",
    infos.filter((p) => /<iframe/i.test(p.html)).map((p) => p.path),
  );

  // ---- 内部リンク ----------------------------------------------------------
  console.log("\n内部リンク");
  const linkSources = new Map<string, string>();
  const inMainSources = new Map<string, string>();
  for (const p of infos) {
    for (const m of strip(p.html).matchAll(/<a\b[^>]*href="(\/[^"#?]*)[^"]*"/g)) {
      const href = m[1].replace(/\/$/, "") || "/";
      if (!linkSources.has(href)) linkSources.set(href, p.path);
    }
    for (const m of strip(p.main).matchAll(/<a\b[^>]*href="(\/[^"#?]*)[^"]*"/g)) {
      const href = m[1].replace(/\/$/, "") || "/";
      if (href !== p.path && !inMainSources.has(href)) inMainSources.set(href, p.path);
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
  check("どこからもリンクされていないページが無い", expected.filter((p) => p !== "/" && !linkSources.has(p)));
  // ヘッダーのメニューに出していないページも、本文中のリンクからたどれること
  check(
    "メニューに出していないページへ、ほかのページの本文からリンクがある",
    pageList.filter((p) => p.path !== "/" && !inMainSources.has(p.path)).map((p) => p.path),
  );

  const flow: string[] = [];
  for (const p of infos.filter((x) => postPaths.has(x.path))) {
    if (!/href="\/reservation"/.test(p.main)) flow.push(`${p.path}: 予約への導線が無い`);
    if (!/href="\/omakase"/.test(p.main)) flow.push(`${p.path}: コースへの導線が無い`);
  }
  check("記事から、コース・予約へ進める", flow);

  // ---- robots・sitemap・転送 ----------------------------------------------
  console.log("\nrobots.txt・sitemap.xml・旧 URL");
  const robots = await get("/robots.txt");
  check("robots.txt が 200 で、全ページを許可し、sitemap を知らせている", [
    ...(robots.status === 200 ? [] : [`status ${robots.status}`]),
    ...(/Allow: \//.test(robots.body) ? [] : ["Allow: / が無い"]),
    ...(/Disallow: \/\s*$/m.test(robots.body) ? ["Disallow: / になっている"] : []),
    ...(robots.body.includes(`Sitemap: ${SITE_URL}/sitemap.xml`) ? [] : ["Sitemap の行が無い"]),
  ]);
  const sitemap = await get("/sitemap.xml");
  const rawLocs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const locs = rawLocs.map((u) => u.replace(SITE_URL, "").replace(/\/$/, "") || "/");
  const shouldList = expected.filter((p) => !noindexExpected.has(p));
  check("sitemap.xml が 200 で返る", sitemap.status === 200 ? [] : [`status ${sitemap.status}`]);
  check("sitemap.xml に、載せるべきページが全部ある", shouldList.filter((p) => !locs.includes(p)));
  check("sitemap.xml に、noindex のページや存在しないページが無い", locs.filter((p) => !shouldList.includes(p)));
  const canonicals = new Set(infos.map((p) => p.canonical));
  check("sitemap.xml の URL が、各ページの canonical と同じ", rawLocs.filter((u) => !canonicals.has(u)));

  const redirectProblems: string[] = [];
  for (const [from, to] of LEGACY_REDIRECTS) {
    const r = await get(from);
    const loc = (r.headers.get("location") ?? "").replace(BASE, "");
    if (r.status !== 301) redirectProblems.push(`${from} → ${r.status}（301 であること）`);
    else if (loc !== to) redirectProblems.push(`${from} → ${loc}（期待 ${to}）`);
    else if (!known.has(to)) redirectProblems.push(`${from} の転送先 ${to} が存在しない`);
  }
  check(`旧サイトの URL が、内容の近いページへ 301 で転送される（${LEGACY_REDIRECTS.length} 件）`, redirectProblems);
  const toTop = LEGACY_REDIRECTS.filter(([from, to]) => to === "/" && from !== "/index.html");
  check("旧 URL を、まとめてトップへ送っていない", toTop.map(([from]) => from));

  const nf = await get("/this-page-does-not-exist");
  check("存在しない URL は 404", nf.status === 404 ? [] : [`${nf.status}`]);
  check("404 のページは noindex", /<meta name="robots" content="[^"]*noindex/.test(nf.body) ? [] : ["noindex が無い"]);

  if (LIVE) {
    // 公開中のサイトを点検しているとき：そのホスト自身の応答を見る（Host の差し替えはできない）
    const self = await fetch(`${BASE}/`, { method: "HEAD", redirect: "manual" });
    const tag = self.headers.get("x-robots-tag") ?? "";
    if (/\.vercel\.app$/.test(new URL(BASE).hostname)) {
      check("*.vercel.app のホストには X-Robots-Tag: noindex が付く", /noindex/.test(tag) ? [] : [`x-robots-tag: ${tag || "（無し）"}`]);
    } else {
      check(
        "配信しているドメインが、canonical の向き先（公開 URL）と同じ",
        new URL(BASE).origin === new URL(SITE_URL).origin ? [] : [`点検先 ${new URL(BASE).origin}／公開 URL ${SITE_URL}（next.config.ts の PRODUCTION_URL を確かめる）`],
      );
      check("本番のホストには X-Robots-Tag: noindex が付かない", tag ? [tag] : []);
    }
  } else {
    const prod = await headWithHost(new URL(SITE_URL).host);
    check("本番のホストには X-Robots-Tag: noindex が付かない", prod["x-robots-tag"] ? [String(prod["x-robots-tag"])] : []);
    const preview = await headWithHost("r30-hizen-git-preview.vercel.app");
    check(
      "*.vercel.app のホストには X-Robots-Tag: noindex が付く",
      /noindex/.test(String(preview["x-robots-tag"] ?? "")) ? [] : [`x-robots-tag: ${preview["x-robots-tag"] ?? "（無し）"}`],
    );
  }

  // ---- 全 URL の一覧表 -----------------------------------------------------
  if (WRITE_INVENTORY) {
    const keywordOf = (p: string) => pageByPath(p)?.primaryKeyword ?? posts.find((x) => `/journal/${x.slug}` === p)?.primaryKeyword ?? "（一覧ページ）";
    const cell = (s: string | undefined) => (s ?? "").replace(/\|/g, "｜");
    const lines = [
      "# 全 URL の一覧",
      "",
      `${new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)} に、ビルドした HTML から取り出したもの（\`npm run site:check -- --inventory\`）。`,
      "",
      `- ページ数: ${infos.length}（固定 ${pageList.length}／記事 ${posts.length}／分類 ${infos.length - pageList.length - posts.length}）`,
      "- title・description・h1 の重複: なし（重複があると `npm run site:check` が止めます）",
      "- noindex: 記事が 3 本に満たない分類の一覧ページだけ",
      "",
      "| URL | title | description | h1 | canonical | 担当する検索語 | index |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      ...infos.map(
        (p) =>
          `| \`${p.path}\` | ${cell(p.title)} | ${cell(p.description)} | ${cell(p.h1)} | ${cell(p.canonical)} | ${cell(keywordOf(p.path))} | ${/noindex/.test(p.robots ?? "") ? "noindex" : "index"} |`,
      ),
      "",
      "## 旧 URL の転送（301）",
      "",
      "| 旧 URL | 転送先 |",
      "| --- | --- |",
      ...LEGACY_REDIRECTS.map(([from, to]) => `| \`${from}\` | \`${to}\` |`),
      "",
    ];
    const file = path.join(process.cwd(), "docs", "URL_INVENTORY.md");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, lines.join("\n"), "utf8");
    notes.push(`一覧表を書き出しました: docs/URL_INVENTORY.md（${infos.length} URL）`);
  }

  console.log("\nメモ");
  for (const n of notes) console.log(`  - ${n}`);
  console.log(failures === 0 ? "\nすべて通りました。" : `\n${failures} 件の不備があります。`);
  if (failures > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
