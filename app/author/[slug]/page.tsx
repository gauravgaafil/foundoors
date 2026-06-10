import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_POSTS_BY_AUTHOR } from "@/lib/graphql/queries";
import type { WPPost, WPAuthor } from "@/types/wordpress";
import { buildAuthorMetadata } from "@/lib/seo/metadata";
import { buildPersonSchema, buildBreadcrumbSchema } from "@/lib/seo/schemas";
import JsonLd from "@/components/seo/JsonLd";
import ArticleGrid from "@/components/article/ArticleGrid";
import Breadcrumb from "@/components/layout/Breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kianews.in";

export const revalidate = 300;

interface AuthorPageProps {
  params: { slug: string };
}

interface AuthorData {
  user:
    | (WPAuthor & {
        posts: {
          nodes: WPPost[];
          pageInfo: { hasNextPage: boolean; endCursor: string };
        };
      })
    | null;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const data = await fetchGraphQL<AuthorData>(GET_POSTS_BY_AUTHOR, { slug: params.slug, first: 1 });
  if (!data?.user) return {};
  return buildAuthorMetadata(data.user);
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const data = await fetchGraphQL<AuthorData>(GET_POSTS_BY_AUTHOR, {
    slug: params.slug,
    first: 12,
  });

  if (!data?.user) notFound();

  const author = data.user;
  const posts = author.posts?.nodes ?? [];

  const personSchema = buildPersonSchema(author);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: author.name, url: `/author/${author.slug}` },
  ]);

  return (
    <>
      <JsonLd schema={[personSchema as unknown as Record<string, unknown>, breadcrumbSchema as unknown as Record<string, unknown>]} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb
          items={[
            { name: "Home", url: "/" },
            { name: author.name, url: `/author/${author.slug}` },
          ]}
        />
        <div className="py-8 mb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-6">
            {author.avatar?.url && (
              <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0">
                <Image
                  src={author.avatar.url}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {author.name}
              </h1>
              {author.description && (
                <p className="text-gray-500 dark:text-gray-400 max-w-xl">
                  {author.description}
                </p>
              )}
            </div>
          </div>
        </div>
        <ArticleGrid posts={posts} columns={3} />
      </div>
    </>
  );
}
