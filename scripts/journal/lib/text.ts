/** 文章の比較に使う小さな道具 */

/** 記号・空白を落として比べやすくする */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s　、。，．・｜|「」『』（）()［］\[\]！？!?：:；;〜~\-―—–]/g, "")
    .replace(/鮨|すし|鮓/g, "寿司");
}

function bigrams(s: string): Map<string, number> {
  const m = new Map<string, number>();
  for (let i = 0; i < s.length - 1; i++) {
    const g = s.slice(i, i + 2);
    m.set(g, (m.get(g) ?? 0) + 1);
  }
  return m;
}

/**
 * 2文字単位の Dice 係数（0〜1）。題名や検索語のような短い文に使う。
 * 本文には使わない（同じ分野の日本語は、別の記事でも 0.5 近くまで上がってしまう）。
 */
export function dice(a: string, b: string): number {
  const x = bigrams(normalize(a));
  const y = bigrams(normalize(b));
  let hit = 0;
  let total = 0;
  for (const [g, n] of x) {
    total += n;
    hit += Math.min(n, y.get(g) ?? 0);
  }
  for (const n of y.values()) total += n;
  return total === 0 ? 0 : (2 * hit) / total;
}

function shingles(s: string, k: number): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i <= s.length - k; i++) out.add(s.slice(i, i + k));
  return out;
}

/**
 * 8文字の連なりが、どれだけ重なっているか（0〜1）。本文の「焼き直し・写し」を見つけるために使う。
 * 別の記事どうしなら 0.15 ほどまでに収まる。0.2 を超えたら、同じ文章の言い換えを疑う。
 */
export function shingleOverlap(a: string, b: string, k = 8): number {
  const x = shingles(a, k);
  const y = shingles(b, k);
  if (x.size === 0 || y.size === 0) return 0;
  let hit = 0;
  for (const g of x) if (y.has(g)) hit++;
  return hit / Math.min(x.size, y.size);
}

/** 検索語を比べるための正規化（語の順番を無視し、寿司／鮨の表記ゆれを吸収する） */
export function keywordKey(keyword: string): string {
  return keyword
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => normalize(w))
    .sort()
    .join(" ");
}

/** 文に分ける（。！？と改行で区切る） */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[。！？!?])|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 文字列から決まった数を作る（題材ごとに、いつも同じ写真・同じ型を選ぶため） */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
