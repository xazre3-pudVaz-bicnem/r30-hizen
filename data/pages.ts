/**
 * 固定ページの登録簿＝サイト全体のキーワードマップ（固定ページ分）。
 *
 * ・1ページにつき primaryKeyword は1つ。同じ語を2ページに持たせない（npm run seo:audit が確かめる）。
 * ・title / description は全ページで別の文にする。
 * ・notHere は「そのページでは書かないこと（＝別のページの担当）」。加筆するときに読む。
 * ・自動投稿（季節の便り）は、ここにある primaryKeyword と同じ語を狙わない。記事は必ずいずれかの
 *   固定ページ（pillar）へリンクし、固定ページ → コース → アクセス → ご予約 へ進む導線を保つ。
 */
import { agePolicy, site, accessLine, stationWalk } from "./site";

export type PageKey =
  | "home"
  | "concept"
  | "cuisine"
  | "omakase"
  | "drink"
  | "space"
  | "access"
  | "reservation"
  | "journal"
  | "susukinoSushi"
  | "anniversary"
  | "date"
  | "businessDinner"
  | "omakaseSushi"
  | "counterSushi"
  | "adultSushi"
  | "solo";

export type PageDef = {
  path: string;
  /** ナビ・パンくず・関連リンクでの名前 */
  label: string;
  /** <title> の完成形（サイト名まで含む） */
  title: string;
  /** meta description。120字以内 */
  description: string;
  /** このページが担当する検索語 */
  primaryKeyword: string;
  secondaryKeywords: string[];
  /** 想定する検索意図 */
  intent: string;
  /** ここでは書かないこと（担当ページ） */
  notHere: string;
  /** OGP 画像（public/og/ 以下。npm run og:make で作る） */
  ogImage: string;
  /** 自動投稿の本文から張ってよいリンク先として、モデルに渡す説明 */
  linkHint: string;
};

const BRAND = site.name;

export const pages: Record<PageKey, PageDef> = {
  home: {
    path: "/",
    label: "トップ",
    title: `すすきのの寿司・おまかせ鮨｜${BRAND}【公式】`,
    description: `${stationWalk}。${agePolicy.label}、${site.seating.style}の鮨店です。${site.people.chefExperience}の店主が、旬の魚介をおまかせで握ります。記念日や会食のご予約は公式サイトから。`,
    primaryKeyword: "すすきの 寿司",
    secondaryKeywords: ["すすきの 鮨", "札幌 寿司", "R-30 hizen"],
    intent: "すすきので寿司店を探している人が、どんな店かを一目でつかみ、目的別のページへ進む",
    notHere: "コースの細目（/omakase）、場面ごとの詳しい案内（各ページ）は繰り返さない",
    ogImage: "/og/home.jpg",
    linkHint: "店の全体像。記事からは原則リンクしない（より具体的なページへ送る）",
  },
  concept: {
    path: "/concept",
    label: "コンセプト",
    title: `コンセプト｜${agePolicy.label}、大人のための鮨店｜${BRAND}`,
    description: `${BRAND}は、${agePolicy.audience}の鮨店です。従来の手法にとらわれない握りと一品を、${site.people.team}のカウンターで。店の考え方と、大切にしていることをお伝えします。`,
    primaryKeyword: "R-30 hizen",
    secondaryKeywords: ["R-30 hizen コンセプト", "30歳未満 入店不可 寿司", "すすきの 鮨 夫婦"],
    intent: "店名を知った人が、どんな考えの店なのか・なぜ年齢のきまりがあるのかを確かめる",
    notHere: "「大人の隠れ家寿司を探す」一般の検索は /adult-sushi。料金は /omakase",
    ogImage: "/og/concept.jpg",
    linkHint: "店の考え方、年齢のきまりの理由、夫婦二人で営むこと",
  },
  cuisine: {
    path: "/cuisine",
    label: "鮨と料理",
    title: `鮨と料理｜握りの仕事と創作の一皿｜すすきの ${BRAND}`,
    description: `${site.techniques.join("、")}。手間を惜しまない握りと、従来の手法にとらわれない創作の一皿。すすきの ${BRAND}の鮨と和食を、写真とともにご紹介します。`,
    primaryKeyword: "すすきの 創作和食",
    secondaryKeywords: ["すすきの 寿司 握り", "札幌 鮨 職人", "すすきの 寿司 旬"],
    intent: "この店の鮨がどんな仕事で作られているか、料理の方向性を知りたい",
    notHere: "コースの構成と料金は /omakase。酒との合わせは /drink。「すすきの 寿司／鮨」そのものはトップの担当",
    ogImage: "/og/cuisine.jpg",
    linkHint: "握りの仕事（隠し包丁・昆布〆・煮ツメ）、一品料理、結びの丼",
  },
  omakase: {
    path: "/omakase",
    label: "おまかせコース",
    title: `おまかせコースと料金｜すすきのの寿司 ${BRAND}`,
    description: `${BRAND}のおまかせコースは3種類。品数・料金（税込）・所要時間・ご予約方法をまとめました。お品書きは、ご来店までのお楽しみです。`,
    primaryKeyword: "すすきの 寿司 コース",
    secondaryKeywords: ["R-30 hizen コース", "R-30 hizen 料金", "すすきの 寿司 ディナー"],
    intent: "いくらで、何品出て、どれくらい時間がかかるのかを具体的に確かめたい",
    notHere: "「おまかせとは何か」「すすきのでおまかせ寿司を探す」は /omakase-sushi",
    ogImage: "/og/omakase.jpg",
    linkHint: "3つのコースの品数・料金・所要時間。料金に触れるときは必ずここへ",
  },
  drink: {
    path: "/drink",
    label: "お酒",
    title: `日本酒とワイン｜鮨に合わせるお酒｜すすきの ${BRAND}`,
    description: `${site.drinks.kinds.join("、")}。${BRAND}では、握りや季節の一皿に合わせてお酒をお選びいただけます。ボトルのご注文も承ります。`,
    primaryKeyword: "すすきの 寿司 日本酒",
    secondaryKeywords: ["すすきの 寿司 ワイン", "寿司 シャンパン すすきの", "札幌 鮨 日本酒"],
    intent: "鮨と一緒に日本酒やワインを楽しめる店かどうか、どんな飲み方ができるかを知りたい",
    notHere: "銘柄の一覧は載せない（時季で替わるため）。料理の説明は /cuisine",
    ogImage: "/og/drink.jpg",
    linkHint: "日本酒・ワイン・シャンパンなど、お酒の取りそろえと合わせ方",
  },
  space: {
    path: "/space",
    label: "空間",
    title: `店内とカウンター席｜すすきの ${BRAND}の空間`,
    description: `黒を基調にした、${site.seating.style}の店内。${site.seating.smoking}。${BRAND}の空間と、心地よく過ごしていただくためのお願いをご案内します。`,
    primaryKeyword: "R-30 hizen 店内",
    secondaryKeywords: ["R-30 hizen 雰囲気", "R-30 hizen 席", "すすきの 寿司 禁煙"],
    intent: "店内の雰囲気・席の種類・禁煙かどうかなど、行く前に空間の様子を確かめたい",
    notHere: "「カウンター寿司とは」「すすきのでカウンター寿司を探す」は /counter-sushi",
    ogImage: "/og/space.jpg",
    linkHint: "店内の様子、カウンター席のみ・全席禁煙・個室なしといった設備の事実",
  },
  access: {
    path: "/access",
    label: "アクセス",
    title: `アクセス・店舗情報｜${site.access.primary.station} ${site.access.primary.walk}｜${BRAND}`,
    description: `${BRAND}は${site.address.locality}${site.address.street}、${site.address.buildingName}の${site.address.floorText}。${accessLine}。地図・営業時間・お支払い方法はこちら。`,
    primaryKeyword: "R-30 hizen アクセス",
    secondaryKeywords: ["R-30 hizen 場所", "すすきの駅 寿司", "資生館小学校前 寿司", "R-30 hizen 営業時間"],
    intent: "店の場所・行き方・営業時間・支払い方法を確かめたい",
    notHere: "予約の手順は /reservation",
    ogImage: "/og/access.jpg",
    linkHint: "住所・地図・最寄り駅からの時間・営業時間・お支払い方法",
  },
  reservation: {
    path: "/reservation",
    label: "ご予約",
    title: `ご予約｜お電話・Web予約のご案内｜すすきの ${BRAND}`,
    description: `${BRAND}のご予約は、お電話（${site.tel.display}）またはWeb予約で。Web予約は${site.reservation.web.partySize}名様限定、当日のご予約は${site.reservation.sameDayDeadline}まで承ります。ご来店前のお願いもご確認ください。`,
    primaryKeyword: "R-30 hizen 予約",
    secondaryKeywords: ["すすきの 寿司 予約", "すすきの 寿司 当日予約", "R-30 hizen 電話"],
    intent: "予約したい。方法・人数の条件・当日でも取れるか・注意事項を確かめたい",
    notHere: "コースの中身は /omakase。場所は /access",
    ogImage: "/og/reservation.jpg",
    linkHint: "予約の方法（電話・Web）、人数の条件、当日予約の締め切り、来店前のお願い",
  },
  journal: {
    path: "/journal",
    label: "季節の便り",
    title: `季節の便り｜すすきのの鮨と酒の読みもの｜${BRAND}`,
    description: `旬の魚、鮨の仕事、酒との合わせ方、すすきのでの過ごし方。${BRAND}がお届けする読みもの「季節の便り」の一覧です。`,
    primaryKeyword: "すすきの 寿司 コラム",
    secondaryKeywords: ["寿司 読みもの", "鮨 旬 コラム"],
    intent: "鮨や旬について読みたい。記事の一覧から興味のある話題を探す",
    notHere: "個別の話題は各記事の担当",
    ogImage: "/og/journal.jpg",
    linkHint: "記事の一覧。記事の本文からはリンクしない",
  },

  // ---- 検索意図ごとのページ -------------------------------------------------
  susukinoSushi: {
    path: "/susukino-sushi",
    label: "すすきので寿司を選ぶ",
    title: `すすきので高級寿司を選ぶ｜おまかせ・カウンターの店選び｜${BRAND}`,
    description: `すすきので寿司店を選ぶとき、見ておきたいのは「頼み方・席・時間・予算」。おまかせのカウンター鮨という選択肢と、${BRAND}がどんな夜に向くかをまとめました。`,
    primaryKeyword: "すすきの 高級寿司",
    secondaryKeywords: ["すすきの 寿司 おすすめ", "すすきの 寿司 ディナー", "札幌 寿司 高級"],
    intent: "すすきので良い寿司店を探して比較している。選び方の軸と、この店の立ち位置を知りたい",
    notHere: "記念日・デート・接待・一人は、それぞれのページへ送る。ランキングや他店の評価は書かない",
    ogImage: "/og/susukino-sushi.jpg",
    linkHint: "すすきので寿司店を選ぶ視点の総まとめ。店選び全般の話題から",
  },
  anniversary: {
    path: "/anniversary",
    label: "記念日",
    title: `すすきので記念日に寿司を｜大人二人のおまかせディナー｜${BRAND}`,
    description: `結婚記念日や誕生日を、すすきののカウンター鮨で。${agePolicy.audience}の静かな店内で、おまかせのコースをゆっくりと。記念日のご予約で確かめておきたいことをまとめました。`,
    primaryKeyword: "すすきの 寿司 記念日",
    secondaryKeywords: ["すすきの 記念日 ディナー", "札幌 寿司 記念日", "すすきの 寿司 誕生日", "結婚記念日 寿司 札幌"],
    intent: "記念日・誕生日のディナーに使える寿司店を探している。雰囲気・所要時間・予約の勘どころを知りたい",
    notHere: "付き合う前後のデートの話は /date。会社の会食は /business-dinner",
    ogImage: "/og/anniversary.jpg",
    linkHint: "記念日・誕生日・結婚記念日のディナー",
  },
  date: {
    path: "/date",
    label: "デート",
    title: `すすきので寿司デート｜カウンターで過ごす大人の夜｜${BRAND}`,
    description: `横に並んで、同じ一貫を味わう。すすきのでの寿司デートに、${agePolicy.audience}のカウンター鮨を。待ち合わせから所要時間、香りのお願いまで、当日の流れをご案内します。`,
    primaryKeyword: "すすきの 寿司 デート",
    secondaryKeywords: ["すすきの デート ディナー", "札幌 寿司 デート", "すすきの カウンター デート"],
    intent: "デートで使える寿司店を探している。会話のしやすさ・時間配分・気をつける点を知りたい",
    notHere: "記念日の過ごし方は /anniversary",
    ogImage: "/og/date.jpg",
    linkHint: "デートでの利用、二人でのカウンターの過ごし方",
  },
  businessDinner: {
    path: "/business-dinner",
    label: "接待・会食",
    title: `すすきので接待・会食に寿司を｜カウンター鮨のご案内｜${BRAND}`,
    description: `すすきのでの接待や会食に。${BRAND}は${site.seating.style}・個室なしの鮨店です。人数とご予約方法、貸切のご相談、お会計まわりの注意点を、先にお伝えします。`,
    primaryKeyword: "すすきの 寿司 接待",
    secondaryKeywords: ["すすきの 会食", "札幌 寿司 接待", "すすきの 寿司 会食", "すすきの 寿司 貸切"],
    intent: "接待・会食の店を探す幹事が、席・人数・会計・予約の条件を確かめたい",
    notHere: "プライベートな記念日は /anniversary",
    ogImage: "/og/business-dinner.jpg",
    linkHint: "接待・会食・貸切の相談、幹事が確かめること",
  },
  omakaseSushi: {
    path: "/omakase-sushi",
    label: "おまかせ寿司とは",
    title: `すすきののおまかせ寿司｜品書きのない鮨の楽しみ方｜${BRAND}`,
    description: `選ぶのは、コースだけ。すすきのでおまかせ寿司を楽しむ前に知っておきたい、流れ・所要時間・事前に伝えること。${BRAND}のおまかせの進み方もご紹介します。`,
    primaryKeyword: "すすきの おまかせ寿司",
    secondaryKeywords: ["札幌 おまかせ寿司", "すすきの 寿司 おまかせ", "おまかせ 寿司 流れ"],
    intent: "おまかせの寿司を体験したい。どう進むのか・何を伝えればよいのか・どのくらいかかるのかを知りたい",
    notHere: "料金の一覧は /omakase に置き、ここでは繰り返さない",
    ogImage: "/og/omakase-sushi.jpg",
    linkHint: "おまかせという頼み方の説明、流れ、事前に伝えること",
  },
  counterSushi: {
    path: "/counter-sushi",
    label: "カウンター寿司",
    title: `すすきののカウンター寿司｜目の前で握る鮨の時間｜${BRAND}`,
    description: `握りたてを、目の前で。すすきのでカウンター寿司を楽しむなら知っておきたい、席での過ごし方とささやかな作法。${BRAND}のカウンターについてもご案内します。`,
    primaryKeyword: "すすきの カウンター 寿司",
    secondaryKeywords: ["札幌 カウンター 寿司", "カウンター 寿司 作法", "すすきの 寿司 カウンターのみ"],
    intent: "カウンターで寿司を食べたい。どんな体験か・緊張せずに過ごすには、を知りたい",
    notHere: "店内の設備の事実は /space。一人での利用は /solo",
    ogImage: "/og/counter-sushi.jpg",
    linkHint: "カウンターで食べる鮨の魅力、席での過ごし方・作法",
  },
  adultSushi: {
    path: "/adult-sushi",
    label: "大人の隠れ家",
    title: `すすきのの大人の隠れ家寿司｜${agePolicy.label}の静かな鮨店｜${BRAND}`,
    description: `にぎやかなすすきので、静かに鮨を。${BRAND}は${agePolicy.label}、香りの強い香水もご遠慮いただいている鮨店です。大人が落ち着いて過ごすためのきまりをご案内します。`,
    primaryKeyword: "すすきの 大人 寿司",
    secondaryKeywords: ["すすきの 隠れ家 寿司", "すすきの 寿司 静か", "札幌 大人 鮨", "すすきの 寿司 落ち着いた"],
    intent: "騒がしくない、大人向けの落ち着いた寿司店を探している",
    notHere: "店の成り立ちや考え方は /concept",
    ogImage: "/og/adult-sushi.jpg",
    linkHint: "静かに過ごしたい大人向けの店選び、年齢と香りのきまり",
  },
  solo: {
    path: "/solo",
    label: "お一人で",
    title: `すすきので一人寿司｜おひとりさまのカウンター鮨｜${BRAND}`,
    description: `出張の夜や、自分をねぎらう日に。すすきので一人でも入りやすいカウンター鮨をお探しの方へ。${BRAND}の1名様のご予約方法と、一人の夜に合うコースをご案内します。`,
    primaryKeyword: "すすきの 寿司 一人",
    secondaryKeywords: ["すすきの 一人 ディナー", "札幌 寿司 一人", "すすきの 寿司 出張", "おひとりさま 寿司 すすきの"],
    intent: "一人で寿司を食べたい。一人で予約できるか・浮かないか・どのコースがよいかを知りたい",
    notHere: "カウンター全般の作法は /counter-sushi",
    ogImage: "/og/solo.jpg",
    linkHint: "一人での利用、1名の予約方法、出張・旅行の夜",
  },
};

export const pageList: PageDef[] = Object.values(pages);

/** path から登録を引く */
export function pageByPath(path: string): PageDef | undefined {
  return pageList.find((p) => p.path === path);
}

/** ヘッダーのナビ（この順で表示） */
export const headerNav: PageKey[] = ["concept", "cuisine", "omakase", "drink", "space", "journal", "access"];

/** フッターのナビ */
export const footerNav: { heading: string; items: PageKey[] }[] = [
  { heading: "店のこと", items: ["concept", "cuisine", "omakase", "drink", "space"] },
  { heading: "ご利用の場面", items: ["anniversary", "date", "businessDinner", "solo"] },
  { heading: "鮨を選ぶ", items: ["susukinoSushi", "omakaseSushi", "counterSushi", "adultSushi"] },
  { heading: "ご案内", items: ["journal", "access", "reservation"] },
];

/** 自動投稿が本文からリンクしてよい固定ページ */
export const linkablePages: PageKey[] = [
  "concept",
  "cuisine",
  "omakase",
  "drink",
  "space",
  "access",
  "reservation",
  "susukinoSushi",
  "anniversary",
  "date",
  "businessDinner",
  "omakaseSushi",
  "counterSushi",
  "adultSushi",
  "solo",
];
