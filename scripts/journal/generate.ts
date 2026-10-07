/**
 * 季節の便りを1本、自動で書く。
 *   npm run journal:generate        … 書いて content/journal/ に保存する（GitHub Actions が毎日実行）
 *   npm run journal:dry-run         … 書いて検査するが、保存しない（試し書き）
 *
 * 流れ
 *   1. 今日の分がすでにあれば、何もしない
 *   2. 題材を1つ選ぶ（data/journal-topics.ts。使った検索語・直近の分類と重ならないもの）
 *   3. Claude に書かせる（店の事実は data/site.ts・data/courses.ts から渡す）
 *   4. 検査する（lib/validate.ts）。落ちたら、指摘だけを渡して書き直させる
 *   5. 通ったときだけ保存する。通らなければ保存せずに終了コード 1（その日は公開しない）
 *
 * 環境変数
 *   ANTHROPIC_API_KEY  必須（.env.local か、GitHub の Secrets に置く。リポジトリには絶対に入れない）
 *   CLAUDE_MODEL       使うモデル。省くと claude-haiku-4-5
 *   DRY_RUN=1          保存しない
 *   DRY_RUN_FIXTURE    記事の JSON ファイル。API を呼ばず、その内容を「モデルの出力」として検査だけ行う
 *   JOURNAL_TOPIC      題材の id を指定する（試したい題材があるとき）
 *   JOURNAL_DATE       日付を指定する（YYYY-MM-DD）
 *   JOURNAL_FORCE=1    今日の分があっても書く
 *   JOURNAL_WRITE_DIR  保存先を変える（試し書き用）
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { categoryBySlug, journalCategories } from "../../data/journal-categories";
import { topics, type Topic } from "../../data/journal-topics";
import { linkablePages, pageList, pages, type PageKey } from "../../data/pages";
import { JOURNAL_DIR, loadPosts, plainText, todayJst, type Post } from "../../lib/journal-core";
import { buildRevisionPrompt, buildSystemPrompt, buildTopicProposalPrompt, buildUserPrompt } from "./lib/prompt";
import { pickPhoto, relatedCandidates, selectFormat, selectTopic, usedKeywordKeys } from "./lib/select";
import { keywordKey } from "./lib/text";
import { RESERVED_SLUGS, validateArticle, type Draft, type Problem } from "./lib/validate";

/** 既定のモデル。コストを抑えるため Haiku。CLAUDE_MODEL で差し替えられる */
const DEFAULT_MODEL = "claude-haiku-4-5";
const MAX_ATTEMPTS = Number(process.env.JOURNAL_MAX_ATTEMPTS ?? 4);

const DraftSchema = z.object({
  title: z.string(),
  description: z.string(),
  summary: z.string(),
  body: z.string(),
  secondaryKeywords: z.array(z.string()),
});

const TopicSchema = z.object({
  id: z.string(),
  primaryKeyword: z.string(),
  secondaryKeywords: z.array(z.string()),
  angle: z.string(),
  pillar: z.string(),
});

function loadEnvFile() {
  // 手元で動かすときは .env.local を読む（GitHub Actions では Secrets が環境変数に入っている）
  for (const name of [".env.local", ".env"]) {
    const file = path.join(process.cwd(), name);
    if (fs.existsSync(file)) {
      try {
        process.loadEnvFile(file);
      } catch {
        // 読めなくても続ける
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Claude の呼び出し
// ---------------------------------------------------------------------------

type Usage = { input: number; output: number; cacheRead: number; cacheWrite: number };
const usage: Usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

function track(u: Anthropic.Usage) {
  usage.input += u.input_tokens;
  usage.output += u.output_tokens;
  usage.cacheRead += u.cache_read_input_tokens ?? 0;
  usage.cacheWrite += u.cache_creation_input_tokens ?? 0;
}

async function ask<T>(
  client: Anthropic,
  model: string,
  schema: z.ZodType<T>,
  messages: Anthropic.MessageParam[],
): Promise<T> {
  const response = await client.messages.parse({
    model,
    max_tokens: 16000,
    // 毎日同じ内容なので、書き直しのあいだキャッシュから読めるようにしておく
    system: [{ type: "text", text: buildSystemPrompt(), cache_control: { type: "ephemeral" } }],
    messages,
    output_config: { format: zodOutputFormat(schema) },
  });
  track(response.usage);

  if (response.stop_reason === "refusal") throw new Error("モデルが応答を断りました（refusal）");
  if (response.stop_reason === "max_tokens") throw new Error("出力が途中で切れました（max_tokens）");
  if (!response.parsed_output) throw new Error("出力を解釈できませんでした");
  return response.parsed_output;
}

function describeApiError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "API キーが正しくありません（ANTHROPIC_API_KEY を確かめてください）";
  if (e instanceof Anthropic.PermissionDeniedError) return "この API キーでは、指定のモデルを使えません";
  if (e instanceof Anthropic.NotFoundError) return `モデルが見つかりません（CLAUDE_MODEL を確かめてください）`;
  if (e instanceof Anthropic.RateLimitError) return "利用の上限に達しました（時間をおいて再実行してください）";
  if (e instanceof Anthropic.BadRequestError) return `リクエストが受け付けられませんでした: ${e.message}`;
  if (e instanceof Anthropic.APIConnectionError) return "API に接続できませんでした";
  if (e instanceof Anthropic.APIError) return `API エラー（${e.status}）: ${e.message}`;
  return e instanceof Error ? e.message : String(e);
}

// ---------------------------------------------------------------------------
// 題材が尽きたとき：モデルに1つ提案させ、同じ基準で確かめる
// ---------------------------------------------------------------------------

function checkProposedTopic(raw: z.infer<typeof TopicSchema>, category: string, posts: Post[]): { topic?: Topic; errors: string[] } {
  const errors: string[] = [];
  const id = raw.id.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+){1,6}$/.test(id)) errors.push("id は半角英小文字とハイフン（2〜7語）");
  if (RESERVED_SLUGS.includes(id)) errors.push(`id「${id}」は使えない`);
  if (posts.some((p) => p.slug === id) || topics.some((x) => x.id === id)) errors.push(`id「${id}」はすでにある`);

  const key = keywordKey(raw.primaryKeyword);
  const words = raw.primaryKeyword.trim().split(/\s+/);
  if (words.length < 2 || words.length > 5) errors.push("primaryKeyword は 2〜5 語");
  if (usedKeywordKeys(posts).has(key) || topics.some((x) => keywordKey(x.primaryKeyword) === key)) {
    errors.push(`検索語「${raw.primaryKeyword}」はすでに使われている`);
  }
  if (/個室|夜景|サプライズ|ランキング|人気|おすすめ\s*\d|口コミ|安い|格安|食べ放題|ランチ|No\.?1/.test(`${raw.primaryKeyword} ${raw.angle}`)) {
    errors.push("店の事実に無いこと・評価のことばを前提にした題材は不可");
  }

  const pillarKey = linkablePages.find((k) => pages[k].path === raw.pillar.trim());
  if (!pillarKey) errors.push(`pillar は固定ページのパスから選ぶ: ${raw.pillar}`);

  if (errors.length || !pillarKey) return { errors };
  return {
    errors,
    topic: {
      id,
      category,
      primaryKeyword: raw.primaryKeyword.trim().replace(/\s+/g, " "),
      secondaryKeywords: raw.secondaryKeywords.slice(0, 3),
      angle: raw.angle.trim(),
      pillar: pillarKey as PageKey,
    },
  };
}

async function proposeTopic(client: Anthropic, model: string, posts: Post[], date: string): Promise<Topic> {
  // 記事のいちばん少ない分類（直近2本とは別）で考えさせる
  const recent = posts.slice(0, 2).map((p) => p.category);
  const category = [...journalCategories]
    .filter((c) => !recent.includes(c.slug))
    .sort((a, b) => posts.filter((p) => p.category === a.slug).length - posts.filter((p) => p.category === b.slug).length)[0].slug;

  const used = [...pageList.map((p) => p.primaryKeyword), ...posts.map((p) => p.primaryKeyword)];
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: buildTopicProposalPrompt({ category, usedKeywords: used, month: Number(date.slice(5, 7)) }) },
  ];

  for (let i = 1; i <= 3; i++) {
    const raw = await ask(client, model, TopicSchema, messages);
    const { topic, errors } = checkProposedTopic(raw, category, posts);
    if (topic) {
      console.log(`  題材を新しく作りました: ${topic.primaryKeyword}（${topic.id}）`);
      return topic;
    }
    console.log(`  題材の提案 ${i} 回目は不採用: ${errors.join(" / ")}`);
    messages.push({ role: "assistant", content: JSON.stringify(raw) });
    messages.push({ role: "user", content: `この題材は使えません。理由: ${errors.join("。")}。別の題材を提案してください。` });
  }
  throw new Error("新しい題材を作れませんでした。data/journal-topics.ts に題材を追記してください");
}

// ---------------------------------------------------------------------------
// 保存
// ---------------------------------------------------------------------------

function toMarkdown(args: { draft: Draft; topic: Topic; date: string; format: string; photo: string; model: string }): string {
  const { draft, topic, date, format, photo, model } = args;
  const q = (s: string) => JSON.stringify(s);
  const front = [
    "---",
    `title: ${q(draft.title)}`,
    `description: ${q(draft.description)}`,
    `summary: ${q(draft.summary)}`,
    `date: ${q(date)}`,
    `category: ${q(topic.category)}`,
    `primaryKeyword: ${q(topic.primaryKeyword)}`,
    `secondaryKeywords: [${draft.secondaryKeywords.map(q).join(", ")}]`,
    `pillar: ${q(pages[topic.pillar].path)}`,
    `photo: ${q(photo)}`,
    `topicId: ${q(topic.id)}`,
    `format: ${q(format)}`,
    `author: "auto"`,
    `model: ${q(model)}`,
    "---",
    "",
  ].join("\n");
  return `${front}\n${draft.body.trim()}\n`;
}

function cleanDraft(d: Draft): Draft {
  return {
    title: d.title.trim(),
    description: d.description.trim().replace(/\s*\n\s*/g, ""),
    summary: d.summary.trim().replace(/\s*\n\s*/g, ""),
    body: d.body.replace(/\r\n/g, "\n").trim(),
    secondaryKeywords: [...new Set(d.secondaryKeywords.map((k) => k.trim()).filter(Boolean))].slice(0, 5),
  };
}

// ---------------------------------------------------------------------------
// 本体
// ---------------------------------------------------------------------------

async function main() {
  loadEnvFile();

  const date = process.env.JOURNAL_DATE || todayJst();
  const dryRun = process.env.DRY_RUN === "1";
  const fixture = process.env.DRY_RUN_FIXTURE;
  const model = process.env.CLAUDE_MODEL || process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const writeDir = process.env.JOURNAL_WRITE_DIR ? path.resolve(process.env.JOURNAL_WRITE_DIR) : JOURNAL_DIR;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`日付の形が違います: ${date}`);

  const posts = loadPosts();
  console.log(`季節の便り 自動投稿 — ${date}／既存 ${posts.length} 本／モデル ${fixture ? "（使わない）" : model}${dryRun ? "／試し書き" : ""}`);

  if (!process.env.JOURNAL_FORCE && posts.some((p) => p.date === date && p.author === "auto")) {
    console.log("今日の分は、すでにあります。何もしません。");
    return;
  }

  let client: Anthropic | undefined;
  if (!fixture) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY がありません。手元では .env.local に、GitHub では Secrets に登録してください");
    }
    client = new Anthropic({ maxRetries: 3, timeout: 10 * 60 * 1000 });
  }

  let topic = selectTopic(posts, date, process.env.JOURNAL_TOPIC);
  if (!topic) {
    if (!client) throw new Error("書ける題材がありません（試し書きでは JOURNAL_TOPIC を指定してください）");
    console.log("用意した題材を書き終えました。新しい題材を作ります。");
    topic = await proposeTopic(client, model, posts, date);
  }

  const format = selectFormat(topic, posts);
  const candidates = relatedCandidates(topic, posts);
  const target = {
    slug: topic.id,
    category: topic.category,
    primaryKeyword: topic.primaryKeyword,
    pillar: pages[topic.pillar].path,
  };
  console.log(`  題材: ${topic.primaryKeyword}（${topic.id}／${categoryBySlug(topic.category)?.name}／型 ${format.id}）`);

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: buildUserPrompt({ topic, format, date, candidates, recentTitles: posts.slice(0, 12).map((p) => p.title) }),
    },
  ];

  let accepted: Draft | undefined;
  let lastProblems: Problem[] = [];

  for (let attempt = 1; attempt <= (fixture ? 1 : MAX_ATTEMPTS); attempt++) {
    let draft: Draft;
    if (fixture) {
      draft = cleanDraft(DraftSchema.parse(JSON.parse(fs.readFileSync(fixture, "utf8"))));
    } else {
      draft = cleanDraft(await ask(client!, model, DraftSchema, messages));
    }

    lastProblems = validateArticle(draft, target, posts);
    const chars = plainText(draft.body).length;
    if (lastProblems.length === 0) {
      console.log(`  試行 ${attempt}: 合格（${chars}字）「${draft.title}」`);
      accepted = draft;
      break;
    }
    console.log(`  試行 ${attempt}: 不合格（${chars}字）— ${lastProblems.length} 件`);
    for (const p of lastProblems) console.log(`      - [${p.code}] ${p.message}`);

    // 指摘だけを渡して、同じ原稿を直させる（全文を書き直させると、別の所に新しい誤りが入る）
    messages.push({ role: "assistant", content: JSON.stringify(draft) });
    messages.push({ role: "user", content: buildRevisionPrompt(lastProblems) });
  }

  if (!fixture) {
    console.log(
      `  トークン: 入力 ${usage.input}／出力 ${usage.output}／キャッシュ読込 ${usage.cacheRead}／キャッシュ書込 ${usage.cacheWrite}`,
    );
  }

  if (!accepted) {
    console.error("検査を通る原稿ができませんでした。今日は公開しません。");
    process.exitCode = 1;
    return;
  }

  const photo = pickPhoto(topic);
  const markdown = toMarkdown({ draft: accepted, topic, date, format: format.id, photo, model: fixture ? "fixture" : model });

  if (dryRun) {
    console.log("\n----- 試し書き（保存しません） -----\n");
    console.log(markdown);
    return;
  }

  fs.mkdirSync(writeDir, { recursive: true });
  const file = path.join(writeDir, `${topic.id}.md`);
  if (fs.existsSync(file)) throw new Error(`同じ名前の記事がすでにあります: ${file}`);
  fs.writeFileSync(file, markdown, "utf8");
  console.log(`  保存しました: ${path.relative(process.cwd(), file)}`);

  // GitHub Actions のコミットメッセージ用
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `title=${accepted.title}\nslug=${topic.id}\n`);
  }
}

main().catch((e) => {
  console.error(`失敗しました: ${describeApiError(e)}`);
  process.exit(1);
});
