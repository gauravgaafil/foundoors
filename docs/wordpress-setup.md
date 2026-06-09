# WordPress Setup Guide

## Required Plugins

Install all plugins before connecting the frontend.

### Core Plugins

| Plugin | Purpose | Free/Paid |
|---|---|---|
| WPGraphQL | GraphQL API endpoint | Free |
| WPGraphQL for ACF | Exposes ACF fields to GraphQL | Free |
| Advanced Custom Fields (ACF) | Custom AEO fields on posts | Free (Pro for some features) |
| Yoast SEO | SEO meta, XML sitemaps (reference only) | Free |
| WPGraphQL for Yoast SEO | Exposes Yoast data to GraphQL | Free |
| WP Mail SMTP | Transactional email reliability | Free |
| Wordfence | Security | Free |

### Installation Order
1. Install ACF first
2. Install WPGraphQL
3. Install WPGraphQL for ACF
4. Install WPGraphQL for Yoast SEO

---

## WPGraphQL Configuration

After installing WPGraphQL:

1. Go to **GraphQL → Settings**
2. Set the GraphQL endpoint to `/graphql`
3. Enable **Public Introspection** (required for development)
4. In production, consider disabling introspection

Verify the endpoint works:
```
curl -X POST https://your-site.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ generalSettings { title url } }"}'
```

---

## ACF Fields Setup

Create an ACF field group named **"AEO Fields"** applied to Post type.

### Field Group: AEO Fields

| Field Label | Field Name | Field Type | Notes |
|---|---|---|---|
| Summary | `summary` | Textarea | 1-3 sentences for AI extraction |
| Key Facts | `key_facts` | Textarea | One fact per line, will render as bullets |
| Why It Matters | `why_it_matters` | Textarea | 2-4 sentences |
| Sources | `sources` | Textarea | One URL per line |
| FAQ | `faq_items` | Repeater | See subfields below |

**FAQ Repeater Subfields:**

| Sub-label | Sub-name | Type |
|---|---|---|
| Question | `question` | Text |
| Answer | `answer` | Textarea |

### Exposing ACF to GraphQL

In ACF field group settings:
- Enable **"Show in GraphQL"**
- Set GraphQL field name to `aeoFields`

Each subfield must also have **"Show in GraphQL"** enabled.

---

## WordPress Permalink Structure

Go to **Settings → Permalinks** and set to:
```
/%postname%/
```

This gives clean slugs like `/openai-raises-10-billion/` which match the Next.js `(articles)/[slug]` route.

---

## WordPress Categories Setup

Create these categories (slugs must match exactly):

**Primary:**
- AI News → `ai-news`
- Startup News → `startup-news`
- EV News → `ev-news`
- Founder Stories → `founder-stories`

**Secondary:**
- Funding → `funding`
- Product Launches → `product-launches`
- Industry Analysis → `industry-analysis`

---

## Entity Tag Convention

To populate entity pages, use WordPress tags with these naming conventions:

| Entity | Tag Name | Tag Slug |
|---|---|---|
| Company: OpenAI | `company-openai` | `company-openai` |
| Company: Anthropic | `company-anthropic` | `company-anthropic` |
| Company: Tesla | `company-tesla` | `company-tesla` |
| Person: Sam Altman | `person-sam-altman` | `person-sam-altman` |
| Person: Elon Musk | `person-elon-musk` | `person-elon-musk` |
| Topic: AI Agents | `topic-ai-agents` | `topic-ai-agents` |
| Topic: LLMs | `topic-llm` | `topic-llm` |

When tagging an article about OpenAI's funding round, add tags: `company-openai`, `funding`.

The frontend entity pages at `/companies/openai` automatically query all posts tagged `company-openai`.

---

## User Roles & Author Setup

For each writer/editor:

1. Create a WordPress user with role **Author** or **Editor**
2. Fill in:
   - Display Name
   - Biographical Info (used as author bio on article pages)
   - Profile photo (via Simple Local Avatars plugin, or Gravatar)

Author pages are available at `/author/[slug]`.

---

## WordPress REST API / Webhook for ISR

Install the **WP Webhooks** plugin (or use ACF Hooks + custom code) to fire a webhook on post publish/update.

### Webhook configuration:
- **Trigger:** Post published / Post updated
- **URL:** `https://your-frontend.vercel.app/api/revalidate`
- **Method:** POST
- **Headers:**
  - `Authorization: Bearer YOUR_REVALIDATE_SECRET`
  - `Content-Type: application/json`
- **Body:**
  ```json
  { "slug": "%%post_slug%%" }
  ```

### Custom code alternative (add to `functions.php`):

```php
function foundoors_revalidate_on_publish($post_id, $post) {
    if ($post->post_status !== 'publish' || $post->post_type !== 'post') return;
    
    $slug = $post->post_name;
    $secret = defined('REVALIDATE_SECRET') ? REVALIDATE_SECRET : '';
    
    wp_remote_post('https://your-frontend.vercel.app/api/revalidate', [
        'headers' => [
            'Authorization' => 'Bearer ' . $secret,
            'Content-Type'  => 'application/json',
        ],
        'body' => json_encode(['slug' => $slug]),
        'timeout' => 5,
        'blocking' => false,
    ]);
}
add_action('wp_after_insert_post', 'foundoors_revalidate_on_publish', 10, 2);
```

Add `define('REVALIDATE_SECRET', 'your-secret-here');` to `wp-config.php`.

---

## Security: Disable XML-RPC

Add to `functions.php`:
```php
add_filter('xmlrpc_enabled', '__return_false');
```

## Security: Restrict GraphQL to known origins (optional, production)

Add to `functions.php`:
```php
add_filter('graphql_response_headers_to_send', function($headers) {
    $allowed = ['https://foundoors.com', 'https://www.foundoors.com'];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed)) {
        $headers['Access-Control-Allow-Origin'] = $origin;
    }
    return $headers;
});
```
