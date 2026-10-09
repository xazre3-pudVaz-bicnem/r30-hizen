/**
 * 構造化データ（JSON-LD）の組み立て。
 *
 * どのページに何を出すか（これ以上は足さない）
 *   サイト全体      … Organization（店の名前・ロゴ・公式の掲載先だけ）＋ WebSite ＋ そのページの WebPage
 *   トップ・アクセス … Organization の代わりに Restaurant（住所・電話・営業時間・地図・料金帯まで）
 *   トップ以外       … BreadcrumbList
 *   季節の便りの記事 … BlogPosting（書き手・発行元は店）
 *   おまかせコース   … Menu（3つのコースと料金）
 *   ご予約           … FAQPage（サイト内でここだけ）
 *
 * 店舗の値はすべて data/restaurant.ts から取る。ここに住所や料金を直接書かないこと。
 * （旧サイトは JSON-LD にだけ移転前の住所が残っていた。同じことが起きない形にしてある）
 * 実在しない情報（評価・受賞・席数の未確定値など）は入れない。
 */
import type { PageDef } from "@/data/pages";
import { pages } from "@/data/pages";
import { alternateNames, courses, priceRange, restaurant, streetLine } from "@/data/restaurant";
import { absoluteUrl, SITE_URL } from "./seo";

type Node = Record<string, unknown>;

const base = SITE_URL ?? "";
/**
 * 店（＝このサイトの発行元）を指す ID。
 * トップとアクセスでは Restaurant として、ほかのページでは Organization として、同じ ID で記述する
 * （Restaurant は Organization の一種なので、同じ実体の詳しい版と簡単な版になる）。
 */
export const ORG_ID = `${base}/#organization`;
export const WEBSITE_ID = `${base}/#website`;

/** 店舗の代表写真（構造化データ用。public/ 配下の変わらない URL を使う） */
const RESTAURANT_IMAGES = [
  "/images/hizen-counter-01.webp",
  "/images/hizen-susukino-sushi-01.webp",
  "/images/hizen-chef-01.webp",
];
const LOGO = "/brand/r30-hizen-logo.svg";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** 店の公式の掲載先（Instagram と、店舗自身の予約・掲載ページ） */
const sameAs = [restaurant.social.instagram, restaurant.listings.ikyu, restaurant.listings.tabelog];

/** サイト全体に出す、店の簡単な記述 */
export function organizationNode(): Node {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: restaurant.name,
    alternateName: alternateNames,
    url: absoluteUrl("/"),
    logo: absoluteUrl(LOGO),
    sameAs,
  };
}

/** トップとアクセスに出す、店舗としての詳しい記述 */
export function restaurantNode(): Node {
  return {
    "@type": "Restaurant",
    "@id": ORG_ID,
    name: restaurant.name,
    alternateName: alternateNames,
    description: pages.home.description,
    slogan: restaurant.positioning,
    url: absoluteUrl("/"),
    telephone: restaurant.phone.e164,
    image: RESTAURANT_IMAGES.map((p) => absoluteUrl(p) ?? p),
    logo: absoluteUrl(LOGO),
    address: {
      "@type": "PostalAddress",
      postalCode: restaurant.address.postalCode,
      addressRegion: restaurant.address.region,
      addressLocality: restaurant.address.locality,
      streetAddress: streetLine,
      addressCountry: restaurant.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: restaurant.map.geo.latitude,
      longitude: restaurant.map.geo.longitude,
    },
    hasMap: restaurant.map.linkUrl,
    // 定休日は「不定休」。曜日で決まった休みが無いため、毎日の営業時間として記述している
    // （Google ビジネスプロフィールの登録も、毎日 18:00〜23:00）
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ALL_DAYS,
        opens: restaurant.hours.opens,
        closes: restaurant.hours.closes,
      },
    ],
    servesCuisine: ["寿司", "鮨", "日本料理"],
    priceRange,
    currenciesAccepted: "JPY",
    paymentAccepted: `クレジットカード（${restaurant.payment.cards.join("・")}）、電子マネー`,
    acceptsReservations: true,
    smokingAllowed: false,
    // 年齢の決まり（30歳未満入店不可）は、Restaurant に使える正式な項目が無いので構造化データには入れない
    // （audience は Restaurant では未定義で、検証器が警告を出す）。画面の本文に明記している。
    hasMenu: absoluteUrl(pages.omakase.path),
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: restaurant.reservation.web.url,
        inLanguage: "ja",
        actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"],
      },
      result: { "@type": "FoodEstablishmentReservation", name: "席のご予約" },
    },
    sameAs,
  };
}

export function websiteNode(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: restaurant.name,
    alternateName: `${restaurant.name} 公式サイト`,
    inLanguage: "ja",
    publisher: { "@id": ORG_ID },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbNode(crumbs: Crumb[], path: string): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(path) ?? path}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path) ?? c.path,
    })),
  };
}

type WebPageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";

export function webPageNode(args: {
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: WebPageType;
  hasBreadcrumb?: boolean;
}): Node {
  const url = absoluteUrl(args.path) ?? args.path;
  return {
    "@type": args.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url: absoluteUrl(args.path),
    name: args.title,
    description: args.description,
    inLanguage: "ja",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    ...(args.image ? { primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(args.image) ?? args.image } } : {}),
    ...(args.hasBreadcrumb ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
  };
}

/** コースの一覧（/omakase 用）。料金は data/restaurant.ts から */
export function menuNode(): Node {
  return {
    "@type": "Menu",
    "@id": `${absoluteUrl(pages.omakase.path) ?? pages.omakase.path}#menu`,
    name: `${restaurant.name} おまかせコース`,
    inLanguage: "ja",
    url: absoluteUrl(pages.omakase.path),
    hasMenuSection: [
      {
        "@type": "MenuSection",
        name: "おまかせコース",
        hasMenuItem: courses.map((c) => ({
          "@type": "MenuItem",
          name: c.name,
          description: `${c.items}。${c.contents.join("、")}`,
          offers: {
            "@type": "Offer",
            price: c.price,
            priceCurrency: "JPY",
          },
        })),
      },
    ],
  };
}

export type Faq = { q: string; a: string };

/** FAQPage。サイト内で出すのは /reservation の1か所だけ */
export function faqNodes(path: string, faqs: Faq[]): Node {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path) ?? path}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * 記事。書き手と発行元は店（Organization）。
 * 「店主監修」などの、確かめられない肩書きは付けない。
 */
export function blogPostingNode(args: {
  path: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  image: string;
  section: string;
  keywords: string[];
  wordCount: number;
}): Node {
  const url = absoluteUrl(args.path) ?? args.path;
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: args.title,
    description: args.description,
    image: [absoluteUrl(args.image) ?? args.image],
    datePublished: `${args.datePublished}T09:00:00+09:00`,
    dateModified: `${args.dateModified ?? args.datePublished}T09:00:00+09:00`,
    inLanguage: "ja",
    articleSection: args.section,
    keywords: args.keywords.join(", "),
    wordCount: args.wordCount,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    author: { "@type": "Organization", "@id": ORG_ID, name: restaurant.author, url: absoluteUrl("/") },
    publisher: { "@id": ORG_ID },
  };
}

/** トップページ：Restaurant ＋ WebSite ＋ WebPage */
export function homeGraph(): Node[] {
  const page = pages.home;
  return [
    restaurantNode(),
    websiteNode(),
    webPageNode({ path: page.path, title: page.title, description: page.description, image: page.ogImage }),
  ];
}

/**
 * 固定ページの標準の組み合わせ：店（Organization）＋ WebSite ＋ WebPage ＋ BreadcrumbList（＋追加分）。
 * withRestaurant を付けたページ（アクセス）だけ、店を Restaurant として詳しく出す。
 */
export function pageGraph(
  page: PageDef,
  crumbs: Crumb[],
  extra: Node[] = [],
  options: { type?: WebPageType; withRestaurant?: boolean } = {},
): Node[] {
  return [
    options.withRestaurant ? restaurantNode() : organizationNode(),
    websiteNode(),
    webPageNode({
      path: page.path,
      title: page.title,
      description: page.description,
      image: page.ogImage,
      type: options.type,
      hasBreadcrumb: crumbs.length > 0,
    }),
    ...(crumbs.length > 0 ? [breadcrumbNode(crumbs, page.path)] : []),
    ...extra,
  ];
}

/** 固定ページのパンくず（トップ ＞ そのページ） */
export function crumbsFor(page: PageDef): Crumb[] {
  return [
    { name: pages.home.label, path: pages.home.path },
    { name: page.label, path: page.path },
  ];
}
