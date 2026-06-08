import type { Metadata } from "next";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Foundoors";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://foundoors.com";

export const metadata: Metadata = {
  title: `Contact - ${SITE_NAME}`,
  description: `Get in touch with the ${SITE_NAME} team.`,
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
        <p>
          We welcome tips, story ideas, corrections, and feedback from our readers. Here&rsquo;s
          how to reach the right team.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { title: "Editorial", email: "editorial@foundoors.com", desc: "Story tips, corrections, press releases" },
          { title: "Advertising", email: "ads@foundoors.com", desc: "Sponsorships, partnerships, media kit" },
          { title: "Legal", email: "legal@foundoors.com", desc: "DMCA, legal notices, privacy requests" },
          { title: "General", email: "hello@foundoors.com", desc: "Everything else" },
        ].map((item) => (
          <div
            key={item.title}
            className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{item.desc}</p>
            <a
              href={`mailto:${item.email}`}
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
            >
              {item.email}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
