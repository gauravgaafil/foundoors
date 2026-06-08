import type { WPPost } from "@/types/wordpress";
import ArticleGrid from "@/components/article/ArticleGrid";

interface EntityArticlesProps {
  posts: WPPost[];
  emptyMessage?: string;
}

export default function EntityArticles({ posts, emptyMessage }: EntityArticlesProps) {
  if (!posts.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-16">
        {emptyMessage || "No articles found for this entity."}
      </p>
    );
  }

  return (
    <section className="mt-10">
      <ArticleGrid posts={posts} columns={3} />
    </section>
  );
}
