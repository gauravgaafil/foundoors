export interface WPNode {
  id: string;
  databaseId: number;
}

export interface WPImage {
  sourceUrl: string;
  altText: string;
  mediaDetails?: {
    width: number;
    height: number;
  };
  caption?: string;
}

export interface WPAuthor {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  avatar?: {
    url: string;
  };
  seo?: {
    title?: string;
    metaDesc?: string;
    opengraphImage?: WPImage;
  };
  social?: {
    twitter?: string;
    linkedIn?: string;
  };
}

export interface WPCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  ancestors?: {
    nodes: Array<{ name: string; slug: string }>;
  };
}

export interface WPTag {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface WPFAQItem {
  question: string;
  answer: string;
}

export interface WPAEOFields {
  summary?: string;
  keyFacts?: string;
  whyItMatters?: string;
  sources?: string;
  faqItems?: WPFAQItem[];
}

export interface WPPost {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  status: string;
  featuredImage?: {
    node: WPImage;
  };
  author?: {
    node: WPAuthor;
  };
  categories?: {
    nodes: WPCategory[];
  };
  tags?: {
    nodes: WPTag[];
  };
  seo?: {
    title?: string;
    metaDesc?: string;
    canonical?: string;
    opengraphTitle?: string;
    opengraphDescription?: string;
    opengraphImage?: WPImage;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: WPImage;
    readingTime?: number;
  };
  aeoFields?: WPAEOFields;
  tableOfContents?: string;
}

export interface WPPostConnection {
  nodes: WPPost[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export interface WPPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface WPSearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  featuredImage?: {
    node: WPImage;
  };
  categories?: {
    nodes: WPCategory[];
  };
}

export interface WPSitemapPost {
  slug: string;
  modified: string;
  date: string;
  title: string;
  categories?: {
    nodes: Array<{ slug: string; name: string }>;
  };
}

export interface WPEntity {
  slug: string;
  name: string;
  description?: string;
  count?: number;
}
