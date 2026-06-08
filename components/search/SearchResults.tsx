import Link from "next/link";
import Image from "next/image";
import type { WPSearchResult } from "@/types/wordpress";
import { formatDateShort } from "@/lib/utils/date";
import { stripHtml, truncate } from "@/lib/utils/string";
import CategoryBadge from "@/components/common/CategoryBadge";

interface SearchResultsProps {
  results: WPSearchResult[];
  query: string;
  total?: number;
}

export default function SearchResults({ results, query, total }: SearchResultsProps) {
  if (!results.length) {
    return (
      <div className="text-center py-16">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No results for &ldquo;{query}&rdquo;
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Try different keywords or browse our topics.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {total !== undefined ? `${total} results` : `${results.length} results`} for &ldquo;{query}&rdquo;
      </p>
      <div className="space-y-6">
        {results.map((result) => (
          <article key={result.id} className="flex gap-4 py-6 border-b border-gray-100 dark:border-gray-800">
            {result.featuredImage?.node && (
              <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-24 relative rounded-lg overflow-hidden">
                <Image
                  src={result.featuredImage.node.sourceUrl}
                  alt={result.featuredImage.node.altText || result.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {result.categories?.nodes[0] && (
                <div className="mb-2">
                  <CategoryBadge category={result.categories.nodes[0]} size="sm" />
                </div>
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                <Link href={`/${result.slug}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {result.title}
                </Link>
              </h3>
              {result.excerpt && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {truncate(stripHtml(result.excerpt), 140)}
                </p>
              )}
              <time className="text-xs text-gray-400 mt-2 block">
                {formatDateShort(result.date)}
              </time>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
