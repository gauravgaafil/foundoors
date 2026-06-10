import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_POSTS_BY_AUTHOR, GET_POSTS_BY_TAG } from "@/lib/graphql/queries";
import type { WPPost, WPAuthor, WPTag } from "@/types/wordpress";
import { buildEntityMetadata } from "@/lib/seo/metadata";
import { buildPersonSchema, buildBreadcrumbSchema } from "@/lib/seo/schemas";
import JsonLd from "@/components/seo/JsonLd";
import EntityHeader from "@/components/entity/EntityHeader";
import EntityArticles from "@/components/entity/EntityArticles";
import Breadcrumb from "@/components/layout/Breadcrumb";

export const revalidate = 300;

interface PeoplePageProps {
  params: { slug: string };
}

interface AuthorData {
  user:
    | (WPAuthor & {
        posts: { nodes: WPPost[]; pageInfo: { hasNextPage: boolean } };
      })
    | null;
}

interface TagData {
  tag:
    | (WPTag & {
        posts: { nodes: WPPost[]; pageInfo: { hasNextPage: boolean } };
      })
    | null;
}

export async function generateMetadata({ params }: PeoplePageProps): Promise<Metadata> {
  const authorData = await fetchGraphQL<AuthorData>(GET_POSTS_BY_AUTHOR, {
    slug: params.slug,
    first: 1,
  });
  if (authorData?.user) {
    return buildEntityMetadata(authorData.user.name, "person", params.slug, authorData.user.description);
  }
  const tagData = await fetchGraphQL<TagData>(GET_POSTS_BY_TAG, {
    slug: `person-${params.slug}`,
    first: 1,
  });
  if (tagData?.tag) {
    return buildEntityMetadata(tagData.tag.name, "person", params.slug, tagData.tag.description);
  }
  return {};
}

export default async function PeoplePage({ params }: PeoplePageProps) {
  // Try author first
  const authorData = await fetchGraphQL<AuthorData>(GET_POSTS_BY_AUTHOR, {
    slug: params.slug,
    first: 12,
  });

  if (authorData?.user) {
    const author = authorData.user;
    const posts = author.posts?.nodes ?? [];
    const personSchema = buildPersonSchema(author);
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "People", url: "/people" },
      { name: author.name, url: `/people/${params.slug}` },
    ]);

    return (
      <>
        <JsonLd schema={[personSchema as unknown as Record<string, unknown>, breadcrumbSchema as unknown as Record<string, unknown>]} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "People", url: "/people" },
              { name: author.name, url: `/people/${params.slug}` },
            ]}
          />
          <EntityHeader
            name={author.name}
            type="person"
            description={author.description}
            count={posts.length}
          />
          <EntityArticles posts={posts} emptyMessage="No articles by this person yet." />
        </div>
      </>
    );
  }

  // Fall back to tag-based lookup
  const tagData = await fetchGraphQL<TagData>(GET_POSTS_BY_TAG, {
    slug: `person-${params.slug}`,
    first: 12,
  });

  if (!tagData?.tag) notFound();

  const tag = tagData.tag;
  const posts = tag.posts?.nodes ?? [];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "People", url: "/people" },
    { name: tag.name, url: `/people/${params.slug}` },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb
          items={[
            { name: "Home", url: "/" },
            { name: "People", url: "/people" },
            { name: tag.name, url: `/people/${params.slug}` },
          ]}
        />
        <EntityHeader
          name={tag.name}
          type="person"
          description={tag.description}
          count={posts.length}
        />
        <EntityArticles posts={posts} emptyMessage="No articles about this person yet." />
      </div>
    </>
  );
}
