/**
 * コースの正本。
 *
 * 料金・品数・内容は、旧公式サイトのコースページ（course.html。食べログ連携で表示されていた内容）を
 * 2026-10-07 に確認したもの。グルメサイトや予約サイトの掲載から書き写した値は入れていない。
 *
 * 旧サイトでは食べログの登録内容が自動で表示されていたが、新サイトはこのファイルが表示のもとになる。
 * 【料金や内容を変えたら、必ずここを直す】。直すと、コースのページ・トップ・予約のご案内・
 * JSON-LD（priceRange / Menu）・自動投稿に渡す事実が、まとめて変わる。
 */
import { CONFIRMED_AT, site } from "./site";

/**
 * 結びの一品。
 * TODO(要確認): 旧公式サイトの表記は「三食丼」。「三色丼」の誤記の可能性があるが、
 * 店舗の表記をそのまま使っている。直すときは name だけを書き換える。
 */
export const signatureDish = {
  name: "三食丼",
  ingredients: ["雲丹", "いくら", "毛蟹"],
  /** 雲丹・いくら・毛蟹の「三食丼」 */
  get label() {
    return `${this.ingredients.join("・")}の「${this.name}」`;
  },
} as const;

export type Course = {
  id: string;
  /** サイトで使う名前 */
  name: string;
  /** 旧公式サイトでの掲載名（突き合わせ用。画面には出さない） */
  officialName: string;
  /** 税込の料金（円） */
  price: number;
  /** 品数の表記 */
  items: string;
  /** 内容 */
  contents: string[];
  /** 滞在できる時間 */
  stay: string;
  /** 予約のしかた */
  booking: "web-and-phone" | "phone-only";
  /** 当日予約ができる旨を旧公式サイトが明記しているか */
  sameDayNoted: boolean;
  /** ひとこと（旧公式サイトの説明にある事実だけで書く） */
  lead: string;
  /** 補足 */
  notes: string[];
};

export const courses: Course[] = [
  {
    id: "omakase-15",
    name: "おまかせコース",
    officialName: "【つまみ5品＋握り10品 おまかせコース】hizenが贈る至高のおまかせコース15品",
    price: 16500,
    items: "全15品",
    contents: ["旬の酒肴 5品", "店主おまかせ握り 10貫", `結び ${signatureDish.name}`],
    stay: "2時間30分",
    booking: "web-and-phone",
    sameDayNoted: false,
    lead: "酒肴から握り、結びまで。その日の仕入れを余すところなく味わっていただく、品数の多いコースです。",
    notes: ["お料理のご提供に2時間ほどいただきます。お時間にゆとりを持ってお越しください。"],
  },
  {
    id: "omakase-short",
    name: "おまかせショートコース",
    officialName: "【つまみ3品＋握り6貫 おまかせコース】おまかせショートコース9品",
    price: 9900,
    items: "全9品",
    contents: ["旬の酒肴 3品", "店主おまかせ握り 6貫", `結び ${signatureDish.name}`],
    stay: "1時間30分",
    booking: "web-and-phone",
    sameDayNoted: false,
    lead: "酒肴3品と握り6貫に、結びの一品。旬の要所を、一時間半ほどで味わっていただけます。",
    notes: [],
  },
  {
    id: "hassun-set",
    name: "おまかせ八寸と握り5貫",
    officialName: "【お電話予約限定／当日可】旬の味覚と美酒を少しずつ愉しむ「おまかせ八寸と握り5貫セット」12品",
    price: 5500,
    items: "全12品",
    contents: ["季節の八寸（旬のおつまみ盛り合わせ）", "店主おまかせ握り 5貫", "お椀"],
    stay: "2時間30分",
    booking: "phone-only",
    sameDayNoted: true,
    lead: "季節のおつまみを少しずつ盛り込んだ八寸と、握り5貫。お酒とともに、ゆっくり過ごしたい夜のためのセットです。",
    notes: ["お電話でのご予約限定です。当日のご予約も承ります。"],
  },
];

/** コースの料金・内容を確認した日 */
export const coursesConfirmedAt = CONFIRMED_AT;

/** 全コースに共通するきまり（旧公式サイトのコース説明による） */
export const courseCommon = {
  menuUndisclosed:
    "その日の仕入れで内容を決めるため、お品書きはご来店までのお楽しみとさせていただいております。",
  perPerson: "コースは、ご来店の人数分でご注文をお願いいたします。",
} as const;

// -----------------------------------------------------------------------------
// 表示用
// -----------------------------------------------------------------------------

/** 16,500円 */
export function yen(price: number): string {
  return `${price.toLocaleString("ja-JP")}円`;
}

/** 16,500円（税込） */
export function priceLabel(price: number): string {
  return `${yen(price)}（税込）`;
}

const prices = courses.map((c) => c.price);
export const priceMin = Math.min(...prices);
export const priceMax = Math.max(...prices);

/** JSON-LD の priceRange。料金を直すと自動で変わる */
export const priceRange = `¥${priceMin.toLocaleString("ja-JP")}〜¥${priceMax.toLocaleString("ja-JP")}`;

/** 2026年10月時点 */
export const confirmedAtLabel = (() => {
  const [y, m] = coursesConfirmedAt.split("-");
  return `${y}年${Number(m)}月時点`;
})();

/** 予約のしかたの表記 */
export function bookingLabel(course: Course): string {
  return course.booking === "phone-only"
    ? "お電話でのご予約限定"
    : `Web予約（${site.reservation.web.partySize}名様）・お電話`;
}

export function courseById(id: string): Course {
  const c = courses.find((x) => x.id === id);
  if (!c) throw new Error(`コースが見つかりません: ${id}`);
  return c;
}
