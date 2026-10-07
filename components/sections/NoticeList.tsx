import { Phrase } from "@/components/ui/Phrase";
import { notices } from "@/data/site";

/**
 * ご来店前のお願い（data/site.ts の notices）。
 * only で絞ると、その場面に関係するものだけを出せる。
 */
export function NoticeList({ only, headingLevel: H = "h3" }: { only?: string[]; headingLevel?: "h2" | "h3" }) {
  const list = only ? notices.filter((n) => only.includes(n.id)) : notices;
  return (
    <ul className="rows">
      {list.map((n) => (
        <li key={n.id} className="grid gap-x-10 gap-y-2 py-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:py-7">
          <H className="text-[1rem] leading-[1.9] tracking-[0.1em] text-paper">
            <Phrase>{n.title}</Phrase>
          </H>
          <p className="text-[0.9375rem] leading-[2.05]">{n.body}</p>
        </li>
      ))}
    </ul>
  );
}
