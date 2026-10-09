/**
 * 検索意図マップ（固定ページ分）＝固定ページの登録簿。
 *
 * ・1ページにつき primaryKeyword は1つ。同じ語を2ページに持たせない。
 *   重なると、このファイルを読み込んだ時点（next dev / next build）で警告が出て、
 *   npm run seo:audit（= npm run check・毎日の自動投稿の前）は失敗する。
 * ・secondaryKeywords は「あわせて拾う語」。ほかのページの primaryKeyword と重なってよい
 *   （そのページへリンクで送る前提）。
 * ・title / description は全ページで別の文にする。
 * ・notHere は「そのページでは書かないこと（＝別のページの担当）」。加筆するときに読む。
 * ・記事（季節の便り）は、ここにある primaryKeyword と同じ語を狙わない。記事は必ずいずれかの
 *   固定ページ（pillar）へリンクし、固定ページ → コース → アクセス → ご予約 へ進む導線を保つ。
 *
 * 一覧で見たいときは npm run seo:map（docs/KEYWORD_MAP.md に書き出せる）。
 */
import { findKeywordConflicts } from "../lib/keywords";
import { accessLine, agePolicy, courses, restaurant, stationWalk } from "./restaurant";

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
  /** パンくず・フッター・本文中のリンクでの名前 */
  label: string;
  /** 関連リンクに添える一文（そのページで何が分かるか） */
  teaser: string;
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

const BRAND = restaurant.name;
const { web, sameDayDeadline } = restaurant.reservation;

export const pages: Record<PageKey, PageDef> = {
  home: {
    path: "/",
    label: "トップ",
    teaser: `${BRAND}のトップページ。`,
    title: `すすきのの寿司・おまかせ鮨｜${BRAND}【公式】`,
    description: `札幌・すすきのの寿司店、${BRAND}。${stationWalk}、${agePolicy.label}・${restaurant.seats.style}。${restaurant.people.chefExperience}の店主が、旬の魚介をおまかせのコースで握ります。`,
    primaryKeyword: "すすきの 寿司",
    secondaryKeywords: ["すすきの 鮨", "すすきの おまかせ寿司", "札幌 寿司"],
    intent: "すすきので寿司店を探している人が、どんな店かを一目でつかみ、目的別のページへ進む",
    notHere: "コースの細目（/omakase）、場面ごとの詳しい案内（各ページ）、「高級寿司とは」の説明（/susukino-sushi）は繰り返さない",
    ogImage: "/og/home.jpg",
    linkHint: "店の全体像。記事からは原則リンクしない（より具体的なページへ送る）",
  },
  concept: {
    path: "/concept",
    label: "コンセプト",
    teaser: `${BRAND}の考え方と、大切にしていること。`,
    title: `コンセプト｜${agePolicy.label}、大人のための鮨店｜${BRAND}`,
    description: `${BRAND}は、${agePolicy.audience}の鮨店です。従来の手法にとらわれない握りと一品を、${restaurant.people.team}のカウンターで。店の考え方と、大切にしていることをお伝えします。`,
    primaryKeyword: "R-30 hizen",
    secondaryKeywords: ["R-30 hizen コンセプト", `${agePolicy.minAge}歳未満 入店不可 寿司`, "すすきの 鮨 夫婦"],
    intent: "店名を知った人が、どんな考えの店なのか・なぜ年齢のきまりがあるのかを確かめる",
    notHere: "「大人の隠れ家寿司を探す」一般の検索は /adult-sushi。料金は /omakase",
    ogImage: "/og/concept.jpg",
    linkHint: "店の考え方、年齢のきまりの理由、夫婦二人で営むこと",
  },
  cuisine: {
    path: "/cuisine",
    label: "鮨と料理",
    teaser: `${restaurant.techniques.join("、")}。握りの仕事と、季節の一皿。`,
    title: `鮨と料理｜握りの仕事と創作の一皿｜すすきの ${BRAND}`,
    description: `${restaurant.techniques.join("、")}。手間を惜しまない握りと、従来の手法にとらわれない創作の一皿。すすきの ${BRAND}の鮨と和食を、写真とともにご紹介します。`,
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
    teaser: `${courses.length}つのコースの品数・料金・所要時間。`,
    title: `おまかせコースと料金｜すすきのの寿司 ${BRAND}`,
    description: `${BRAND}のおまかせコースは${courses.length}種類。品数・料金（税込）・所要時間・ご予約方法をまとめました。お品書きは、ご来店までのお楽しみです。`,
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
    teaser: "握りと一皿に合わせる、日本酒とワイン。",
    title: `日本酒とワイン｜鮨に合わせるお酒｜すすきの ${BRAND}`,
    description: `${restaurant.drinks.kinds.join("、")}。${BRAND}では、握りや季節の一皿に合わせてお酒をお選びいただけます。ボトルのご注文も承ります。`,
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
    teaser: "黒を基調にした、カウンター席だけの店内。",
    title: `店内とカウンター席｜すすきの ${BRAND}の空間`,
    description: `黒を基調にした、${restaurant.seats.style}の店内。${restaurant.seats.smoking}。${BRAND}の空間と、心地よく過ごしていただくためのお願いをご案内します。`,
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
    teaser: `${stationWalk}。地図と店舗情報。`,
    title: `アクセス・店舗情報｜${restaurant.access.primary.station} ${restaurant.access.primary.walk}｜${BRAND}`,
    description: `${BRAND}は${restaurant.address.locality}${restaurant.address.street}、${restaurant.address.buildingName}の${restaurant.address.floorText}。${accessLine}。地図・営業時間・お支払い方法はこちら。`,
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
    teaser: "お電話・Web予約の方法と、ご来店前のお願い。",
    title: `ご予約｜お電話・Web予約のご案内｜すすきの ${BRAND}`,
    description: `${BRAND}のご予約は、お電話（${restaurant.phone.display}）またはWeb予約で。Web予約は${web.partyLabel}限定、当日のご予約は${sameDayDeadline}まで承ります。ご来店前のお願いもご確認ください。`,
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
    teaser: "旬の魚、鮨の仕事、酒との合わせ方。店からの便り。",
    title: `季節の便り｜すすきのの鮨と酒の読みもの｜${BRAND}`,
    description: `旬の魚、鮨の仕事、酒との合わせ方、すすきのでの過ごし方。${BRAND}がお届けする読みもの「季節の便り」の一覧です。`,
    primaryKeyword: "すすきの 寿司 コラム",
    secondaryKeywords: ["寿司 読みもの", "鮨 旬 コラム"],
    intent: "鮨や旬について読みたい。記事の一覧から興味のある話題を探す",
    notHere: "個別の話題は各記事の担当",
    ogImage: "/og/journal.jpg",
    linkHint: "記事の一覧。記事の本文からはリンクしない",
  },

  // ---- 検索意図ごとのページ（ヘッダーのメニューには出さない。本文・フッター・記事からたどる） ----
  susukinoSushi: {
    path: "/susukino-sushi",
    label: "すすきのの高級寿司",
    teaser: "高級寿司という切り口で見た、料金と時間、向く夜。",
    title: `すすきので高級寿司を味わう｜カウンターのおまかせ鮨｜${BRAND}`,
    description: `すすきので高級寿司・高級鮨の店をお探しの方へ。${BRAND}が手間と時間をかけているのは、握りの仕事とカウンターの席です。おまかせの料金と所要時間、向く夜・向かない夜をお伝えします。`,
    primaryKeyword: "すすきの 高級寿司",
    secondaryKeywords: ["すすきの 高級鮨", "すすきの おまかせ寿司", "すすきの カウンター寿司"],
    intent: "すすきので、きちんとした寿司店・高級な鮨店を探している。何が「高級」なのか、いくらで、どんな夜になるのかを知りたい",
    notHere:
      "店の全体像はトップ。おまかせの仕組みは /omakase-sushi、カウンターの過ごし方は /counter-sushi、場面ごとの案内は各ページ。ランキング・他店の名前・比較は書かない",
    ogImage: "/og/susukino-sushi.jpg",
    linkHint: "高級寿司・高級鮨という切り口。価格帯と所要時間、どんな夜に向くか",
  },
  anniversary: {
    path: "/anniversary",
    label: "記念日",
    teaser: "結婚記念日や誕生日のディナーに。",
    title: `すすきので記念日に寿司を｜大人二人のおまかせディナー｜${BRAND}`,
    description: `結婚記念日や誕生日を、すすきののカウンター鮨で。${agePolicy.audience}の静かな店内で、おまかせのコースをゆっくりと。コースと滞在時間、ご予約で確かめておきたいことをまとめました。`,
    primaryKeyword: "すすきの 寿司 記念日",
    secondaryKeywords: ["すすきの 記念日 ディナー", "札幌 寿司 記念日", "すすきの 寿司 誕生日", "結婚記念日 寿司 札幌"],
    intent: "記念日・誕生日のディナーに使える寿司店を探している。コース・滞在時間・予約・二人での過ごし方を知りたい",
    notHere: "付き合う前後のデートの話（距離感・服装・二軒目）は /date。会社の会食は /business-dinner",
    ogImage: "/og/anniversary.jpg",
    linkHint: "記念日・誕生日・結婚記念日のディナー",
  },
  date: {
    path: "/date",
    label: "デート",
    teaser: "並んで座る、二人のカウンター。",
    title: `すすきので寿司デート｜カウンターで過ごす大人の夜｜${BRAND}`,
    description: `横に並んで、同じ一貫を味わう。すすきのでの寿司デートに、${agePolicy.audience}のカウンター鮨を。席の距離感、服装と香り、食後の二軒目まで、当日の流れをご案内します。`,
    primaryKeyword: "すすきの 寿司 デート",
    secondaryKeywords: ["すすきの デート ディナー", "札幌 寿司 デート", "すすきの カウンター デート"],
    intent: "デートで使える寿司店を探している。カウンターの距離感・服装・香り・二軒目までの時間配分を知りたい",
    notHere: "記念日のコース選びと予約は /anniversary",
    ogImage: "/og/date.jpg",
    linkHint: "デートでの利用、二人でのカウンターの過ごし方",
  },
  businessDinner: {
    path: "/business-dinner",
    label: "接待・会食",
    teaser: "接待・会食でのご利用と、貸切のご相談。",
    title: `すすきので接待・会食に寿司を｜カウンター鮨のご案内｜${BRAND}`,
    description: `すすきのでの接待や会食に。${BRAND}は${restaurant.seats.style}・個室なしの鮨店です。人数とご予約方法、ご予算、お会計、お相手への配慮を、幹事の方へ先にお伝えします。`,
    primaryKeyword: "すすきの 寿司 接待",
    secondaryKeywords: ["すすきの 会食", "札幌 寿司 接待", "すすきの 寿司 会食", "すすきの 寿司 貸切"],
    intent: "接待・会食の店を探す幹事が、人数・予約・予算・会計・相手への配慮を確かめたい",
    notHere: "プライベートな記念日は /anniversary",
    ogImage: "/og/business-dinner.jpg",
    linkHint: "接待・会食・貸切の相談、幹事が確かめること",
  },
  omakaseSushi: {
    path: "/omakase-sushi",
    label: "おまかせ寿司とは",
    teaser: "おまかせという頼み方の仕組みと、出てくる順番。",
    title: `すすきののおまかせ寿司｜品書きのない鮨の楽しみ方｜${BRAND}`,
    description: `選ぶのは、コースだけ。すすきのでおまかせ寿司を楽しむ前に知っておきたい、おまかせの仕組み・出てくる順番・事前に伝えること。${BRAND}の3つのコースの違いもご紹介します。`,
    primaryKeyword: "すすきの おまかせ寿司",
    secondaryKeywords: ["札幌 おまかせ寿司", "すすきの 寿司 おまかせ", "おまかせ 寿司 流れ"],
    intent: "おまかせの寿司を体験したい。仕組み・コースの違い・出てくる順番・何を伝えればよいのかを知りたい",
    notHere: "料金の一覧は /omakase に置き、ここでは繰り返さない。席での作法は /counter-sushi",
    ogImage: "/og/omakase-sushi.jpg",
    linkHint: "おまかせという頼み方の説明、流れ、事前に伝えること",
  },
  counterSushi: {
    path: "/counter-sushi",
    label: "カウンター寿司",
    teaser: "握りたてを目の前で味わう、カウンターの席のこと。",
    title: `すすきののカウンター寿司｜目の前で握る鮨の時間｜${BRAND}`,
    description: `握りたてを、目の前で。すすきのでカウンター寿司を楽しむなら知っておきたい、席のこと・職人との距離・握りたての食べどき。${BRAND}のカウンターについてもご案内します。`,
    primaryKeyword: "すすきの カウンター 寿司",
    secondaryKeywords: ["札幌 カウンター 寿司", "カウンター 寿司 作法", "すすきの 寿司 カウンターのみ"],
    intent: "カウンターで寿司を食べたい。席・職人との距離・握りたてを味わうということを知りたい",
    notHere: "店内の設備の事実は /space。一人での利用は /solo。おまかせの仕組みは /omakase-sushi",
    ogImage: "/og/counter-sushi.jpg",
    linkHint: "カウンターで食べる鮨の魅力、席での過ごし方・作法",
  },
  adultSushi: {
    path: "/adult-sushi",
    label: "大人の隠れ家",
    teaser: "静かに過ごしたい大人のための、店の決まりごと。",
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
    teaser: "出張や旅行の夜に、お一人でのご利用。",
    title: `すすきので一人寿司｜おひとりさまのカウンター鮨｜${BRAND}`,
    description: `出張の夜や、自分をねぎらう日に。すすきので一人でも入りやすいカウンター鮨をお探しの方へ。${BRAND}の${restaurant.reservation.soloLabel}のご予約方法と、一人の夜に合うコースをご案内します。`,
    primaryKeyword: "すすきの 寿司 一人",
    secondaryKeywords: ["すすきの 一人 ディナー", "札幌 寿司 一人", "すすきの 寿司 出張", "おひとりさま 寿司 すすきの"],
    intent: "一人で寿司を食べたい。一人で予約できるか・浮かないか・出張の夜でも間に合うかを知りたい",
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

// ---- ナビ -------------------------------------------------------------------

/**
 * ヘッダーのメニュー（この順で表示）。
 * 店の案内だけに絞っている。「ご利用の場面」「はじめての方へ」のページはここに足さない
 * （本文中のリンク・フッター・パンくず・季節の便りからたどる）。
 */
export const headerNav: { key: PageKey; label: string }[] = [
  { key: "concept", label: "コンセプト" },
  { key: "cuisine", label: "鮨と料理" },
  { key: "omakase", label: "おまかせ" },
  { key: "space", label: "空間" },
  { key: "journal", label: "季節の便り" },
  { key: "access", label: "アクセス" },
];

/** フッターのメニュー */
export const footerNav: { heading: string; items: PageKey[] }[] = [
  { heading: "ご案内", items: ["concept", "cuisine", "omakase", "drink", "space", "journal", "access", "reservation"] },
  { heading: "ご利用の場面", items: ["anniversary", "date", "businessDinner", "solo"] },
  { heading: "はじめての方へ", items: ["susukinoSushi", "omakaseSushi", "counterSushi", "adultSushi"] },
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

// ---- 検索意図の重なりの見張り -----------------------------------------------

/**
 * 固定ページどうしで、担当する検索語（primaryKeyword）が重なっている組。
 * 表記ゆれ（寿司／鮨、語の順番）は同じ語として数える。
 */
export const intentConflicts = findKeywordConflicts(pageList.map((p) => ({ where: p.path, keyword: p.primaryKeyword })));

if (intentConflicts.length > 0) {
  for (const c of intentConflicts) {
    console.warn(
      `[検索意図マップ] ${c.second.where} の担当語「${c.second.keyword}」は、${c.first.where}（「${c.first.keyword}」）と重なっています。` +
        `どちらかの primaryKeyword を変えるか、ページを1つにまとめてください（data/pages.ts）。`,
    );
  }
}
