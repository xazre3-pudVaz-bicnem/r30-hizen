/**
 * よくあるご質問。
 *
 * /reservation の画面表示と、構造化データ（FAQPage）の両方をここから出す（文言の食い違いを作らない）。
 * 答えは data/restaurant.ts の値から組み立てる。確認できていないことは問いごと載せない。
 */
import { agePolicy, courses, fragrancePolicy, hoursLine, priceMax, priceMin, restaurant, yen } from "./restaurant";

export type FaqItem = { q: string; a: string };

const { reservation, seats: seating, payment, hours, phone: tel } = restaurant;

export const reservationFaqs: FaqItem[] = [
  {
    q: "当日でも予約できますか？",
    a: `はい。当日のご予約は${reservation.sameDayDeadline}まで承ります。お電話（${tel.display}）でご連絡ください。`,
  },
  {
    q: "一人でも予約できますか？",
    a: `はい、${reservation.soloLabel}でもご利用いただけます。Web予約は${reservation.web.partyLabel}限定のため、${reservation.soloLabel}のご予約はお電話で承ります。`,
  },
  {
    q: `${reservation.groupLabel.replace("様", "")}で利用できますか？`,
    a: `${reservation.groupLabel}のご予約は、お電話で承ります。${seating.charter}`,
  },
  {
    q: `${agePolicy.minAge}歳未満の同伴者がいても入店できますか？`,
    a: `申し訳ございません。${agePolicy.reason}、${agePolicy.sentence}ご同伴の方も同様です。`,
  },
  {
    q: "香水をつけて行ってもよいですか？",
    a: fragrancePolicy.sentence,
  },
  {
    q: "アレルギーや苦手な食材がある場合は？",
    a: "アレルギーなどがございましたら、ご予約の際にお知らせください。当日の食材の変更はできません。また、苦手な食材の差し替えはいたしかねますので、あらかじめご了承ください。",
  },
  {
    q: "料金はどのくらいですか？",
    a: `お料理はおまかせのコースのみで、${courses.length}種類・${yen(priceMin)}〜${yen(priceMax)}（税込）です。品数と内容は、おまかせコースのページでご案内しています。`,
  },
  {
    q: "個室はありますか？",
    a: `個室はございません。お席は${seating.style}です。`,
  },
  {
    q: "クレジットカードは使えますか？",
    a: `はい。${payment.cards.join("、")}をご利用いただけます。電子マネー（${payment.eMoney.join("、")}）にも対応しています。`,
  },
  {
    q: "営業時間と定休日を教えてください。",
    a: `営業時間は${hoursLine}、定休日は${hours.closedLabel}です。お休みの日は、ご予約の際にご確認ください。`,
  },
  {
    q: `${reservation.notAccepted}から予約できますか？`,
    a: `${reservation.notAccepted}経由のご予約は、一切お受けしておりません。お電話または${reservation.web.label}のWeb予約をご利用ください。`,
  },
];
