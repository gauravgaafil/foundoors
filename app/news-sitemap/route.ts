import { NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_RECENT_POSTS_FOR_NEWS_SITEMAP } from "@/lib/graphql/queries";
import type { WPSitemapPost } from "@/types/wordpress";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://foundoors.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Foundoors";

interface RecentPostsData {
  posts: { nodes: WPSitemapPost[] };
}

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const data = await fetchGraphQL<RecentPostsData>(GET_RECENT_POSTS_FOR_NEWS_SITEMAP);
  const posts = data?.posts?.nodes ?? [];

  // Filter to last 48 hours
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recentPosts = posts.filter((p) => new Date(p.date).getTime() > cutoff);

  const urls = recentPosts
    .map((post) => {
      const pubDate = new Date(post.date).toISOString();
      const title = post.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const categories = post.categories?.nodes ?? [];
      const genre = categories.length ? "Blog" : "Blog";
      const keywords = categories.map((c) => c.name).join(", ");

      return `
  <url>
    <loc>${SITE_URL}/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:genres>${genre}</news:genres>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
      ${keywords ? `<news:keywords>${keywords}</news:keywords>` : ""}
    </news:news>
    <lastmod>${new Date(post.modified).toISOString()}</lastmod>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
>
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
