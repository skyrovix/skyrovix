# Skyrovix — Rollback & Emergency Recovery Guide

This runbook outlines the exact procedure to safely rollback any deployment without affecting `https://fullstack-intern.skyrovix.in` or any other service on the Contabo VPS.

---

## 1. Quick Emergency Rollback (Instant)

If `skyrovix-main` needs to be immediately taken offline:

```bash
# 1. Stop and remove the PM2 process
pm2 stop skyrovix-main
pm2 delete skyrovix-main
pm2 save

# 2. Disable the Nginx server block
sudo rm -f /etc/nginx/sites-enabled/skyrovix-main.conf

# 3. Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

> **Note**: Removing `/etc/nginx/sites-enabled/skyrovix-main.conf` leaves all other sites (including `fullstack-intern.skyrovix.in`) completely untouched and operating normally.

---

## 2. DNS Rollback

If you changed the DNS `A` record of `skyrovix.in` to point to the Contabo VPS and need to revert back to your previous hosting (Vercel):

1. Log into your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.).
2. Change the `A` record of `@` (or `skyrovix.in`) back to:
   - **Type**: `A`
   - **Name**: `@`
   - **Value**: `216.198.79.1` (or `76.76.21.21`)
   - **TTL**: Auto / 5 minutes
3. Save changes. DNS propagation usually takes 2–10 minutes.

---

## 3. Database Rollback / Restoration

The application uses an isolated database (`skyrovix_main_db`) that is completely separated from other databases.

### To restore from a previous backup:
```bash
# Create a snapshot before restoring
mysqldump -u skyrovix_main_user -p skyrovix_main_db > /opt/skyrovix-sites/emergency_backup_$(date +%F_%H%M).sql

# Restore a previous backup
mysql -u skyrovix_main_user -p skyrovix_main_db < /path/to/backup.sql
```

### To completely reset the database cleanly:
```bash
mysql -u root -p <<EOF
DROP DATABASE IF EXISTS skyrovix_main_db;
CREATE DATABASE skyrovix_main_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON skyrovix_main_db.* TO 'skyrovix_main_user'@'localhost';
GRANT ALL PRIVILEGES ON skyrovix_main_db.* TO 'skyrovix_main_user'@'127.0.0.1';
FLUSH PRIVILEGES;
EOF

# Re-import base schema
mysql -u skyrovix_main_user -p skyrovix_main_db < /opt/skyrovix-sites/skyrovix-main/mysql_schema.sql
```

---

## 4. Git Code Rollback

To revert the application code to a previous commit on the VPS:

```bash
cd /opt/skyrovix-sites/skyrovix-main

# View recent commits
git log --oneline -n 5

# Revert to a specific commit
git checkout <COMMIT_HASH>

# Rebuild and restart
npm install
npm run build
pm2 restart skyrovix-main
```

---

## 5. Verifying Co-Existing Internship Site Health

Always verify that the existing internship platform remains fully functional:

```bash
# 1. Check curl response on local and public domains
curl -I https://fullstack-intern.skyrovix.in

# 2. Check Nginx syntax
sudo nginx -t

# 3. Check PM2 list
pm2 list
```
