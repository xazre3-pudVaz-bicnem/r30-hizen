/**
 * 自動投稿の自己点検（API は呼ばない）。
 *   npm run journal:selftest
 *
 * 確かめること
 *   1. 題材の一覧に、重複や、固定ページ・既存記事との食い合いが無いか
 *   2. 事実シートに、店名・住所・電話番号・料金が正しく入っているか（移転前の住所が無いか）
 *   3. 検査が、良い原稿を通し、わざと違反させた原稿を落とすか
 *   4. 題材選びが、決まりどおりに動くか
 *
 * 検査の規則（lib/validate.ts）を直したら、必ずこれを通す。
 */
import fs from "node:fs";
import path from "node:path";
import { courses } from "../../data/courses";
import { categorySlugs } from "../../data/journal-categories";
import { topics } from "../../data/journal-topics";
import { linkablePages, pageList, pages } from "../../data/pages";
import { addressLine, agePolicy, site } from "../../data/site";
import { loadPosts } from "../../lib/journal-core";
import { buildFactSheet } from "./lib/facts";
import { buildSystemPrompt } from "./lib/prompt";
import { openTopics, selectFormat, selectTopic } from "./lib/select";
import { keywordKey } from "./lib/text";
import { validateArticle, type Draft, type Target } from "./lib/validate";

let failures = 0;
const ok = (name: string) => console.log(`  ok   ${name}`);
const ng = (name: string, detail = "") => {
  failures++;
  console.log(`  NG   ${name}${detail ? ` — ${detail}` : ""}`);
};
const check = (name: string, cond: boolean, detail = "") => (cond ? ok(name) : ng(name, detail));

const posts = loadPosts();

// ---------------------------------------------------------------------------
console.log("\n1. 題材の一覧");
{
  const ids = topics.map((t) => t.id);
  check("id に重複が無い", new Set(ids).size === ids.length);
  check("id が URL に使える形", ids.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)), ids.filter((id) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)).join(", "));
  check("分類が登録にある", topics.every((t) => categorySlugs.includes(t.category)), topics.filter((t) => !categorySlugs.includes(t.category)).map((t) => t.id).join(", "));
  check("柱のページが、リンクしてよい固定ページにある", topics.every((t) => linkablePages.includes(t.pillar)), topics.filter((t) => !linkablePages.includes(t.pillar)).map((t) => t.id).join(", "));

  const keys = topics.map((t) => keywordKey(t.primaryKeyword));
  const dupKeys = keys.filter((k, i) => keys.indexOf(k) !== i);
  check("検索語に重複が無い", dupKeys.length === 0, dupKeys.join(", "));

  const pageKeys = new Map(pageList.map((p) => [keywordKey(p.primaryKeyword), p.path]));
  const clash = topics.filter((t) => pageKeys.has(keywordKey(t.primaryKeyword)));
  check("固定ページと同じ検索語を狙っていない", clash.length === 0, clash.map((t) => `${t.id}=${pageKeys.get(keywordKey(t.primaryKeyword))}`).join(", "));

  const postClash = topics.filter((t) => posts.some((p) => p.slug !== t.id && p.topicId !== t.id && keywordKey(p.primaryKeyword) === keywordKey(t.primaryKeyword)));
  check("既存の記事と同じ検索語を狙っていない", postClash.length === 0, postClash.map((t) => t.id).join(", "));

  const months = topics.filter((t) => t.months?.some((m) => m < 1 || m > 12));
  check("months が 1〜12", months.length === 0);
  console.log(`       題材 ${topics.length} 本（うち季節もの ${topics.filter((t) => t.months).length} 本）／いま書けるもの ${openTopics(posts, "2026-10-08").length} 本`);
}

// ---------------------------------------------------------------------------
console.log("\n2. 事実シート");
{
  const sheet = buildFactSheet();
  check("店名が入っている", sheet.includes(site.name));
  check("住所が入っている", sheet.includes(addressLine));
  check("電話番号が入っている", sheet.includes(site.tel.display));
  check("年齢の決まりが入っている", sheet.includes(agePolicy.label));
  check("全コースの料金が入っている", courses.every((c) => sheet.includes(c.price.toLocaleString("ja-JP"))));
  check("移転前の住所が入っていない", !/南5条|南五条|Nスター/.test(sheet));
  check("確定していない席数が入っていない", !/\d+\s*席/.test(sheet));
  const system = buildSystemPrompt();
  check("指示文に、リンクしてよい固定ページが全部ある", linkablePages.every((k) => system.includes(pages[k].path)));
  check("指示文に日付が入っていない（キャッシュのため）", !/20\d\d-\d\d-\d\d/.test(system));
}

// ---------------------------------------------------------------------------
console.log("\n3. 検査（良い原稿は通し、違反は落とす）");
{
  const fixture = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts/journal/fixtures/nitsume-toha.json"), "utf8")) as Draft;
  const target: Target = { slug: "nitsume-toha", category: "knowledge", primaryKeyword: "煮ツメ 寿司 とは", pillar: "/cuisine" };

  const good = validateArticle(fixture, target, posts);
  check("良い原稿（煮ツメ）が通る", good.length === 0, good.map((p) => `[${p.code}] ${p.message}`).join(" / "));

  /** 本文の末尾に一文を足す */
  const withTail = (s: string): Draft => ({ ...fixture, body: `${fixture.body}\n\n${s}` });
  const cases: { name: string; draft: Draft; code: string; target?: Target }[] = [
    { name: "定型表現（いかがでしたか）", draft: withTail("いかがでしたか。"), code: "stock" },
    { name: "定型表現（〜なのです）", draft: withTail("それが鮨の奥深さなのです。"), code: "stock" },
    { name: "「当店」", draft: withTail("当店でもツメを大切にしています。"), code: "stock" },
    { name: "感嘆符", draft: withTail("ぜひ味わってみてください！"), code: "stock" },
    { name: "最上級（絶品）", draft: withTail("穴子の握りは絶品です。"), code: "unsupported" },
    { name: "一番人気", draft: withTail("R-30 hizenは、すすきので一番人気の鮨店です。"), code: "unsupported" },
    { name: "口コミ", draft: withTail("口コミでも高く評価されています。"), code: "unsupported" },
    { name: "事実に無い金額", draft: withTail("R-30 hizenのコースは12,000円からです。"), code: "price" },
    { name: "個室があるという記述", draft: withTail("R-30 hizenには、落ち着いた個室があります。"), code: "fact.unverified" },
    { name: "席数の記述", draft: withTail("R-30 hizenのカウンターは8席です。"), code: "fact.unverified" },
    { name: "産地の記述", draft: withTail("R-30 hizenでは、北海道産の穴子だけを使っています。"), code: "fact.unverified" },
    { name: "店主の経歴", draft: withTail("R-30 hizenの店主は、銀座の名店で修業しました。"), code: "fact.unverified" },
    { name: "サプライズ演出", draft: withTail("R-30 hizenでは、記念日のサプライズもお手伝いします。"), code: "fact.unverified" },
    { name: "事実に無い数値（営業時間）", draft: withTail("R-30 hizenは、17時から営業しています。"), code: "fact.number" },
    { name: "年齢の表記ゆれ（30歳以下）", draft: withTail(`R-30 hizenは、${agePolicy.minAge}歳以下の方は入店できません。`), code: "age.wording" },
    { name: "移転前の住所", draft: withTail("以前は南5条西4丁目にありました。"), code: "unsupported" },
    { name: "存在しないページへのリンク", draft: withTail("詳しくは[個室のご案内](/private-room)へ。"), code: "link.missing" },
    { name: "サイトの外へのリンク", draft: withTail("詳しくは[こちらのサイト](https://example.com/)へ。"), code: "link.external" },
    { name: "柱のページへのリンクが無い", draft: { ...fixture, body: fixture.body.replace("[鮨と料理のページ](/cuisine)", "鮨と料理のページ") }, code: "link.pillar" },
    { name: "関連記事へのリンクが足りない", draft: { ...fixture, body: fixture.body.replace("[昆布〆の話](/journal/kobujime-toha)", "昆布〆の話") }, code: "link.related" },
    { name: "本文が短い", draft: { ...fixture, body: fixture.body.slice(0, 900) }, code: "length.body" },
    { name: "h1 がある", draft: { ...fixture, body: `# 煮ツメとは\n\n${fixture.body}` }, code: "h1" },
    { name: "見出しが「まとめ」", draft: withTail("## まとめ\n\n煮ツメは、煮汁を煮詰めたたれです。"), code: "heading.stock" },
    { name: "固定ページと同じ検索語", draft: fixture, code: "cannibal.page", target: { ...target, primaryKeyword: pages.omakaseSushi.primaryKeyword } },
    { name: "既存の記事と同じ検索語", draft: fixture, code: "cannibal.post", target: { ...target, primaryKeyword: posts[0]?.primaryKeyword ?? "" } },
    { name: "既存の記事の写し", draft: { ...fixture, body: posts.find((p) => p.slug === "kobujime-toha")?.body ?? "" }, code: "dup.body" },
  ];
  for (const c of cases) {
    const found = validateArticle(c.draft, c.target ?? target, posts);
    check(`落とす: ${c.name}`, found.some((p) => p.code === c.code), `期待 [${c.code}] ／ 実際 ${found.map((p) => p.code).join(", ") || "なし"}`);
  }
}

// ---------------------------------------------------------------------------
console.log("\n4. 題材選び");
{
  const a = selectTopic(posts, "2026-10-08");
  const b = selectTopic(posts, "2026-10-08");
  check("題材が選ばれる", Boolean(a));
  check("同じ状態なら、同じ題材が選ばれる", a?.id === b?.id);
  if (a) {
    const recent = posts.slice(0, 2).map((p) => p.category);
    check("直近2本と別の分類", !recent.includes(a.category), `${a.category} / 直近 ${recent.join(", ")}`);
    check("その月に出してよい題材", !a.months || a.months.includes(10), a.id);
    check("書き方の型が選ばれる", Boolean(selectFormat(a, posts).id));
    console.log(`       次に選ばれる題材: ${a.primaryKeyword}（${a.id}）`);
  }
  const winter = selectTopic(posts, "2027-01-15");
  check("1月には、1月の季節の題材が先に選ばれる", Boolean(winter?.months?.includes(1)), winter?.id);
}

console.log(failures === 0 ? "\nすべて通りました。" : `\n${failures} 件の不備があります。`);
if (failures > 0) process.exit(1);
