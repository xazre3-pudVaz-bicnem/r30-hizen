/**
 * 記事ごとの OGP 画像（1200x630）。
 *
 * 左に題名、右に記事の見出し写真。ビルド時に記事の数だけ作られる。
 * ・書体は assets/fonts の Zen Old Mincho（SIL Open Font License）。ここだけで使い、画面の表示には読み込まない
 * ・写真は npm run og:make で作った assets/og-photos/<写真のキー>.jpg
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { splitPhrases } from "@/components/ui/Phrase";
import { categoryBySlug } from "@/data/journal-categories";
import { pages } from "@/data/pages";
import { site } from "@/data/site";
import { getAllPosts, getPost } from "@/lib/journal";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name}｜${pages.journal.label}`;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

/** 左の面で、題名に使える幅（px） */
const TITLE_WIDTH = 512;

/**
 * 題名を、文節の切れ目で、長さのそろった行に分ける。
 * 自動の折り返しに任せると「…と／香り」のように1語だけ次の行へ落ちるため。
 */
function balancedLines(text: string, maxChars: number): string[] {
  const phrases = splitPhrases(text);
  const len = (s: string) => [...s].length;
  let best: string[] = [text];

  const search = (start: number, linesLeft: number, acc: string[], state: { max: number; out: string[] }) => {
    if (linesLeft === 1) {
      const lines = [...acc, phrases.slice(start).join("")];
      const worst = Math.max(...lines.map(len));
      if (worst < state.max) {
        state.max = worst;
        state.out = lines;
      }
      return;
    }
    for (let end = start + 1; end <= phrases.length - (linesLeft - 1); end++) {
      search(end, linesLeft - 1, [...acc, phrases.slice(start, end).join("")], state);
    }
  };

  for (let k = 1; k <= Math.min(4, phrases.length); k++) {
    const state = { max: Infinity, out: [text] };
    search(0, k, [], state);
    best = state.out;
    if (state.max <= maxChars) break;
  }
  return best;
}

async function dataUrl(file: string, mime: string): Promise<string | null> {
  try {
    const buf = await readFile(file);
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? pages.journal.label;
  const category = post ? categoryBySlug(post.category)?.name : undefined;
  const photoKey = post?.photo ?? "sushi01";

  const font = await readFile(path.join(process.cwd(), "assets", "fonts", "ZenOldMincho-Medium.ttf"));
  const photo =
    (await dataUrl(path.join(process.cwd(), "assets", "og-photos", `${photoKey}.jpg`), "image/jpeg")) ??
    (await dataUrl(path.join(process.cwd(), "assets", "og-photos", "sushi01.jpg"), "image/jpeg"));
  const logo = await dataUrl(path.join(process.cwd(), "public", "brand", "r30-hizen-logo.svg"), "image/svg+xml");

  // 題名は「｜」の前後で分け、前半を大きく組む。行の長さから字の大きさを決める
  const [main, sub] = title.split("｜");
  const mainLines = balancedLines(main, 10);
  const longest = Math.max(...mainLines.map((l) => [...l].length));
  const mainSize = Math.max(34, Math.min(58, Math.floor(TITLE_WIDTH / longest) - 3));
  const subLines = sub ? balancedLines(sub, 17) : [];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a0a0a", color: "#f2efe9", fontFamily: "Mincho" }}>
        <div style={{ width: 640, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 56px 60px 72px" }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: "#a09a90" }}>
            {pages.journal.label}
            {category ? `　／　${category}` : ""}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {mainLines.map((line) => (
              <div key={line} style={{ display: "flex", fontSize: mainSize, lineHeight: 1.55, letterSpacing: 3, whiteSpace: "nowrap" }}>
                {line}
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", marginTop: subLines.length ? 24 : 0 }}>
              {subLines.map((line) => (
                <div key={line} style={{ display: "flex", fontSize: 26, lineHeight: 1.65, letterSpacing: 2, color: "#d8d2c8", whiteSpace: "nowrap" }}>
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- 画像生成（satori）の中では <img> を使う
              <img src={logo} alt="" width={170} height={72} />
            ) : (
              <div style={{ display: "flex", fontSize: 34 }}>{site.name}</div>
            )}
            <div style={{ display: "flex", fontSize: 17, letterSpacing: 6, color: "#a09a90" }}>SUSUKINO / SAPPORO</div>
          </div>
        </div>

        <div style={{ width: 560, height: "100%", display: "flex" }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- 同上
            <img src={photo} alt="" width={560} height={630} style={{ objectFit: "cover" }} />
          ) : null}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Mincho", data: font, weight: 500, style: "normal" }],
    },
  );
}
