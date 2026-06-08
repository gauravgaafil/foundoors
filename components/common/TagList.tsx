import Link from "next/link";
import type { WPTag } from "@/types/wordpress";

interface TagListProps {
  tags: Pick<WPTag, "name" | "slug">[];
}

export default function TagList({ tags }: TagListProps) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`/tag/${tag.slug}`}
          className="inline-block text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
