import Link from "next/link";
import { categoryBySlug } from "@/data/journal-categories";
import { formatDate, type Post } from "@/lib/journal";
import { Phrase } from "@/components/ui/Phrase";

type Props = {
  posts: Post[];
  /** 見出しの段階。一覧ページでは h2、他のページの中では h3 */
  headingLevel?: "h2" | "h3";
  /** 要約も出すか */
  withSummary?: boolean;
};

/** 記事の一覧。日付・分類・題名を、罫で区切った行で並べる */
export function JournalRows({ posts, headingLevel: H = "h3", withSummary = false }: Props) {
  return (
    <ul className="rows">
      {posts.map((post) => {
        const category = categoryBySlug(post.category);
        return (
          <li key={post.slug}>
            <Link
              href={`/journal/${post.slug}`}
              className="group grid gap-x-10 gap-y-2.5 py-8 md:grid-cols-[10.5rem_minmax(0,1fr)] md:py-10"
            >
              <p className="t-note flex items-baseline gap-x-4 md:flex-col md:gap-y-1">
                <time dateTime={post.date} className="num text-[0.9375rem] tracking-[0.12em]">
                  {formatDate(post.date)}
                </time>{" "}
                {category && <span>{category.name}</span>}
              </p>
              <div>
                <H className="text-[1.0625rem] leading-[1.9] tracking-[0.1em] text-paper transition-colors duration-300 group-hover:text-brass md:text-[1.1875rem]">
                  <Phrase>{post.title}</Phrase>
                </H>
                {withSummary && <p className="mt-3 max-w-[40em] text-[0.9375rem] leading-[2] text-paper-2">{post.summary}</p>}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
