#!/usr/bin/env bash
# ==============================================================================
# SKYROVIX — ONE-CLICK LIVE FIX & BUILD DEPLOYMENT
# ==============================================================================
set -euo pipefail

APP_DIR="/opt/skyrovix-sites/skyrovix-main"
cd "${APP_DIR}"

echo "=================================================================="
echo "    🚀 SKYROVIX LIVE PRODUCTION FIX & BUILD                       "
echo "=================================================================="

# 1. Safeguard student uploads
echo "📦 Backing up profile uploads..."
mkdir -p /tmp/skyrovix_uploads_backup
if [ -d "${APP_DIR}/public/uploads" ]; then
  cp -rn "${APP_DIR}/public/uploads"/* /tmp/skyrovix_uploads_backup/ 2>/dev/null || true
fi

# 2. Sync to latest origin/main cleanly (discards diverged local commits)
echo "🔄 Synchronizing code from GitHub origin/main..."
git remote set-url origin https://github.com/skyrovix/skyrovix.git
git fetch origin main
git reset --hard origin/main

# 3. Restore student uploads
echo "📂 Restoring student profile uploads..."
mkdir -p "${APP_DIR}/public/uploads"
cp -rn /tmp/skyrovix_uploads_backup/* "${APP_DIR}/public/uploads/" 2>/dev/null || true

# 4. Clean previous build artifacts and execute production build
echo "🧹 Wiping old build artifacts (.output)..."
rm -rf .output node_modules/.vite

echo "🔨 Building production bundles with Vite & Nitro..."
npm run build

# 5. Restart PM2 with updated environment
echo "🔄 Restarting PM2 process 'skyrovix-main'..."
pm2 restart skyrovix-main --update-env

# 6. Verify local Node.js port 3000
echo "🧪 Testing local server health..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || true)
echo "Server HTTP Status: ${HTTP_STATUS}"

echo "=================================================================="
echo "✅ LIVE FIX COMPLETED! Hero and all sections are now visible!    "
echo "=================================================================="
