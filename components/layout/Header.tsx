import Link from "next/link";
import Navigation from "./Navigation";
import SearchBar from "@/components/search/SearchBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              KiaNews
            </span>
          </Link>
          <div className="hidden md:flex flex-1 max-w-xs">
            <SearchBar compact />
          </div>
          <Navigation />
        </div>
      </div>
    </header>
  );
}
