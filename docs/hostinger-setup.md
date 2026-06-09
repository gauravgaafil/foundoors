# Hostinger Setup Guide — Full Stack (WordPress + Next.js)

This guide covers running both WordPress and the Next.js frontend on Hostinger VPS.

## Recommended Plan

**Hostinger KVM 2** or higher:
- 2 vCPU, 8GB RAM, 100GB NVMe SSD
- Ubuntu 22.04 LTS
- Sufficient for 100k+ monthly visitors

---

## 1. Initial Server Setup

SSH into your VPS:
```bash
ssh root@YOUR_SERVER_IP
```

Update the system:
```bash
apt update && apt upgrade -y
apt install -y curl git unzip software-properties-common ufw fail2ban
```

Create a non-root user:
```bash
adduser foundoors
usermod -aG sudo foundoors
su - foundoors
```

Configure UFW firewall:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 2. Install Node.js (for Next.js)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should be 20.x
npm -v
```

Install PM2 (process manager for Next.js):
```bash
sudo npm install -g pm2
```

---

## 3. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 4. Install PHP + MySQL (for WordPress)

```bash
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-curl \
  php8.2-gd php8.2-mbstring php8.2-xml php8.2-zip php8.2-intl \
  php8.2-imagick mariadb-server mariadb-client

sudo systemctl enable php8.2-fpm mariadb
sudo systemctl start php8.2-fpm mariadb
```

Secure MariaDB:
```bash
sudo mysql_secure_installation
```

---

## 5. Create WordPress Database

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE foundoors_wp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wp_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON foundoors_wp.* TO 'wp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 6. Install WordPress

```bash
cd /var/www
sudo mkdir wordpress
sudo chown -R $USER:$USER /var/www/wordpress
cd /var/www/wordpress

wget https://wordpress.org/latest.tar.gz
tar xzf latest.tar.gz --strip-components=1
rm latest.tar.gz

cp wp-config-sample.php wp-config.php
nano wp-config.php
```

Update in `wp-config.php`:
```php
define( 'DB_NAME', 'foundoors_wp' );
define( 'DB_USER', 'wp_user' );
define( 'DB_PASSWORD', 'STRONG_PASSWORD_HERE' );
define( 'DB_HOST', 'localhost' );

// Security keys — get from https://api.wordpress.org/secret-key/1.1/salt/
// Paste the generated keys here

// ISR revalidation secret
define('REVALIDATE_SECRET', 'your-strong-random-secret');
```

Set permissions:
```bash
sudo chown -R www-data:www-data /var/www/wordpress
sudo find /var/www/wordpress -type d -exec chmod 755 {} \;
sudo find /var/www/wordpress -type f -exec chmod 644 {} \;
```

---

## 7. Install SSL with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx

# Get certs for both domains
sudo certbot --nginx -d api.foundoors.com -d foundoors.com -d www.foundoors.com
```

Set up auto-renewal:
```bash
sudo systemctl enable certbot.timer
```

---

## 8. Nginx Configuration — WordPress (api.foundoors.com)

```bash
sudo nano /etc/nginx/sites-available/wordpress
```

```nginx
server {
    listen 80;
    server_name api.foundoors.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.foundoors.com;

    ssl_certificate     /etc/letsencrypt/live/api.foundoors.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.foundoors.com/privkey.pem;

    root /var/www/wordpress;
    index index.php;

    # WordPress GraphQL endpoint — no cache
    location /graphql {
        try_files $uri $uri/ /index.php?$args;
        add_header Cache-Control "no-store, no-cache" always;
    }

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|webp|avif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~ /\. { deny all; }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/wordpress /etc/nginx/sites-enabled/
```

---

## 9. Deploy Next.js Frontend

```bash
# Clone the repo
cd /var/www
git clone https://github.com/gauravgaafil/foundoors.git nextjs
cd nextjs

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
nano .env.local
```

Fill in `.env.local`:
```
WORDPRESS_API_URL=https://api.foundoors.com/graphql
WORDPRESS_IMAGE_HOSTNAME=api.foundoors.com
NEXT_PUBLIC_SITE_URL=https://foundoors.com
NEXT_PUBLIC_SITE_NAME=Foundoors
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
REVALIDATE_SECRET=your-strong-random-secret
```

Build the app:
```bash
npm run build
```

Start with PM2:
```bash
pm2 start npm --name "foundoors" -- start
pm2 save
pm2 startup   # follow the printed command to enable on boot
```

Verify it's running:
```bash
pm2 status
# Should show "foundoors" as "online"
```

---

## 10. Nginx Configuration — Next.js (foundoors.com)

```bash
sudo nano /etc/nginx/sites-available/nextjs
```

```nginx
upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name foundoors.com www.foundoors.com;
    return 301 https://foundoors.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.foundoors.com;
    return 301 https://foundoors.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name foundoors.com;

    ssl_certificate     /etc/letsencrypt/live/foundoors.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/foundoors.com/privkey.pem;
    ssl_session_cache   shared:SSL:10m;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Next.js static files — long cache
    location /_next/static/ {
        proxy_pass http://nextjs_upstream;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Next.js image optimization
    location /_next/image {
        proxy_pass http://nextjs_upstream;
        add_header Cache-Control "public, max-age=86400";
    }

    # Feeds & sitemaps — short cache
    location ~ ^/(feed\.xml|feed\.json|sitemap\.xml|news-sitemap|robots\.txt) {
        proxy_pass http://nextjs_upstream;
        add_header Cache-Control "public, max-age=3600";
    }

    # Main proxy
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/nextjs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 11. DNS Configuration

In your domain registrar (or Hostinger DNS panel), point:

| Record | Name | Value |
|---|---|---|
| A | @ | YOUR_VPS_IP |
| A | www | YOUR_VPS_IP |
| A | api | YOUR_VPS_IP |
| CNAME | www | foundoors.com |

---

## 12. Deployment Script (for updates)

```bash
nano /var/www/nextjs/deploy.sh
```

```bash
#!/bin/bash
set -e

cd /var/www/nextjs

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
npm ci --production=false

echo "Building..."
npm run build

echo "Restarting PM2..."
pm2 reload foundoors --update-env

echo "Deploy complete."
```

```bash
chmod +x /var/www/nextjs/deploy.sh
```

Run a deploy:
```bash
./deploy.sh
```

---

## 13. Monitoring

```bash
# View Next.js logs
pm2 logs foundoors

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Server resource usage
htop
```

Install PM2 monitoring dashboard (optional):
```bash
pm2 install pm2-logrotate
```
