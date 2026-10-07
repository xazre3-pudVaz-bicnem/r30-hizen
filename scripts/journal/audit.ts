/**
 * 公開済みの記事を、自動投稿と同じ基準で点検する。
 *   npm run journal:audit
 *
 * ・1本でも問題があれば終了コード 1（GitHub Actions が push を止める）
 * ・料金や営業時間を data 側で直したあとに実行すると、古い数字が残っている記事が見つかる
 * ・--warn を付けると、問題があっても終了コード 0（一覧だけ見たいとき）
 */
import { loadPosts } from "../../lib/journal-core";
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
    },
    { slug: post.slug, category: post.category, primaryKeyword: post.primaryKeyword, pillar: post.pillar },
    others,
  );
  if (problems.length === 0) {
    console.log(`  ok   ${post.slug}（${post.chars}字）`);
  } else {
    failed++;
    console.log(`  NG   ${post.slug}（${post.chars}字）`);
    for (const p of problems) console.log(`         - [${p.code}] ${p.message}`);
  }
}

console.log(`\n${posts.length} 本を点検 — 問題あり ${failed} 本`);
if (failed > 0 && !warnOnly) process.exit(1);
