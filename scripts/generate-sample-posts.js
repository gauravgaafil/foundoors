#!/usr/bin/env node
/**
 * Generates a WordPress eXtended RSS (WXR) file containing sample posts
 * across all KiaNews categories, with AEO fields (ACF) and featured images,
 * so the frontend can be designed/tested with realistic content volume.
 *
 * Usage: node scripts/generate-sample-posts.js
 * Output: wordpress-import/sample-posts.xml
 *
 * Import via WordPress Admin -> Tools -> Import -> WordPress, and enable
 * "Download and import file attachments" to fetch featured images.
 */

const fs = require("fs");
const path = require("path");

const SITE_URL = "https://cms.kianews.in";

const CATEGORIES = [
  { name: "Startup News", slug: "startup-news" },
  { name: "Funding", slug: "funding" },
  { name: "Founder Stories", slug: "founder-stories" },
  { name: "EV News", slug: "ev-news" },
  { name: "Product Launches", slug: "product-launches" },
  { name: "Industry Analysis", slug: "industry-analysis" },
];

const COMPANIES = [
  "Nexora", "Veltrix", "Skyforge AI", "Lumina Robotics", "Quantra Health",
  "BrightWave Energy", "Coral Logistics", "Zenith Mobility", "Pulsegrid",
  "Atlas Biotech", "Northstar Fintech", "Orbital Foods",
];

const PEOPLE = [
  "Riya Sharma", "Marcus Chen", "Aanya Verma", "David Okafor",
  "Priya Nair", "Tom Bennett",
];

const VCS = [
  "Sequoia Capital", "Accel", "Tiger Global", "Lightspeed Ventures",
  "Elevation Capital", "SoftBank Vision Fund",
];

const REGIONS = ["Bengaluru", "Mumbai", "Pune", "Singapore", "Dubai", "Austin"];
const SECTORS = ["fintech", "healthtech", "climate tech", "AI infrastructure", "logistics", "mobility"];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cdata(str) {
  return `<![CDATA[${str}]]>`;
}

// One template generator per category. Each returns title, content (HTML),
// excerpt, AEO fields, and entity tags for a post at index `i`.
const TEMPLATES = {
  "startup-news": (i) => {
    const company = pick(COMPANIES, i);
    const region = pick(REGIONS, i + 1);
    const sector = pick(SECTORS, i);
    const variants = [
      {
        title: `${company} Launches AI-Powered Platform to Disrupt ${sector.charAt(0).toUpperCase() + sector.slice(1)}`,
        hook: `${company} today announced the launch of a new AI-driven platform aimed at transforming how businesses approach ${sector}.`,
      },
      {
        title: `${company} Expands to ${region} With New Office and 200 New Hires`,
        hook: `${company} is doubling down on its growth strategy with a new regional headquarters in ${region}, expected to create 200 jobs over the next year.`,
      },
      {
        title: `${company} Pivots Toward ${sector.charAt(0).toUpperCase() + sector.slice(1)} After Strong Investor Interest`,
        hook: `${company}, once known for its consumer app, is shifting its core focus toward ${sector} following months of investor and customer feedback.`,
      },
      {
        title: `${company} Partners With Global Retailers to Scale Operations`,
        hook: `${company} has signed partnership agreements with several global retail chains, marking a major step in its international expansion plans.`,
      },
    ];
    const v = pick(variants, i);
    return {
      title: v.title,
      hook: v.hook,
      company,
      region,
      sector,
      tags: [`company-${slugify(company)}`, "startups", sector.replace(/\s+/g, "-")],
    };
  },
  funding: (i) => {
    const company = pick(COMPANIES, i + 3);
    const vc = pick(VCS, i);
    const round = pick(["Seed", "Series A", "Series B", "Series C"], i);
    const amount = (5 + i * 7) % 60 + 5;
    const variants = [
      {
        title: `${company} Raises $${amount}M ${round} Led by ${vc}`,
        hook: `${company} has closed a $${amount} million ${round} funding round led by ${vc}, with participation from existing investors.`,
      },
      {
        title: `${company} Secures $${amount}M in Funding to Build Next-Gen Infrastructure`,
        hook: `${company} announced today it has raised $${amount} million to accelerate product development and hiring across engineering and sales.`,
      },
      {
        title: `${vc} Closes New Fund to Back Early-Stage Startups`,
        hook: `${vc} has announced the closing of a new fund focused on backing early-stage founders building category-defining companies.`,
      },
      {
        title: `${company} Valued at $${amount * 20}M After Latest Funding Round`,
        hook: `${company}'s latest funding round values the company at $${amount * 20} million, nearly doubling its valuation from a year ago.`,
      },
    ];
    const v = pick(variants, i);
    return {
      title: v.title,
      hook: v.hook,
      company,
      vc,
      round,
      amount,
      tags: [`company-${slugify(company)}`, `topic-${slugify(vc)}`, "funding"],
    };
  },
  "founder-stories": (i) => {
    const person = pick(PEOPLE, i);
    const company = pick(COMPANIES, i + 6);
    const variants = [
      {
        title: `How ${person} Built ${company} From a College Dorm Room`,
        hook: `${person} started ${company} with a small team and a laptop. Today, the company serves millions of users across multiple countries.`,
      },
      {
        title: `${person}'s Journey: From Corporate Burnout to Founding ${company}`,
        hook: `Before founding ${company}, ${person} spent nearly a decade in a corporate job before deciding to take the leap into entrepreneurship.`,
      },
      {
        title: `The Untold Story of ${company}'s Early Struggles and Comeback`,
        hook: `${company} nearly shut down twice in its first two years. Here's how founder ${person} turned things around.`,
      },
      {
        title: `${person} on Leadership, Failure, and Scaling ${company}`,
        hook: `In a candid conversation, ${person} shares lessons learned while scaling ${company} from a handful of employees to a company-wide team.`,
      },
    ];
    const v = pick(variants, i);
    return {
      title: v.title,
      hook: v.hook,
      person,
      company,
      tags: [`person-${slugify(person)}`, `company-${slugify(company)}`, "founder-stories"],
    };
  },
  "ev-news": (i) => {
    const company = pick(COMPANIES, i + 2);
    const region = pick(REGIONS, i + 2);
    const range = 250 + i * 15;
    const variants = [
      {
        title: `${company} Unveils New Electric SUV With ${range}-Mile Range`,
        hook: `${company} has unveiled its newest electric SUV, boasting a range of ${range} miles on a single charge and a starting price under $40,000.`,
      },
      {
        title: `${company} to Build Gigafactory in ${region}, Creating Thousands of Jobs`,
        hook: `${company} announced plans to construct a new battery gigafactory in ${region}, expected to create thousands of manufacturing jobs.`,
      },
      {
        title: `EV Sales Surge as ${company} Leads Market in ${region}`,
        hook: `Electric vehicle sales have surged this quarter, with ${company} capturing the largest share of new registrations in ${region}.`,
      },
      {
        title: `${company} Announces Battery Breakthrough for Faster Charging`,
        hook: `${company} revealed a new battery chemistry that it says can cut charging times by nearly half compared to current models.`,
      },
    ];
    const v = pick(variants, i);
    return {
      title: v.title,
      hook: v.hook,
      company,
      region,
      range,
      tags: [`company-${slugify(company)}`, "electric-vehicles", `topic-${slugify(region)}`],
    };
  },
  "product-launches": (i) => {
    const company = pick(COMPANIES, i + 4);
    const product = pick(["Atlas", "Pulse", "Orbit", "Nova", "Forge", "Vega"], i);
    const competitor = pick(COMPANIES, i + 8);
    const variants = [
      {
        title: `${company} Launches ${product}, a New Workspace Productivity Tool`,
        hook: `${company} today launched ${product}, a productivity tool designed to help teams collaborate more efficiently using AI-assisted workflows.`,
      },
      {
        title: `${company} Debuts ${product} With AI-Driven Automation Features`,
        hook: `${company} has introduced ${product}, its latest product featuring AI-driven automation aimed at reducing manual work for businesses.`,
      },
      {
        title: `${company} Rolls Out ${product} to Compete With ${competitor}`,
        hook: `${company} is entering a crowded market with the launch of ${product}, positioning it as a direct competitor to ${competitor}'s flagship offering.`,
      },
      {
        title: `${company} Releases Major Update to ${product} Platform`,
        hook: `${company} has shipped a major update to its ${product} platform, adding new collaboration tools and performance improvements.`,
      },
    ];
    const v = pick(variants, i);
    return {
      title: v.title,
      hook: v.hook,
      company,
      product,
      competitor,
      tags: [`company-${slugify(company)}`, "product-launches", `topic-${slugify(product)}`],
    };
  },
  "industry-analysis": (i) => {
    const sector = pick(SECTORS, i + 1);
    const year = 2026 + (i % 3);
    const valuation = 50 + i * 25;
    const variants = [
      {
        title: `Why ${sector.charAt(0).toUpperCase() + sector.slice(1)} Startups Are Attracting Record Investment in ${year}`,
        hook: `Investors are pouring capital into ${sector} startups at a record pace, according to new data released this week.`,
      },
      {
        title: `The State of ${sector.charAt(0).toUpperCase() + sector.slice(1)}: Trends Shaping the Next Decade`,
        hook: `A new report outlines the key trends expected to shape the ${sector} industry over the next ten years.`,
      },
      {
        title: `${sector.charAt(0).toUpperCase() + sector.slice(1)} Market to Reach $${valuation}B by ${year}, Report Finds`,
        hook: `The global ${sector} market is projected to reach $${valuation} billion by ${year}, driven by rising demand and new technology adoption.`,
      },
      {
        title: `How AI Is Transforming the ${sector.charAt(0).toUpperCase() + sector.slice(1)} Industry`,
        hook: `Artificial intelligence is reshaping the ${sector} industry, from automating operations to unlocking entirely new business models.`,
      },
    ];
    const v = pick(variants, i);
    return {
      title: v.title,
      hook: v.hook,
      sector,
      year,
      valuation,
      tags: [`topic-${slugify(sector)}`, "industry-analysis", "market-trends"],
    };
  },
};

function buildContent(hook, data, catSlug) {
  const paragraphs = [
    hook,
    `Industry observers say the move reflects a broader shift in how companies in this space are approaching growth, with a renewed focus on sustainable expansion rather than rapid, unchecked scaling. Analysts have pointed to similar moves across the sector in recent months.`,
    `"This is a pivotal moment for the industry," said one analyst familiar with the matter. "Companies that can execute well on both product and operations will be the ones that come out ahead over the next few years."`,
    `The development comes amid a wave of activity across the broader market, with several companies announcing similar initiatives in recent weeks. Market watchers expect this trend to continue through the remainder of the year as competition intensifies.`,
  ];

  const heading = catSlug === "founder-stories" ? "Background" : "What This Means for the Industry";

  return [
    `<p>${paragraphs[0]}</p>`,
    `<p>${paragraphs[1]}</p>`,
    `<h2>${heading}</h2>`,
    `<p>${paragraphs[2]}</p>`,
    `<blockquote><p>${paragraphs[2].replace(/^"|"$/g, "").split('"')[1] || paragraphs[2]}</p></blockquote>`,
    `<p>${paragraphs[3]}</p>`,
    `<h2>What's Next</h2>`,
    `<p>Stakeholders will be watching closely to see how this plays out over the coming quarters, with several follow-up announcements expected before the end of the year.</p>`,
  ].join("\n");
}

function buildAEO(title, data, catSlug) {
  const summary = `${title}. Here's a quick breakdown of what happened, why it matters, and what to expect next.`;

  const keyFacts = [
    `${data.company || data.sector || "The company"} is at the center of this development.`,
    `The announcement was made this week and is already drawing reactions from across the industry.`,
    `Analysts expect ripple effects across related markets in the coming months.`,
  ].join("\n");

  const whyItMatters = `This development matters because it signals where the industry is heading next. Companies, investors, and customers alike will need to adjust their strategies in response to these changes, and early movers are likely to gain a competitive advantage.`;

  const sources = [
    `- Company press release, ${SITE_URL}`,
    `- Industry analysis, KiaNews Research Desk`,
    `- Market data via public filings`,
  ].join("\n");

  const faqItems = `Q: What happened? A: ${data.hook} Q: Why does this matter? A: ${whyItMatters} Q: What happens next? A: Industry watchers expect further updates and follow-on announcements over the coming months as the situation develops.`;

  return { summary, keyFacts, whyItMatters, sources, faqItems };
}

const now = new Date("2026-06-11T09:00:00Z");

const items = [];
let postId = 2000;
let attachmentId = 1000;
const allTags = new Set();

CATEGORIES.forEach((cat, catIndex) => {
  for (let n = 0; n < 4; n++) {
    const i = catIndex * 4 + n;
    const data = TEMPLATES[cat.slug](n);
    const title = data.title;
    const slug = slugify(title);
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().replace("T", " ").slice(0, 19);

    const content = buildContent(data.hook, data, cat.slug);
    const excerpt = data.hook;
    const aeo = buildAEO(title, data, cat.slug);
    const tags = data.tags;
    tags.forEach((t) => allTags.add(t));

    const thisAttachmentId = attachmentId++;
    const thisPostId = postId++;
    const imageSlug = `${slug}-${thisPostId}`;

    items.push({
      type: "attachment",
      id: thisAttachmentId,
      title: `${title} - Featured Image`,
      slug: `${imageSlug}-image`,
      date: dateStr,
      attachmentUrl: `https://picsum.photos/seed/${imageSlug}/1200/630.jpg`,
    });

    items.push({
      type: "post",
      id: thisPostId,
      title,
      slug,
      date: dateStr,
      content,
      excerpt,
      category: cat,
      tags,
      thumbnailId: thisAttachmentId,
      aeo,
    });
  }
});

function renderCategoryEl(cat, index) {
  return `    <wp:category>
      <wp:term_id>${100 + index}</wp:term_id>
      <wp:category_nicename>${cat.slug}</wp:category_nicename>
      <wp:category_parent></wp:category_parent>
      <wp:cat_name>${cdata(cat.name)}</wp:cat_name>
    </wp:category>`;
}

function renderTagEl(tagSlug) {
  const niceName = tagSlug
    .replace(/^(company|person|topic)-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return `    <wp:tag>
      <wp:term_id>${Math.abs(hashCode(tagSlug)) % 100000 + 200}</wp:term_id>
      <wp:tag_slug>${tagSlug}</wp:tag_slug>
      <wp:tag_name>${cdata(niceName)}</wp:tag_name>
    </wp:tag>`;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function renderItem(item) {
  if (item.type === "attachment") {
    return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${SITE_URL}/?attachment_id=${item.id}</link>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <dc:creator><![CDATA[admin]]></dc:creator>
      <guid isPermaLink="false">${SITE_URL}/?attachment_id=${item.id}</guid>
      <description></description>
      <content:encoded><![CDATA[]]></content:encoded>
      <excerpt:encoded><![CDATA[]]></excerpt:encoded>
      <wp:post_id>${item.id}</wp:post_id>
      <wp:post_date>${item.date}</wp:post_date>
      <wp:post_date_gmt>${item.date}</wp:post_date_gmt>
      <wp:comment_status>closed</wp:comment_status>
      <wp:ping_status>closed</wp:ping_status>
      <wp:post_name>${item.slug}</wp:post_name>
      <wp:status>inherit</wp:status>
      <wp:post_parent>0</wp:post_parent>
      <wp:menu_order>0</wp:menu_order>
      <wp:post_type>attachment</wp:post_type>
      <wp:post_password></wp:post_password>
      <wp:is_sticky>0</wp:is_sticky>
      <wp:attachment_url>${item.attachmentUrl}</wp:attachment_url>
    </item>`;
  }

  const categoryEls = [
    `    <category domain="category" nicename="${item.category.slug}">${cdata(item.category.name)}</category>`,
    ...item.tags.map((t) => `    <category domain="post_tag" nicename="${t}">${cdata(t.replace(/-/g, " "))}</category>`),
  ].join("\n");

  const postmeta = [
    ["_thumbnail_id", String(item.thumbnailId)],
    ["summary", item.aeo.summary],
    ["key_facts", item.aeo.keyFacts],
    ["why_it_matters", item.aeo.whyItMatters],
    ["sources", item.aeo.sources],
    ["faq_items", item.aeo.faqItems],
  ]
    .map(
      ([key, value]) => `      <wp:postmeta>
        <wp:meta_key>${cdata(key)}</wp:meta_key>
        <wp:meta_value>${cdata(value)}</wp:meta_value>
      </wp:postmeta>`
    )
    .join("\n");

  return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${SITE_URL}/${item.slug}/</link>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <dc:creator><![CDATA[admin]]></dc:creator>
      <guid isPermaLink="false">${SITE_URL}/?p=${item.id}</guid>
      <description></description>
      <content:encoded>${cdata(item.content)}</content:encoded>
      <excerpt:encoded>${cdata(item.excerpt)}</excerpt:encoded>
      <wp:post_id>${item.id}</wp:post_id>
      <wp:post_date>${item.date}</wp:post_date>
      <wp:post_date_gmt>${item.date}</wp:post_date_gmt>
      <wp:comment_status>closed</wp:comment_status>
      <wp:ping_status>closed</wp:ping_status>
      <wp:post_name>${item.slug}</wp:post_name>
      <wp:status>publish</wp:status>
      <wp:post_parent>0</wp:post_parent>
      <wp:menu_order>0</wp:menu_order>
      <wp:post_type>post</wp:post_type>
      <wp:post_password></wp:post_password>
      <wp:is_sticky>0</wp:is_sticky>
${categoryEls}
${postmeta}
    </item>`;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/"
>
  <channel>
    <title>KiaNews</title>
    <link>${SITE_URL}</link>
    <description>Sample post import for KiaNews</description>
    <pubDate>${now.toUTCString()}</pubDate>
    <language>en-US</language>
    <wp:wxr_version>1.2</wp:wxr_version>
    <wp:base_site_url>${SITE_URL}</wp:base_site_url>
    <wp:base_blog_url>${SITE_URL}</wp:base_blog_url>
    <wp:author>
      <wp:author_id>1</wp:author_id>
      <wp:author_login><![CDATA[admin]]></wp:author_login>
      <wp:author_email><![CDATA[admin@kianews.in]]></wp:author_email>
      <wp:author_display_name><![CDATA[Admin]]></wp:author_display_name>
      <wp:author_first_name><![CDATA[]]></wp:author_first_name>
      <wp:author_last_name><![CDATA[]]></wp:author_last_name>
    </wp:author>
${CATEGORIES.map((c, idx) => renderCategoryEl(c, idx)).join("\n")}
${[...allTags].map(renderTagEl).join("\n")}
${items.map(renderItem).join("\n")}
  </channel>
</rss>
`;

const outDir = path.join(__dirname, "..", "wordpress-import");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "sample-posts.xml");
fs.writeFileSync(outPath, xml, "utf-8");
console.log(`Wrote ${items.filter((i) => i.type === "post").length} posts to ${outPath}`);
