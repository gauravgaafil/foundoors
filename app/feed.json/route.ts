import { NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_ALL_POSTS } from "@/lib/graphql/queries";
import type { WPPost } from "@/types/wordpress";
import { stripHtml, truncate } from "@/lib/utils/string";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://foundoors.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Foundoors";

export const dynamic = "force-static";
export const revalidate = 3600;

interface PostsData {
  posts: { nodes: WPPost[] };
}

export async function GET() {
  const data = await fetchGraphQL<PostsData>(GET_ALL_POSTS, { first: 50 });
  const posts = data?.posts?.nodes ?? [];

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: SITE_NAME,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description: "Authoritative news and analysis for founders, investors, and business leaders.",
    icon: `${SITE_URL}/icon-512.png`,
    favicon: `${SITE_URL}/favicon.ico`,
    language: "en-US",
    items: posts.map((post) => ({
      id: `${SITE_URL}/${post.slug}`,
      url: `${SITE_URL}/${post.slug}`,
      title: post.title,
      content_text: truncate(stripHtml(post.excerpt || post.content || ""), 500),
      date_published: new Date(post.date).toISOString(),
      date_modified: new Date(post.modified).toISOString(),
      authors: post.author?.node
        ? [
            {
              name: post.author.node.name,
              url: `${SITE_URL}/author/${post.author.node.slug}`,
            },
          ]
        : [{ name: SITE_NAME }],
      tags: [
        ...(post.categories?.nodes.map((c) => c.name) ?? []),
        ...(post.tags?.nodes.map((t) => t.name) ?? []),
      ],
      image: post.featuredImage?.node?.sourceUrl,
    })),
  };

  return NextResponse.json(feed, {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
