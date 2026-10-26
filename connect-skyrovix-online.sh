#!/usr/bin/env bash
# ==============================================================================
# SKYROVIX — CONNECT skyrovix.online TO CONTABO VPS
# Targets: skyrovix.online & www.skyrovix.online -> 75.119.129.201
# ==============================================================================

set -euo pipefail

echo "=================================================================="
echo "    🌐 SKYROVIX Domain Connector: skyrovix.online               "
echo "=================================================================="

VPS_IP="75.119.129.201"
NGINX_CONF="/etc/nginx/sites-available/skyrovix-main.conf"

if [ ! -f "${NGINX_CONF}" ]; then
  # Fallback to sites-available default or skyrovix
  for f in "/etc/nginx/sites-available/skyrovix.conf" "/etc/nginx/sites-available/default"; do
    if [ -f "$f" ]; then
      NGINX_CONF="$f"
      break
    fi
  done
fi

echo "📁 Using Nginx config: ${NGINX_CONF}"

# 1. Check DNS resolution for skyrovix.online
echo "🔍 Checking DNS A records for skyrovix.online..."
RESOLVED_IP=$(dig +short skyrovix.online 2>/dev/null | tail -n1 || getent hosts skyrovix.online | awk '{print $1}' || echo "")

if [ -n "${RESOLVED_IP}" ]; then
  echo "📡 skyrovix.online resolves to: ${RESOLVED_IP}"
  if [ "${RESOLVED_IP}" != "${VPS_IP}" ]; then
    echo "⚠️ Note: skyrovix.online IP (${RESOLVED_IP}) does not yet match VPS IP (${VPS_IP})."
    echo "👉 If you recently added the DNS record, please wait 2-5 minutes for DNS propagation."
  else
    echo "✅ DNS A record verified! Points directly to this VPS (${VPS_IP})."
  fi
else
  echo "ℹ️ DNS check skipped or pending propagation."
fi

# 2. Backup existing config
cp "${NGINX_CONF}" "${NGINX_CONF}.backup.$(date +%F_%T)"
echo "💾 Backup created: ${NGINX_CONF}.backup"

# 3. Add skyrovix.online to server_name if not already present
if grep -q "skyrovix\.online" "${NGINX_CONF}"; then
  echo "✅ skyrovix.online is already configured in ${NGINX_CONF}"
else
  echo "⚙️ Adding skyrovix.online and www.skyrovix.online to server_name..."
  sed -i 's/server_name \(.*skyrovix\.in.*\);/server_name \1 skyrovix.online www.skyrovix.online;/' "${NGINX_CONF}"
fi

# 4. Test Nginx Configuration
echo "🧪 Testing Nginx configuration syntax..."
nginx -t

# 5. Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# 6. Certbot SSL Certificate Generation
echo "🔒 Requesting SSL certificate for skyrovix.online via Certbot..."
certbot --nginx -d skyrovix.in -d www.skyrovix.in -d skyrovix.online -d www.skyrovix.online \
  --expand \
  --non-interactive \
  --agree-tos \
  -m hariharan@skyrovix.com \
  --redirect || {
    echo "⚠️ Certbot finished with warning. If DNS is still propagating, run this later:"
    echo "   sudo certbot --nginx -d skyrovix.online -d www.skyrovix.online"
}

echo "=================================================================="
echo "🎉 DOMAIN CONNECTION COMPLETE!"
echo "   Primary:   https://skyrovix.in"
echo "   Connected: https://skyrovix.online"
echo "=================================================================="
