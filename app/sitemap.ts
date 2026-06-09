import type { MetadataRoute } from "next";
import { fetchGraphQL } from "@/lib/graphql/client";
import {
  GET_ALL_POSTS_FOR_SITEMAP,
  GET_CATEGORIES,
  GET_TAGS,
  GET_ALL_AUTHORS_FOR_SITEMAP,
} from "@/lib/graphql/queries";
import type { WPSitemapPost, WPCategory, WPTag } from "@/types/wordpress";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kianews.in";

interface SitemapPostsData {
  posts: {
    nodes: WPSitemapPost[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

interface CategoriesData {
  categories: { nodes: WPCategory[] };
}

interface TagsData {
  tags: { nodes: WPTag[] };
}

interface AuthorsData {
  users: { nodes: Array<{ slug: string }> };
}

async function getAllPosts(): Promise<WPSitemapPost[]> {
  const posts: WPSitemapPost[] = [];
  let after: string | undefined;
  let hasNext = true;

  while (hasNext) {
    const data = await fetchGraphQL<SitemapPostsData>(GET_ALL_POSTS_FOR_SITEMAP, {
      first: 100,
      after,
    });
    if (!data?.posts) break;
    posts.push(...data.posts.nodes);
    hasNext = data.posts.pageInfo.hasNextPage;
    after = data.posts.pageInfo.endCursor;
  }

  return posts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postsData, catData, tagData, authorData] = await Promise.all([
    getAllPosts(),
    fetchGraphQL<CategoriesData>(GET_CATEGORIES, { first: 100 }),
    fetchGraphQL<TagsData>(GET_TAGS, { first: 200 }),
    fetchGraphQL<AuthorsData>(GET_ALL_AUTHORS_FOR_SITEMAP),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/editorial-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/corrections-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/topics`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/companies`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/people`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const articlePages: MetadataRoute.Sitemap = postsData.map((post) => ({
    url: `${SITE_URL}/${post.slug}`,
    lastModified: new Date(post.modified),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const categoryPages: MetadataRoute.Sitemap = (catData?.categories?.nodes ?? []).map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const tagPages: MetadataRoute.Sitemap = (tagData?.tags?.nodes ?? []).map((tag) => ({
    url: `${SITE_URL}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const authorPages: MetadataRoute.Sitemap = (authorData?.users?.nodes ?? []).map((user) => ({
    url: `${SITE_URL}/author/${user.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...articlePages,
    ...categoryPages,
    ...tagPages,
    ...authorPages,
  ];
}
