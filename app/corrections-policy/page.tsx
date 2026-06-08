import type { Metadata } from "next";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Foundoors";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://foundoors.com";

export const metadata: Metadata = {
  title: `Corrections Policy - ${SITE_NAME}`,
  description: `How ${SITE_NAME} handles corrections and updates to published content.`,
  alternates: { canonical: `${SITE_URL}/corrections-policy` },
};

export default function CorrectionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Corrections Policy</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p>
          {SITE_NAME} is committed to accuracy. When we make errors, we correct them quickly,
          clearly, and transparently.
        </p>

        <h2>How We Handle Corrections</h2>
        <ul>
          <li>
            <strong>Factual errors</strong> — significant factual errors are corrected and a
            correction notice is appended to the article explaining what was wrong and what
            the correct information is.
          </li>
          <li>
            <strong>Minor errors</strong> — typographical errors, spelling mistakes, and minor
            clarifications are fixed silently or with a brief update note.
          </li>
          <li>
            <strong>Major errors</strong> — if an article contains a fundamental error that
            changes its meaning or fairness, we may unpublish the article, rewrite it, or
            append a prominent correction notice at the top.
          </li>
        </ul>

        <h2>Reporting an Error</h2>
        <p>
          If you believe we have made an error, please contact us at{" "}
          <a href="mailto:corrections@foundoors.com">corrections@foundoors.com</a>{" "}
          with the article URL, the specific error, and the correct information with supporting
          evidence where available.
        </p>
        <p>
          We aim to respond to all correction requests within 24 hours on business days.
        </p>

        <h2>What We Will Not Change</h2>
        <p>
          We do not alter or remove published articles at the request of sources, subjects, or
          advertisers except where there is a genuine factual error, a legal reason to do so,
          or where the publication causes unjustified harm to an individual.
        </p>
      </div>
    </div>
  );
}
