import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchGraphQL } from "@/lib/graphql/client";
import { SEARCH_POSTS, GET_CATEGORIES } from "@/lib/graphql/queries";
import type { WPSearchResult, WPCategory } from "@/types/wordpress";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import SearchFilters from "@/components/search/SearchFilters";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Foundoors";

export const metadata: Metadata = {
  title: `Search - ${SITE_NAME}`,
  description: `Search articles, topics, and more on ${SITE_NAME}.`,
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: { q?: string; category?: string };
}

interface SearchData {
  posts: { nodes: WPSearchResult[]; pageInfo: { hasNextPage: boolean } };
}

interface CategoriesData {
  categories: { nodes: WPCategory[] };
}

async function SearchContent({ query, category }: { query: string; category?: string }) {
  if (!query.trim()) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-12">
        Enter a search term above to find articles.
      </p>
    );
  }

  const data = await fetchGraphQL<SearchData>(SEARCH_POSTS, {
    query,
    first: 20,
  });

  const results = data?.posts?.nodes ?? [];

  return (
    <SearchResults
      results={results}
      query={query}
      total={results.length}
    />
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const category = searchParams.category;

  const catData = await fetchGraphQL<CategoriesData>(GET_CATEGORIES, { first: 20 });
  const categories = catData?.categories?.nodes ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Search</h1>
      <div className="mb-8">
        <SearchBar defaultValue={query} />
      </div>
      {categories.length > 0 && (
        <div className="mb-8">
          <Suspense>
            <SearchFilters
              categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
              selectedCategory={category}
            />
          </Suspense>
        </div>
      )}
      <Suspense key={query} fallback={<p className="text-gray-400 text-center py-12">Searching…</p>}>
        <SearchContent query={query} category={category} />
      </Suspense>
    </div>
  );
}
