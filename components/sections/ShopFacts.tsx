import { agePolicy, buildingLine, hoursLine, postalLine, restaurant, seatingLine, telHref } from "@/data/restaurant";

/**
 * 店舗情報の表。値はすべて data/restaurant.ts から。
 * full＝/access 用（お席・お支払い・駐車場まで）。short＝トップ用（住所・電話・営業・最寄り駅だけ）。
 * 確定していない項目（席数・QR決済・ラストオーダー）は、data 側が null の間は行ごと出ない。
 */
/**
 * 「◯◯駅」から、を折り返しの単位に分ける。
 * 駅名に空白があるとき（「資生館小学校前 停留場」）は、そこでだけ折り返す。
 * 分けないと、幅の狭い画面で「停留」と「場」のあいだのような、語の途中で折れる。
 */
function FromStation({ station }: { station: string }) {
  const parts = station.split(/\s+/);
  return (
    <>
      {parts.map((part, i) => (
        <span key={part}>
          {i > 0 && " "}
          <span className="ib">
            {i === 0 && "「"}
            {part}
            {i === parts.length - 1 && "」から"}
          </span>
        </span>
      ))}
    </>
  );
}

export function ShopFacts({ variant = "full" }: { variant?: "full" | "short" }) {
  const full = variant === "full";
  const { access, hours, payment, seats } = restaurant;

  return (
    <dl className="facts">
      {full && (
        <div>
          <dt>店名</dt>
          <dd>{restaurant.name}</dd>
        </div>
      )}
      <div>
        <dt>住所</dt>
        <dd>
          <address>
            {postalLine}
            <br />
            <span className="ib">
              {restaurant.address.region}
              {restaurant.address.locality}
            </span>
            <span className="ib">{restaurant.address.street}</span>
            <br />
            {buildingLine}
          </address>
        </dd>
      </div>
      <div>
        <dt>電話</dt>
        <dd>
          <a href={telHref} className="link inline-flex min-h-8 items-center">
            {restaurant.phone.display}
          </a>
        </dd>
      </div>
      <div>
        <dt>営業時間</dt>
        <dd>
          {hoursLine}
          {!full && <span className="ml-3">（{hours.closedLabel}）</span>}
          {hours.lastOrder && (
            <span className="t-note block">
              ラストオーダー　お料理 {hours.lastOrder.food}／お飲みもの {hours.lastOrder.drink}
            </span>
          )}
        </dd>
      </div>
      {full && (
        <div>
          <dt>定休日</dt>
          <dd>{hours.closedLabel}</dd>
        </div>
      )}
      <div>
        <dt>{full ? "アクセス" : "最寄り駅"}</dt>
        <dd>
          <span className="ib">{access.primary.line}</span>
          <FromStation station={access.primary.station} />
          <span className="ib">{access.primary.walk}</span>
          {full &&
            access.others.map((r) => (
              <span key={r.station} className="block">
                <span className="ib">{r.line}</span>
                <FromStation station={r.station} />
                <span className="ib">{r.walk}</span>
              </span>
            ))}
        </dd>
      </div>
      {full && (
        <>
          <div>
            <dt>お席</dt>
            <dd>
              {seatingLine}
              <span className="block">{seats.smoking}・個室はございません</span>
            </dd>
          </div>
          <div>
            <dt>ご利用</dt>
            <dd>{agePolicy.label}</dd>
          </div>
          <div>
            <dt>貸切</dt>
            <dd>{seats.charter}</dd>
          </div>
          <div>
            <dt>お支払い</dt>
            <dd>
              クレジットカード（{payment.cards.join("、")}）
              <span className="block">電子マネー（{payment.eMoney.join("、")}）</span>
              {payment.qr && <span className="block">QRコード決済（{payment.qr}）</span>}
            </dd>
          </div>
          <div>
            <dt>駐車場</dt>
            <dd>{access.parking}</dd>
          </div>
        </>
      )}
    </dl>
  );
}
