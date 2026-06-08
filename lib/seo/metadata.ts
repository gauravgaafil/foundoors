import type { Metadata } from "next";
import type { WPPost, WPAuthor, WPCategory, WPTag } from "@/types/wordpress";
import { stripHtml, truncate } from "@/lib/utils/string";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://foundoors.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Foundoors";

export function buildArticleMetadata(post: WPPost, slug: string): Metadata {
  const canonicalUrl = `${SITE_URL}/${slug}`;
  const title = post.seo?.title || post.title;
  const rawExcerpt = post.seo?.metaDesc || post.excerpt || "";
  const description = truncate(stripHtml(rawExcerpt), 160);

  const ogImage = post.seo?.opengraphImage || post.featuredImage?.node;

  return {
    title,
    description,
    alternates: {
      canonical: post.seo?.canonical || canonicalUrl,
    },
    openGraph: {
      type: "article",
      title: post.seo?.opengraphTitle || title,
      description: post.seo?.opengraphDescription || description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: post.author?.node
        ? [`${SITE_URL}/author/${post.author.node.slug}`]
        : undefined,
      section: post.categories?.nodes[0]?.name,
      tags: post.tags?.nodes.map((t) => t.name),
      images: ogImage
        ? [
            {
              url: ogImage.sourceUrl,
              width: ogImage.mediaDetails?.width,
              height: ogImage.mediaDetails?.height,
              alt: ogImage.altText,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo?.twitterTitle || title,
      description: post.seo?.twitterDescription || description,
      images: post.seo?.twitterImage
        ? [post.seo.twitterImage.sourceUrl]
        : ogImage
        ? [ogImage.sourceUrl]
        : undefined,
    },
  };
}

export function buildAuthorMetadata(author: WPAuthor): Metadata {
  const canonicalUrl = `${SITE_URL}/author/${author.slug}`;
  const title = author.seo?.title || `${author.name} - ${SITE_NAME}`;
  const description =
    author.seo?.metaDesc ||
    author.description ||
    `Articles by ${author.name} on ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: author.seo?.opengraphImage
        ? [{ url: author.seo.opengraphImage.sourceUrl }]
        : author.avatar
        ? [{ url: author.avatar.url }]
        : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function buildCategoryMetadata(category: WPCategory): Metadata {
  const canonicalUrl = `${SITE_URL}/category/${category.slug}`;
  const title = `${category.name} - ${SITE_NAME}`;
  const description =
    category.description ||
    `Latest news and articles about ${category.name} on ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function buildTagMetadata(tag: WPTag): Metadata {
  const canonicalUrl = `${SITE_URL}/tag/${tag.slug}`;
  const title = `${tag.name} - ${SITE_NAME}`;
  const description =
    tag.description ||
    `Articles tagged with ${tag.name} on ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function buildEntityMetadata(
  name: string,
  type: "company" | "person" | "topic",
  slug: string,
  description?: string
): Metadata {
  const pathMap = { company: "companies", person: "people", topic: "topics" };
  const canonicalUrl = `${SITE_URL}/${pathMap[type]}/${slug}`;
  const title = `${name} - ${SITE_NAME}`;
  const desc = description || `News and articles about ${name} on ${SITE_NAME}`;

  return {
    title,
    description: desc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      title,
      description: desc,
      url: canonicalUrl,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary",
      title,
      description: desc,
    },
  };
}
