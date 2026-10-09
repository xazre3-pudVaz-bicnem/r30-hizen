/**
 * 自動投稿の自己点検（API は呼ばない）。
 *   npm run journal:selftest
 *
 * 確かめること
 *   1. 題材の一覧に、重複や、固定ページ・既存記事との食い合いが無いか。優先度（A/B/C）が付いているか
 *   2. 事実シートに、店名・住所・電話番号・料金が正しく入っているか（移転前の住所が無いか）
 *   3. 検査が、良い原稿を通し、わざと違反させた原稿を落とすか
 *   4. 題材選びが、決まりどおりに動くか（優先度の配分・近すぎる題材の見送り・店からのメモ）
 *
 * 検査の規則（lib/validate.ts）を直したら、必ずこれを通す。
 */
import fs from "node:fs";
import path from "node:path";
import { categorySlugs } from "../../data/journal-categories";
import { topics } from "../../data/journal-topics";
import { linkablePages, pageList, pages } from "../../data/pages";
import { addressLine, agePolicy, courses, restaurant } from "../../data/restaurant";
import { shopNotes } from "../../data/shop-notes";
import { loadPosts, type Post } from "../../lib/journal-core";
import { buildFactSheet } from "./lib/facts";
import { buildSystemPrompt, buildUserPrompt } from "./lib/prompt";
import { candidateJobs, jobFromNote, openTopics, selectFormat, selectTopic, TIER_TARGET, tierOfPost, tierOrder, tierShares } from "./lib/select";
import { themeCloseness, THEME_TOO_CLOSE } from "./lib/similarity";
import { keywordKey, sentences } from "./lib/text";
import { validateArticle, type Draft, type Options, type Target } from "./lib/validate";

let failures = 0;
const ok = (name: string) => console.log(`  ok   ${name}`);
const ng = (name: string, detail = "") => {
  failures++;
  console.log(`  NG   ${name}${detail ? ` — ${detail}` : ""}`);
};
const check = (name: string, cond: boolean, detail = "") => (cond ? ok(name) : ng(name, detail));

const posts = loadPosts();
const FORMER = new RegExp(restaurant.legacy.formerAddressPatterns.join("|"));

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

  const count = { A: 0, B: 0, C: 0 };
  for (const t of topics) count[t.tier]++;
  check("優先度 A・B・C の題材がそれぞれある", count.A > 0 && count.B > 0 && count.C > 0, JSON.stringify(count));

  // 題材どうしが近すぎないか（同じ話を2本書くことになる組）
  const close: string[] = [];
  for (let i = 0; i < topics.length; i++) {
    for (let j = i + 1; j < topics.length; j++) {
      const a = topics[i];
      const b = topics[j];
      const c = themeCloseness(
        { slug: a.id, category: a.category, primaryKeyword: a.primaryKeyword, secondaryKeywords: a.secondaryKeywords },
        { slug: b.id, category: b.category, primaryKeyword: b.primaryKeyword, secondaryKeywords: b.secondaryKeywords },
      );
      if (c.score >= 0.8) close.push(`${a.id}／${b.id}（${c.by} ${c.score.toFixed(2)}）`);
    }
  }
  check("題材どうしが、ほぼ同じ話になっていない", close.length === 0, close.join(", "));

  console.log(
    `       題材 ${topics.length} 本（A ${count.A}／B ${count.B}／C ${count.C}・うち季節もの ${topics.filter((t) => t.months).length} 本）／いま書けるもの ${openTopics(posts, "2026-10-08").length} 本`,
  );
}

// ---------------------------------------------------------------------------
console.log("\n2. 事実シート");
{
  const sheet = buildFactSheet();
  check("店名が入っている", sheet.includes(restaurant.name));
  check("住所が入っている", sheet.includes(addressLine));
  check("電話番号が入っている", sheet.includes(restaurant.phone.display));
  check("年齢の決まりが入っている", sheet.includes(agePolicy.label));
  check("全コースの料金が入っている", courses.every((c) => sheet.includes(c.price.toLocaleString("ja-JP"))));
  check("移転前の住所が入っていない", !FORMER.test(sheet));
  check("確定していない席数が入っていない", !/\d+\s*席/.test(sheet));
  const system = buildSystemPrompt();
  check("指示文に、リンクしてよい固定ページが全部ある", linkablePages.every((k) => system.includes(pages[k].path)));
  check("指示文に日付が入っていない（キャッシュのため）", !/20\d\d-\d\d-\d\d/.test(system));
  check("指示文に移転前の住所が入っていない", !FORMER.test(system));
  check("指示文が、店の紹介を末尾に足さないよう求めている", system.includes("店の紹介の節を足さない"));
}

// ---------------------------------------------------------------------------
console.log("\n3. 検査（良い原稿は通し、違反は落とす）");
{
  const fixture = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts/journal/fixtures/nitsume-toha.json"), "utf8")) as Draft;
  const target: Target = { slug: "nitsume-toha", category: "knowledge", primaryKeyword: "煮ツメ 寿司 とは", pillar: "/cuisine", date: "2026-10-08" };

  const good = validateArticle(fixture, target, posts);
  check("良い原稿（煮ツメ）が通る", good.length === 0, good.map((p) => `[${p.code}] ${p.message}`).join(" / "));

  /** 本文の末尾に一文を足す */
  const withTail = (s: string): Draft => ({ ...fixture, body: `${fixture.body}\n\n${s}` });
  /** ほかの記事から、長めの一文を借りる（使い回しの検査用） */
  const borrowed =
    sentences(posts.find((p) => p.slug === "fufu-counter-sushi")?.body.replace(/^#.*$/gm, "") ?? "").find((s) => [...s].length >= 40 && !s.includes("[")) ?? "";
  /** 題名に「すすきの＋寿司」が続いている状態を作る */
  const headTermPosts: Post[] = posts.map((p, i) => (i < 2 ? { ...p, title: `すすきので寿司を楽しむ夜 その${i + 1}` } : p));
  const kobujime = posts.find((p) => p.slug === "kobujime-toha");

  const cases: { name: string; draft: Draft; code: string; target?: Target; others?: Post[]; options?: Options }[] = [
    { name: "定型表現（いかがでしたか）", draft: withTail("いかがでしたか。"), code: "stock" },
    { name: "定型表現（〜なのです）", draft: withTail("それが鮨の奥深さなのです。"), code: "stock" },
    { name: "「当店」", draft: withTail("当店でもツメを大切にしています。"), code: "stock" },
    { name: "感嘆符", draft: withTail("ぜひ味わってみてください！"), code: "stock" },
    { name: "最上級（絶品）", draft: withTail("穴子の握りは絶品です。"), code: "unsupported" },
    { name: "根拠のない No.1（一番人気）", draft: withTail("R-30 hizenは、すすきので一番人気の鮨店です。"), code: "unsupported" },
    { name: "口コミ", draft: withTail("口コミでも高く評価されています。"), code: "unsupported" },
    { name: "架空の受賞歴", draft: withTail("R-30 hizenは、数々の賞を受賞しています。"), code: "unsupported" },
    { name: "「おすすめ10選」", draft: withTail("すすきのの鮨店おすすめ10選も、あわせてどうぞ。"), code: "unsupported" },
    { name: "他店との比較", draft: withTail("他店と比べても、握りの仕事の細かさが違います。"), code: "unsupported" },
    { name: "事実に無い金額", draft: withTail("R-30 hizenのコースは12,000円からです。"), code: "price" },
    { name: "存在しない設備（個室）", draft: withTail("R-30 hizenには、落ち着いた個室があります。"), code: "fact.unverified" },
    { name: "架空の席数", draft: withTail("R-30 hizenのカウンターは8席です。"), code: "fact.unverified" },
    { name: "架空の産地", draft: withTail("R-30 hizenでは、北海道産の穴子だけを使っています。"), code: "fact.unverified" },
    { name: "店主の経歴", draft: withTail("R-30 hizenの店主は、銀座の名店で修業しました。"), code: "fact.unverified" },
    { name: "架空のサービス（サプライズ演出）", draft: withTail("R-30 hizenでは、記念日のサプライズもお手伝いします。"), code: "fact.unverified" },
    { name: "架空の料理（店の料理として魚の名前）", draft: withTail("R-30 hizenでは、平目の握りを毎日お出ししています。"), code: "fact.dish" },
    { name: "事実に無い数値（営業時間）", draft: withTail("R-30 hizenは、17時から営業しています。"), code: "fact.number" },
    { name: "年齢の表記ゆれ（30歳以下）", draft: withTail(`R-30 hizenは、${agePolicy.minAge}歳以下の方は入店できません。`), code: "age.wording" },
    { name: "移転前の住所", draft: withTail(`以前は${restaurant.legacy.formerAddressPatterns[0]}西4丁目にありました。`), code: "unsupported" },
    { name: "存在しないページへのリンク", draft: withTail("詳しくは[個室のご案内](/private-room)へ。"), code: "link.missing" },
    { name: "サイトの外へのリンク", draft: withTail("詳しくは[こちらのサイト](https://example.com/)へ。"), code: "link.external" },
    { name: "柱のページへのリンクが無い", draft: { ...fixture, body: fixture.body.replace("[鮨と料理のページ](/cuisine)", "鮨と料理のページ") }, code: "link.pillar" },
    { name: "関連記事へのリンクが足りない", draft: { ...fixture, body: fixture.body.replace("[昆布〆の話](/journal/kobujime-toha)", "昆布〆の話") }, code: "link.related" },
    { name: "本文が短い", draft: { ...fixture, body: fixture.body.slice(0, 900) }, code: "length.body" },
    { name: "h1 がある", draft: { ...fixture, body: `# 煮ツメとは\n\n${fixture.body}` }, code: "h1" },
    { name: "見出しが「まとめ」", draft: withTail("## まとめ\n\n煮ツメは、煮汁を煮詰めたたれです。"), code: "heading.stock" },
    { name: "表の見出しに空のマス", draft: withTail("| | 生の種 | 煮た種 |\n| --- | --- | --- |\n| 塗るもの | 煮切り | 煮ツメ |"), code: "table.header" },
    { name: "最後の節が、店の紹介", draft: withTail("## R-30 hizenについて\n\nR-30 hizenは、カウンター席のみの鮨店です。"), code: "shop.tail" },
    { name: "どの記事にも付く定型の見出し", draft: withTail("## R-30 hizenについて\n\nR-30 hizenは、カウンター席のみの鮨店です。"), code: "shop.template" },
    { name: "ほかの記事と同じ文の使い回し", draft: withTail(borrowed), code: "dup.sentence" },
    { name: "答えている問い（semanticTopic）が無い", draft: { ...fixture, semanticTopic: undefined }, code: "semantic.missing" },
    {
      name: "題材が既存の記事と近すぎる",
      draft: { ...fixture, semanticTopic: kobujime?.semanticTopic },
      code: "dup.theme",
    },
    {
      name: "題名に「すすきの＋寿司」が続く",
      draft: { ...fixture, title: "すすきので寿司を食べる前に知りたい、煮ツメの話" },
      code: "title.headterm",
      others: headTermPosts,
    },
    { name: "固定ページと同じ検索語", draft: fixture, code: "cannibal.page", target: { ...target, primaryKeyword: pages.omakaseSushi.primaryKeyword } },
    { name: "既存の記事と同じ検索語", draft: fixture, code: "cannibal.post", target: { ...target, primaryKeyword: posts[0]?.primaryKeyword ?? "" } },
    { name: "既存の記事の写し", draft: { ...fixture, body: kobujime?.body ?? "" }, code: "dup.body" },
  ];
  for (const c of cases) {
    const found = validateArticle(c.draft, c.target ?? target, c.others ?? posts, c.options);
    check(`落とす: ${c.name}`, found.some((p) => p.code === c.code), `期待 [${c.code}] ／ 実際 ${found.map((p) => p.code).join(", ") || "なし"}`);
  }

  // 店からのメモがあるときは、メモにある魚の名前・産地を店の事実として書ける
  const memo = ["今週は、平目を昆布〆にしています。"];
  const withMemo = validateArticle(withTail("R-30 hizenでは今週、平目を昆布〆にしています。"), target, posts, { noteFacts: memo });
  check("店からのメモにある魚の名前は通す", !withMemo.some((p) => p.code === "fact.dish"), withMemo.map((p) => p.code).join(", "));
  const withoutMemo = validateArticle(withTail("R-30 hizenでは今週、平目を昆布〆にしています。"), target, posts);
  check("メモが無ければ、同じ文を落とす", withoutMemo.some((p) => p.code === "fact.dish"));
}

// ---------------------------------------------------------------------------
console.log("\n4. 題材選び");
{
  const date = "2026-10-08";
  const a = selectTopic(posts, date);
  const b = selectTopic(posts, date);
  check("題材が選ばれる", Boolean(a));
  check("同じ状態なら、同じ題材が選ばれる", a?.id === b?.id);

  const shares = tierShares(posts);
  const order = tierOrder(posts);
  const deficit = (t: "A" | "B" | "C") => TIER_TARGET[t] - shares[t];
  check("優先度は、目安との差が大きい順に並ぶ", deficit(order[0]) >= deficit(order[1]) && deficit(order[1]) >= deficit(order[2]), order.join(" → "));
  check("記事の優先度が決まる", posts.every((p) => ["A", "B", "C"].includes(tierOfPost(p))));

  if (a) {
    check("直前の記事と別の分類", a.category !== posts[0]?.category, `${a.category} / 直前 ${posts[0]?.category}`);
    check("その月に出してよい題材", !a.months || a.months.includes(10), a.id);
    check("いちばん足りていない優先度の題材が選ばれる", a.tier === order[0], `${a.tier}（順番 ${order.join(" → ")}）`);
    check("書き方の型が選ばれる", Boolean(selectFormat(a, posts).id));
    const prompt = buildUserPrompt({ job: a, format: selectFormat(a, posts), date, candidates: posts.slice(0, 4), recent: posts.slice(0, 3), headTermAllowed: true });
    check("その日の指示に、優先度ごとの書き方が入る", prompt.includes("この記事の位置づけ"));
    console.log(`       次に選ばれる題材: ${a.primaryKeyword}（${a.id}・優先度 ${a.tier}）`);
  }

  const { jobs, skipped } = candidateJobs(posts, date);
  check("公開済みの記事と近すぎる題材は、候補に入らない", jobs.every((j) => !skipped.some((s) => s.id === j.id)));
  console.log(`       候補 ${jobs.length} 本／近すぎて見送り ${skipped.length} 本${skipped.length ? `（${skipped.slice(0, 3).map((s) => s.id).join(", ")}…）` : ""}`);
  check("近さの目安が 0〜1 の間にある", THEME_TOO_CLOSE > 0 && THEME_TOO_CLOSE < 1);

  const winter = selectTopic(posts, "2027-01-15");
  check("1月にも題材が選ばれる", Boolean(winter), winter?.id);

  // 店からのメモは、ほかの題材より先に書かれる
  const note = { id: "memo-selftest", date, kind: "仕込み" as const, subject: "点検用のメモ", primaryKeyword: "点検 メモ 鮨", facts: ["点検用の事実です。"] };
  const job = jobFromNote(note);
  check("店からのメモは、優先度 A の題材になる", job.tier === "A" && job.note === note);
  check("店からのメモの id が、題材の id と重なっていない", shopNotes.every((n) => !topics.some((t) => t.id === n.id)));
  check("店からのメモに、事実が1つ以上ある", shopNotes.every((n) => n.facts.length > 0 && n.facts.every((f) => f.trim().length > 0)));
  console.log(`       店からのメモ ${shopNotes.length} 件`);
}

console.log(failures === 0 ? "\nすべて通りました。" : `\n${failures} 件の不備があります。`);
if (failures > 0) process.exit(1);
