/**
 * 文字列で書いた見出し・導入文が、どこで折り返されるか（文節の区切り）を一覧にする。
 *   npx tsx scripts/phrase-check.ts
 * 語の途中で切れているものが無いか、目で確かめるための道具。
 */
import fs from "node:fs";
import path from "node:path";
import { splitPhrases } from "../components/ui/Phrase";
import { reservationFaqs } from "../data/faq";
import { notices } from "../data/site";
import { loadPosts } from "../lib/journal-core";

const found = new Set<string>();
function walk(dir: string) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (name.endsWith(".tsx")) {
      const src = fs.readFileSync(full, "utf8");
      for (const m of src.matchAll(/(?:heading|title|lead|q)[=:]\s*"([^"]{6,})"/g)) found.add(m[1]);
    }
  }
}
walk(path.join(process.cwd(), "app"));
for (const n of notices) found.add(n.title);
for (const f of reservationFaqs) found.add(f.q);
for (const p of loadPosts()) found.add(p.title);

for (const s of found) {
  const parts = splitPhrases(s);
  const suspicious = parts.some((p) => [...p].length === 1) ? "  ← 1文字の区切り" : "";
  console.log(parts.join(" ｜ ") + suspicious);
}
