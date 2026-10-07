/**
 * 写真の登録簿。
 *
 * ・使ってよいのは、店舗が所有していると確認できた写真だけ（scripts/prepare-images.mjs の JOBS を参照）。
 * ・alt は「写っているもの」を書く。確認できていない魚の名前・産地・料理名は書かない。
 *   キーワードを並べる場所ではない。
 * ・静的 import にしておくと、幅・高さが自動で入り、レイアウトのずれ（CLS）が起きない。
 */
import type { StaticImageData } from "next/image";

import counter01 from "@/public/images/hizen-counter-01.webp";
import counter01Portrait from "@/public/images/hizen-counter-01-portrait.webp";
import counter02 from "@/public/images/hizen-counter-02.webp";
import entrance01 from "@/public/images/hizen-entrance-01.webp";
import entrance02 from "@/public/images/hizen-entrance-02.webp";
import sushi01 from "@/public/images/hizen-susukino-sushi-01.webp";
import sushi02 from "@/public/images/hizen-susukino-sushi-02.webp";
import sushi03 from "@/public/images/hizen-susukino-sushi-03.webp";
import sushi04 from "@/public/images/hizen-susukino-sushi-04.webp";
import chef01 from "@/public/images/hizen-chef-01.webp";
import chef02 from "@/public/images/hizen-chef-02.webp";
import chef03 from "@/public/images/hizen-chef-03.webp";
import omakase01 from "@/public/images/hizen-omakase-01.webp";
import omakase02 from "@/public/images/hizen-omakase-02.webp";
import omakase03 from "@/public/images/hizen-omakase-03.webp";
import cuisine01 from "@/public/images/hizen-cuisine-01.webp";
import cuisine02 from "@/public/images/hizen-cuisine-02.webp";
import cuisine03 from "@/public/images/hizen-cuisine-03.webp";
import cuisine04 from "@/public/images/hizen-cuisine-04.webp";
import cuisine05 from "@/public/images/hizen-cuisine-05.webp";
import cuisine06 from "@/public/images/hizen-cuisine-06.webp";
import sake01 from "@/public/images/hizen-sake-01.webp";
import season01 from "@/public/images/hizen-season-01.webp";

export type Photo = {
  image: StaticImageData;
  alt: string;
};

export const photos = {
  counter01: {
    image: counter01,
    alt: "R-30 hizenの店内。弧を描くカウンターと、灯りを落とした黒基調の空間",
  },
  counter01Portrait: {
    image: counter01Portrait,
    alt: "R-30 hizenのカウンター。奥の壁を照らす灯りと、並んだ椅子",
  },
  counter02: {
    image: counter02,
    alt: "R-30 hizenのカウンター席と、日本酒を冷やす冷蔵庫",
  },
  entrance01: {
    image: entrance01,
    alt: "R-30 hizenの入口。壁に浮かぶロゴと、すすきの穂を生けた花器",
  },
  entrance02: {
    image: entrance02,
    alt: "R-30 hizenの入口に灯るロゴと、季節の花",
  },
  sushi01: {
    image: sushi01,
    alt: "黒い皿に並ぶ握り四貫。すすきの R-30 hizenのおまかせ鮨",
  },
  sushi02: {
    image: sushi02,
    alt: "包丁目を入れた握りを間近に写した一枚",
  },
  sushi03: {
    image: sushi03,
    alt: "薬味をのせた握り二貫を、緑の皿に",
  },
  sushi04: {
    image: sushi04,
    alt: "白い皿と緑の皿に置かれた握り四貫",
  },
  chef01: {
    image: chef01,
    alt: "握りを仕上げる店主の手もと",
  },
  chef02: {
    image: chef02,
    alt: "カウンターの内側で握る店主と、皿に置かれた握り二貫",
  },
  chef03: {
    image: chef03,
    alt: "握りに箸で薬味をのせる、仕上げの手もと",
  },
  omakase01: {
    image: omakase01,
    alt: "R-30 hizenのおまかせコース。酒肴と握り、椀ものを並べた一枚",
  },
  omakase02: {
    image: omakase02,
    alt: "雲丹・いくら・蟹を盛った結びの小丼と、奥に並ぶ握り",
  },
  omakase03: {
    image: omakase03,
    alt: "酒肴を少しずつ盛り合わせた一皿",
  },
  cuisine01: {
    image: cuisine01,
    alt: "白い器に盛った二皿の料理と、後ろに並ぶ日本酒の瓶",
  },
  cuisine02: {
    image: cuisine02,
    alt: "香ばしく焼いた魚を野菜の和え物にのせ、ガラスの器に盛った一品",
  },
  cuisine03: {
    image: cuisine03,
    alt: "餡をかけた蒸し物に、小さな花を添えた一品",
  },
  cuisine04: {
    image: cuisine04,
    alt: "橙色のソースを敷いた、創作の一皿",
  },
  cuisine05: {
    image: cuisine05,
    alt: "貝とアボカドに緑のソースを合わせた一皿",
  },
  cuisine06: {
    image: cuisine06,
    alt: "赤身の肉にジュレを添えた一皿",
  },
  sake01: {
    image: sake01,
    alt: "カウンターに並べた日本酒の瓶",
  },
  season01: {
    image: season01,
    alt: "カウンターに置かれた丸茄子",
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
