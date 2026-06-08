"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // In production, call your newsletter API endpoint
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
  };

  return (
    <div className="bg-primary-50 dark:bg-primary-950 rounded-2xl p-8 text-center">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Stay ahead of the curve
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Get the latest news and analysis delivered to your inbox.
      </p>
      {status === "success" ? (
        <p className="text-primary-600 dark:text-primary-400 font-medium">
          Thanks for subscribing! Check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-3 text-red-600 dark:text-red-400 text-sm">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
