/**
 * 季節の便り — 記事
 * 記事は content/journal/<slug>.md。ビルド時にすべて静的なページにする。
 * 1記事は1つの検索語（frontmatter の primaryKeyword）を担当し、pillar の固定ページを支える。
 *
 * ・書き手の表示は店名（data/restaurant.ts の author）。確かめられない肩書きは付けない。
 * ・記事の終わりに、毎回同じ「店の紹介文」を足さない。店との関わりは本文の中に書く。
 *   終わりに置くのは、その記事が支えるページへの道しるべ（リンク）だけ。
 * ・予約のブロックは置かない（ヘッダーの「ご予約」と、道しるべのリンクで足りる）。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/sections/ArticleBody";
import { JournalRows } from "@/components/sections/JournalRows";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { Photo } from "@/components/ui/Photo";
import { Phrase } from "@/components/ui/Phrase";
import { Reveal } from "@/components/ui/Reveal";
import { categoryBySlug } from "@/data/journal-categories";
import { pageByPath, pages, type PageDef } from "@/data/pages";
import { restaurant } from "@/data/restaurant";
import { formatDate, getAllPosts, getPost, getRelatedPosts, postPhoto, postPhotoPublicPath } from "@/lib/journal";
import { blogPostingNode, breadcrumbNode, organizationNode, webPageNode, websiteNode, type Crumb } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: `${post.title}｜${restaurant.name}`,
    description: post.description,
    path: `/journal/${post.slug}`,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords],
    type: "article",
    publishedTime: `${post.date}T09:00:00+09:00`,
    modifiedTime: `${post.updated ?? post.date}T09:00:00+09:00`,
    // og:image は、同じフォルダーの opengraph-image.tsx が記事ごとに作る
  });
}

/** 大きく出せる写真か（元の幅が足りない写真は、引き伸ばさず小さく出す） */
const LARGE_ENOUGH = 1500;

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const path = `/journal/${post.slug}`;
  const category = categoryBySlug(post.category);
  const photo = postPhoto(post);
  const wide = photo.image.width >= LARGE_ENOUGH;
  const related = getRelatedPosts(post, 3);
  const pillar = pageByPath(post.pillar);
  const [titleMain, titleSub] = post.title.split("｜");

  // 記事の終わりの道しるべ：支えるページ → コース → ご予約（重なりは除く）
  const onward: PageDef[] = [];
  for (const p of [pillar, pages.omakase, pages.reservation]) {
    if (p && p.path !== pages.home.path && !onward.some((x) => x.path === p.path)) onward.push(p);
  }

  const crumbs: Crumb[] = [
    { name: pages.home.label, path: pages.home.path },
    { name: pages.journal.label, path: pages.journal.path },
    ...(category ? [{ name: category.name, path: `/journal/category/${category.slug}` }] : []),
    { name: post.title, path },
  ];

  const graph = [
    organizationNode(),
    websiteNode(),
    webPageNode({ path, title: post.title, description: post.description, image: postPhotoPublicPath(post), hasBreadcrumb: true }),
    breadcrumbNode(crumbs, path),
    blogPostingNode({
      path,
      title: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated,
      image: postPhotoPublicPath(post),
      section: category?.name ?? "",
      keywords: [post.primaryKeyword, ...post.secondaryKeywords],
      wordCount: post.chars,
    }),
  ];

  return (
    <>
      <JsonLd graph={graph} />

      <article>
        <header>
          <div className="wrap page-head">
            <Breadcrumbs crumbs={crumbs} />
            <div className="mt-12 max-w-[46rem] lg:mt-20">
              <p className="t-note flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <time dateTime={post.date} className="num text-[0.9375rem] tracking-[0.12em]">
                  {formatDate(post.date)}
                </time>{" "}
                {category && (
                  <Link href={`/journal/category/${category.slug}`} className="inline-flex min-h-8 items-center transition-colors duration-300 hover:text-paper">
                    {category.name}
                  </Link>
                )}
                {post.updated && post.updated !== post.date && (
                  <span>
                    更新 <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                  </span>
                )}
              </p>
              <h1 className="t-h1 mt-5 text-[clamp(1.4375rem,1.16rem+1.2vw,2.125rem)]">
                <span className="block">
                  <Phrase>{titleMain}</Phrase>
                </span>
                {/* 2行に分けた題名のあいだに、読み上げ・検索エンジン用の区切りを入れる */}
                {titleSub && <span className="sr-only">｜</span>}
                {titleSub && (
                  <span className="mt-2 block text-[0.68em] leading-[1.9] tracking-[0.12em] text-paper-2">
                    <Phrase>{titleSub}</Phrase>
                  </span>
                )}
              </h1>
              <p className="t-lead mt-8">{post.summary}</p>
              <p className="t-note mt-8">文　{restaurant.author}</p>
            </div>
          </div>

          {/* 最初の画面に入る写真。優先して読み込む */}
          <div className="wrap">
            {wide ? (
              <Photo
                photo={photo}
                ratio="21/9"
                ratioSp="4/3"
                sizes="(max-width: 767px) calc(100vw - 3rem), (max-width: 1279px) calc(100vw - 8rem), min(calc(100vw - 12rem), 1280px)"
                priority
              />
            ) : (
              // 縦位置の写真は切り抜かずに見せる。そのまま置くと高さが 1100px を超えて画面からはみ出すので、
              // 高さが画面の 8割に収まる幅で止める
              <div style={{ maxWidth: `min(46rem, calc(80svh * ${photo.image.width} / ${photo.image.height}))` }}>
                <Photo photo={photo} sizes="(max-width: 767px) calc(100vw - 3rem), 736px" priority />
              </div>
            )}
          </div>
        </header>

        {/* 本文の入れ物。描画の後回しは中の節ごとに掛けるので、入れ物そのものは外す（.no-cv） */}
        <div className="wrap section-tight no-cv">
          <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-10">
            {post.headings.length >= 3 && (
              <nav aria-label="この便りの目次" className="border-y border-line py-7 lg:sticky lg:top-28 lg:col-span-3 lg:self-start lg:border-y-0 lg:py-0">
                <p className="label">目次</p>
                <ol className="mt-4 space-y-1 lg:mt-5">
                  {post.headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className="inline-flex min-h-11 items-center text-[0.9375rem] leading-[1.7] text-paper-2 lg:min-h-9 transition-colors duration-300 hover:text-paper lg:text-[0.875rem]"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div className={post.headings.length >= 3 ? "lg:col-span-7 lg:col-start-5" : "lg:col-span-7 lg:col-start-3"}>
              <ArticleBody markdown={post.body} />

              <div className="mt-16 flex flex-wrap gap-x-10 gap-y-1 border-t border-line pt-8 lg:mt-20">
                {onward.map((p) => (
                  <Link key={p.path} href={p.path} className="more">
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-posts" className="border-t border-line">
          <div className="wrap section-tight">
            <Reveal className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
              <h2 id="related-posts" className="t-h3">
                あわせて読む
              </h2>
              <Link href={pages.journal.path} className="more">
                すべての便り
              </Link>
            </Reveal>
            <Reveal className="mt-6" delay={0.08}>
              <JournalRows posts={related} />
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
