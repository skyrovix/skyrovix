#!/usr/bin/env bash
# ==============================================================================
# SKYROVIX — SAFE ISOLATED CONTABO VPS DEPLOYMENT SCRIPT
# Target Directory: /opt/skyrovix-sites/skyrovix-main
# Target Domain:    skyrovix.in (www.skyrovix.in)
# Dedicated Port:   3005
# Dedicated DB:     skyrovix_main_db
# Dedicated User:   skyrovix_main_user
#
# CRITICAL SAFETY DIRECTIVES:
# 1. DOES NOT touch, stop, or delete existing Docker containers.
# 2. DOES NOT delete or overwrite existing Nginx configs or default sites.
# 3. DOES NOT touch or interfere with fullstack-intern.skyrovix.in.
# 4. Uses an isolated database, isolated user, isolated port, and isolated PM2 process.
# ==============================================================================

set -euo pipefail

echo "=================================================================="
echo "    🛡️ SKYROVIX Safe Isolated Contabo VPS Deployment (MySQL 8.0)  "
echo "=================================================================="

# Configuration
APP_DIR="/opt/skyrovix-sites/skyrovix-main"
DB_NAME="skyrovix_main_db"
DB_USER="skyrovix_main_user"
DB_PASS="SkyrovixMain@2026#SecureDb"
APP_PORT=3005
DOMAIN="skyrovix.in"
PM2_NAME="skyrovix-main"

# 1. Pre-flight Safety Checks
echo "🔍 Performing pre-flight port and process checks..."

# Check if port 3005 is already in use
if ss -tulpn 2>/dev/null | grep -q ":${APP_PORT} "; then
  echo "⚠️ Port ${APP_PORT} is already in use! Searching for next available port..."
  for p in 3006 3007 3008 3009 3010; do
    if ! ss -tulpn 2>/dev/null | grep -q ":${p} "; then
      APP_PORT=$p
      echo "✅ Selected alternative free port: ${APP_PORT}"
      break
    fi
  done
else
  echo "✅ Port ${APP_PORT} is free."
fi

# 2. Ensure prerequisites are installed (without affecting existing services)
echo "📦 Verifying system packages..."
apt-get update -y
apt-get install -y curl wget git build-essential nginx certbot python3-certbot-nginx

# Node.js check (install only if not present)
if ! command -v node &> /dev/null; then
  echo "🟢 Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node: $(node -v) | NPM: $(npm -v)"

# PM2 check
if ! command -v pm2 &> /dev/null; then
  echo "⚙️ Installing PM2..."
  npm install -g pm2
fi

# 3. Setup Dedicated MySQL Database & User
echo "🐬 Setting up dedicated isolated database '${DB_NAME}'..."
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
FLUSH PRIVILEGES;
EOF

# 4. Clone or Update Application in Isolated Directory
echo "📁 Setting up application directory in ${APP_DIR}..."
mkdir -p "/opt/skyrovix-sites"
if [ ! -d "${APP_DIR}/.git" ]; then
  git clone https://github.com/skyrovix/skyrovix.git "${APP_DIR}"
else
  echo "Updating existing repository in ${APP_DIR}..."
  cd "${APP_DIR}"
  git fetch origin
  git checkout main
  git pull origin main
fi

cd "${APP_DIR}"

# 5. Import MySQL Schema into Dedicated Database
if [ -f "${APP_DIR}/mysql_schema.sql" ]; then
  echo "📥 Importing schema into dedicated database '${DB_NAME}'..."
  mysql -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" < "${APP_DIR}/mysql_schema.sql"
  echo "✅ Database schema verified."
fi

# 6. Ensure Local Uploads Directory Exists
mkdir -p "${APP_DIR}/public/uploads/profile-photos"
mkdir -p "${APP_DIR}/public/uploads/payment-screenshots"
mkdir -p "${APP_DIR}/public/uploads/project-submissions"
mkdir -p "${APP_DIR}/public/uploads/task-submissions"
chmod -R 775 "${APP_DIR}/public/uploads"

# 7. Configure Isolated .env File
echo "🔐 Writing isolated environment configuration..."
JWT_KEY=$(openssl rand -hex 32)
cat > "${APP_DIR}/.env.production" <<EOF
PORT=${APP_PORT}
NODE_ENV=production
VITE_APP_URL=https://${DOMAIN}

# Dedicated MySQL Connection
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=${DB_NAME}
MYSQL_USER=${DB_USER}
MYSQL_PASSWORD=${DB_PASS}

# JWT Secret
JWT_SECRET=${JWT_KEY}

# Transactional Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=skyrovix@gmail.com
SMTP_PASS=mwxf nxkg bhoo kzac
SMTP_FROM=Skyrovix <skyrovix@gmail.com>
GMAIL_USER=skyrovix@gmail.com
GMAIL_APP_PASSWORD=mwxf nxkg bhoo kzac

# Cashfree PG
CASHFREE_ENVIRONMENT=PRODUCTION
CASHFREE_API_VERSION=2023-08-01
CASHFREE_APP_ID=14394481c7c769b9f0a9c04eec38449341
CASHFREE_SECRET_KEY=cfsk_ma_prod_d3b45e16d8c0d277fc90ae6e333e90aa_eb101bb7
CASHFREE_PROD_APP_ID=14394481c7c769b9f0a9c04eec38449341
CASHFREE_PROD_SECRET_KEY=cfsk_ma_prod_d3b45e16d8c0d277fc90ae6e333e90aa_eb101bb7
EOF

cp "${APP_DIR}/.env.production" "${APP_DIR}/.env"

# 8. Install & Build
echo "🏗️ Installing dependencies and compiling application..."
npm install --production=false

echo "📥 Restoring student backups, applications, tasks, and admin credentials..."
node scripts/restore-csv-backups.mjs

npm run build

# 9. Start / Restart PM2 Dedicated Process
echo "🚀 Managing PM2 process '${PM2_NAME}' on port ${APP_PORT}..."
pm2 delete "${PM2_NAME}" 2>/dev/null || true
PORT=${APP_PORT} pm2 start node --name "${PM2_NAME}" -- .output/server/index.mjs
pm2 save

# 10. Configure Isolated Nginx Server Block
# NOTE: We DO NOT touch /etc/nginx/sites-enabled/default or fullstack-intern!
echo "🌐 Writing dedicated Nginx configuration for ${DOMAIN}..."
cat > /etc/nginx/sites-available/skyrovix-main.conf <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    client_max_body_size 50M;

    # Local uploads cache
    location /uploads/ {
        alias ${APP_DIR}/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy to isolated Node app port
    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
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

ln -sf /etc/nginx/sites-available/skyrovix-main.conf /etc/nginx/sites-enabled/

# Test Nginx before reloading to ensure NO other site is broken
echo "🧪 Testing Nginx configuration..."
nginx -t

echo "🔄 Reloading Nginx safely..."
systemctl reload nginx

# 11. Health Check
echo "🩺 Verifying local application response on http://127.0.0.1:${APP_PORT}..."
sleep 3
if curl -s -f "http://127.0.0.1:${APP_PORT}" > /dev/null; then
  echo "✅ Local health check PASSED! Skyrovix is responding on port ${APP_PORT}."
else
  echo "⚠️ Warning: Local health check returned non-200. Check logs with 'pm2 logs ${PM2_NAME}'."
fi

echo "=================================================================="
echo "🎉 SUCCESS: Skyrovix is deployed in isolated mode!"
echo "📍 Location: ${APP_DIR}"
echo "🔌 Port: ${APP_PORT} (PM2: ${PM2_NAME})"
echo "📊 Database: ${DB_NAME} (User: ${DB_USER})"
echo "🌐 Nginx: /etc/nginx/sites-available/skyrovix-main.conf"
echo ""
echo "👉 NEXT STEPS FOR DNS & SSL:"
echo "1. Verify DNS: In your DNS registrar, point 'skyrovix.in' (A record) to this VPS IP."
echo "2. Once DNS resolves to this VPS, enable SSL with:"
echo "   sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "=================================================================="
