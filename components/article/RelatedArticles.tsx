import type { WPPost } from "@/types/wordpress";
import ArticleCard from "./ArticleCard";

interface RelatedArticlesProps {
  posts: WPPost[];
}

export default function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (!posts.length) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 id="related-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Related Articles
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.slice(0, 4).map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
