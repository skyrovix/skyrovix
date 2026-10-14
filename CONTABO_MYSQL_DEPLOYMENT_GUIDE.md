# Skyrovix — Contabo VPS Deployment & MySQL Migration Guide

This guide walks you step-by-step through deploying Skyrovix on your **Contabo VPS** using **MySQL 8.0** and **PM2**, completely removing any dependency on external Supabase Cloud.

---

## Architecture Overview

```
                      Internet / Browser
                              │
                      [ Nginx Port 80/443 ]
                   (SSL via Let's Encrypt)
                              │
                    Reverse Proxy (HTTP)
                              │
                    [ Node.js / PM2 :3000 ]
                    Skyrovix TanStack Start
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
     [ MySQL 8.0 Server ]               [ Local File Storage ]
      Database: `skyrovix`               `/public/uploads/`
```

- **Database**: Local MySQL 8.0 instance running on `127.0.0.1:3306`.
- **Authentication**: Native JWT + `bcryptjs` password hashing (supports admin recovery fallback).
- **File Storage**: Local filesystem disk storage (`/var/www/skyrovix/public/uploads`).
- **Server Engine**: Node.js 20+ managed by PM2 with auto-restart on boot.
- **Web Server**: Nginx with SSL reverse proxy.

---

## Method 1: Automated 1-Click Setup (Recommended)

Log in to your Contabo VPS via SSH as root and run:

```bash
# 1. Clone your repository or transfer files to the VPS
git clone https://github.com/skyrovix/skyrovix.git /var/www/skyrovix
cd /var/www/skyrovix

# 2. Make the setup script executable and run it
chmod +x setup-contabo.sh
sudo ./setup-contabo.sh
```

The script will automatically:
1. Install Node.js 20 LTS, MySQL Server, Nginx, PM2, and Certbot.
2. Create the `skyrovix` database and user with secure permissions.
3. Import the complete MySQL schema and seed data from `mysql_schema.sql`.
4. Install npm dependencies and build the production bundle (`npm run build`).
5. Configure PM2 to start on system boot.
6. Configure Nginx with reverse proxy caching and firewall settings.

---

## Method 2: Manual Step-by-Step Setup

If you prefer to configure your Contabo VPS manually, follow these steps:

### Step 1: Install System Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential nginx ufw certbot python3-certbot-nginx

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### Step 2: Install & Configure MySQL
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Create Skyrovix Database and User
sudo mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS skyrovix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'skyrovix_user'@'localhost' IDENTIFIED BY 'SkyrovixSecure@2026#Db';
CREATE USER IF NOT EXISTS 'skyrovix_user'@'127.0.0.1' IDENTIFIED BY 'SkyrovixSecure@2026#Db';
GRANT ALL PRIVILEGES ON skyrovix.* TO 'skyrovix_user'@'localhost';
GRANT ALL PRIVILEGES ON skyrovix.* TO 'skyrovix_user'@'127.0.0.1';
FLUSH PRIVILEGES;
EOF
```

### Step 3: Import the MySQL Schema
```bash
cd /var/www/skyrovix
mysql -u skyrovix_user -p'SkyrovixSecure@2026#Db' skyrovix < mysql_schema.sql
```

### Step 4: Configure Production `.env`
Create `/var/www/skyrovix/.env`:
```ini
# MySQL Database Configuration
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=skyrovix_user
MYSQL_PASSWORD=SkyrovixSecure@2026#Db
MYSQL_DATABASE=skyrovix
JWT_SECRET=your_super_strong_random_jwt_secret_key_2026

# App URL
VITE_APP_URL=https://skyrovix.in
NODE_ENV=production
PORT=3000

# Nodemailer / Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=skyrovix@gmail.com
SMTP_PASS=mwxf nxkg bhoo kzac
SMTP_FROM=Skyrovix <skyrovix@gmail.com>
GMAIL_USER=skyrovix@gmail.com
GMAIL_APP_PASSWORD=mwxf nxkg bhoo kzac

# Cashfree PG
CASHFREE_ENVIRONMENT=PRODUCTION
CASHFREE_APP_ID=14394481c7c769b9f0a9c04eec38449341
CASHFREE_SECRET_KEY=cfsk_ma_prod_d3b45e16d8c0d277fc90ae6e333e90aa_eb101bb7
CASHFREE_API_VERSION=2023-08-01
CASHFREE_PROD_APP_ID=14394481c7c769b9f0a9c04eec38449341
CASHFREE_PROD_SECRET_KEY=cfsk_ma_prod_d3b45e16d8c0d277fc90ae6e333e90aa_eb101bb7
```

### Step 5: Install Dependencies & Build
```bash
cd /var/www/skyrovix
npm install
npm run build
```

### Step 6: Start with PM2
```bash
pm2 start node --name "skyrovix" -- .output/server/index.mjs
pm2 save
pm2 startup systemd
```

### Step 7: Configure Nginx & SSL
Create `/etc/nginx/sites-available/skyrovix`:
```nginx
server {
    listen 80;
    server_name skyrovix.in www.skyrovix.in skyrovix.online www.skyrovix.online;

    client_max_body_size 50M;

    # Local uploads cache
    location /uploads/ {
        alias /var/www/skyrovix/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy to Node.js / TanStack Start
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/skyrovix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

Obtain free SSL certificate via Certbot:
```bash
sudo certbot --nginx -d skyrovix.in -d www.skyrovix.in -d skyrovix.online -d www.skyrovix.online
```

---

## Default Admin Credentials

- **Email**: `hariharan@skyrovix.com`
- **Default Password**: `123harimahesh` (or your existing account password)
- **Role**: Automatically granted `admin` privileges in `user_roles` table.

---

## Helpful Operations & Maintenance Commands

| Action | Command |
| :--- | :--- |
| **Check PM2 App Status** | `pm2 status` |
| **View Realtime Logs** | `pm2 logs skyrovix` |
| **Restart Application** | `pm2 restart skyrovix` |
| **Open MySQL Terminal** | `mysql -u skyrovix_user -p skyrovix` |
| **Backup MySQL Database** | `mysqldump -u skyrovix_user -p skyrovix > backup_$(date +%F).sql` |
| **Check Nginx Status** | `sudo systemctl status nginx` |
