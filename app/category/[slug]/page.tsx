import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_POSTS_BY_CATEGORY, GET_SIDEBAR_DATA } from "@/lib/graphql/queries";
import type { WPPost, WPCategory, WPTag } from "@/types/wordpress";
import { buildCategoryMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schemas";
import JsonLd from "@/components/seo/JsonLd";
import ArticleGrid from "@/components/article/ArticleGrid";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Sidebar from "@/components/layout/Sidebar";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kianews.in";

export const revalidate = 300;

interface CategoryPageProps {
  params: { slug: string };
}

interface CategoryData {
  category: (WPCategory & { posts: { nodes: WPPost[]; pageInfo: { hasNextPage: boolean; endCursor: string } } }) | null;
}

interface SidebarData {
  trendingPosts: { nodes: WPPost[] };
  categories: { nodes: WPCategory[] };
  tags: { nodes: WPTag[] };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const data = await fetchGraphQL<CategoryData>(GET_POSTS_BY_CATEGORY, { slug: params.slug, first: 1 });
  if (!data?.category) return {};
  return buildCategoryMetadata(data.category);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const [data, sidebarData] = await Promise.all([
    fetchGraphQL<CategoryData>(GET_POSTS_BY_CATEGORY, {
      slug: params.slug,
      first: 12,
    }),
    fetchGraphQL<SidebarData>(GET_SIDEBAR_DATA),
  ]);

  if (!data?.category) notFound();

  const { category } = data;
  const posts = category.posts?.nodes ?? [];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: category.name, url: `/category/${category.slug}` },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb
          items={[
            { name: "Home", url: "/" },
            { name: category.name, url: `/category/${category.slug}` },
          ]}
        />
        <div className="py-8 mb-8 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
              {category.description}
            </p>
          )}
          {category.count !== undefined && (
            <p className="mt-2 text-sm text-gray-400">{category.count} articles</p>
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
