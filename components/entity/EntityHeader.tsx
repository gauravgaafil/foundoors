interface EntityHeaderProps {
  name: string;
  type: "company" | "person" | "topic";
  description?: string;
  count?: number;
}

const typeLabels = {
  company: "Company",
  person: "Person",
  topic: "Topic",
};

const typeIcons: Record<string, React.ReactNode> = {
  company: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  person: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  topic: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
};

export default function EntityHeader({ name, type, description, count }: EntityHeaderProps) {
  return (
    <div className="py-12 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
          {typeIcons[type]}
        </div>
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
            {typeLabels[type]}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {name}
          </h1>
          {description && (
            <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
              {description}
            </p>
          )}
          {count !== undefined && (
            <p className="mt-2 text-sm text-gray-400">
              {count} article{count !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
