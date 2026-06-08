import type { Metadata } from "next";
import Link from "next/link";
import { fetchGraphQL } from "@/lib/graphql/client";
import { GET_TAGS } from "@/lib/graphql/queries";
import type { WPTag } from "@/types/wordpress";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Foundoors";

export const metadata: Metadata = {
  title: `People - ${SITE_NAME}`,
  description: `Browse founders, investors, and executives covered on ${SITE_NAME}.`,
};

export const revalidate = 3600;

interface TagsData {
  tags: { nodes: WPTag[] };
}

export default async function PeopleIndexPage() {
  const data = await fetchGraphQL<TagsData>(GET_TAGS, { first: 100 });
  const allTags = data?.tags?.nodes ?? [];
  const peopleTags = allTags.filter((t) => t.slug.startsWith("person-"));
  const tags = peopleTags.length ? peopleTags : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">People</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Founders, investors, executives, and thought leaders.
      </p>
      {tags.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tags.map((tag) => {
            const slug = tag.slug.replace(/^person-/, "");
            return (
              <Link
                key={tag.slug}
                href={`/people/${slug}`}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all group"
              >
                <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {tag.name.replace(/^Person: ?/, "")}
                </span>
                {tag.count !== undefined && (
                  <span className="text-xs text-gray-400 ml-2">{tag.count}</span>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          Browse individual people pages by navigating from articles.
        </p>
      )}
    </div>
  );
}
