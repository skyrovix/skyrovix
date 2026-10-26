#!/usr/bin/env bash
# ==============================================================================
# SKYROVIX — FIX NGINX ROUTING FOR skyrovix.online & skyrovix.in
# Resolves: "Welcome to nginx!" placeholder by pointing both domains
# to the live Node.js application process instead of /var/www/html.
# ==============================================================================

set -euo pipefail

echo "=================================================================="
echo "    🚀 SKYROVIX Nginx Multi-Domain Route Linker                 "
echo "=================================================================="

# 1. Disable the default Ubuntu placeholder site
echo "🛑 Disabling default Ubuntu 'Welcome to nginx' placeholder site..."
rm -f /etc/nginx/sites-enabled/default

# 2. Locate the real Skyrovix proxy config
PROXY_CONF=""
for candidate in \
  "/etc/nginx/sites-available/skyrovix.in" \
  "/etc/nginx/sites-available/skyrovix-main.conf" \
  "/etc/nginx/sites-available/skyrovix.conf" \
  "/etc/nginx/sites-available/skyrovix"; do
  if [ -f "$candidate" ]; then
    PROXY_CONF="$candidate"
    break
  fi
done

if [ -z "$PROXY_CONF" ]; then
  # Find any file in sites-available that contains proxy_pass
  PROXY_CONF=$(grep -l "proxy_pass" /etc/nginx/sites-available/* 2>/dev/null | head -n1 || echo "")
fi

if [ -z "$PROXY_CONF" ]; then
  echo "❌ Error: Could not locate existing Skyrovix proxy configuration!"
  exit 1
fi

echo "📁 Located active proxy config: ${PROXY_CONF}"
cp "$PROXY_CONF" "${PROXY_CONF}.bak.$(date +%s)"

# 3. Add skyrovix.online and www.skyrovix.online to server_name in the proxy config
echo "⚙️ Adding skyrovix.online and www.skyrovix.online to ${PROXY_CONF}..."
if ! grep -q "skyrovix\.online" "$PROXY_CONF"; then
  # Append to all server_name lines that mention skyrovix.in
  sed -i '/server_name.*skyrovix\.in/ s/;/ skyrovix.online www.skyrovix.online;/' "$PROXY_CONF"
fi

# Ensure it is symlinked in sites-enabled
BASENAME=$(basename "$PROXY_CONF")
ln -sf "$PROXY_CONF" "/etc/nginx/sites-enabled/${BASENAME}"

# 4. Test Nginx Configuration Syntax
echo "🧪 Testing Nginx configuration..."
nginx -t

# 5. Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# 6. Reinstall / Expand Certbot SSL to map all 4 domains to the proxy config
echo "🔒 Reinstalling SSL certificates to proxy config for all domains..."
certbot --nginx \
  -d skyrovix.in \
  -d www.skyrovix.in \
  -d skyrovix.online \
  -d www.skyrovix.online \
  --reinstall \
  --expand \
  --non-interactive \
  --agree-tos \
  -m hariharan@skyrovix.com \
  --redirect || {
    echo "ℹ️ Reinstall skipped, reloading Nginx with existing unified certificate..."
    systemctl reload nginx
}

# 7. Final Verification
echo "🩺 Testing HTTPS responses for both domains..."
sleep 2

IN_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://skyrovix.in || echo "000")
ONLINE_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://skyrovix.online || echo "000")
WWW_ONLINE_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://www.skyrovix.online || echo "000")

echo "=================================================================="
echo "🎉 ROUTING UPDATE COMPLETE!"
echo "   https://skyrovix.in        HTTP Status: ${IN_STATUS}"
echo "   https://skyrovix.online    HTTP Status: ${ONLINE_STATUS}"
echo "   https://www.skyrovix.online HTTP Status: ${WWW_ONLINE_STATUS}"
echo "=================================================================="
