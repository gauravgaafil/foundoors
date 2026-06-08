import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_POSTS_BY_TAG, GET_POSTS_BY_CATEGORY } from "@/lib/graphql/queries";
import type { WPPost, WPTag, WPCategory } from "@/types/wordpress";
import { buildEntityMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schemas";
import JsonLd from "@/components/seo/JsonLd";
import EntityHeader from "@/components/entity/EntityHeader";
import EntityArticles from "@/components/entity/EntityArticles";
import Breadcrumb from "@/components/layout/Breadcrumb";

export const revalidate = 300;

interface TopicPageProps {
  params: { slug: string };
}

interface TagData {
  tag: (WPTag & { posts: { nodes: WPPost[] } }) | null;
}

interface CategoryData {
  category: (WPCategory & { posts: { nodes: WPPost[] } }) | null;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const tagData = await fetchGraphQL<TagData>(GET_POSTS_BY_TAG, { slug: params.slug, first: 1 });
  if (tagData?.tag) {
    return buildEntityMetadata(tagData.tag.name, "topic", params.slug, tagData.tag.description);
  }
  const catData = await fetchGraphQL<CategoryData>(GET_POSTS_BY_CATEGORY, { slug: params.slug, first: 1 });
  if (catData?.category) {
    return buildEntityMetadata(catData.category.name, "topic", params.slug, catData.category.description);
  }
  return {};
}

export default async function TopicPage({ params }: TopicPageProps) {
  // Topics can be tags or categories
  const [tagData, catData] = await Promise.all([
    fetchGraphQL<TagData>(GET_POSTS_BY_TAG, { slug: params.slug, first: 12 }),
    fetchGraphQL<CategoryData>(GET_POSTS_BY_CATEGORY, { slug: params.slug, first: 12 }),
  ]);

  const tag = tagData?.tag;
  const category = catData?.category;

  if (!tag && !category) notFound();

  const name = tag?.name ?? category?.name ?? "";
  const description = tag?.description ?? category?.description;
  const posts = tag?.posts?.nodes ?? category?.posts?.nodes ?? [];
  const count = posts.length;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Topics", url: "/topics" },
    { name: name, url: `/topics/${params.slug}` },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb
          items={[
            { name: "Home", url: "/" },
            { name: "Topics", url: "/topics" },
            { name: name, url: `/topics/${params.slug}` },
          ]}
        />
        <EntityHeader name={name} type="topic" description={description} count={count} />
        <EntityArticles posts={posts} emptyMessage="No articles on this topic yet." />
      </div>
    </>
  );
}
