/**
 * 店舗情報の正本（このファイル1つ）。
 *
 * 画面の表示・構造化データ（JSON-LD）・自動投稿に渡す「店の事実」は、すべてここから作る。
 * 店名・住所・電話番号・営業時間・年齢の決まり・予約の決まり・コースの料金を、
 * ページや記事生成の指示文に直接書かないこと（npm run seo:audit が見つけて止める）。
 * 直すときは、ここだけを直す。
 *
 * 出どころの略記
 *   [HP]   旧公式サイト hizen-susukino.com の画面表示（2026-10-07 に確認）
 *   [GBP]  Google ビジネスプロフィールの公開情報（2026-10-09 に再確認。店名・住所・電話・営業時間が一致。Web サイトの欄だけ旧サイトのまま）
 *   [一休] 店舗の予約ページ restaurant.ikyu.com/154941（公式 Instagram のプロフィールからリンクされている）
 *   [食べ] 食べログの店舗掲載（突き合わせにだけ使用。料金は転載していない）
 */

/** 内容を確かめた日。料金・営業時間を直したら、この日付も更新する。 */
export const CONFIRMED_AT = "2026-10-07";

// =============================================================================
// 年齢の決まり
// =============================================================================
/**
 * 入店できる年齢。
 *
 * 旧公式サイトで表示されている文言は「30歳未満入店不可」「当店は30歳以上のお客様限定です」。
 * いっぽう HTML には、表示されていない旧い文言「30歳以下の方は入店をお断り」が残っており、
 * 外部サイトにも表記の揺れがある。「未満」と「以下」では 30歳ちょうどの方の扱いが変わる。
 * ここでは現在表示されている「30歳未満は不可＝30歳から入店できる」を採り、意味は変えていない。
 *
 * TODO(要確認): 正式な運用が「30歳以下不可（31歳から）」の場合は、minAge を 31 にし、
 * label / audience / sentence の文言を直す。サイト内の表記はすべてここを参照している。
 */
export const agePolicy = {
  /** 入店できる最少の年齢 */
  minAge: 30,
  /** 短い表記（見出し・一覧用） */
  label: "30歳未満入店不可",
  /** 言い換え（本文用） */
  audience: "30歳以上のお客様限定",
  /** 案内文 */
  sentence: "30歳未満のお客様はご入店いただけません。",
  /** 理由。[HP] コースの注意書き「上質な食体験と快適な空間をご提供するため」による */
  reason: "上質な食体験と快適な空間をお届けするため",
} as const;

// =============================================================================
// 香りの決まり
// =============================================================================
/**
 * [HP]「鮨の繊細な風味を保つため、香水や香りの強い柔軟剤等を使用された方の入店はお断りいたします」
 * [HP]「場合によってはご入店頂けない場合がございます」
 */
export const fragrancePolicy = {
  label: "香水・香りの強い柔軟剤はご遠慮ください",
  sentence:
    "鮨の繊細な風味を保つため、香水や香りの強い柔軟剤などはお控えください。香りが強い場合は、ご入店をお断りすることがございます。",
} as const;

// =============================================================================
// コース
// =============================================================================
/**
 * 料金・品数・内容は、旧公式サイトのコースページ（食べログ連携で表示されていた内容）を確認したもの。
 * グルメサイトや予約サイトの掲載から書き写した値は入れていない。
 * 旧サイトと違い、今後は自動では変わらない。【料金や内容を変えたら、必ずここを直す】
 */

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
  /** ひとこと（旧公式サイトの説明にある事実だけで書く） */
  lead: string;
  /** どんな夜に向くか（コース選びの案内に使う） */
  suits: string;
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
    lead: "酒肴から握り、結びまで。その日の仕入れを余すところなく味わっていただく、品数の多いコースです。",
    suits: "握りをしっかり味わいたい夜に",
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
    lead: "酒肴3品と握り6貫に、結びの一品。旬の要所を、一時間半ほどで味わっていただけます。",
    suits: "時間をきめて楽しみたい夜に",
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
    lead: "季節のおつまみを少しずつ盛り込んだ八寸と、握り5貫。お酒とともに、ゆっくり過ごしたい夜のためのセットです。",
    suits: "お酒を中心に過ごしたい夜に",
    notes: ["お電話でのご予約限定です。当日のご予約も承ります。"],
  },
];

/** 全コースに共通するきまり（[HP] コース説明による） */
export const courseCommon = {
  menuUndisclosed:
    "その日の仕入れで内容を決めるため、お品書きはご来店までのお楽しみとさせていただいております。",
  perPerson: "コースは、ご来店の人数分でご注文をお願いいたします。",
} as const;

// =============================================================================
// 店舗
// =============================================================================
const WEB_PARTY_SIZE = 2;
const CHARTER_MAX = 20;

export const restaurant = {
  name: "R-30 hizen",
  /** 読み。[一休] の表記 */
  nameReading: "アールサンジュウ ヒゼン",
  /** ブランドの一文。構造化データや OGP の補足に使う */
  positioning: "すすきのにある、大人だけの隠れ家鮨",
  /** 記事の書き手として出す名前（実態に合わせて店名。「店主監修」などの肩書きは付けない） */
  author: "R-30 hizen",

  // ---------------------------------------------------------------------------
  // NAP（Name / Address / Phone）— [HP][GBP] 一致を確認
  // 旧サイトは、画面が現住所・JSON-LD が移転前の住所という食い違いがあった。
  // 住所はこの1か所だけに持ち、画面と JSON-LD の両方をここから組み立てる。
  // ---------------------------------------------------------------------------
  address: {
    postalCode: "060-0063",
    region: "北海道",
    locality: "札幌市中央区",
    street: "南3条西6丁目1-8",
    /** 文章の中で町名までを書くときの表記（番地なし） */
    district: "南3条西6丁目",
    buildingName: "インフィニ桂和22",
    floor: "7F",
    /** 文章の中で階を書くときの表記 */
    floorText: "7階",
    country: "JP",
  },
  phone: {
    /** 画面に出す表記 */
    display: "011-206-0358",
    /** tel: リンクと JSON-LD に使う国番号つきの表記 */
    e164: "+81-11-206-0358",
  },

  // ---------------------------------------------------------------------------
  // 店と人（[HP] コンセプト・お知らせに書かれていること）
  // ---------------------------------------------------------------------------
  people: {
    /** [HP]「職人歴30年以上で培った技」。経歴・修業先・氏名は確認できていないので書かない */
    chefExperience: "職人歴30年以上",
    /** [HP]「夫婦二人で営んでいる為」 */
    team: "夫婦二人",
  },
  /** [HP] 握りの仕事として挙げられている手法 */
  techniques: ["隠し包丁", "昆布〆", "煮ツメ"],
  /** [HP] 取りそろえているお酒 */
  drinks: {
    kinds: ["日本酒", "ワイン", "シャンパン", "焼酎", "ウイスキー", "ビール"],
    /** [HP]「ワインボトル・シャンパンボトルのご注文も承っております」 */
    bottles: "ワイン・シャンパンは、ボトルでのご注文も承ります。",
  },

  // ---------------------------------------------------------------------------
  // 営業 — [HP][GBP] 毎日 18:00〜23:00
  // ---------------------------------------------------------------------------
  hours: {
    opens: "18:00",
    closes: "23:00",
    /** [HP] 定休日 */
    closedLabel: "不定休",
    // TODO(要確認): ラストオーダーは [HP] に記載がない。食べログには「料理 22:00／ドリンク 22:30」とあるが、
    // 店舗に確かめてから入れる（null の間は画面に出ない）。
    lastOrder: null as null | { food: string; drink: string },
  },

  // ---------------------------------------------------------------------------
  // アクセス
  // ---------------------------------------------------------------------------
  access: {
    /** [HP]「すすきの駅から徒歩5分」 */
    primary: { line: "地下鉄南北線", station: "すすきの駅", walk: "徒歩5分" },
    /** [一休] に店舗が載せている経路。[HP] には無いので、変わったら店舗に確かめる */
    others: [
      { line: "札幌市電", station: "資生館小学校前 停留場", walk: "徒歩2分" },
      { line: "地下鉄各線", station: "大通駅", walk: "徒歩8分" },
    ],
    /** [HP]「駐車場 無」 */
    parking: "駐車場はございません。お車の方は近隣の駐車場をご利用ください。",
  },

  /**
   * 地図。[GBP] のプロフィール（R-30 hizen）そのものを指す埋め込みと座標。
   * 住所の検索結果ではないので、地図のカードには建物名ではなく店名が出る。
   */
  map: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d728.8277126226088!2d141.3488447880605!3d43.055929371136735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f0b2986791c0001%3A0x5e3a6d7819238377!2sR-30%20hizen!5e0!3m2!1sja!2sjp!4v1785744205028!5m2!1sja!2sjp",
    /** Google マップで店舗を開くリンク（上の埋め込みと同じ店舗 ID） */
    linkUrl: "https://www.google.com/maps?cid=6789859750799704951",
    /** [GBP] に登録されている店舗の座標 */
    geo: { latitude: 43.0559349, longitude: 141.3498156 },
  },

  // ---------------------------------------------------------------------------
  // 予約
  // ---------------------------------------------------------------------------
  reservation: {
    web: {
      label: "一休.comレストラン",
      // 旧公式サイトのボタンは restaurant.ikyu.com/122140/?ikgo=2 を指していたが、2026-10-07 時点で 404。
      // 公式 Instagram のプロフィールにある 154941 が現在の掲載ページ（店名・住所・電話番号が一致）。
      // TODO(要確認): Web予約の窓口を変えたときは、この url だけを差し替える。
      url: "https://restaurant.ikyu.com/154941",
      /** [HP]「ネット予約は2名限定です。1名や3名以上はお電話にて対応しております」 */
      partySize: WEB_PARTY_SIZE,
      /** 2名様 */
      partyLabel: `${WEB_PARTY_SIZE}名様`,
    },
    /** 電話でだけ受ける人数（Web予約の人数から決まる）。1名様、3名様以上 */
    phoneOnlyParties: `1名様、${WEB_PARTY_SIZE + 1}名様以上`,
    /** 3名様以上 */
    groupLabel: `${WEB_PARTY_SIZE + 1}名様以上`,
    /** 1名様 */
    soloLabel: "1名様",
    /** [HP]「当日予約は15時までになります」 */
    sameDayDeadline: "15時",
    /** [HP]「当店はオートリザーブからの予約を一切受け付けておりません」 */
    notAccepted: "オートリザーブ（AutoReserve）",
  },

  // ---------------------------------------------------------------------------
  // 席・設備
  // ---------------------------------------------------------------------------
  seats: {
    /** [HP]「カウンター席のみの店内」 */
    style: "カウンター席のみ",
    // TODO(要確認): 席数は [HP] が「カウンター 6席」、[一休][食べ] が「7席」と食い違っている。
    // 確定するまで画面には席数を出さない（count が null の間は「カウンター席のみ」とだけ表示される）。
    count: null as null | number,
    /** [食べ] 個室は「無」。個室があるかのような表現はサイト内で使わない */
    privateRoom: false,
    /** [HP]「貸切 20人以下可」 */
    charterMax: CHARTER_MAX,
    charter: `貸切は${CHARTER_MAX}名様以下で承ります。人数や日時はお電話でご相談ください。`,
    /** [HP]「全席禁煙」 */
    smoking: "全席禁煙",
  },

  // ---------------------------------------------------------------------------
  // お支払い
  // ---------------------------------------------------------------------------
  payment: {
    /** [HP] */
    cards: ["VISA", "Master", "JCB", "AMEX", "Diners"],
    /** [HP] */
    eMoney: ["交通系電子マネー（Suicaなど）", "楽天Edy", "nanaco", "iD", "QUICPay"],
    // TODO(要確認): QRコード決済は [HP] が「不可」、[一休][食べ] が「d払い・楽天ペイ 可」と食い違っている。
    // 確定するまで画面には出さない（null の間は行ごと表示されない）。
    qr: null as null | string,
  },

  agePolicy,
  fragrancePolicy,
  courses,
  signatureDish,
  courseCommon,

  // ---------------------------------------------------------------------------
  // 外部リンク
  // ---------------------------------------------------------------------------
  social: {
    instagram: "https://www.instagram.com/hizen_susukino_/",
  },
  /** 店舗自身の掲載ページ（JSON-LD の sameAs に入れる） */
  listings: {
    ikyu: "https://restaurant.ikyu.com/154941",
    tabelog: "https://tabelog.com/hokkaido/A0101/A010102/1085254/",
  },
  /** 店舗紹介の映像（旧公式サイトのトップに置かれていた YouTube 動画） */
  video: {
    youtubeId: "dLlaQU6p51k",
  },
  /** Search Console の所有権確認（旧サイトの値を引き継ぐ） */
  googleSiteVerification: "Ba6JcAQ7Z_xXrAOSIL7Hj_PJLyqfK0mXdh1gVBKKp5Y",

  /**
   * Google ビジネスプロフィールに表示されている内容。
   * **サイトの表記と食い違っていないかを確かめるためだけに使う**（表示には使わない。npm run seo:audit が突き合わせる）。
   * プロフィール側を直したら、ここも直す。数字の全角・半角やスペースの違いは、同じものとして比べる。
   *
   * 店名・住所・Web サイトは、地図の埋め込みページ（下の map.embedUrl）の HTML に入っている店舗データで確かめられる
   * （2026-10-09 に確認）。電話・営業時間・カテゴリは 2026-10-07 に Google マップの店舗ページで確認。
   */
  googleBusinessProfile: {
    /**
     * 2026-10-07 の時点では「R-30 hizen すすきの店」だったが、2026-10-09 には「R-30 hizen」に直っている。
     * もし店名が食い違ったら、サイトと違う名前は構造化データの alternateName に自動で入る（下の alternateNames）。
     */
    name: "R-30 hizen",
    address: "〒060-0063 北海道札幌市中央区南３条西６丁目1−８ インフィニ桂和 22 7F",
    phone: "011-206-0358",
    category: "寿司店",
    /** 毎日同じ時間で登録されている */
    opens: "18:00",
    closes: "23:00",
    /**
     * プロフィールの「Web サイト」は、旧サイトを指している（2026-10-09 確認）。
     * 旧サイトは残す方針なので、どちらを載せるかは店舗の判断（docs/TODO.md の F。新しいサイトを勧めている）。
     * 変わったら、ここも書き換える。
     */
    website: "https://hizen-susukino.com/",
    placeId: "ChIJAQAceYYpC18Rd4MjGXhtOl4",
  },

  /**
   * 以前のもの。**サイトに出さないため・突き合わせのためにだけ使う**（表示には使わない）。
   */
  legacy: {
    /**
     * 移転前の住所に含まれる語。記事の検査（scripts/journal）とサイトの点検（scripts/check-site.ts）が、
     * この語を見つけたら止める。
     */
    formerAddressPatterns: ["南5条", "南五条", "南５条", "Nスター", "Ｎスター"],
    /**
     * 旧公式サイト。新しいサイトとは別のドメインにあり、残したまま運用する方針（2026-10-09）。
     * 公式サイトが2つある形になる。旧サイトの側で直しておきたいことは docs/TODO.md の F。
     * 旧サイトの構造化データには移転前の住所が残っているので、直るまでは、こちらの構造化データの sameAs には入れない。
     */
    formerSiteUrl: "https://hizen-susukino.com",
  },
} as const;

// =============================================================================
// お店からのお知らせ（[HP]「お店からの大切なお知らせ」を、意味を変えずに整えたもの）
// =============================================================================
export const notices: readonly { id: string; title: string; body: string }[] = [
  {
    id: "course-only",
    title: "コース料理のみのご提供です",
    body: "お料理はおまかせのコースのみでご用意しております。当日のご予約も承ります。",
  },
  {
    id: "per-person",
    title: "コースは人数分でお願いいたします",
    body: "コース料理は人数分でのご提供です。複数名様で一人前を取り分けるご利用はお断りしております。",
  },
  {
    id: "two-of-us",
    title: `${restaurant.people.team}で営んでおります`,
    body: "混み合う時間帯は、お料理の提供にお時間をいただく場合がございます。ご理解をお願いいたします。",
  },
  {
    id: "no-itemized",
    title: "明細は発行しておりません",
    body: "コースご利用時などの明細は発行しておりません。あらかじめご了承ください。",
  },
  {
    id: "allergy",
    title: "アレルギーは事前にお知らせください",
    body: "当日の食材の変更はできません。アレルギーなどがございましたら、ご予約の際にお伝えください。苦手な食材の差し替えはいたしかねます。",
  },
  {
    id: "same-day",
    title: `当日のご予約は${restaurant.reservation.sameDayDeadline}まで`,
    body: `当日のご予約は${restaurant.reservation.sameDayDeadline}までにお願いいたします。`,
  },
  {
    id: "web-two",
    title: `Web予約は${restaurant.reservation.web.partyLabel}限定です`,
    body: `Web予約は${restaurant.reservation.web.partyLabel}でのご利用に限らせていただいております。${restaurant.reservation.phoneOnlyParties}のご予約はお電話にて承ります。`,
  },
  {
    id: "autoreserve",
    title: `${restaurant.reservation.notAccepted}経由のご予約はお受けしておりません`,
    body: `${restaurant.reservation.notAccepted}からのご予約は一切お受けしておりません。お電話またはWeb予約をご利用ください。`,
  },
  {
    id: "fragrance",
    title: fragrancePolicy.label,
    body: fragrancePolicy.sentence,
  },
  {
    id: "age",
    title: agePolicy.label,
    body: `${agePolicy.reason}、${agePolicy.sentence}`,
  },
];

// =============================================================================
// 表示用の組み立て
// =============================================================================

/** インフィニ桂和22 7F */
export const buildingLine = `${restaurant.address.buildingName} ${restaurant.address.floor}`;

/** 南3条西6丁目1-8 インフィニ桂和22 7F（JSON-LD の streetAddress） */
export const streetLine = `${restaurant.address.street} ${buildingLine}`;

/** 北海道札幌市中央区南3条西6丁目1-8 インフィニ桂和22 7F */
export const addressLine = `${restaurant.address.region}${restaurant.address.locality}${streetLine}`;

/** 〒060-0063 */
export const postalLine = `〒${restaurant.address.postalCode}`;

/**
 * 構造化データの alternateName に入れる別名。
 * 店名の読みと、Google ビジネスプロフィールの店名（サイトの店名と違うときだけ）。
 * 画面には出さない。同じ店であることを、検索エンジンに伝えるためのもの。
 */
const siteName: string = restaurant.name;
const profileName: string = restaurant.googleBusinessProfile.name;
export const alternateNames: string[] = [restaurant.nameReading, ...(profileName !== siteName ? [profileName] : [])];

/** tel:+81112060358 */
export const telHref = `tel:${restaurant.phone.e164.replace(/-/g, "")}`;

/** 18:00〜23:00 */
export const hoursLine = `${restaurant.hours.opens}〜${restaurant.hours.closes}`;

/** 地下鉄南北線「すすきの駅」から徒歩5分 */
export const accessLine = `${restaurant.access.primary.line}「${restaurant.access.primary.station}」から${restaurant.access.primary.walk}`;

/** すすきの駅から徒歩5分 */
export const stationWalk = `${restaurant.access.primary.station}から${restaurant.access.primary.walk}`;

/** 席の表記。席数が未確定の間は「カウンター席のみ」 */
export const seatingLine =
  restaurant.seats.count === null ? restaurant.seats.style : `${restaurant.seats.style}（${restaurant.seats.count}席）`;

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
  const [y, m] = CONFIRMED_AT.split("-");
  return `${y}年${Number(m)}月時点`;
})();

/** 予約のしかたの表記 */
export function bookingLabel(course: Course): string {
  return course.booking === "phone-only"
    ? "お電話でのご予約限定"
    : `Web予約（${restaurant.reservation.web.partyLabel}）・お電話`;
}

/**
 * 文の最初の一文だけを返す（「お料理のご提供に2時間ほどいただきます。」）。
 * 注意書きを、別の文の途中に差し込むときに使う。
 */
export function firstSentence(text: string): string {
  const i = text.indexOf("。");
  return i < 0 ? text : text.slice(0, i + 1);
}

export function courseById(id: string): Course {
  const c = courses.find((x) => x.id === id);
  if (!c) throw new Error(`コースが見つかりません: ${id}`);
  return c;
}

/** 結びの丼が付くコース */
export const coursesWithSignatureDish = courses.filter((c) => c.contents.some((x) => x.includes(signatureDish.name)));
