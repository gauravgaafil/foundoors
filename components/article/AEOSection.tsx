import type { WPAEOFields, WPFAQItem } from "@/types/wordpress";

interface AEOSectionProps {
  aeoFields: WPAEOFields;
}

function FAQAccordion({ items }: { items: WPFAQItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          itemScope
          itemType="https://schema.org/Question"
        >
          <h4
            className="px-5 py-4 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
            itemProp="name"
          >
            {item.question}
          </h4>
          <div
            className="px-5 py-4 text-gray-700 dark:text-gray-300 text-sm"
            itemScope
            itemType="https://schema.org/Answer"
            itemProp="acceptedAnswer"
          >
            <p itemProp="text">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionWrapper({ title, children, id }: { title: string; children: React.ReactNode; id: string }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="my-10 p-6 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900"
    >
      <h2 id={`${id}-heading`} className="text-lg font-bold text-primary-800 dark:text-primary-200 mb-4 flex items-center gap-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function AEOSection({ aeoFields }: AEOSectionProps) {
  const { summary, keyFacts, whyItMatters, sources, faqItems } = aeoFields;

  if (!summary && !keyFacts && !whyItMatters && !sources && (!faqItems || !faqItems.length)) {
    return null;
  }

  return (
    <div className="my-10 space-y-6">
      {summary && (
        <SectionWrapper title="Summary" id="aeo-summary">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
        </SectionWrapper>
      )}

      {keyFacts && (
        <SectionWrapper title="Key Facts" id="aeo-key-facts">
          <ul className="space-y-2">
            {keyFacts.split("\n").filter(Boolean).map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                <span>{fact.replace(/^[-•]\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </SectionWrapper>
      )}

      {whyItMatters && (
        <SectionWrapper title="Why It Matters" id="aeo-why-it-matters">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{whyItMatters}</p>
        </SectionWrapper>
      )}

      {sources && (
        <SectionWrapper title="Sources" id="aeo-sources">
          <ul className="space-y-1">
            {sources.split("\n").filter(Boolean).map((source, i) => {
              const urlMatch = source.match(/https?:\/\/[^\s]+/);
              const cleanSource = source.replace(/^[-•]\s*/, "");
              return (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                  {urlMatch ? (
                    <a
                      href={urlMatch[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {cleanSource}
                    </a>
                  ) : (
                    cleanSource
                  )}
                </li>
              );
            })}
          </ul>
        </SectionWrapper>
      )}

      {faqItems && faqItems.length > 0 && (
        <section
          id="aeo-faq"
          aria-labelledby="aeo-faq-heading"
          className="my-10"
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          <h2 id="aeo-faq-heading" className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={faqItems} />
        </section>
      )}
    </div>
  );
}
