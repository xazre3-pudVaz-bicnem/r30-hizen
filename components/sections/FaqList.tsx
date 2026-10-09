import { Phrase } from "@/components/ui/Phrase";
import type { Faq } from "@/lib/schema";

/**
 * よくあるご質問。開閉は <details> に任せ、JS は使わない。
 * 構造化データ（FAQPage）を付けるのは /reservation だけ。ほかのページでは見た目だけを使う。
 */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="rows">
      {faqs.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex min-h-[4.5rem] cursor-pointer list-none items-center justify-between gap-6 py-6 text-paper [&::-webkit-details-marker]:hidden">
            <h3 className="text-[1rem] leading-[1.9] tracking-[0.08em] md:text-[1.0625rem]">
              <Phrase>{f.q}</Phrase>
            </h3>
            <span aria-hidden="true" className="relative block size-3 shrink-0">
              <span className="absolute left-0 top-1/2 block h-px w-3 bg-paper" />
              <span className="absolute left-0 top-1/2 block h-px w-3 rotate-90 bg-paper transition-transform duration-500 group-open:rotate-0" />
            </span>
          </summary>
          <p className="measure pb-8 text-[0.9375rem] leading-[2] md:text-[1rem]">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
