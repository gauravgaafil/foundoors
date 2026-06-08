import type { Metadata } from "next";
import Link from "next/link";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_TAGS } from "@/lib/graphql/queries";
import type { WPTag } from "@/types/wordpress";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Foundoors";

export const metadata: Metadata = {
  title: `Companies - ${SITE_NAME}`,
  description: `Browse all companies covered on ${SITE_NAME}.`,
};

export const revalidate = 3600;

interface TagsData {
  tags: { nodes: WPTag[] };
}

export default async function CompaniesIndexPage() {
  const data = await fetchGraphQL<TagsData>(GET_TAGS, { first: 100 });
  const allTags = data?.tags?.nodes ?? [];
  // Filter to company-prefixed tags if they exist, else show all
  const companyTags = allTags.filter((t) => t.slug.startsWith("company-"));
  const tags = companyTags.length ? companyTags : allTags.slice(0, 50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Companies</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Browse news and analysis by company.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.map((tag) => {
          const slug = tag.slug.replace(/^company-/, "");
          return (
            <Link
              key={tag.slug}
              href={`/companies/${slug}`}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all group"
            >
              <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {tag.name.replace(/^Company: ?/, "")}
              </span>
              {tag.count !== undefined && (
                <span className="text-xs text-gray-400 ml-2 shrink-0">{tag.count}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
