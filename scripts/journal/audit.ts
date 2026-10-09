/**
 * 公開済みの記事を、自動投稿と同じ基準で点検する。
 *   npm run journal:audit
 *
 * ・1本でも問題があれば終了コード 1（GitHub Actions が push を止める）
 * ・料金や営業時間を data 側で直したあとに実行すると、古い数字が残っている記事が見つかる
 * ・店からのメモ（data/shop-notes.ts）をもとに書いた記事は、そのメモを事実の出どころとして検査する
 * ・--warn を付けると、問題があっても終了コード 0（一覧だけ見たいとき）
 */
import { noteById } from "../../data/shop-notes";
import { loadPosts } from "../../lib/journal-core";
import { tierOfPost, tierShares } from "./lib/select";
import { validateArticle } from "./lib/validate";

const warnOnly = process.argv.includes("--warn");
const posts = loadPosts();
let failed = 0;

for (const post of posts) {
  const others = posts.filter((p) => p.slug !== post.slug);
  const problems = validateArticle(
    {
      title: post.title,
      description: post.description,
      summary: post.summary,
      body: post.body,
      secondaryKeywords: post.secondaryKeywords,
      semanticTopic: post.semanticTopic,
    },
    { slug: post.slug, category: post.category, primaryKeyword: post.primaryKeyword, pillar: post.pillar, date: post.date },
    others,
    { noteFacts: noteById(post.topicId)?.facts },
  );
  if (problems.length === 0) {
    console.log(`  ok   ${post.slug}（${post.chars}字・優先度 ${tierOfPost(post)}）`);
  } else {
    failed++;
    console.log(`  NG   ${post.slug}（${post.chars}字）`);
    for (const p of problems) console.log(`         - [${p.code}] ${p.message}`);
  }
}

const shares = tierShares(posts);
const pct = (n: number) => `${Math.round(n * 100)}%`;
console.log(`\n${posts.length} 本を点検 — 問題あり ${failed} 本`);
console.log(`最近の配分（新しい順に 14 本まで）: A ${pct(shares.A)}／B ${pct(shares.B)}／C ${pct(shares.C)}`);
if (failed > 0 && !warnOnly) process.exit(1);
