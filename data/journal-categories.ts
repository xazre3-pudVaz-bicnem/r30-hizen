/**
 * 「季節の便り」（/journal）のカテゴリ＝トピッククラスター。
 *
 * 記事は必ずどれか1つに属し、そのカテゴリの pillar（固定ページ）を本文中から紹介する。
 * photos は記事の見出し写真の候補（data/photos.ts のキー）。記事ごとに slug から決まった1枚が選ばれる。
 */
import type { PageKey } from "./pages";

export type JournalCategory = {
  slug: string;
  name: string;
  /** カテゴリ一覧ページの導入文 */
  description: string;
  /** このクラスターが支える固定ページ */
  pillar: PageKey;
  photos: string[];
};

export const journalCategories: JournalCategory[] = [
  {
    slug: "susukino-sushi",
    name: "すすきのと寿司",
    description: "すすきので寿司を食べる夜の、店選びと過ごし方について。",
    pillar: "susukinoSushi",
    photos: ["counter01", "sushi01", "chef02"],
  },
  {
    slug: "anniversary",
    name: "記念日",
    description: "結婚記念日や誕生日を、鮨とともに過ごすための読みもの。",
    pillar: "anniversary",
    photos: ["omakase02", "sushi02", "entrance01"],
  },
  {
    slug: "date",
    name: "デート",
    description: "大人二人の食事に、カウンターの鮨を選ぶときの手引き。",
    pillar: "date",
    photos: ["sushi03", "counter01", "sake01"],
  },
  {
    slug: "business",
    name: "接待・会食",
    description: "接待や会食の席に寿司店を選ぶ方へ。幹事が確かめておきたいこと。",
    pillar: "businessDinner",
    photos: ["counter01", "chef01", "sushi01"],
  },
  {
    slug: "omakase",
    name: "おまかせ",
    description: "品書きのない「おまかせ」という頼み方を、気負わず楽しむために。",
    pillar: "omakaseSushi",
    photos: ["omakase01", "chef03", "sushi04"],
  },
  {
    slug: "knowledge",
    name: "鮨の知識",
    description: "昆布〆、煮ツメ、隠し包丁。握りを支える仕事と、言葉の意味。",
    pillar: "cuisine",
    photos: ["chef01", "sushi02", "chef03"],
  },
  {
    slug: "season",
    name: "旬の魚",
    description: "春夏秋冬、北の海で旬を迎える魚介のこと。",
    pillar: "cuisine",
    photos: ["sushi01", "season01", "sushi04"],
  },
  {
    slug: "sake-wine",
    name: "日本酒とワイン",
    description: "鮨に合わせる日本酒、ワイン、シャンパンの考え方。",
    pillar: "drink",
    photos: ["sake01", "cuisine01", "counter02"],
  },
  {
    slug: "sapporo",
    name: "すすきの・札幌",
    description: "札幌の旅や出張の夜に。すすきのという街での過ごし方。",
    pillar: "access",
    photos: ["entrance01", "counter01", "entrance02"],
  },
  {
    slug: "hizen",
    name: "R-30 hizenのこと",
    description: "コースの選び方や、ご来店の前にお伝えしておきたいこと。",
    pillar: "concept",
    photos: ["entrance02", "omakase02", "chef02"],
  },
];

export const categorySlugs = journalCategories.map((c) => c.slug);

/** 記事がこの本数に満たない分類の一覧ページは、検索エンジンに載せない（noindex・sitemap からも外す） */
export const MIN_POSTS_TO_INDEX = 3;

export function categoryBySlug(slug: string): JournalCategory | undefined {
  return journalCategories.find((c) => c.slug === slug);
}
