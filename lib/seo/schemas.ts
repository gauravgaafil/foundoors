import type {
  BreadcrumbItem,
  FAQItem,
  OrganizationSchema,
  WebSiteSchema,
  NewsArticleSchema,
  PersonSchema,
  FAQPageSchema,
  BreadcrumbListSchema,
} from "@/types/seo";
import type { WPPost, WPAuthor } from "@/types/wordpress";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://foundoors.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Foundoors";

export function buildOrganizationSchema(): OrganizationSchema {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    sameAs: [
      "https://twitter.com/foundoors",
      "https://linkedin.com/company/foundoors",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "editorial",
        email: "editorial@foundoors.com",
      },
    ],
  };
}

export function buildWebSiteSchema(): WebSiteSchema {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildNewsArticleSchema(
  post: WPPost,
  url: string
): NewsArticleSchema {
  return {
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt
      ? post.excerpt.replace(/<[^>]+>/g, "").trim()
      : undefined,
    url,
    datePublished: post.date,
    dateModified: post.modified,
    author: post.author?.node
      ? [
          {
            "@type": "Person",
            name: post.author.node.name,
            url: `${SITE_URL}/author/${post.author.node.slug}`,
          },
        ]
      : [{ "@type": "Person", name: SITE_NAME }],
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    image: post.featuredImage?.node
      ? {
          "@type": "ImageObject",
          url: post.featuredImage.node.sourceUrl,
          width: post.featuredImage.node.mediaDetails?.width,
          height: post.featuredImage.node.mediaDetails?.height,
        }
      : undefined,
    articleSection: post.categories?.nodes[0]?.name,
    keywords: post.tags?.nodes.map((t) => t.name),
    isAccessibleForFree: true,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

export function buildPersonSchema(author: WPAuthor): PersonSchema {
  const authorUrl = `${SITE_URL}/author/${author.slug}`;
  return {
    "@type": "Person",
    "@id": `${authorUrl}#person`,
    name: author.name,
    url: authorUrl,
    description: author.description,
    image: author.avatar
      ? {
          "@type": "ImageObject",
          url: author.avatar.url,
        }
      : undefined,
    worksFor: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
    },
  };
}

export function buildFAQPageSchema(faqs: FAQItem[]): FAQPageSchema {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[]
): BreadcrumbListSchema {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function wrapInGraphSchema(
  ...schemas: Record<string, unknown>[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
}
