import Link from "next/link";
import Image from "next/image";
import type { WPAuthor } from "@/types/wordpress";

interface AuthorBioProps {
  author: WPAuthor;
}

export default function AuthorBio({ author }: AuthorBioProps) {
  return (
    <div className="flex gap-5 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
      {author.avatar?.url && (
        <div className="shrink-0">
          <Link href={`/author/${author.slug}`}>
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              <Image
                src={author.avatar.url}
                alt={author.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          </Link>
        </div>
      )}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          Written by
        </p>
        <Link
          href={`/author/${author.slug}`}
          className="font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {author.name}
        </Link>
        {author.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {author.description}
          </p>
        )}
        <Link
          href={`/author/${author.slug}`}
          className="mt-3 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          View all articles →
        </Link>
      </div>
    </div>
  );
}
