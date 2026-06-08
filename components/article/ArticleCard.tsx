import Link from "next/link";
import Image from "next/image";
import type { WPPost } from "@/types/wordpress";
import { formatDateShort } from "@/lib/utils/date";
import { stripHtml, truncate } from "@/lib/utils/string";
import CategoryBadge from "@/components/common/CategoryBadge";

interface ArticleCardProps {
  post: WPPost;
  featured?: boolean;
}

export default function ArticleCard({ post, featured = false }: ArticleCardProps) {
  const excerpt = post.excerpt ? truncate(stripHtml(post.excerpt), 130) : "";

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-gray-900 aspect-[16/9]">
        {post.featuredImage?.node && (
          <Image
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            fill
            className="object-cover opacity-60 group-hover:opacity-50 transition-opacity"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {post.categories?.nodes[0] && (
            <div className="mb-3">
              <CategoryBadge category={post.categories.nodes[0]} />
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-3">
            <Link href={`/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </h2>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            {post.author?.node && (
              <span>{post.author.node.name}</span>
            )}
            <time dateTime={post.date}>{formatDateShort(post.date)}</time>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
      {post.featuredImage?.node && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="flex flex-col flex-1 p-4">
        {post.categories?.nodes[0] && (
          <div className="mb-2">
            <CategoryBadge category={post.categories.nodes[0]} size="sm" />
          </div>
        )}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          <Link href={`/${post.slug}`}>{post.title}</Link>
        </h3>
        {excerpt && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
          {post.author?.node && (
            <>
              <span>{post.author.node.name}</span>
              <span>·</span>
            </>
          )}
          <time dateTime={post.date}>{formatDateShort(post.date)}</time>
        </div>
      </div>
    </article>
  );
}
