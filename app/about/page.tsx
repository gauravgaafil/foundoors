import type { Metadata } from "next";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "KiaNews";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kianews.in";

export const metadata: Metadata = {
  title: `About - ${SITE_NAME}`,
  description: `Learn about ${SITE_NAME}'s mission, team, and editorial standards.`,
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">About {SITE_NAME}</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p>
          {SITE_NAME} is an authoritative news and analysis publication dedicated to covering
          startups, venture capital, emerging technology, and the business stories that matter
          to founders and investors.
        </p>
        <h2>Our Mission</h2>
        <p>
          We believe that access to accurate, timely, and in-depth business journalism should be
          a right, not a privilege. Our mission is to be the most trusted source of information
          for people building and backing the companies of tomorrow.
        </p>
        <h2>Editorial Independence</h2>
        <p>
          {SITE_NAME}&rsquo;s editorial coverage is fully independent of our commercial relationships.
          Our journalists operate without interference from advertisers, investors, or any other
          outside parties. We maintain a strict separation between editorial and business operations.
        </p>
        <h2>Our Team</h2>
        <p>
          We are a team of experienced journalists, analysts, and technologists who are passionate
          about the startup ecosystem. Our reporters have decades of combined experience covering
          technology, business, and finance.
        </p>
        <h2>Contact</h2>
        <p>
          For editorial inquiries, please email{" "}
          <a href="mailto:editorial@kianews.in">editorial@kianews.in</a>.
          For business inquiries, please visit our{" "}
          <a href="/contact">contact page</a>.
        </p>
      </div>
    </div>
  );
}
