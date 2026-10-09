/**
 * 検索語を比べるための正規化。
 * サイト（data/pages.ts の検索意図マップ）と、自動投稿・点検のスクリプトの両方から使うので、
 * ここでは next/* を import しない。
 */

/** 記号・空白を落とし、「鮨／すし／鮓」を「寿司」にそろえる */
export function normalizeTerm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s　、。，．・｜|「」『』（）()［］\[\]！？!?：:；;〜~\-―—–]/g, "")
    .replace(/鮨|すし|鮓/g, "寿司");
}

/**
 * 検索語の「同じかどうか」を決める鍵。語の順番と、寿司／鮨の表記ゆれを無視する。
 * 「すすきの 寿司 記念日」と「記念日 すすきの 鮨」は同じ鍵になる。
 */
export function keywordKey(keyword: string): string {
  return keyword
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => normalizeTerm(w))
    .sort()
    .join(" ");
}

export type KeywordOwner = { where: string; keyword: string };

/** 同じ検索語を担当しているものの組を返す（無ければ空） */
export function findKeywordConflicts(owners: KeywordOwner[]): { key: string; first: KeywordOwner; second: KeywordOwner }[] {
  const seen = new Map<string, KeywordOwner>();
  const out: { key: string; first: KeywordOwner; second: KeywordOwner }[] = [];
  for (const o of owners) {
    const key = keywordKey(o.keyword);
    const first = seen.get(key);
    if (first) out.push({ key, first, second: o });
    else seen.set(key, o);
  }
  return out;
}
