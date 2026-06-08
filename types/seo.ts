export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  siteName: string;
  images: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  type: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}

export interface TwitterCardData {
  card: "summary" | "summary_large_image";
  site?: string;
  creator?: string;
  title: string;
  description: string;
  images?: string[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface OrganizationSchema {
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
  logo?: {
    "@type": "ImageObject";
    url: string;
    width?: number;
    height?: number;
  };
  sameAs?: string[];
  contactPoint?: Array<{
    "@type": "ContactPoint";
    contactType: string;
    email?: string;
    url?: string;
  }>;
}

export interface WebSiteSchema {
  "@type": "WebSite";
  "@id": string;
  name: string;
  url: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}

export interface NewsArticleSchema {
  "@type": "NewsArticle";
  "@id": string;
  headline: string;
  description?: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author: Array<{
    "@type": "Person";
    name: string;
    url?: string;
  }>;
  publisher: {
    "@type": "Organization";
    "@id": string;
    name: string;
    logo?: {
      "@type": "ImageObject";
      url: string;
    };
  };
  image?: {
    "@type": "ImageObject";
    url: string;
    width?: number;
    height?: number;
  };
  articleSection?: string;
  keywords?: string[];
  isAccessibleForFree?: boolean;
  mainEntityOfPage?: {
    "@type": "WebPage";
    "@id": string;
  };
}

export interface PersonSchema {
  "@type": "Person";
  "@id": string;
  name: string;
  url?: string;
  description?: string;
  image?: {
    "@type": "ImageObject";
    url: string;
  };
  sameAs?: string[];
  jobTitle?: string;
  worksFor?: {
    "@type": "Organization";
    "@id": string;
    name: string;
  };
}

export interface FAQPageSchema {
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export interface BreadcrumbListSchema {
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export type JsonLdSchema =
  | OrganizationSchema
  | WebSiteSchema
  | NewsArticleSchema
  | PersonSchema
  | FAQPageSchema
  | BreadcrumbListSchema
  | Record<string, unknown>;
