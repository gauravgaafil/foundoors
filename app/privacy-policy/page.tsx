import type { Metadata } from "next";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "KiaNews";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kianews.in";

export const metadata: Metadata = {
  title: `Privacy Policy - ${SITE_NAME}`,
  description: `${SITE_NAME}'s privacy policy and data practices.`,
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  const updated = "June 1, 2024";
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: {updated}</p>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p>
          This Privacy Policy describes how {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;our&rdquo;) collects, uses, and shares information when you use our website at{" "}
          {SITE_URL}.
        </p>

        <h2>Information We Collect</h2>
        <h3>Information you provide</h3>
        <p>
          When you subscribe to our newsletter or contact us, we collect your email address and
          any other information you choose to provide.
        </p>
        <h3>Information collected automatically</h3>
        <p>
          We automatically collect certain information when you visit our website, including your
          IP address, browser type, referring URLs, and pages visited. We use Google Analytics
          to understand how our site is used.
        </p>
        <h3>Cookies</h3>
        <p>
          We use cookies and similar tracking technologies to improve your experience on our
          site. You can control cookies through your browser settings.
        </p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To send you newsletters and updates (with your consent)</li>
          <li>To analyze site usage and improve our content</li>
          <li>To respond to your inquiries</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2>Information Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may share
          information with service providers who assist us in operating our website, subject to
          confidentiality agreements.
        </p>

        <h2>Your Rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct, delete, or
          restrict the processing of your personal information. To exercise these rights, please
          contact us at <a href="mailto:privacy@kianews.in">privacy@kianews.in</a>.
        </p>

        <h2>Data Retention</h2>
        <p>
          We retain your information for as long as necessary to fulfill the purposes described
          in this policy, unless a longer retention period is required by law.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this privacy policy should be directed to{" "}
          <a href="mailto:privacy@kianews.in">privacy@kianews.in</a>.
        </p>
      </div>
    </div>
  );
}
