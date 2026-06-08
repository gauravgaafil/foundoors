import Image from "next/image";
import Link from "next/link";
import type { WPPost } from "@/types/wordpress";
import { formatDate } from "@/lib/utils/date";
import { formatReadingTime, calculateReadingTime } from "@/lib/utils/reading-time";
import CategoryBadge from "@/components/common/CategoryBadge";
import TagList from "@/components/common/TagList";
import ShareButtons from "@/components/common/ShareButtons";
import Breadcrumb from "@/components/layout/Breadcrumb";
import type { BreadcrumbItem } from "@/types/seo";

interface ArticleHeaderProps {
  post: WPPost;
  url: string;
}

export default function ArticleHeader({ post, url }: ArticleHeaderProps) {
  const readingTime = post.seo?.readingTime || calculateReadingTime(post.content || "");
  const primaryCategory = post.categories?.nodes[0];

  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", url: "/" },
    ...(primaryCategory
      ? [{ name: primaryCategory.name, url: `/category/${primaryCategory.slug}` }]
      : []),
    { name: post.title, url },
  ];

  return (
    <header className="mb-8">
      <Breadcrumb items={breadcrumbs} />

      {primaryCategory && (
        <div className="mb-4">
          <CategoryBadge category={primaryCategory} />
        </div>
      )}

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
        {post.title}
      </h1>

      {post.excerpt && (
        <p
          className="text-xl text-gray-500 dark:text-gray-400 mb-6"
          dangerouslySetInnerHTML={{ __html: post.excerpt }}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          {post.author?.node && (
            <Link href={`/author/${post.author.node.slug}`} className="flex items-center gap-3 group">
              {post.author.node.avatar?.url && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={post.author.node.avatar.url}
                    alt={post.author.node.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {post.author.node.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  {post.modified !== post.date && (
                    <span>· Updated {formatDate(post.modified)}</span>
                  )}
                  <span>· {formatReadingTime(readingTime)}</span>
                </div>
              </div>
            </Link>
          )}
        </div>
        <ShareButtons url={url} title={post.title} />
      </div>

      {post.featuredImage?.node && (
        <figure className="mt-8">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9]">
            <Image
              src={post.featuredImage.node.sourceUrl}
              alt={post.featuredImage.node.altText || post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>
          {post.featuredImage.node.caption && (
            <figcaption
              className="mt-3 text-sm text-center text-gray-500 dark:text-gray-400"
              dangerouslySetInnerHTML={{ __html: post.featuredImage.node.caption }}
            />
          )}
        </figure>
      )}

      {post.tags?.nodes && post.tags.nodes.length > 0 && (
        <div className="mt-6">
          <TagList tags={post.tags.nodes} />
        </div>
      )}
    </header>
  );
}
