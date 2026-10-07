/**
 * 季節の便り — 記事
 * 記事は content/journal/<slug>.md。ビルド時にすべて静的なページにする。
 * 1記事は1つの検索語（frontmatter の primaryKeyword）を担当し、pillar の固定ページを支える。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/sections/ArticleBody";
import { JournalRows } from "@/components/sections/JournalRows";
import { ReservationBlock } from "@/components/sections/ReservationBlock";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { Photo } from "@/components/ui/Photo";
import { Phrase } from "@/components/ui/Phrase";
import { Reveal } from "@/components/ui/Reveal";
import { categoryBySlug } from "@/data/journal-categories";
import { pageByPath, pages } from "@/data/pages";
import { agePolicy, hoursLine, seatingLine, site, stationWalk } from "@/data/site";
import { formatDate, getAllPosts, getPost, getRelatedPosts, postPhoto, postPhotoPublicPath } from "@/lib/journal";
import { blogPostingNode, breadcrumbNode, restaurantNode, webPageNode, websiteNode, type Crumb } from "@/lib/schema";
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
    title: `${post.title}｜${site.name}`,
    description: post.description,
    path: `/journal/${post.slug}`,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords],
    type: "article",
    publishedTime: `${post.date}T09:00:00+09:00`,
    modifiedTime: `${post.updated ?? post.date}T09:00:00+09:00`,
    // og:image は、同じフォルダーの opengraph-image.tsx が記事ごとに作る
  });
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const path = `/journal/${post.slug}`;
  const category = categoryBySlug(post.category);
  const photo = postPhoto(post);
  const related = getRelatedPosts(post, 3);
  const pillar = pageByPath(post.pillar);
  const [titleMain, titleSub] = post.title.split("｜");

  const crumbs: Crumb[] = [
    { name: pages.home.label, path: pages.home.path },
    { name: pages.journal.label, path: pages.journal.path },
    ...(category ? [{ name: category.name, path: `/journal/category/${category.slug}` }] : []),
    { name: post.title, path },
  ];

  const graph = [
    restaurantNode(),
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
        <header className="bg-ink">
          <div className="wrap page-head pb-12 lg:pb-16">
            <Breadcrumbs crumbs={crumbs} />
            <div className="mx-auto mt-12 max-w-[46rem] lg:mt-16">
              <p className="t-note flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <time dateTime={post.date} className="num text-[0.9375rem] tracking-[0.12em]">
                  {formatDate(post.date)}
                </time>
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
              <h1 className="t-h1 mt-5 text-[clamp(1.4rem,1.1rem+1.4vw,2.15rem)]">
                <span className="block">
                  <Phrase>{titleMain}</Phrase>
                </span>
                {titleSub && (
                  <span className="mt-2 block text-[0.66em] leading-[1.9] tracking-[0.12em] text-paper-2">
                    <Phrase>{titleSub}</Phrase>
                  </span>
                )}
              </h1>
              <p className="t-lead mt-8">{post.summary}</p>
            </div>
          </div>
          <div className="wrap">
            <div className="mx-auto max-w-[62rem]">
              <Photo
                photo={photo}
                ratio="16/9"
                ratioSp="4/3"
                sizes="(max-width: 767px) calc(100vw - 2.5rem), (max-width: 1279px) calc(100vw - 6rem), 992px"
                priority
              />
            </div>
          </div>
        </header>

        <div className="bg-ink">
          <div className="wrap section-tight no-cv">
            <div className="mx-auto max-w-[46rem]">
              {post.headings.length >= 3 && (
                <nav aria-label="この便りの目次" className="mb-14 border-y border-line py-7">
                  <p className="label">目次</p>
                  <ol className="mt-4 space-y-1">
                    {post.headings.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="inline-flex min-h-9 items-center text-[0.9375rem] text-paper-2 transition-colors duration-300 hover:text-paper">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <ArticleBody markdown={post.body} />

              {/* 店の事実は data/site.ts から。記事の本文がどうであれ、ここは常に正しい値が出る */}
              <aside aria-labelledby="about-shop" className="mt-20 border-t border-line pt-10">
                <h2 id="about-shop" className="t-h3">
                  {site.name}について
                </h2>
                <p className="mt-5 text-[0.9375rem] leading-[2.1]">
                  すすきのにある、{agePolicy.audience}の鮨店です。お料理はおまかせのコースのみ。
                  {site.people.chefExperience}の店主が、目の前で握ります。
                </p>
                <dl className="facts mt-6 text-[0.875rem]">
                  <div>
                    <dt>場所</dt>
                    <dd>
                      {stationWalk}（{site.address.buildingName} {site.address.floor}）
                    </dd>
                  </div>
                  <div>
                    <dt>営業</dt>
                    <dd>
                      {hoursLine}・{site.hours.closedLabel}
                    </dd>
                  </div>
                  <div>
                    <dt>お席</dt>
                    <dd>
                      {seatingLine}・{site.seating.smoking}
                    </dd>
                  </div>
                </dl>
                <div className="mt-8 flex flex-wrap gap-x-10 gap-y-2">
                  {pillar && pillar.path !== pages.home.path && (
                    <Link href={pillar.path} className="more">
                      {pillar.label}
                    </Link>
                  )}
                  <Link href={pages.omakase.path} className="more">
                    {pages.omakase.label}
                  </Link>
                  <Link href={pages.access.path} className="more">
                    {pages.access.label}
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-posts" className="border-t border-line bg-ink">
          <div className="wrap section-tight">
            <Reveal className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
              <h2 id="related-posts" className="t-h3">
                あわせて読む
              </h2>
              <Link href={pages.journal.path} className="more">
                すべての便り
              </Link>
            </Reveal>
            <Reveal className="mt-8" delay={0.08}>
              <JournalRows posts={related} />
            </Reveal>
          </div>
        </section>
      )}

      <ReservationBlock />
    </>
  );
}
