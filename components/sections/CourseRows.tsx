import { bookingLabel, courses, priceLabel, yen, type Course } from "@/data/restaurant";

type Props = {
  /** detail＝/omakase 用（内容・所要時間・予約方法まで）。brief＝トップなどの要約 */
  variant?: "detail" | "brief";
  /** 絞り込んで出すとき（この順に並ぶ） */
  only?: string[];
  headingLevel?: "h2" | "h3";
  /**
   * brief で、内容の代わりに実務の情報を出す（場面のページ用）。
   * true＝滞在時間と予約方法／"stay"＝滞在時間だけ
   * （お一人のページでは、予約方法の「Web予約（2名様）」が当てはまらないので出さない）
   */
  practical?: boolean | "stay";
  /** brief で、コースごとに添えるひとこと（その場面でどう向くか）。キーはコースの id */
  notes?: Record<string, string>;
};

/** 料金。数字は大きくしすぎない（値札のように見せない） */
function Price({ price, className }: { price: number; className?: string }) {
  return (
    <span className={`whitespace-nowrap text-paper ${className ?? ""}`}>
      <span className="num">{yen(price).replace("円", "")}</span>
      <span className="ml-1 text-[0.8125rem]">円</span>
    </span>
  );
}

/**
 * コースの一覧。料金・品数は data/restaurant.ts から出す（ページに数字を直接書かない）。
 * 料金表やカードにはせず、品書きのように名前を主に、料金は添える。
 */
export function CourseRows({ variant = "brief", only, headingLevel: H = "h3", practical, notes }: Props) {
  const list: Course[] = only ? only.map((id) => courses.find((c) => c.id === id)).filter((c): c is Course => Boolean(c)) : courses;

  if (variant === "brief") {
    return (
      <ul className="rows">
        {list.map((c) => (
          <li key={c.id} className="py-8 md:py-9">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
              <H className="text-[1.125rem] tracking-[0.14em] text-paper md:text-[1.25rem]">{c.name}</H>
              <p>
                <Price price={c.price} className="text-[1.0625rem]" />
              </p>
            </div>
            <p className="t-note mt-3">
              {c.items}
              <span className="mx-3" aria-hidden="true">
                ／
              </span>
              {practical ? `ご滞在は${c.stay}まで` : c.contents.join("、")}
              {practical === true && (
                <>
                  <span className="mx-3" aria-hidden="true">
                    ／
                  </span>
                  {bookingLabel(c)}
                </>
              )}
            </p>
            {notes?.[c.id] && <p className="measure mt-3 text-[0.9375rem] leading-[1.95] md:text-[1rem]">{notes[c.id]}</p>}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      {list.map((c, i) => (
        <article
          key={c.id}
          id={c.id}
          className={`lg:grid lg:grid-cols-12 lg:gap-x-10 ${i > 0 ? "mt-[calc(var(--gap)/2.2)] border-t border-line pt-[calc(var(--gap)/2.2)]" : ""}`}
        >
          <div className="lg:col-span-5">
            <p className="label">{c.suits}</p>
            <H className="t-h2 mt-4">{c.name}</H>
            <p className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <span className="text-paper">{c.items}</span>{" "}
              <span>
                <Price price={c.price} className="text-[1.25rem]" />
                <span className="t-note ml-2">（税込）</span>
              </span>
            </p>
          </div>
          <div className="mt-9 lg:col-span-6 lg:col-start-7 lg:mt-0">
            <p>{c.lead}</p>
            <dl className="facts mt-9">
              <div>
                <dt>内容</dt>
                <dd>
                  <ul>
                    {c.contents.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>お時間</dt>
                <dd>ご滞在は{c.stay}まで</dd>
              </div>
              <div>
                <dt>ご予約</dt>
                <dd>{bookingLabel(c)}</dd>
              </div>
            </dl>
            {c.notes.length > 0 && (
              <ul className="t-note mt-5">
                {c.notes.map((n) => (
                  <li key={n}>※ {n}</li>
                ))}
              </ul>
            )}
            <p className="sr-only">
              {c.name}の料金は{priceLabel(c.price)}です。
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
