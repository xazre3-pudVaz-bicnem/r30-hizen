// 店舗から預かった写真（assets/source-photos）を、公開用の名前と大きさに整えて public/images へ書き出す。
//   npm run images:prepare
//
// ・公開するのは、店舗が所有していると確認できた写真だけ（既存公式サイトの掲載分と、店舗提供のLINEアルバム）。
// ・ファイル名は内容が分かる名前にそろえる。写真を足すときは下の JOBS に1行足し、data/photos.ts に alt を書く。
// ・line-04〜09 はスマートフォンの画面を撮ったもので上下に黒帯があるため、写真の部分だけを切り出す。
// ・line-26 は制作会社の画像（店舗の写真ではない）ので使わない。line-01/03 は店の世界観に合わないため未使用。
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "assets", "source-photos");
const OUT = path.join(ROOT, "public", "images");

const OFFICIAL = "official-site-2026-10-07";
const LINE = "line-album-2026-10-07";

// 黒帯つきスクリーンショット（870x1882）の中の、写真の範囲
const FRAME_LANDSCAPE = { left: 0, top: 651, width: 870, height: 580 };
const FRAME_PORTRAIT = { left: 0, top: 361, width: 870, height: 1160 };

/** @type {{ src: string, out: string, extract?: { left: number, top: number, width: number, height: number } }[]} */
const JOBS = [
  // 店内
  { src: `${OFFICIAL}/mv_1.jpg`, out: "hizen-counter-01" },
  { src: `${LINE}/line-19.jpg`, out: "hizen-counter-02" },
  { src: `${LINE}/line-10.jpg`, out: "hizen-entrance-01" },
  { src: `${LINE}/line-09.jpg`, out: "hizen-entrance-02", extract: FRAME_PORTRAIT },
  // ヒーロー（スマートフォン用の縦位置。カウンターの写真の中央を切り出す）
  { src: `${OFFICIAL}/mv_1.jpg`, out: "hizen-counter-01-portrait", extract: { left: 900, top: 0, width: 1080, height: 1760 } },

  // 握り
  { src: `${LINE}/line-13.jpg`, out: "hizen-susukino-sushi-01" },
  { src: `${LINE}/line-15.jpg`, out: "hizen-susukino-sushi-02" },
  { src: `${LINE}/line-04.jpg`, out: "hizen-susukino-sushi-03", extract: FRAME_LANDSCAPE },
  { src: `${LINE}/line-07.jpg`, out: "hizen-susukino-sushi-04", extract: FRAME_LANDSCAPE },

  // 職人の仕事
  { src: `${LINE}/line-11.jpg`, out: "hizen-chef-01" },
  { src: `${LINE}/line-12.jpg`, out: "hizen-chef-02" },
  { src: `${LINE}/line-06.jpg`, out: "hizen-chef-03", extract: FRAME_LANDSCAPE },

  // おまかせ
  { src: `${LINE}/line-05.jpg`, out: "hizen-omakase-01", extract: FRAME_LANDSCAPE },
  { src: `${LINE}/line-14.jpg`, out: "hizen-omakase-02" },
  { src: `${LINE}/line-08.jpg`, out: "hizen-omakase-03", extract: FRAME_PORTRAIT },

  // 一品料理
  { src: `${OFFICIAL}/mv_2.jpg`, out: "hizen-cuisine-01" },
  { src: `${LINE}/line-21.jpg`, out: "hizen-cuisine-02" },
  { src: `${LINE}/line-22.jpg`, out: "hizen-cuisine-03" },
  { src: `${LINE}/line-23.jpg`, out: "hizen-cuisine-04" },
  { src: `${LINE}/line-24.jpg`, out: "hizen-cuisine-05" },
  { src: `${LINE}/line-25.jpg`, out: "hizen-cuisine-06" },

  // 酒
  { src: `${OFFICIAL}/mv_3.jpg`, out: "hizen-sake-01" },

  // 季節の素材
  { src: `${LINE}/line-02.jpg`, out: "hizen-season-01" },
];

await mkdir(OUT, { recursive: true });

for (const job of JOBS) {
  const input = path.join(SRC, job.src);
  const output = path.join(OUT, `${job.out}.webp`);
  let img = sharp(input).rotate(); // EXIF の向きを反映してから処理する
  if (job.extract) img = img.extract(job.extract);
  const info = await img
    .withMetadata({ exif: {} }) // 位置情報などの EXIF は落とす（色空間の情報は残す）
    .webp({ quality: 88, effort: 6, smartSubsample: true })
    .toFile(output);
  const size = (await stat(output)).size;
  console.log(`${job.out}.webp`.padEnd(38), `${info.width}x${info.height}`.padEnd(11), `${Math.round(size / 1024)}KB`);
}
