import type { Metadata } from "next";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "KiaNews";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kianews.in";

export const metadata: Metadata = {
  title: `Editorial Policy - ${SITE_NAME}`,
  description: `${SITE_NAME}'s editorial standards and guidelines.`,
  alternates: { canonical: `${SITE_URL}/editorial-policy` },
};

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Editorial Policy</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="lead">
          {SITE_NAME} is committed to the highest standards of journalism. This policy outlines
          our editorial principles, processes, and standards.
        </p>

        <h2>Independence</h2>
        <p>
          Our editorial decisions are made independently by our editors and reporters. Advertisers,
          sponsors, investors, and subjects of coverage have no influence over what we publish.
          Business relationships are never allowed to affect editorial coverage.
        </p>

        <h2>Accuracy</h2>
        <p>
          We verify information from multiple sources before publishing. Where information cannot
          be independently verified, we say so clearly. We correct errors promptly and transparently
          in accordance with our{" "}
          <a href="/corrections-policy">Corrections Policy</a>.
        </p>

        <h2>Attribution and Sources</h2>
        <p>
          We identify sources by name whenever possible. Anonymous sources are used only when
          necessary to obtain important information that would otherwise not be available, and
          only when we are satisfied with the credibility of the source. We do not fabricate
          sources or quotes.
        </p>

        <h2>Fairness</h2>
        <p>
          We give subjects of critical coverage the opportunity to respond before publication.
          We represent all perspectives in stories involving controversy or dispute.
        </p>

        <h2>Conflicts of Interest</h2>
        <p>
          Staff members are required to disclose potential conflicts of interest to editors.
          We do not allow journalists to write about companies in which they hold a financial
          interest. Gifts, travel, or other benefits from sources or subjects of coverage are
          prohibited.
        </p>

        <h2>Native Advertising and Sponsored Content</h2>
        <p>
          Sponsored content is clearly labeled as such and is separate from editorial content.
          Our editorial team has no involvement in the creation of sponsored content.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about our editorial standards should be directed to{" "}
          <a href="mailto:editorial@kianews.in">editorial@kianews.in</a>.
        </p>
      </div>
    </div>
  );
}
