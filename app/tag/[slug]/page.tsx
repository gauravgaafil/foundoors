import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_POSTS_BY_TAG, GET_SIDEBAR_DATA } from "@/lib/graphql/queries";
import type { WPPost, WPTag, WPCategory } from "@/types/wordpress";
import { buildTagMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schemas";
import JsonLd from "@/components/seo/JsonLd";
import ArticleGrid from "@/components/article/ArticleGrid";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Sidebar from "@/components/layout/Sidebar";

export const revalidate = 300;

interface TagPageProps {
  params: { slug: string };
}

interface TagData {
  tag:
    | (WPTag & {
        posts: {
          nodes: WPPost[];
          pageInfo: { hasNextPage: boolean; endCursor: string };
        };
      })
    | null;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const data = await fetchGraphQL<TagData>(GET_POSTS_BY_TAG, { slug: params.slug, first: 1 });
  if (!data?.tag) return {};
  return buildTagMetadata(data.tag);
}

interface SidebarData {
  trendingPosts: { nodes: WPPost[] };
  categories: { nodes: WPCategory[] };
  tags: { nodes: WPTag[] };
}

export default async function TagPage({ params }: TagPageProps) {
  const [data, sidebarData] = await Promise.all([
    fetchGraphQL<TagData>(GET_POSTS_BY_TAG, {
      slug: params.slug,
      first: 12,
    }),
    fetchGraphQL<SidebarData>(GET_SIDEBAR_DATA),
  ]);

  if (!data?.tag) notFound();

  const { tag } = data;
  const posts = tag.posts?.nodes ?? [];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: `#${tag.name}`, url: `/tag/${tag.slug}` },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={[{ name: "Home", url: "/" }, { name: `#${tag.name}`, url: `/tag/${tag.slug}` }]} />
        <div className="py-8 mb-8 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            #{tag.name}
          </h1>
          {tag.description && (
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">{tag.description}</p>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          <div>
            <ArticleGrid posts={posts} columns={2} />
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Sidebar
                trendingPosts={sidebarData?.trendingPosts?.nodes}
                categories={sidebarData?.categories?.nodes}
                tags={sidebarData?.tags?.nodes}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
