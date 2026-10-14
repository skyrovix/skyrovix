# SKYROVIX — Supabase to MySQL Migration & Contabo Deployment Audit Report

**Date**: October 14, 2026  
**Auditor**: Senior Full-Stack & DevOps Migration Engineer  
**Repository**: [https://github.com/skyrovix/skyrovix.git](https://github.com/skyrovix/skyrovix.git)  
**Target Domain**: `https://skyrovix.in`  
**Target VPS**: Contabo VPS (`75.119.129.201`)  
**Target Path**: `/opt/skyrovix-sites/skyrovix-main`  
**Co-Existing Website**: `https://fullstack-intern.skyrovix.in` (CRITICAL: MUST NOT BE TOUCHED OR DISRUPTED)

---

## 1. Executive Summary & Safety Policy

This audit provides a comprehensive, production-grade assessment of the complete migration of the Skyrovix EdTech & Virtual Internship platform from **Supabase Cloud (PostgreSQL + Supabase Auth + Supabase Storage + PostgREST)** to a fully self-hosted, high-performance **MySQL 8.0 + Node.js (TanStack Start / Nitro) stack on Contabo VPS**.

### ⚠️ Non-Negotiable Safety Directives:
1. **Existing Internship Website Protection**:
   The VPS currently hosts `https://fullstack-intern.skyrovix.in` on IP `75.119.129.201`.
   - **DO NOT** stop, restart, or alter existing Docker containers or PM2 processes belonging to the existing internship site.
   - **DO NOT** delete or overwrite existing Nginx configuration files (e.g. `/etc/nginx/sites-enabled/default` or any existing `.conf` files).
   - **DO NOT** use default ports like `3000` or `5000` without checking active listeners. The new deployment will run on dedicated port `3005` (or dynamically verified free port).
   - **DO NOT** drop, modify, or share the existing MySQL database. The new site will use an isolated database (`skyrovix_main_db`) and user (`skyrovix_main_user`).
2. **DNS Verification Before Cutover**:
   - Current DNS: `skyrovix.in` points to `216.198.79.1` (Vercel/external), while `fullstack-intern.skyrovix.in` points to `75.119.129.201` (Contabo VPS).
   - No DNS changes or SSL cutovers will take place until the staging deployment is 100% verified locally on the VPS.

---

## 2. Infrastructure & DNS Audit

| Target | Current Record | Target IP | Status / Action |
| :--- | :--- | :--- | :--- |
| **`skyrovix.in`** | `A 216.198.79.1` | `75.119.129.201` | Currently pointing to legacy Vercel host. Keep unchanged until migration is fully verified on VPS. |
| **`fullstack-intern.skyrovix.in`** | `A 75.119.129.201` | `75.119.129.201` | **ACTIVE LIVE SITE** on Contabo VPS. Strictly preserve. |
| **Target Port** | `3005` (Dedicated) | Localhost `127.0.0.1:3005` | Avoids standard port `3000` and `5000` collisions. |
| **Target App Directory** | `/opt/skyrovix-sites/skyrovix-main` | Dedicated directory | Isolated from any other site on the VPS. |
| **Dedicated Database** | `skyrovix_main_db` | MySQL 8.0 | Isolated database with custom credentials. |
| **PM2 Process Name** | `skyrovix-main` | Node.js process | Isolated from any other PM2 instance. |

---

## 3. Comprehensive Codebase Dependency Audit

### 3.1. Supabase Usage Inventory Across Source Files

An exhaustive scan of `src/` revealed **38 frontend route and component files** that interface with Supabase APIs:

| Component / Layer | Direct Supabase References | Current Status in Migration |
| :--- | :--- | :--- |
| **Client Initialization** | `src/integrations/supabase/client.ts` | Replaced with drop-in Universal MySQL Client adapter routing via TanStack Start `createServerFn` bridge (`runMysqlQueryServerFn`). |
| **Server Admin Client** | `src/integrations/supabase/client.server.ts` | Replaced with server-side MySQL client with full administrative privileges. |
| **Auth Middleware** | `src/integrations/supabase/auth-middleware.ts`, `auth-attacher.ts` | Replaced with local JWT token decoding and verification via `mysql-auth.server.ts`. |
| **Auth State Provider** | `src/lib/auth.tsx` (`useAuth`) | Fully operational with local JWT storage (`skyrovix_auth_session`) and auth state event emitters. |
| **Auth UI & Login/Signup** | `src/routes/auth.tsx`, `forgot-password.tsx`, `reset-password.tsx` | Routes to local endpoints `/api/auth/signin`, `/api/auth/signup`, `/api/auth/update-password`. |
| **Student Dashboard** | `src/routes/_navbar-layout/_authenticated/dashboard.tsx` (11 tables queried) | All queries (`applications`, `submissions`, `tasks`, `certificates`, `payments`, `fee_settings`, `payment_records`) route via MySQL query builder. |
| **Admin Control Panel** | `src/routes/admin.tsx`, `admin.payment-verification.tsx`, `admin.fee-settings.tsx`, `admin.coupons.tsx` | Routes through MySQL query builder and server functions. |
| **Courses & Quizzes** | `src/routes/_navbar-layout/courses.*.tsx` | Routes through MySQL query builder. |
| **Projects Module** | `src/routes/_navbar-layout/projects.*.tsx` | Routes through MySQL query builder. |
| **Hardcoded Storage URL** | `src/routes/_navbar-layout/projects.$id_.submit.tsx:107` | **FINDING**: Contains hardcoded fallback URL `https://eesiuqeswydlmwhecrcy.supabase.co/storage/...`. Must be updated to `/uploads/project-submissions/...`. |
| **Realtime Channels** | `src/routes/_navbar-layout/_authenticated/dashboard.tsx:207` | Replaced with safe non-crashing subscriber stub; should be backed by HTTP polling or SSE. |

### 3.2. Unused Package Audit (`package.json`)

The following packages are currently installed but will be deprecated once Supabase is fully retired:
- `@supabase/supabase-js`: `^2.108.1` (Safe to remove after testing)
- `supabase`: `^2.107.0` (CLI in devDependencies, safe to remove)
- `pg` & `@types/pg`: Replaced by `mysql2`

---

## 4. Database Schema & Migration Audit

### 4.1. Comparison: PostgreSQL Schema vs. MySQL 8.0 Schema

An audit of `complete_setup.sql` (5,945 lines) and supplementary migration files identified **32 relational tables**:

| Table Name | PostgreSQL Types / Features | MySQL 8.0 Equivalent | Status in `mysql_schema.sql` |
| :--- | :--- | :--- | :--- |
| `users` | `auth.users` | `id VARCHAR(36) PRIMARY KEY, password_hash VARCHAR(255)` | ✅ Configured |
| `profiles` | `UUID`, `TIMESTAMPTZ` | `VARCHAR(36)`, `DATETIME(3)` | ✅ Configured |
| `user_roles` | `app_role ENUM` | `role VARCHAR(50)` | ✅ Configured |
| `applications` | `application_status ENUM` | `status VARCHAR(50)`, all 30+ columns mapped | ✅ Configured |
| `tasks` | `CHECK (task_number 0-12)` | `INT NOT NULL, UNIQUE(domain, task_number)` | ✅ Configured |
| `submissions` | `submission_status ENUM` | `status VARCHAR(50)` | ✅ Configured |
| `submission_history` | `UUID` | `VARCHAR(36)` | ✅ Configured |
| `certificates` | `UUID`, `TEXT UNIQUE` | `VARCHAR(36)`, `VARCHAR(100) UNIQUE` | ✅ Configured |
| `payments` | `NUMERIC` | `DECIMAL(10,2)` | ✅ Configured |
| `payment_records` | `payment_type CHECK` | `payment_type VARCHAR(50)` | ✅ Configured |
| `fee_settings` | `offer_* columns` | `DECIMAL(10,2)`, `TINYINT(1)` | ✅ Configured |
| `cashfree_orders` | `JSONB`, `NUMERIC(10,2)` | `JSON`, `DECIMAL(10,2)` | ✅ Configured |
| `coupons` | `discount_type CHECK` | `VARCHAR(50)`, `DECIMAL(10,2)` | ✅ Configured |
| `coupon_redemptions` | `UUID` | `VARCHAR(36)` | ✅ Configured |
| `reviews` | `rating CHECK (1-5)` | `INT NOT NULL` | ✅ Configured |
| `email_logs` | `JSONB` | `JSON` | ✅ Configured |
| `promotional_popups` | `BOOLEAN` | `TINYINT(1)` | ✅ Configured |
| `project_challenges` | `TEXT[]`, `JSONB` | `JSON`, `MEDIUMTEXT` | ✅ Configured |
| `project_submissions` | `NUMERIC(5,1)` | `DECIMAL(5,1)` | ✅ Configured |
| `project_evaluations` | `NUMERIC(5,0)` | `DECIMAL(5,0)` | ✅ Configured |
| `project_certificates` | `UUID` from `migrations-projects.sql` | `VARCHAR(36), cert_id VARCHAR(100)` | ⚠️ **Action Needed**: Add to schema |
| `project_awards` | `UUID` from `migrations-projects.sql` | `VARCHAR(36), award_id VARCHAR(100)` | ⚠️ **Action Needed**: Add to schema |
| `courses` | `UUID` | `VARCHAR(36)` | ✅ Configured |
| `course_topics` | `MEDIUMTEXT` | `MEDIUMTEXT`, `order_index INT` | ✅ Configured |
| `course_tasks` | `UUID` | `VARCHAR(36)` | ✅ Configured |
| `course_quiz_questions`| `JSONB` | `JSON` | ✅ Configured |
| `enrollments` | `UUID` | `VARCHAR(36)` | ✅ Configured |
| `lesson_progress` | `UUID` | `VARCHAR(36)` | ✅ Configured |
| `quiz_attempts` | `JSONB` | `JSON` | ✅ Configured |
| `course_certificates` | `UUID` | `VARCHAR(36)` | ✅ Configured |
| `leaderboard` | `UUID` | `VARCHAR(36)` | ✅ Configured |
| `login_sessions` | `UUID` | `VARCHAR(36)` | ✅ Configured |

### 4.2. Stored Procedures / RPC Mapping
- `count_domain_applications(p_domain)`: Executed via backend server query `SELECT COUNT(*) FROM applications WHERE domain = ?`.
- `ensure_task(p_domain, p_task_number, p_title, p_description)`: Handled natively in `mysql-api.server.ts` with atomic upsert.
- `ensure_linkedin_task(p_domain)`: Handled natively in `mysql-api.server.ts` (task number 0).

---

## 5. Security Vulnerability & Secret Leak Audit

### 🚨 Critical Security Findings:
1. **Hardcoded Secrets in Git Working Tree**:
   - `.env` & `.env.production` contain plain-text Gmail App Passwords (`GMAIL_APP_PASSWORD=mwxf nxkg bhoo kzac`) and Cashfree Production Secret Keys (`CASHFREE_SECRET_KEY=cfsk_ma_prod_...`).
   - **Remediation**:
     - Never commit `.env` or `.env.production` with live credentials.
     - Create a clean `.env.example` with sanitized placeholders.
     - Recommend rotating the Gmail App Password and Cashfree secret key.
2. **Hardcoded Admin Bypass Passwords in `src/routes/auth.tsx`**:
   - Lines 94-110 test for fallback passwords `["123harimahesh", "Admin@123"]` directly in frontend code.
   - **Remediation**: Remove fallback passwords from client-side bundle; all password verification must reside securely on the server via bcrypt.
3. **Storage Access Traversal Protection**:
   - `saveUploadedFile` in `src/lib/mysql-api.server.ts` uses `path.resolve` and strict prefix verification against `public/uploads` to prevent directory traversal attacks (`../`).

---

## 6. Feature-by-Feature Integrity Verification Plan

| Module | Features | Verification Check |
| :--- | :--- | :--- |
| **Authentication** | Student Sign-up, Sign-in, Sign-out, Admin check, Session refresh | Test with `bcryptjs` and JWT tokens; test role resolution. |
| **Student Dashboard** | LMS tasks 1-5, submission uploads (PDF/screenshot/GitHub), verification timeline, offer letter download | Verify document generation, task submissions, and status progression. |
| **Admin Portal** | Student directory, submission approvals, rejections, manual merit approval dialog, fee controls | Verify approval action writes to MySQL and updates student status. |
| **Payment Gateway** | Cashfree PG checkout, webhook handling, UPI manual verification | Test server order creation; verify signature checking and state updates. |
| **Document Verification**| Universal credential verification (`/verify/$id`), QR code scanning | Verify direct MySQL lookups for offer letters, intern IDs, and certificates. |
| **Courses & Quizzes** | Course topic reader, MCQ quizzes, score submission, certificate issuance | Test quiz attempt submission and certificate generation. |
| **Email Service** | Offer letter email with PDF, Certificate issuance email with PDF | Verify SMTP connection with Gmail app password. |
| **Local File Storage** | Multipart file uploads for profile photos, payment receipts, task deliverables | Test saving to `/public/uploads/` and HTTP retrieval. |

---

## 7. Contabo Safe Deployment Plan (Step-by-Step)

### Phase A: Database & Application Isolation on VPS
1. Target Directory: `/opt/skyrovix-sites/skyrovix-main`
2. Dedicated MySQL Database: `skyrovix_main_db`
3. Dedicated MySQL User: `skyrovix_main_user` (restricted to `skyrovix_main_db.*`)
4. Dedicated Port: `3005` (with active verification using `ss -tulpn | grep 3005` to ensure no conflict)
5. Dedicated PM2 Process: `pm2 start node --name "skyrovix-main" -- .output/server/index.mjs`

### Phase B: Dedicated Nginx Server Block (Zero Overwrite)
Create `/etc/nginx/sites-available/skyrovix-main.conf` strictly scoped to:
```nginx
server {
    listen 80;
    server_name skyrovix.in www.skyrovix.in;

    client_max_body_size 50M;

    location /uploads/ {
        alias /opt/skyrovix-sites/skyrovix-main/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location / {
        proxy_pass http://127.0.0.1:3005;
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
- **Safety check**: Test Nginx configuration with `sudo nginx -t` before issuing `sudo systemctl reload nginx`.
- **Preservation**: The existing `fullstack-intern.skyrovix.in` server block and default block remain untouched.

### Phase C: DNS Cutover & SSL Validation
1. Verify `skyrovix-main` is responding locally on `http://127.0.0.1:3005`.
2. Verify DNS: User points `skyrovix.in` (A record) to Contabo VPS IP `75.119.129.201`.
3. Run Certbot for `skyrovix.in` only:
   `sudo certbot --nginx -d skyrovix.in -d www.skyrovix.in`

---

## 8. Rollback Strategy & Emergency Plan

If any issue occurs during the cutover:
1. **Nginx Rollback**:
   `sudo rm /etc/nginx/sites-enabled/skyrovix-main.conf && sudo systemctl reload nginx`
   (The existing internship website remains 100% untouched).
2. **PM2 Stop**:
   `pm2 stop skyrovix-main && pm2 delete skyrovix-main`
3. **Database Isolation**:
   Because `skyrovix_main_db` is completely separate, dropping it will never affect other databases on the server.
4. **DNS Rollback**:
   Revert `skyrovix.in` A record back to `216.198.79.1` (Vercel).
