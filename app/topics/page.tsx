import type { Metadata } from "next";
import Link from "next/link";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_CATEGORIES, GET_TAGS } from "@/lib/graphql/queries";
import type { WPCategory, WPTag } from "@/types/wordpress";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "KiaNews";

export const metadata: Metadata = {
  title: `Topics - ${SITE_NAME}`,
  description: `Browse all topics covered on ${SITE_NAME}.`,
};

export const revalidate = 3600;

interface CategoriesData {
  categories: { nodes: WPCategory[] };
}

interface TagsData {
  tags: { nodes: WPTag[] };
}

export default async function TopicsIndexPage() {
  const [catData, tagData] = await Promise.all([
    fetchGraphQL<CategoriesData>(GET_CATEGORIES, { first: 50 }),
    fetchGraphQL<TagsData>(GET_TAGS, { first: 100 }),
  ]);

  const categories = catData?.categories?.nodes ?? [];
  const tags = (tagData?.tags?.nodes ?? []).filter(
    (t) => !t.slug.startsWith("company-") && !t.slug.startsWith("person-")
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Topics</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10">
        Explore news and analysis by topic.
      </p>

      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/topics/${cat.slug}`}
                className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    {cat.name}
                  </span>
                  {cat.count !== undefined && (
                    <span className="text-xs text-gray-400">{cat.count} articles</span>
                  )}
                </div>
                {cat.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {cat.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {tags.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/topics/${tag.slug}`}
                className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                {tag.name}
                {tag.count !== undefined && (
                  <span className="ml-1.5 text-xs text-gray-400">({tag.count})</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
