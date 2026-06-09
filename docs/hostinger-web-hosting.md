# Hostinger Web Hosting Deployment Guide

## Plan Requirement

You need **Hostinger Business Web Hosting** (or higher).

Only the Business plan includes Node.js support in hPanel, which is required to run Next.js with server components, ISR, and API routes.

- Starter / Premium plans: PHP only → cannot run this Next.js app
- **Business plan**: Node.js via hPanel → full Next.js support ✅

Check your plan at: hPanel → Hosting → Manage → Node.js

---

## Part 1: WordPress Setup on Hostinger

### 1.1 Install WordPress via hPanel

1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Go to **Hosting → Manage → Auto Installer**
3. Click **WordPress**
4. Set:
   - **Domain:** `api.foundoors.com` (or a subdomain like `cms.foundoors.com`)
   - **Directory:** leave blank (installs to root)
   - **Admin username/password:** use a strong password
5. Click **Install**

### 1.2 Install Required Plugins

After WordPress installs, log in to `/wp-admin` and install these plugins:

1. **WPGraphQL** — search in Plugins → Add New
2. **WPGraphQL for ACF** — download from [github.com/wp-graphql/wpgraphql-acf](https://github.com/wp-graphql/wpgraphql-acf/releases), upload via Plugins → Upload Plugin
3. **Advanced Custom Fields** — search in Plugins → Add New
4. **Yoast SEO** — search in Plugins → Add New
5. **WPGraphQL for Yoast SEO** — upload from [github.com/ashhitch/wp-graphql-yoast-seo](https://github.com/ashhitch/wp-graphql-yoast-seo/releases)

### 1.3 Configure Permalinks

Go to **Settings → Permalinks** → select **Post name** → Save Changes.

### 1.4 Configure WPGraphQL

Go to **GraphQL → Settings**:
- GraphQL endpoint: `/graphql` (default)
- Enable public introspection: ✅

Test it:
```
https://api.foundoors.com/graphql?query={generalSettings{title}}
```

### 1.5 Create ACF Field Group

Go to **Custom Fields → Add New**:

**Field Group Name:** AEO Fields  
**Location:** Post Type is equal to Post

Add these fields:

| Label | Name | Type |
|---|---|---|
| Summary | `summary` | Textarea |
| Key Facts | `key_facts` | Textarea |
| Why It Matters | `why_it_matters` | Textarea |
| Sources | `sources` | Textarea |
| FAQ Items | `faq_items` | Repeater |

For the **FAQ Items** repeater, add sub-fields:
- Question (`question`) — Text
- Answer (`answer`) — Textarea

On each field, scroll down and enable **"Show in GraphQL"**.  
On the field group itself, enable **"Show in GraphQL"** and set GraphQL name to `aeoFields`.

### 1.6 WordPress Revalidation Hook

In hPanel, go to **File Manager** → navigate to your WordPress folder → edit `wp-content/themes/your-theme/functions.php` (or create a custom plugin).

Add this code:
```php
function foundoors_revalidate_on_publish($post_id, $post, $update) {
    if ($post->post_status !== 'publish' || $post->post_type !== 'post') return;
    if (wp_is_post_revision($post_id)) return;

    $slug   = $post->post_name;
    $secret = defined('REVALIDATE_SECRET') ? REVALIDATE_SECRET : getenv('REVALIDATE_SECRET');

    wp_remote_post('https://foundoors.com/api/revalidate', [
        'headers'  => [
            'Authorization' => 'Bearer ' . $secret,
            'Content-Type'  => 'application/json',
        ],
        'body'     => wp_json_encode(['slug' => $slug]),
        'timeout'  => 5,
        'blocking' => false,
    ]);
}
add_action('wp_after_insert_post', 'foundoors_revalidate_on_publish', 10, 3);
```

Add to `wp-config.php` (edit via File Manager):
```php
define('REVALIDATE_SECRET', 'your-strong-random-secret-here');
```

---

## Part 2: Next.js Setup on Hostinger (Node.js App)

### 2.1 Enable Node.js in hPanel

1. Go to **hPanel → Hosting → Manage**
2. Find **Node.js** in the sidebar (under Advanced)
3. Click **Enable Node.js**
4. Select Node.js version: **20.x**
5. Set:
   - **Application root:** `public_html/nextjs` (or your preferred folder)
   - **Application URL:** your main domain `foundoors.com`
   - **Application startup file:** `server.js`
6. Click **Create**

### 2.2 Upload the Next.js App

**Option A: via Git (recommended if SSH access available)**

In hPanel, go to **SSH Access → Enable SSH**, then connect:
```bash
ssh u123456789@foundoors.com -p 65002
```

Clone and build:
```bash
cd ~/public_html
git clone https://github.com/gauravgaafil/foundoors.git nextjs
cd nextjs
npm install
```

Create environment file:
```bash
cp .env.local.example .env.local
nano .env.local
```

Fill in:
```
WORDPRESS_API_URL=https://api.foundoors.com/graphql
WORDPRESS_IMAGE_HOSTNAME=api.foundoors.com
NEXT_PUBLIC_SITE_URL=https://foundoors.com
NEXT_PUBLIC_SITE_NAME=Foundoors
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
REVALIDATE_SECRET=your-strong-random-secret-here
```

Build:
```bash
npm run build
```

**Option B: via File Manager + hPanel**

1. Build locally on your computer: `npm run build`
2. The build output is in `.next/standalone/`
3. Zip the `.next/standalone/` folder contents
4. Upload via hPanel File Manager to `public_html/nextjs/`
5. Also upload `.env.local` with your production values

### 2.3 Create the startup file

The Node.js app in hPanel needs a `server.js` entry point.

In hPanel File Manager, create `public_html/nextjs/server.js`:
```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

### 2.4 Set Application Startup File in hPanel

In hPanel → Node.js:
- **Startup file:** `server.js`
- **Application mode:** Production
- Click **Restart**

### 2.5 Configure Environment Variables in hPanel

In hPanel → Node.js → **Environment Variables**, add:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `WORDPRESS_API_URL` | `https://api.foundoors.com/graphql` |
| `WORDPRESS_IMAGE_HOSTNAME` | `api.foundoors.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://foundoors.com` |
| `NEXT_PUBLIC_SITE_NAME` | `Foundoors` |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` |
| `REVALIDATE_SECRET` | `your-strong-random-secret` |

### 2.6 Point Your Domain

In hPanel → Domains → foundoors.com → DNS Zone:

| Type | Name | Value |
|---|---|---|
| A | @ | Hostinger's shared hosting IP (shown in hPanel) |
| CNAME | www | foundoors.com |
| A | api | Hostinger's shared hosting IP |

---

## Part 3: Verification Checklist

After setup, verify each endpoint:

```
https://foundoors.com/                    → Homepage loads
https://foundoors.com/sitemap.xml         → XML sitemap
https://foundoors.com/news-sitemap        → Google News sitemap
https://foundoors.com/feed.xml            → RSS feed
https://foundoors.com/feed.json           → JSON feed
https://foundoors.com/robots.txt          → Robots.txt
https://foundoors.com/api/search?q=ai     → Search returns JSON
https://api.foundoors.com/graphql         → GraphQL endpoint
```

---

## Troubleshooting

**Node.js app won't start:**
- Check hPanel → Node.js → Error logs
- Make sure `npm run build` completed without errors
- Verify `server.js` exists in the app root

**Images not loading:**
- Add your Hostinger server's hostname to `WORDPRESS_IMAGE_HOSTNAME`
- Check `next.config.ts` `remotePatterns` includes the domain

**GraphQL returns 404:**
- Confirm WPGraphQL plugin is active in WordPress
- Check WordPress permalinks are set to Post Name
- Test: `https://api.foundoors.com/graphql?query={generalSettings{title}}`

**API routes return 500:**
- Check `.env.local` or hPanel env vars are set correctly
- View Next.js logs in hPanel → Node.js → Logs

---

## Updating the App

When you push code changes:

```bash
# Via SSH
cd ~/public_html/nextjs
git pull origin main
npm install
npm run build

# Restart via hPanel → Node.js → Restart
# OR via SSH if PM2 is available:
# pm2 reload foundoors
```

Or trigger a restart from hPanel → Node.js → **Restart Application**.
