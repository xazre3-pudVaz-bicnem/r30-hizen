/**
 * 店からのメモ（一次情報）。
 *
 * 「今週の魚」「今日の仕込み」「この一皿のこと」のように、**この店にしか書けない記事**の材料を置く場所。
 * 自動投稿（季節の便り）は、まだ記事にしていないメモがあれば、ほかの題材より先にそれを書く。
 *
 * 決まり
 * ・ここに書くのは、店主・女将から聞き取った事実だけ。想像や一般論を書かない。
 *   （魚の名前・産地・仕入先・仕込みの方法は、店から聞いたときだけ、聞いたとおりに書く）
 * ・1つのメモ＝1本の記事。facts は一文ずつ、短く。記事に書けるのは、facts と data/restaurant.ts にあることだけ。
 *   検査（scripts/journal/lib/validate.ts）は、facts に無い魚の名前・産地・数字が店の話として出てきたら止める。
 * ・「今週」「今日」のように古くなる話には、until（その日まで）を付ける。過ぎたメモは書かれない。
 * ・記事になったメモも、ここから消さない（公開済みの記事を点検するときに、事実の出どころとして使う）。
 *
 * いまは空。聞き取った内容が無いうちは、自動投稿は data/journal-topics.ts の題材を
 * 「店のこと → すすきのでの場面 → 鮨の一般知識」の優先で書く。
 *
 * 書き方の例（これは見本。実際の内容ではないので、配列には入れていない）
 *
 *   {
 *     id: "memo-2026-11-kobujime",          // 記事の URL（/journal/<id>）になる。半角英小文字・数字・ハイフン
 *     date: "2026-11-04",                   // 聞き取った日
 *     kind: "仕込み",
 *     subject: "この時季の昆布〆",           // 何の話か（ひとこと）
 *     primaryKeyword: "昆布〆 仕込み 鮨",    // 担当する検索語
 *     facts: [
 *       "（店から聞いた事実を、一文ずつ）",
 *       "（魚の名前や産地は、聞いたとおりに。聞いていないことは書かない）",
 *     ],
 *     until: "2026-11-30",                  // 古くなる話なら
 *   },
 */
import type { PageKey } from "./pages";

export type ShopNote = {
  /** 記事の slug になる。半角英小文字・数字・ハイフン */
  id: string;
  /** 聞き取った日（YYYY-MM-DD） */
  date: string;
  kind: "仕入れ" | "仕込み" | "一皿" | "酒" | "季節" | "店のこと";
  /** 何の話か（ひとこと）。題名の手がかりになる */
  subject: string;
  /** 店から聞いた事実。一文ずつ */
  facts: string[];
  /** この日を過ぎたら書かない（YYYY-MM-DD）。省くと、いつでも書ける */
  until?: string;
  /**
   * 担当する検索語（2〜4語を半角スペースで区切る）。例: "昆布〆 仕込み 鮨"
   * 記事の題名か説明文、本文に、この語が入る。固定ページやほかの記事と同じ語にしない。
   */
  primaryKeyword: string;
  secondaryKeywords?: string[];
  /** 分類（data/journal-categories.ts の slug）。省くと hizen（R-30 hizenのこと） */
  category?: string;
  /** 本文から必ず紹介する固定ページ。省くと cuisine（鮨と料理） */
  pillar?: PageKey;
};

export const shopNotes: ShopNote[] = [];

export function noteById(id: string | undefined): ShopNote | undefined {
  return id ? shopNotes.find((n) => n.id === id) : undefined;
}
