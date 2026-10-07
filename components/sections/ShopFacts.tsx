import {
  agePolicy,
  buildingLine,
  hoursLine,
  postalLine,
  seatingLine,
  site,
  telHref,
} from "@/data/site";

/**
 * 店舗情報の表。値はすべて data/site.ts から。
 * full＝/access 用（お支払い・駐車場まで）。short＝トップ用。
 * 確定していない項目（席数・QR決済・ラストオーダー）は、data 側が null の間は行ごと出ない。
 */
export function ShopFacts({ variant = "full" }: { variant?: "full" | "short" }) {
  const full = variant === "full";
  const { access, hours, payment, seating } = site;

  return (
    <dl className="facts">
      <div>
        <dt>店名</dt>
        <dd>{site.name}</dd>
      </div>
      <div>
        <dt>住所</dt>
        <dd>
          <address>
            {postalLine}
            <br />
            {site.address.region}
            {site.address.locality}
            {site.address.street}
            <br />
            {buildingLine}
          </address>
        </dd>
      </div>
      <div>
        <dt>電話</dt>
        <dd>
          <a href={telHref} className="link inline-flex min-h-8 items-center">
            {site.tel.display}
          </a>
        </dd>
      </div>
      <div>
        <dt>営業時間</dt>
        <dd>
          {hoursLine}
          {hours.lastOrder && (
            <span className="t-note block">
              ラストオーダー　お料理 {hours.lastOrder.food}／お飲みもの {hours.lastOrder.drink}
            </span>
          )}
        </dd>
      </div>
      <div>
        <dt>定休日</dt>
        <dd>{hours.closedLabel}</dd>
      </div>
      <div>
        <dt>アクセス</dt>
        <dd>
          <span className="ib">{access.primary.line}</span>
          <span className="ib">「{access.primary.station}」から</span>
          <span className="ib">{access.primary.walk}</span>
          {full &&
            access.others.map((r) => (
              <span key={r.station} className="block">
                <span className="ib">{r.line}</span>
                <span className="ib">「{r.station}」から</span>
                <span className="ib">{r.walk}</span>
              </span>
            ))}
        </dd>
      </div>
      <div>
        <dt>お席</dt>
        <dd>
          {seatingLine}
          {full && <span className="block">{seating.smoking}・個室はございません</span>}
        </dd>
      </div>
      <div>
        <dt>ご利用</dt>
        <dd>{agePolicy.label}</dd>
      </div>
      {full && (
        <>
          <div>
            <dt>貸切</dt>
            <dd>{seating.charter}</dd>
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
