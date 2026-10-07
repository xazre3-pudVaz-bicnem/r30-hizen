import { bookingLabel, courses, priceLabel, yen, type Course } from "@/data/courses";

type Props = {
  /** detail＝/omakase 用（内容・所要時間・予約方法まで）。brief＝トップなどの要約 */
  variant?: "detail" | "brief";
  /** 絞り込んで出すとき */
  only?: string[];
  headingLevel?: "h2" | "h3";
};

/**
 * コースの一覧。料金・品数は data/courses.ts から出す（ページに数字を直接書かない）。
 * カードにはせず、品書きのように罫で区切って並べる。
 */
export function CourseRows({ variant = "brief", only, headingLevel: H = "h3" }: Props) {
  const list: Course[] = only ? courses.filter((c) => only.includes(c.id)) : courses;

  if (variant === "brief") {
    return (
      <ul className="rows">
        {list.map((c) => (
          <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-6">
            <H className="text-[1.0625rem] tracking-[0.12em] text-paper">{c.name}</H>
            <p className="row-span-2 self-center text-right text-paper">
              <span className="num text-[1.5rem]">{yen(c.price).replace("円", "")}</span>
              <span className="ml-1 text-[0.8125rem]">円</span>
              <span className="t-note ml-1">（税込）</span>
            </p>
            <p className="t-note">
              {c.items}　{c.contents.join("・")}
            </p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="rows">
      {list.map((c) => (
        <article key={c.id} id={c.id} className="scroll-mt-28 py-12 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:py-16">
          <div>
            <p className="label">{c.items}</p>
            <H className="t-h2 mt-3">{c.name}</H>
            <p className="mt-5 text-paper">
              <span className="num text-[2rem]">{yen(c.price).replace("円", "")}</span>
              <span className="ml-1.5">円</span>
              <span className="t-note ml-2">（税込）</span>
            </p>
          </div>
          <div className="mt-8 lg:mt-0">
            <p>{c.lead}</p>
            <dl className="facts mt-8">
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
