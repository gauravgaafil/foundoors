import Link from "next/link";
import Image from "next/image";
import type { WPCategory, WPTag } from "@/types/wordpress";
import { formatDateShort } from "@/lib/utils/date";

interface TrendingPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
}

interface SidebarProps {
  trendingPosts?: TrendingPost[];
  categories?: WPCategory[];
  tags?: WPTag[];
  className?: string;
}

function WidgetCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Sidebar({ trendingPosts = [], categories = [], tags = [], className = "" }: SidebarProps) {
  if (!trendingPosts.length && !categories.length && !tags.length) {
    return null;
  }

  return (
    <aside className={`space-y-6 ${className}`}>
      {trendingPosts.length > 0 && (
        <WidgetCard title="Trending Now">
          <ol className="space-y-4">
            {trendingPosts.map((post, i) => (
              <li key={post.id} className="flex gap-3">
                <span className="text-xl font-bold text-gray-200 dark:text-gray-700 leading-none w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {post.featuredImage?.node && (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.featuredImage.node.altText || post.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                    <Link href={`/${post.slug}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {post.title}
                    </Link>
                  </h4>
                  <time dateTime={post.date} className="text-xs text-gray-400 mt-1 block">
                    {formatDateShort(post.date)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </WidgetCard>
      )}

      {categories.length > 0 && (
        <WidgetCard title="Categories">
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="flex items-center justify-between py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <span>{cat.name}</span>
                  {typeof cat.count === "number" && (
                    <span className="text-xs text-gray-400 tabular-nums">{cat.count}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </WidgetCard>
      )}

      {tags.length > 0 && (
        <WidgetCard title="Popular Tags">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100 hover:text-primary-700 dark:hover:bg-primary-900 dark:hover:text-primary-300 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </WidgetCard>
      )}
    </aside>
  );
}
