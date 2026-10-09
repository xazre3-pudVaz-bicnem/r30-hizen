/**
 * 自動投稿に渡す「店の事実」。
 *
 * data/restaurant.ts（店舗情報の正本）から組み立てる。ここに住所や料金を直接書かないこと。
 * モデルが R-30 hizen について書いてよいのは、このシートと、その日の「店からのメモ」にあることだけ。
 * 検査（validate.ts）も、同じシートから「使ってよい数値・料理の名前」を取り出して突き合わせる。
 */
import {
  accessLine,
  addressLine,
  agePolicy,
  bookingLabel,
  courseCommon,
  courses,
  coursesWithSignatureDish,
  fragrancePolicy,
  hoursLine,
  postalLine,
  priceLabel,
  restaurant,
  signatureDish,
} from "../../../data/restaurant";

export function buildFactSheet(): string {
  const { access, seats, payment, reservation, people, drinks } = restaurant;

  const lines: string[] = [
    `店名: ${restaurant.name}（読み: ${restaurant.nameReading}）`,
    "業態: すすきのの鮨店。お料理はおまかせのコースのみ（お品書きは無い）",
    `住所: ${postalLine} ${addressLine}`,
    `電話: ${restaurant.phone.display}`,
    `営業時間: ${hoursLine}　定休日: ${restaurant.hours.closedLabel}（決まった曜日の休みは無い）`,
    `アクセス: ${accessLine}／${access.others.map((r) => `${r.line}「${r.station}」から${r.walk}`).join("／")}`,
    `席: ${seats.style}。個室・テーブル席は無い。${seats.smoking}。駐車場は無い`,
    `入店できる方: ${agePolicy.label}（${agePolicy.audience}）。ご同伴の方も同じ。理由は「${agePolicy.reason}」`,
    `香り: ${fragrancePolicy.sentence}`,
    `店と人: ${people.chefExperience}の店主が握る。${people.team}で営んでおり、混み合う時間帯は料理の提供に時間がかかる場合がある`,
    `握りの仕事: ${restaurant.techniques.join("、")}。手間を惜しまず、一貫ずつ、お客様の目の前で握って出す。口に入れるとほどける銀シャリ`,
    "料理の方向: 従来の手法や常識にとらわれない握りと一品。新しいアイデアや調理法を取り入れ、盛り付けにも工夫している。旬の魚介と旬の野菜を使う",
    "内装: 黒を基調とした、落ち着いた雰囲気の店内",
    `コースの決まり: ${courseCommon.menuUndisclosed}${courseCommon.perPerson}一人前を取り分ける利用は不可`,
  ];

  for (const c of courses) {
    lines.push(
      `コース「${c.name}」: ${c.items}／${priceLabel(c.price)}／内容＝${c.contents.join("、")}／滞在は${c.stay}まで／予約＝${bookingLabel(c)}${c.notes.length ? `／${c.notes.join(" ")}` : ""}`,
    );
  }

  lines.push(
    `結びの一品: ${signatureDish.label}。${restaurant.name}の名物。${coursesWithSignatureDish.map((c) => c.name).join("と")}の最後に出る`,
    `予約の方法: お電話、またはWeb予約（${reservation.web.label}）。Web予約は${reservation.web.partyLabel}限定。${reservation.phoneOnlyParties}はお電話`,
    `当日予約: ${reservation.sameDayDeadline}まで受け付ける`,
    `受け付けていない予約: ${reservation.notAccepted}経由の予約`,
    "食材の変更: 当日の食材の変更はできない。アレルギーは予約のときに伝える。苦手な食材の差し替えはしない",
    "明細: コース利用時などの明細は発行していない",
    `貸切: ${seats.charter}`,
    `支払い: クレジットカード（${payment.cards.join("、")}）、電子マネー（${payment.eMoney.join("、")}）`,
    `お酒: ${drinks.kinds.join("、")}。${drinks.bottles}（銘柄は書かない）`,
  );

  return lines.map((l) => `- ${l}`).join("\n");
}

/** 記事に書いてよい金額（円） */
export function allowedYen(): number[] {
  return courses.map((c) => c.price);
}

/**
 * 店の料理として名前を出してよい魚介・料理（事実シートにあるもの）。
 * これ以外の魚の名前を「R-30 hizen で出している」かのように書くことはできない
 * （その日の内容は仕入れで決まり、お品書きは公開していないため）。
 */
export function shopDishNames(): string[] {
  return [...signatureDish.ingredients, signatureDish.name, "酒肴", "八寸", "お椀", "握り"];
}

const UNIT = "(歳|年以上|年|名様|名|人|席|品|貫|分|時間|時|円|階|F|種類|つ|本|軒|日|月|％|%)";
const TOKEN = new RegExp(`(\\d[\\d,]*(?::\\d{2})?)\\s*${UNIT}?`, "g");

/** 全角数字を半角に、桁区切りを外す */
export function normalizeDigits(s: string): string {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/：/g, ":");
}

/** 文中の「数＋単位」を取り出す（例: 30歳, 18:00, 5分, 16500円） */
export function numericTokens(text: string): string[] {
  const out: string[] = [];
  const src = normalizeDigits(text)
    // 電話番号・郵便番号・店名の R-30 は数値として数えない
    .replace(/0\d{1,3}-\d{2,4}-\d{3,4}/g, " ")
    .replace(/〒?\d{3}-\d{4}/g, " ")
    .replace(/R-30/gi, " ");
  for (const m of src.matchAll(TOKEN)) {
    const num = m[1].replace(/,/g, "");
    const unit = m[2] === "名様" ? "名" : m[2] === "%" ? "％" : (m[2] ?? "");
    out.push(`${num}${unit}`);
  }
  return out;
}

/**
 * 事実シートに出てくる「数＋単位」。店について述べる文では、ここに無い数値を使えない。
 * extra には、その記事のもとになった「店からのメモ」の文を渡す（メモにある数値も使ってよい）。
 */
export function allowedNumericTokens(extra: string[] = []): Set<string> {
  const set = new Set(numericTokens([buildFactSheet(), ...extra].join("\n")));
  // 住所に含まれる数（条・丁目・番地・ビル名）
  for (const n of normalizeDigits(addressLine).match(/\d+/g) ?? []) set.add(n);
  // 言い換えとして自然なもの
  set.add(`${agePolicy.minAge}歳`);
  set.add(`${agePolicy.minAge}代`);
  for (const c of courses) {
    set.add(`${c.price}円`);
    set.add(String(c.price));
  }
  return set;
}
