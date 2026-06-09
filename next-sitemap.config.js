/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://foundoors.com",
  generateRobotsTxt: false, // handled by app/robots.ts
  exclude: [
    "/api/*",
    "/admin",
    "/_next/*",
  ],
  additionalPaths: async (config) => [
    await config.transform(config, "/about"),
    await config.transform(config, "/contact"),
    await config.transform(config, "/editorial-policy"),
    await config.transform(config, "/corrections-policy"),
    await config.transform(config, "/privacy-policy"),
  ],
  transform: async (config, path) => ({
    loc: path,
    changefreq: path === "/" ? "hourly" : path.startsWith("/category") ? "daily" : "weekly",
    priority:
      path === "/"
        ? 1.0
        : path.startsWith("/category") || path.startsWith("/topics")
        ? 0.8
        : path.startsWith("/author") || path.startsWith("/companies") || path.startsWith("/people")
        ? 0.7
        : 0.6,
    lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
  }),
};
