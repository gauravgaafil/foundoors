import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo/schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kianews.in";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "KiaNews";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - News & Analysis for Founders`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Authoritative news and analysis for founders, investors, and business leaders.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@kianews",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = buildOrganizationSchema();
  const siteSchema = buildWebSiteSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} RSS Feed`} href="/feed.xml" />
        <link rel="alternate" type="application/json" title={`${SITE_NAME} JSON Feed`} href="/feed.json" />
      </head>
      <body className="min-h-screen flex flex-col">
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
        <JsonLd schema={[orgSchema as unknown as Record<string, unknown>, siteSchema as unknown as Record<string, unknown>]} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
