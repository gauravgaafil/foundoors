import type { Metadata } from "next";
import Link from "next/link";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_HOMEPAGE_POSTS } from "@/lib/graphql/queries";
import type { WPPost, WPCategory } from "@/types/wordpress";
import ArticleCard from "@/components/article/ArticleCard";
import ArticleGrid from "@/components/article/ArticleGrid";
import NewsletterSignup from "@/components/common/NewsletterSignup";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "KiaNews";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kianews.in";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `${SITE_NAME} - News & Analysis for Founders`,
  description:
    "Authoritative news and analysis for founders, investors, and business leaders building the future.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: `${SITE_NAME} - News & Analysis for Founders`,
    description:
      "Authoritative news and analysis for founders, investors, and business leaders building the future.",
  },
};

interface HomepageData {
  featuredPosts: { nodes: WPPost[] };
  latestPosts: { nodes: WPPost[] };
  categories: { nodes: WPCategory[] };
}

export default async function HomePage() {
  const data = await fetchGraphQL<HomepageData>(GET_HOMEPAGE_POSTS);

  const featuredPost = data?.featuredPosts?.nodes[0] ?? null;
  const latestPosts = data?.latestPosts?.nodes ?? [];
  const categories = data?.categories?.nodes ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero / Featured */}
      {featuredPost && (
        <section aria-label="Featured article" className="mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ArticleCard post={featuredPost} featured />
            <div className="flex flex-col gap-4 justify-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest in Startups & Tech</h2>
              <p className="text-gray-500 dark:text-gray-400">
                In-depth reporting on startups, venture capital, and the business of technology.
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest articles */}
      <section aria-labelledby="latest-heading" className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 id="latest-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
            Latest Articles
          </h2>
        </div>
        <ArticleGrid posts={latestPosts.slice(0, 9)} columns={3} />
      </section>

      {/* Newsletter */}
      <section aria-label="Newsletter signup" className="mb-16">
        <NewsletterSignup />
      </section>
    </div>
  );
}
