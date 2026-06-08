import type { WPPost } from "@/types/wordpress";
import ArticleCard from "./ArticleCard";

interface ArticleGridProps {
  posts: WPPost[];
  columns?: 2 | 3 | 4;
}

export default function ArticleGrid({ posts, columns = 3 }: ArticleGridProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  if (!posts.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-12">
        No articles found.
      </p>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
      {posts.map((post) => (
        <ArticleCard key={post.id} post={post} />
      ))}
    </div>
  );
}
