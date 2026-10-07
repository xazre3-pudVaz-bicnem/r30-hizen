/**
 * 構造化データ（JSON-LD）の組み立て。
 *
 * 店舗の値はすべて data/site.ts と data/courses.ts から取る。ここに住所や料金を直接書かないこと。
 * （旧サイトは JSON-LD にだけ移転前の住所が残っていた。同じことが起きない形にしてある）
 */
import { courses, priceRange } from "@/data/courses";
import type { PageDef } from "@/data/pages";
import { pages } from "@/data/pages";
import { agePolicy, site, streetLine } from "@/data/site";
import { absoluteUrl, SITE_URL } from "./seo";

type Node = Record<string, unknown>;

const base = SITE_URL ?? "";
export const RESTAURANT_ID = `${base}/#restaurant`;
export const WEBSITE_ID = `${base}/#website`;

/** 店舗の代表写真（構造化データ用。public/ 配下の変わらない URL を使う） */
const RESTAURANT_IMAGES = [
  "/images/hizen-counter-01.webp",
  "/images/hizen-susukino-sushi-01.webp",
  "/images/hizen-chef-01.webp",
];

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function restaurantNode(): Node {
  return {
    "@type": "Restaurant",
    "@id": RESTAURANT_ID,
    name: site.name,
    alternateName: site.nameReading,
    description: pages.home.description,
    slogan: site.positioning,
    url: absoluteUrl("/"),
    telephone: site.tel.e164,
    image: RESTAURANT_IMAGES.map((p) => absoluteUrl(p) ?? p),
    logo: absoluteUrl("/brand/r30-hizen-logo.svg"),
    address: {
      "@type": "PostalAddress",
      postalCode: site.address.postalCode,
      addressRegion: site.address.region,
      addressLocality: site.address.locality,
      streetAddress: streetLine,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.map.geo.latitude,
      longitude: site.map.geo.longitude,
    },
    hasMap: site.map.linkUrl,
    // 定休日は「不定休」。曜日で決まった休みが無いため、毎日の営業時間として記述している
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ALL_DAYS,
        opens: site.hours.opens,
        closes: site.hours.closes,
      },
    ],
    servesCuisine: ["寿司", "鮨", "日本料理"],
    priceRange,
    currenciesAccepted: "JPY",
    paymentAccepted: `クレジットカード（${site.payment.cards.join("・")}）、電子マネー`,
    acceptsReservations: true,
    smokingAllowed: false,
    audience: {
      "@type": "PeopleAudience",
      requiredMinAge: agePolicy.minAge,
    },
    hasMenu: absoluteUrl(pages.omakase.path),
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: site.reservation.web.url,
        inLanguage: "ja",
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
      result: { "@type": "FoodEstablishmentReservation", name: "席のご予約" },
    },
    sameAs: [site.social.instagram, site.listings.ikyu, site.listings.tabelog],
  };
}

export function websiteNode(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: site.name,
    alternateName: `${site.name} 公式サイト`,
    inLanguage: "ja",
    publisher: { "@id": RESTAURANT_ID },
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

export function webPageNode(args: {
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage";
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
    about: { "@id": RESTAURANT_ID },
    ...(args.image ? { primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(args.image) ?? args.image } } : {}),
    ...(args.hasBreadcrumb ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
  };
}

/** コースの一覧（/omakase 用）。料金は data/courses.ts から */
export function menuNode(): Node {
  return {
    "@type": "Menu",
    "@id": `${absoluteUrl(pages.omakase.path) ?? pages.omakase.path}#menu`,
    name: `${site.name} おまかせコース`,
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
    author: { "@id": RESTAURANT_ID },
    publisher: { "@id": RESTAURANT_ID },
  };
}

/** 固定ページの標準の組み合わせ：店舗 ＋ サイト ＋ ページ ＋ パンくず（＋追加分） */
export function pageGraph(page: PageDef, crumbs: Crumb[], extra: Node[] = [], type?: Parameters<typeof webPageNode>[0]["type"]): Node[] {
  return [
    restaurantNode(),
    websiteNode(),
    webPageNode({
      path: page.path,
      title: page.title,
      description: page.description,
      image: page.ogImage,
      type,
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
