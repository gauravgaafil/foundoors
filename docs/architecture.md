# Platform Architecture

## Overview

Foundoors is a headless media platform built for maximum SEO authority, AI discovery, and editorial velocity. The architecture separates content management from rendering to allow independent scaling and zero-downtime deploys.

```
┌─────────────────┐     WPGraphQL      ┌────────────────────┐
│   WordPress     │ ──────────────────▶│   Next.js (Vercel) │
│  (Hostinger)    │                    │   App Router + ISR  │
│                 │◀──────────────────  │                    │
│  REST API /     │   Revalidate Hook  └────────────────────┘
│  ACF / Yoast    │
└─────────────────┘
        │
        │ Webhooks (on publish)
        ▼
┌─────────────────┐
│      n8n        │  RSS → GPT → Draft → Publish
└─────────────────┘
```

## Folder Structure

```
foundoors/
├── app/                          # Next.js App Router
│   ├── (articles)/[slug]/        # Article pages (route group, no URL prefix)
│   ├── category/[slug]/          # Category listing pages
│   ├── tag/[slug]/               # Tag listing pages
│   ├── author/[slug]/            # Author profile pages
│   ├── search/                   # Search page
│   ├── companies/[slug]/         # Entity: company pages
│   ├── people/[slug]/            # Entity: person pages
│   ├── topics/[slug]/            # Entity: topic pages
│   ├── about/                    # Static editorial pages
│   ├── contact/
│   ├── editorial-policy/
│   ├── corrections-policy/
│   ├── privacy-policy/
│   ├── feed.xml/route.ts         # RSS 2.0 feed
│   ├── feed.json/route.ts        # JSON Feed 1.1
│   ├── news-sitemap/route.ts     # Google News sitemap
│   ├── sitemap.ts                # Dynamic XML sitemap
│   ├── robots.ts                 # robots.txt
│   ├── api/
│   │   ├── search/route.ts       # Search proxy endpoint
│   │   └── revalidate/route.ts   # ISR webhook (for n8n/WP hooks)
│   ├── layout.tsx                # Root layout: Org schema, GA4, fonts
│   ├── page.tsx                  # Homepage
│   └── globals.css
│
├── components/
│   ├── article/                  # Article-specific UI
│   │   ├── AEOSection.tsx        # AI answer engine sections (server-rendered)
│   │   ├── ArticleBody.tsx       # Prose content renderer
│   │   ├── ArticleCard.tsx       # Card for listings (featured/standard)
│   │   ├── ArticleGrid.tsx       # Grid layout
│   │   ├── ArticleHeader.tsx     # Title, meta, featured image
│   │   ├── AuthorBio.tsx         # Author card at bottom of article
│   │   ├── RelatedArticles.tsx   # Related articles section
│   │   └── TableOfContents.tsx   # Sticky sidebar ToC (client component)
│   ├── common/                   # Shared UI primitives
│   │   ├── CategoryBadge.tsx
│   │   ├── NewsletterSignup.tsx
│   │   ├── ReadingProgress.tsx
│   │   ├── ShareButtons.tsx
│   │   └── TagList.tsx
│   ├── entity/                   # Entity page components
│   │   ├── EntityHeader.tsx
│   │   └── EntityArticles.tsx
│   ├── layout/                   # Page chrome
│   │   ├── Breadcrumb.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── Navigation.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchFilters.tsx
│   │   └── SearchResults.tsx
│   └── seo/
│       └── JsonLd.tsx            # Generic JSON-LD script injector
│
├── lib/
│   ├── graphql/
│   │   ├── client.ts             # graphql-request client with error handling
│   │   ├── fragments.ts          # Reusable GraphQL fragments
│   │   └── queries.ts            # All WPGraphQL query strings
│   ├── seo/
│   │   ├── metadata.ts           # generateMetadata() helpers per page type
│   │   └── schemas.ts            # JSON-LD schema builders
│   └── utils/
│       ├── date.ts               # Date formatting + relative time
│       ├── reading-time.ts       # Reading time calculator
│       └── string.ts             # HTML stripping, slugify, truncation
│
├── types/
│   ├── wordpress.ts              # TypeScript interfaces for WP data
│   └── seo.ts                    # SEO/schema types
│
└── docs/
    ├── architecture.md           # This file
    ├── wordpress-setup.md        # WordPress + WPGraphQL setup
    ├── hostinger-setup.md        # Hostinger hosting guide
    ├── vercel-deployment.md      # Vercel deployment guide
    ├── vps-migration.md          # VPS migration guide
    └── n8n-automation.md         # n8n workflow guide
```

## Content Categories

### Primary
- AI News (`/category/ai-news`)
- Startup News (`/category/startup-news`)
- EV News (`/category/ev-news`)
- Founder Stories (`/category/founder-stories`)

### Secondary
- Funding (`/category/funding`)
- Product Launches (`/category/product-launches`)
- Industry Analysis (`/category/industry-analysis`)

## Entity System

Entity pages aggregate related articles automatically via WordPress tags:

| Entity Type | URL Pattern | WP Tag Convention |
|---|---|---|
| Company | `/companies/openai` | Tag: `company-openai` |
| Person | `/people/sam-altman` | Tag: `person-sam-altman` |
| Topic | `/topics/ai-agents` | Tag: `topic-ai-agents` OR Category |

When creating an article about OpenAI, tag it with `company-openai`. The `/companies/openai` page auto-populates.

## ISR (Incremental Static Regeneration) Strategy

| Page Type | Revalidate |
|---|---|
| Article page | 60s |
| Category listing | 300s |
| Tag / Author listing | 300s |
| Entity pages | 300s |
| Homepage | 60s |
| On-demand | POST /api/revalidate |

On publish in WordPress, a webhook fires `POST /api/revalidate` which triggers path-specific revalidation — the new article appears in < 1 second.

## SEO Architecture

Every page renders:
1. `generateMetadata()` → `<title>`, `<meta>`, `<link rel="canonical">`
2. OG tags: `og:title`, `og:description`, `og:image`, `og:type`
3. Twitter Cards: `twitter:card`, `twitter:title`, `twitter:image`
4. JSON-LD via `<JsonLd>` component (server-rendered in `<head>`)

### Schema graph per page type

**Article page:**
```json
{ "@context": "https://schema.org", "@graph": [
  { "@type": "NewsArticle", ... },
  { "@type": "BreadcrumbList", ... },
  { "@type": "FAQPage", ... }   // only if FAQ fields present
]}
```

**Root layout (all pages):**
```json
{ "@context": "https://schema.org", "@graph": [
  { "@type": "Organization", ... },
  { "@type": "WebSite", "potentialAction": { "@type": "SearchAction" } }
]}
```

## AEO (Answer Engine Optimization)

Every article template includes server-rendered sections:

```html
<section class="aeo-summary">  <!-- Summary: 1-3 sentences -->
<section class="aeo-key-facts"> <!-- Bulleted key facts -->
<section class="aeo-why">       <!-- Why it matters -->
<section class="aeo-sources">   <!-- Cited sources -->
<section class="aeo-faq">       <!-- FAQ pairs → FAQPage schema -->
```

These sections are populated via WordPress ACF custom fields and render as plain HTML — no JavaScript required. AI crawlers (Google AIO, Perplexity, ChatGPT, Gemini, Claude) extract this structured content for citations.

## Performance Strategy

- **Server Components by default** — only `TableOfContents`, `ReadingProgress`, `SearchBar` are client components
- **next/image** with `priority` on hero images, lazy loading otherwise
- **AVIF + WebP** image formats via `next.config.ts`
- **ISR** keeps pages pre-rendered at the CDN edge
- **No heavy client bundles** — no jQuery, no page builders
- **@tailwindcss/typography** for article body — pure CSS, no runtime

Target Lighthouse scores: Performance 95+, SEO 100, Accessibility 95+, Best Practices 100.
