import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_POST_BY_SLUG, GET_RELATED_POSTS } from "@/lib/graphql/queries";
import type { WPPost } from "@/types/wordpress";
import { buildArticleMetadata } from "@/lib/seo/metadata";
import {
  buildNewsArticleSchema,
  buildBreadcrumbSchema,
  buildFAQPageSchema,
  wrapInGraphSchema,
} from "@/lib/seo/schemas";
import JsonLd from "@/components/seo/JsonLd";
import ArticleHeader from "@/components/article/ArticleHeader";
import ArticleBody from "@/components/article/ArticleBody";
import { AEOSectionTop, AEOSectionBottom } from "@/components/article/AEOSection";
import AuthorBio from "@/components/article/AuthorBio";
import RelatedArticles from "@/components/article/RelatedArticles";
import TableOfContents from "@/components/article/TableOfContents";
import ReadingProgress from "@/components/common/ReadingProgress";
import type { BreadcrumbItem } from "@/types/seo";
import { parseFAQText } from "@/lib/utils/faq";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kianews.in";

export const revalidate = 60;

interface ArticlePageProps {
  params: { slug: string };
}

interface PostData {
  post: WPPost | null;
}

interface RelatedPostsData {
  posts: { nodes: WPPost[] };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const data = await fetchGraphQL<PostData>(GET_POST_BY_SLUG, { slug: params.slug });
  if (!data?.post) return {};
  const url = `${SITE_URL}/${params.slug}`;
  return buildArticleMetadata(data.post, url);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const data = await fetchGraphQL<PostData>(GET_POST_BY_SLUG, { slug: params.slug });

  if (!data?.post) {
    notFound();
  }

  const post = data.post;
  const url = `${SITE_URL}/${params.slug}`;

  const primaryCategory = post.categories?.nodes[0];
  const categoryId = primaryCategory?.databaseId;

  const relatedData = categoryId
    ? await fetchGraphQL<RelatedPostsData>(GET_RELATED_POSTS, {
        categoryId,
        notIn: [post.id],
        first: 4,
      })
    : null;

  const relatedPosts = relatedData?.posts?.nodes ?? [];

  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", url: "/" },
    ...(primaryCategory
      ? [{ name: primaryCategory.name, url: `/category/${primaryCategory.slug}` }]
      : []),
    { name: post.title, url },
  ];

  const schemas: Record<string, unknown>[] = [
    buildNewsArticleSchema(post, url) as unknown as Record<string, unknown>,
    buildBreadcrumbSchema(breadcrumbs) as unknown as Record<string, unknown>,
  ];

  const faqItems = parseFAQText(post.aeoFields?.faqItems);
  if (faqItems.length > 0) {
    schemas.push(buildFAQPageSchema(faqItems) as unknown as Record<string, unknown>);
  }

  const jsonLdData = wrapInGraphSchema(...schemas);

  return (
    <>
      <ReadingProgress />
      <JsonLd schema={jsonLdData} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          {/* Main content */}
          <article>
            <ArticleHeader post={post} url={url} />

            {post.aeoFields && (
              <AEOSectionTop aeoFields={post.aeoFields} />
            )}

            <ArticleBody content={post.content || ""} />

            {post.aeoFields && (
              <AEOSectionBottom aeoFields={post.aeoFields} />
            )}

            {post.author?.node && (
              <div className="mt-12">
                <AuthorBio author={post.author.node} />
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <TableOfContents content={post.content || ""} />
          </aside>
        </div>

        <RelatedArticles posts={relatedPosts} />
      </div>
    </>
  );
}
