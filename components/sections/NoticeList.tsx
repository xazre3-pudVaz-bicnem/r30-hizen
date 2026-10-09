import { Phrase } from "@/components/ui/Phrase";
import { notices } from "@/data/restaurant";

/**
 * ご来店前のお願い（data/restaurant.ts の notices）。
 * only で絞ると、その場面に関係するものだけを出せる。
 * 見出しが長い（「…お受けしておりません」など）ので、横に並べるのは、置かれた場所に 672px 以上の幅があるときだけ。
 */
export function NoticeList({ only, headingLevel: H = "h3" }: { only?: string[]; headingLevel?: "h2" | "h3" }) {
  const list = only ? notices.filter((n) => only.includes(n.id)) : notices;
  return (
    <ul className="rows @container">
      {list.map((n) => (
        <li key={n.id} className="grid gap-x-10 gap-y-2 py-6 md:py-7 @2xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <H className="text-[1rem] leading-[1.9] tracking-[0.1em] text-paper md:text-[1.0625rem]">
            <Phrase>{n.title}</Phrase>
          </H>
          <p className="text-[0.9375rem] leading-[2] md:text-[1rem]">{n.body}</p>
        </li>
      ))}
    </ul>
  );
}
