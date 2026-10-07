type Node = Record<string, unknown>;

/** 構造化データを1つの @graph にまとめて出す */
export function JsonLd({ graph }: { graph: Node[] }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
