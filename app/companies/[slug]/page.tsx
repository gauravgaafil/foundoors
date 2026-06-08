import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_POSTS_BY_TAG } from "@/lib/graphql/queries";
import type { WPPost, WPTag } from "@/types/wordpress";
import { buildEntityMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schemas";
import JsonLd from "@/components/seo/JsonLd";
import EntityHeader from "@/components/entity/EntityHeader";
import EntityArticles from "@/components/entity/EntityArticles";
import Breadcrumb from "@/components/layout/Breadcrumb";

export const revalidate = 300;

interface CompanyPageProps {
  params: { slug: string };
}

interface TagData {
  tag:
    | (WPTag & {
        posts: { nodes: WPPost[]; pageInfo: { hasNextPage: boolean } };
      })
    | null;
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const data = await fetchGraphQL<TagData>(GET_POSTS_BY_TAG, {
    slug: `company-${params.slug}`,
    first: 1,
  });
  const tag = data?.tag;
  if (!tag) return {};
  return buildEntityMetadata(tag.name, "company", params.slug, tag.description);
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  // Companies are stored as tags with a "company-" prefix convention
  const data = await fetchGraphQL<TagData>(GET_POSTS_BY_TAG, {
    slug: `company-${params.slug}`,
    first: 12,
  });

  // Fallback: try without prefix
  const fallback = !data?.tag
    ? await fetchGraphQL<TagData>(GET_POSTS_BY_TAG, { slug: params.slug, first: 12 })
    : null;

  const tag = data?.tag ?? fallback?.tag;

  if (!tag) notFound();

  const posts = tag.posts?.nodes ?? [];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Companies", url: "/companies" },
    { name: tag.name, url: `/companies/${params.slug}` },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb
          items={[
            { name: "Home", url: "/" },
            { name: "Companies", url: "/companies" },
            { name: tag.name, url: `/companies/${params.slug}` },
          ]}
        />
        <EntityHeader
          name={tag.name}
          type="company"
          description={tag.description}
          count={posts.length}
        />
        <EntityArticles posts={posts} emptyMessage="No articles about this company yet." />
      </div>
    </>
  );
}
