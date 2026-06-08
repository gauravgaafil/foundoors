import Link from "next/link";
import type { WPCategory } from "@/types/wordpress";

interface CategoryBadgeProps {
  category: Pick<WPCategory, "name" | "slug">;
  size?: "sm" | "md";
}

export default function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const sizeClasses = size === "sm"
    ? "text-xs px-2 py-0.5"
    : "text-sm px-3 py-1";

  return (
    <Link
      href={`/category/${category.slug}`}
      className={`inline-block ${sizeClasses} rounded-full bg-primary-100 text-primary-700 font-medium hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800 transition-colors`}
    >
      {category.name}
    </Link>
  );
}
