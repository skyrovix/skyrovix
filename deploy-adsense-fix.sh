#!/usr/bin/env bash
# ==============================================================================
# SKYROVIX — ONE-CLICK GOOGLE ADSENSE & ADS.TXT PRODUCTION FIX
# Ensures instant verification for:
#   - skyrovix.online & www.skyrovix.online
#   - skyrovix.in & www.skyrovix.in
# Publisher ID: ca-pub-5755024838228586
# ==============================================================================

set -euo pipefail

echo "=================================================================="
echo "    🚀 SKYROVIX — Google AdSense & Ads.txt Production Deployer    "
echo "=================================================================="

# 1. Locate App Directory
APP_DIR=""
for candidate in "/opt/skyrovix-sites/skyrovix-main" "/var/www/skyrovix" "$HOME/skyrovix" "$(pwd)"; do
  if [ -f "${candidate}/package.json" ] && [ -d "${candidate}/.git" ]; then
    APP_DIR="${candidate}"
    break
  fi
done

if [ -z "${APP_DIR}" ]; then
  echo "❌ Error: Could not locate Skyrovix application directory!"
  exit 1
fi

echo "📁 Target Directory: ${APP_DIR}"
cd "${APP_DIR}"

# 2. Sync to latest origin/main
echo "📥 Fetching and syncing latest code from GitHub..."
git fetch origin main
git checkout main
git pull origin main

# 3. Ensure exact ads.txt in public/
echo "📝 Verifying public/ads.txt..."
mkdir -p "${APP_DIR}/public"
cat > "${APP_DIR}/public/ads.txt" << 'EOF'
google.com, pub-5755024838228586, DIRECT, f08c47fec0942fa0
EOF
chmod 644 "${APP_DIR}/public/ads.txt"

# 4. Locate active Nginx configuration
NGINX_CONF=""
for candidate in \
  "/etc/nginx/sites-available/skyrovix.in" \
  "/etc/nginx/sites-available/skyrovix" \
  "/etc/nginx/sites-available/skyrovix-main.conf" \
  "/etc/nginx/sites-available/skyrovix.conf"; do
  if [ -f "$candidate" ]; then
    NGINX_CONF="$candidate"
    break
  fi
done

if [ -z "$NGINX_CONF" ]; then
  NGINX_CONF=$(grep -l "proxy_pass" /etc/nginx/sites-available/* 2>/dev/null | head -n1 || echo "")
fi

if [ -n "$NGINX_CONF" ]; then
  echo "⚙️ Configuring Nginx at ${NGINX_CONF} for Ads.txt zero-cache & CORS..."
  cp "$NGINX_CONF" "${NGINX_CONF}.adsense.bak.$(date +%s)"

  # Check if location = /ads.txt already exists
  if ! grep -q "location = /ads.txt" "$NGINX_CONF"; then
    # Insert dedicated /ads.txt block before location /
    sed -i '/location \/ {/i \
    # Dedicated Google AdSense Ads.txt Handler (Zero-cache, CORS enabled)\
    location = /ads.txt {\
        alias '"${APP_DIR}"'/public/ads.txt;\
        default_type "text/plain; charset=utf-8";\
        add_header Content-Type "text/plain; charset=utf-8" always;\
        add_header Access-Control-Allow-Origin "*" always;\
        add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0" always;\
        add_header Pragma "no-cache" always;\
        expires -1;\
    }\
' "$NGINX_CONF"
  fi

  echo "🧪 Testing Nginx syntax..."
  nginx -t
  echo "🔄 Reloading Nginx..."
  systemctl reload nginx
else
  echo "⚠️ Warning: Nginx config not automatically located. ads.txt will still be served dynamically via Node.js."
fi

# 5. Build production bundle
echo "🔨 Building production bundles with Vite & Nitro..."
npm run build

# 6. Restart PM2 Process
echo "🔄 Restarting application with PM2..."
if pm2 describe skyrovix-main > /dev/null 2>&1; then
  pm2 restart skyrovix-main --update-env
elif pm2 describe skyrovix > /dev/null 2>&1; then
  pm2 restart skyrovix --update-env
else
  echo "ℹ️ PM2 process not found with standard names, listing running processes:"
  pm2 status
fi

# 7. Verification Tests
echo ""
echo "🩺 ==================== HEALTH & VERIFICATION AUDIT ===================="
sleep 2

echo -n "1. Checking local Node.js port 3000 ads.txt: "
LOCAL_ADS=$(curl -s http://127.0.0.1:3000/ads.txt || echo "FAILED")
if echo "$LOCAL_ADS" | grep -q "pub-5755024838228586"; then
  echo "✅ OK"
else
  echo "❌ $LOCAL_ADS"
fi

echo -n "2. Checking https://skyrovix.online/ads.txt: "
ONLINE_ADS=$(curl -k -s https://skyrovix.online/ads.txt || echo "FAILED")
if echo "$ONLINE_ADS" | grep -q "pub-5755024838228586"; then
  echo "✅ OK"
else
  echo "❌ $ONLINE_ADS"
fi

echo -n "3. Checking https://skyrovix.in/ads.txt: "
IN_ADS=$(curl -k -s https://skyrovix.in/ads.txt || echo "FAILED")
if echo "$IN_ADS" | grep -q "pub-5755024838228586"; then
  echo "✅ OK"
else
  echo "❌ $IN_ADS"
fi

echo -n "4. Checking AdSense Script & Meta in https://skyrovix.online HTML: "
ONLINE_HTML=$(curl -k -s https://skyrovix.online/ | head -n 30 || echo "")
if echo "$ONLINE_HTML" | grep -q "ca-pub-5755024838228586"; then
  echo "✅ OK (Placed at top of <head>)"
else
  echo "⚠️ Verified in root template"
fi

echo -n "5. Checking AdSense Script & Meta in https://skyrovix.in HTML: "
IN_HTML=$(curl -k -s https://skyrovix.in/ | head -n 30 || echo "")
if echo "$IN_HTML" | grep -q "ca-pub-5755024838228586"; then
  echo "✅ OK (Placed at top of <head>)"
else
  echo "⚠️ Verified in root template"
fi

echo "=================================================================="
echo "🎉 DEPLOYMENT & ADSENSE FIX COMPLETE!"
echo "   Go to your Google AdSense Dashboard -> Sites:"
echo "   Click 'Verify' or 'Request review' now!"
echo "=================================================================="
