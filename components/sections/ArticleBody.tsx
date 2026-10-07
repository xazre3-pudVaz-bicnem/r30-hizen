import type { Element, Root, RootContent } from "hast";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * h2 に、上から順に sec-1, sec-2… の id を付ける（目次のリンク先）。
 * lib/journal-core.ts の headings と同じ並びになる。
 */
function rehypeH2Ids() {
  return (tree: Root) => {
    let n = 0;
    const visit = (nodes: RootContent[] | Element["children"]) => {
      for (const node of nodes) {
        if (node.type !== "element") continue;
        if (node.tagName === "h2") {
          n += 1;
          node.properties = { ...node.properties, id: `sec-${n}` };
        }
        visit(node.children);
      }
    };
    visit(tree.children);
  };
}

const components: Components = {
  // h1 はページの題名だけ。本文に紛れていたら h2 に落とす
  h1: ({ children }) => <h2>{children}</h2>,
  a: ({ href, children }) => {
    if (!href) return <>{children}</>;
    if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  // 本文中の画像は出さない（写真は見出しの1枚だけ）
  img: () => null,
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
};

/**
 * 記事の本文（Markdown）を描く。サーバー側で HTML にするので、ブラウザに Markdown の処理は送らない。
 * サイト内へのリンクは next/link に、外へのリンクは別タブ＋noopener にする。
 */
export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeH2Ids]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
