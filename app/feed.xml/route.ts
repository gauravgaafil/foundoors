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
  posts: { nodes: WPPost[]; pageInfo: { hasNextPage: boolean; endCursor: string } };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const data = await fetchGraphQL<PostsData>(GET_ALL_POSTS, { first: 50 });
  const posts = data?.posts?.nodes ?? [];

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/${post.slug}`;
      const title = escapeXml(post.title);
      const description = escapeXml(
        truncate(stripHtml(post.excerpt || post.content || ""), 300)
      );
      const pubDate = new Date(post.date).toUTCString();
      const author = post.author?.node?.name ? escapeXml(post.author.node.name) : SITE_NAME;
      const categories = (post.categories?.nodes ?? [])
        .map((c) => `<category>${escapeXml(c.name)}</category>`)
        .join("\n      ");

      return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml("editorial@foundoors.com")} (${author})</author>
      ${categories}
      ${post.featuredImage?.node ? `<enclosure url="${escapeXml(post.featuredImage.node.sourceUrl)}" type="image/jpeg" length="0"/>` : ""}
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
>
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>Authoritative news and analysis for founders, investors, and business leaders.</description>
    <language>en-us</language>
    <managingEditor>editorial@foundoors.com (${escapeXml(SITE_NAME)} Editorial)</managingEditor>
    <webMaster>tech@foundoors.com (${escapeXml(SITE_NAME)} Tech)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>${escapeXml(SITE_NAME)}</title>
      <link>${SITE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
