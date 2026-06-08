import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/graphql/client";
import { SEARCH_POSTS } from "@/lib/graphql/queries";
import type { WPSearchResult } from "@/types/wordpress";

interface SearchData {
  posts: {
    nodes: WPSearchResult[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const first = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);
  const after = searchParams.get("after") ?? undefined;

  if (!query?.trim()) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const data = await fetchGraphQL<SearchData>(SEARCH_POSTS, {
    query: query.trim(),
    first,
    after,
  });

  if (!data) {
    return NextResponse.json({ error: "Search unavailable" }, { status: 503 });
  }

  return NextResponse.json(
    {
      results: data.posts?.nodes ?? [],
      pageInfo: data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null },
      query: query.trim(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    }
  );
}
