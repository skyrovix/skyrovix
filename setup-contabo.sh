#!/usr/bin/env bash
# ==========================================================
# SKYROVIX LMS — CONTABO VPS AUTOMATED SETUP & DEPLOYMENT SCRIPT
# OS: Ubuntu 22.04 LTS / 24.04 LTS or Debian 11/12
# Run as root or with sudo:
# chmod +x setup-contabo.sh
# sudo ./setup-contabo.sh
# ==========================================================

set -e

echo "=========================================================="
echo "      🚀 SKYROVIX Contabo VPS Deployment & MySQL Setup    "
echo "=========================================================="

DB_NAME="skyrovix"
DB_USER="skyrovix_user"
DB_PASS="SkyrovixSecure@2026#Db"
APP_DIR="/var/www/skyrovix"
DOMAIN="skyrovix.in"

# 1. Update system packages
echo "📦 Updating system packages..."
apt-get update -y
apt-get upgrade -y
apt-get install -y curl wget git build-essential nginx ufw certbot python3-certbot-nginx

# 2. Install Node.js 20.x LTS
echo "🟢 Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 3. Install PM2 globally
echo "⚙️ Installing PM2 process manager..."
npm install -g pm2

# 4. Install & Configure MySQL Server
echo "🐬 Installing MySQL Server..."
apt-get install -y mysql-server

systemctl start mysql
systemctl enable mysql

echo "🔧 Configuring MySQL database '${DB_NAME}' and user '${DB_USER}'..."
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'127.0.0.1';
FLUSH PRIVILEGES;
EOF

# 5. Import MySQL Schema
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "${SCRIPT_DIR}/mysql_schema.sql" ]; then
  echo "📥 Importing mysql_schema.sql into ${DB_NAME}..."
  mysql -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" < "${SCRIPT_DIR}/mysql_schema.sql"
  echo "✅ MySQL schema imported successfully!"
fi

# 6. Setup Project Directory
echo "📁 Setting up project in ${APP_DIR}..."
mkdir -p "${APP_DIR}"
mkdir -p "${APP_DIR}/public/uploads"
chmod -R 775 "${APP_DIR}/public/uploads"

if [ "${SCRIPT_DIR}" != "${APP_DIR}" ]; then
  echo "Copying files to ${APP_DIR}..."
  cp -r "${SCRIPT_DIR}/." "${APP_DIR}/"
fi

cd "${APP_DIR}"

# 7. Write Production .env
echo "🔐 Writing production environment variables..."
cat > "${APP_DIR}/.env.production" <<EOF
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=${DB_USER}
MYSQL_PASSWORD=${DB_PASS}
MYSQL_DATABASE=${DB_NAME}
JWT_SECRET=skyrovix_production_jwt_contabo_key_2026_$(openssl rand -hex 16)

VITE_APP_URL=https://${DOMAIN}
NODE_ENV=production
PORT=3000

# Nodemailer / SMTP
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
EOF

cp "${APP_DIR}/.env.production" "${APP_DIR}/.env"

# 8. Install NPM Dependencies & Build Bundle
echo "📦 Installing project dependencies..."
npm install --production=false

echo "🏗️ Building Skyrovix for production..."
npm run build

# 9. Configure PM2
echo "🚀 Starting Skyrovix via PM2..."
pm2 delete skyrovix 2>/dev/null || true
pm2 start node --name "skyrovix" -- .output/server/index.mjs
pm2 save
pm2 startup systemd -u root --hp /root

# 10. Configure Nginx Reverse Proxy
echo "🌐 Configuring Nginx reverse proxy..."
cat > /etc/nginx/sites-available/skyrovix <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN} skyrovix.online www.skyrovix.online;

    client_max_body_size 50M;

    # Static uploads caching
    location /uploads/ {
        alias ${APP_DIR}/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy to Node.js application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/skyrovix /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

# 11. Firewall
echo "🛡️ Configuring UFW firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=========================================================="
echo "🎉 SUCCESS! Skyrovix is now running on MySQL on your Contabo VPS!"
echo "🌐 URL: http://${DOMAIN}"
echo "📊 Database: MySQL (${DB_NAME})"
echo "🚀 PM2 Status: Run 'pm2 status' or 'pm2 logs skyrovix'"
echo "🔒 To enable Free SSL Certificate, run:"
echo "   sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "=========================================================="
