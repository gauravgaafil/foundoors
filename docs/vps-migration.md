# VPS Migration Guide

This guide covers migrating from the initial Hostinger shared/managed setup to a different VPS provider (DigitalOcean, Hetzner, AWS EC2, etc.) without any code changes.

## What Stays the Same

The platform is designed for zero-code-change migrations:
- All environment-specific config lives in `.env.local` on the server
- WordPress URL is a runtime env var (`WORDPRESS_API_URL`)
- Site URL is a runtime env var (`NEXT_PUBLIC_SITE_URL`)
- No hardcoded IPs or hostnames in source code

## Migration Checklist

### Phase 1: Prepare New VPS

Follow the same setup as `hostinger-setup.md` steps 1–4 on the new server:
- Install Node.js 20, PM2, Nginx, PHP 8.2, MariaDB
- Configure UFW firewall
- Create non-root user

### Phase 2: Export WordPress

On the **old server**:

```bash
# Export WordPress database
mysqldump -u wp_user -p foundoors_wp > /tmp/wp_backup_$(date +%Y%m%d).sql

# Archive WordPress files (plugins, themes, uploads)
tar -czf /tmp/wp_files_$(date +%Y%m%d).tar.gz \
  /var/www/wordpress/wp-content/uploads \
  /var/www/wordpress/wp-content/plugins \
  /var/www/wordpress/wp-content/themes

# Copy to new server
scp /tmp/wp_backup_*.sql user@NEW_SERVER_IP:/tmp/
scp /tmp/wp_files_*.tar.gz user@NEW_SERVER_IP:/tmp/
```

### Phase 3: Import WordPress on New Server

On the **new server**:

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE foundoors_wp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER 'wp_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';"
mysql -u root -p -e "GRANT ALL ON foundoors_wp.* TO 'wp_user'@'localhost';"

# Import database
mysql -u wp_user -p foundoors_wp < /tmp/wp_backup_*.sql

# Extract files
cd /var/www/wordpress
tar -xzf /tmp/wp_files_*.tar.gz --strip-components=4
sudo chown -R www-data:www-data wp-content/
```

Update `wp-config.php` with new database credentials if different.

### Phase 4: Update WordPress Site URL (if domain stays same, skip)

If moving to a new domain temporarily:

```sql
mysql -u wp_user -p foundoors_wp
UPDATE wp_options SET option_value = 'https://new-domain.com' WHERE option_name = 'siteurl';
UPDATE wp_options SET option_value = 'https://new-domain.com' WHERE option_name = 'home';
```

Or use WP-CLI:
```bash
wp search-replace 'https://old-domain.com' 'https://new-domain.com' --all-tables
```

### Phase 5: Deploy Next.js Frontend

```bash
cd /var/www
git clone https://github.com/gauravgaafil/foundoors.git nextjs
cd nextjs
npm install
cp .env.local.example .env.local
# Edit .env.local with production values
nano .env.local
npm run build
pm2 start npm --name "foundoors" -- start
pm2 save && pm2 startup
```

### Phase 6: Configure Nginx

Copy the Nginx configs from `hostinger-setup.md` steps 8 and 10. Install SSL via Certbot.

### Phase 7: DNS Cutover (Zero Downtime)

1. Keep old server running
2. Lower DNS TTL to 60 seconds (24 hours before cutover)
3. Deploy and test on new server using `/etc/hosts` trick locally:
   ```
   NEW_IP foundoors.com api.foundoors.com
   ```
4. When satisfied, update DNS A records to `NEW_SERVER_IP`
5. Wait for TTL propagation (~1-5 minutes with 60s TTL)
6. Verify live site is serving from new server
7. Decommission old server

### Phase 8: Post-Migration Verification

```bash
# Check Next.js is running
curl -I https://foundoors.com

# Check WordPress GraphQL
curl -X POST https://api.foundoors.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ generalSettings { title } }"}'

# Check RSS feed
curl https://foundoors.com/feed.xml | head -20

# Check sitemap
curl https://foundoors.com/sitemap.xml | head -30
```

Run a Lighthouse audit after migration to confirm performance is unchanged.

## Rollback Plan

If the new server has issues:
1. Update DNS A records back to old server IP
2. Old server remains the live site within TTL minutes
3. No data loss — WordPress database on old server is unchanged
4. Diagnose and fix on new server before re-attempting cutover
