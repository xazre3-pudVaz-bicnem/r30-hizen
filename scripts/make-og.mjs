// OGP 画像を作る。
//   npm run og:make
//
// 1) 固定ページ用の画像（1200x630）を public/og/<名前>.jpg に書き出す。写真にロゴを重ねるだけで、文字は入れない。
// 2) 記事（季節の便り）の OGP 画像に使う写真の切り出しを assets/og-photos/<写真のキー>.jpg に書き出す。
//    記事の OGP は app/(pages)/journal/[slug]/opengraph-image.tsx が、題名を入れて記事ごとに作る。
//
// 写真やページを足したら、下の PAGES / PHOTO_KEYS に足して実行し直す。
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES = path.join(ROOT, "public", "images");
const OUT_PAGES = path.join(ROOT, "public", "og");
const OUT_PHOTOS = path.join(ROOT, "assets", "og-photos");
const LOGO = path.join(ROOT, "public", "brand", "r30-hizen-logo.svg");

const W = 1200;
const H = 630;

/** ページ名（data/pages.ts の ogImage と対応） → 使う写真と、切り抜きの重心 */
const PAGES = {
  home: ["hizen-counter-01", "centre"],
  concept: ["hizen-chef-01", "north"],
  cuisine: ["hizen-susukino-sushi-01", "centre"],
  omakase: ["hizen-cuisine-01", "south"],
  drink: ["hizen-sake-01", "centre"],
  space: ["hizen-counter-01", "south"],
  access: ["hizen-entrance-01", "south"],
  reservation: ["hizen-chef-02", "south"],
  journal: ["hizen-susukino-sushi-02", "centre"],
  "susukino-sushi": ["hizen-susukino-sushi-02", "east"],
  anniversary: ["hizen-cuisine-03", "centre"],
  date: ["hizen-cuisine-05", "centre"],
  "business-dinner": ["hizen-counter-02", "centre"],
  "omakase-sushi": ["hizen-cuisine-02", "centre"],
  "counter-sushi": ["hizen-chef-02", "centre"],
  "adult-sushi": ["hizen-cuisine-06", "centre"],
  solo: ["hizen-cuisine-04", "centre"],
};

/** 記事の見出し写真に使えるもの（data/photos.ts のキー → ファイル名） */
const PHOTO_KEYS = {
  counter01: "hizen-counter-01",
  counter02: "hizen-counter-02",
  entrance01: "hizen-entrance-01",
  entrance02: "hizen-entrance-02",
  sushi01: "hizen-susukino-sushi-01",
  sushi02: "hizen-susukino-sushi-02",
  sushi03: "hizen-susukino-sushi-03",
  sushi04: "hizen-susukino-sushi-04",
  chef01: "hizen-chef-01",
  chef02: "hizen-chef-02",
  chef03: "hizen-chef-03",
  omakase01: "hizen-omakase-01",
  omakase02: "hizen-omakase-02",
  omakase03: "hizen-omakase-03",
  cuisine01: "hizen-cuisine-01",
  cuisine02: "hizen-cuisine-02",
  cuisine03: "hizen-cuisine-03",
  cuisine04: "hizen-cuisine-04",
  cuisine05: "hizen-cuisine-05",
  cuisine06: "hizen-cuisine-06",
  sake01: "hizen-sake-01",
  season01: "hizen-season-01",
};

await mkdir(OUT_PAGES, { recursive: true });
await mkdir(OUT_PHOTOS, { recursive: true });

const logoSvg = await readFile(LOGO);
const LOGO_W = 230;
const logoPng = await sharp(logoSvg, { density: 300 }).resize({ width: LOGO_W }).png().toBuffer();
const logoMeta = await sharp(logoPng).metadata();

// 下と左を暗くして、ロゴを読めるようにする
const shade = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0a0a0a" stop-opacity="0.30"/>
        <stop offset="0.45" stop-color="#0a0a0a" stop-opacity="0.12"/>
        <stop offset="1" stop-color="#0a0a0a" stop-opacity="0.86"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#v)"/>
  </svg>`,
);

for (const [name, [file, gravity]] of Object.entries(PAGES)) {
  const out = path.join(OUT_PAGES, `${name}.jpg`);
  await sharp(path.join(IMAGES, `${file}.webp`))
    .resize(W, H, { fit: "cover", position: gravity })
    .composite([
      { input: shade, left: 0, top: 0 },
      { input: logoPng, left: 72, top: H - 72 - logoMeta.height },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(out);
  console.log("page ", `${name}.jpg`);
}

// 記事の OGP の右側に置く写真（縦長の枠。560x630）
for (const [key, file] of Object.entries(PHOTO_KEYS)) {
  const out = path.join(OUT_PHOTOS, `${key}.jpg`);
  await sharp(path.join(IMAGES, `${file}.webp`))
    .resize(560, H, { fit: "cover", position: "centre" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(out);
}
console.log("photos", Object.keys(PHOTO_KEYS).length);
