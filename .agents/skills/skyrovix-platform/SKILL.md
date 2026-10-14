---
name: skyrovix-platform
description: >-
  Comprehensive guide, architectural reference, and operational runbook for the Skyrovix EdTech & Virtual Internship platform.
  Activate this skill when developing, debugging, maintaining, or enhancing any part of the Skyrovix web application,
  including internship programs, sequential task verification, Cashfree payment gateway, certificate issuance,
  PDF document generation, verification routes, email notifications, and database migrations.
---

# Skyrovix Platform Skill Guide

Skyrovix is an MSME-registered EdTech platform providing structured virtual internships, hands-on project submissions, automated offer letters, verified certificates, and career development tools.

---

## 1. System Architecture & Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | TanStack Start + Vite | SSR & client routing with file-based routing (`src/routes/`) |
| **UI Library** | React 19 + Tailwind CSS v4 | Lucide React icons, Radix UI primitives, Sonner toasts |
| **Server Engine** | Nitro | Fullstack server functions via `createServerFn` |
| **Database** | PostgreSQL via Supabase | Direct connection pooling with `pg` (`src/lib/db.server.ts`) + Supabase Auth |
| **Payment Gateway** | Cashfree PG (v2023-08-01) | Web Checkout SDK v3, automatic webhook verification & order sync |
| **Document Generation** | `@react-pdf/renderer` | Server & client PDF generation for Offer Letters, ID Cards, Certificates |
| **Email Service** | Nodemailer (Gmail SMTP) | Automated transactional emails with embedded HTML templates |
| **Production Domains** | `skyrovix.online`, `skyrovix.in` | SSL-enabled dual production domains |

---

## 2. Directory Structure & Key Files

```text
skyrovix/
├── .agents/
│   └── skills/
│       └── skyrovix-platform/
│           └── SKILL.md                 # This skill guide
├── src/
│   ├── routes/                          # TanStack file-based routes
│   │   ├── __root.tsx                   # Global root layout, SEO metadata, JSON-LD
│   │   ├── _navbar-layout/              # Pages sharing standard Navbar/Footer
│   │   │   ├── _authenticated/          # Protected student portal
│   │   │   │   ├── dashboard.tsx        # Main student LMS dashboard & task manager
│   │   │   │   └── review.tsx           # Student review submission
│   │   │   ├── index.tsx                # Homepage / Hero / Programs
│   │   │   ├── about.tsx                # About Skyrovix company
│   │   │   ├── founder.tsx              # Founder & Leadership profiles
│   │   │   ├── courses.*.tsx            # Courses catalog, details & quizzes
│   │   │   └── payment.*.tsx            # Payment status, success & failure callbacks
│   │   ├── admin.tsx                    # Comprehensive admin control panel
│   │   ├── verify.tsx                   # Universal QR verification entry
│   │   ├── verify.$id.tsx               # Direct document verification by ID
│   │   ├── verify-certificate.tsx       # Dedicated certificate verification
│   │   ├── terms.tsx, privacy.tsx       # Legal compliance pages
│   │   └── refund.tsx                   # Mandatory refund policy page
│   ├── components/
│   │   ├── payment/
│   │   │   └── PaymentSummaryDialog.tsx # Cashfree payment modal
│   │   ├── pdf-docs.tsx                 # Offer Letter & Certificate PDF templates
│   │   ├── IDCard.tsx                   # Student Virtual ID Card
│   │   ├── ManualUpiPaymentCard.tsx     # Direct UPI fallback payment component
│   │   └── VerificationView.tsx         # Document verification UI
│   └── lib/
│       ├── cashfree.server.ts           # Cashfree server API integration & config
│       ├── cashfree-service.ts          # Payment order creation & verification server functions
│       ├── cashfree-client.ts           # Cashfree JS SDK v3 client loader
│       ├── db.server.ts                 # PostgreSQL connection pool & migrations
│       ├── fee-service.server.ts        # Task verification checks & fee logic
│       ├── email-service.ts             # SMTP email dispatcher
│       └── constants.ts                 # Company info, domains, and certificate ID helpers
```

---

## 3. Core Workflows & Procedures

### 3.1. Internship Student Lifecycle
1. **Application & Enrollment:**
   - Student selects domain from 25 available tracks ([`domains.index.tsx`](file:///c:/Users/HARIHARAN%20S/OneDrive/Desktop/skyrovix/src/routes/domains.index.tsx)).
   - Enrolled application created in `public.applications`.
   - Automated Offer Letter and Intern ID generated with unique verification IDs.
2. **Sequential Task Completion:**
   - Each domain contains **12 structured tasks** (Tasks 1–6 beginner/intermediate, Tasks 7–12 advanced).
   - Strict sequential progression: Task `N` cannot be submitted or unlocked until Task `N-1` is approved by an admin.
   - Enforced both on the client ([`dashboard.tsx`](file:///c:/Users/HARIHARAN%20S/OneDrive/Desktop/skyrovix/src/routes/_navbar-layout/_authenticated/dashboard.tsx)) and the server ([`fee-service.server.ts`](file:///c:/Users/HARIHARAN%20S/OneDrive/Desktop/skyrovix/src/lib/fee-service.server.ts)).
3. **Task Verification:**
   - Admins review code repositories, live links, and deliverables from `/admin`.
   - Status transitions: `pending` &rarr; `approved` or `rejected` (with review notes).
4. **Certificate Unlock & Issuance:**
   - Locked until all required tasks are approved (`checkAllTasksVerified`).
   - If fee enabled: Student pays nominal fee (₹100) or applies promo code **`SKYROFREE`** for 100% free waiver.
   - Upon verification/payment, certificate is issued with a tamper-proof ID format: `SKY-CERT-[YEAR]-[HASH]` and verified QR code.

---

### 3.2. Cashfree Payment Gateway & Domain Whitelisting

#### Key Rules:
- API Version: `2023-08-01`
- Cashfree Web Checkout SDK: `v3` (`https://sdk.cashfree.com/js/v3/cashfree.js`)
- **Mandatory Production Security:** Cashfree strictly blocks payments if the checkout origin is not whitelisted.
- **Merchant Whitelisting Step:**
  - Login to [Cashfree Merchant Dashboard](https://merchant.cashfree.com/).
  - Go to **Payment Gateway** &rarr; **Developers** &rarr; **Whitelisting** (`/merchants/whitelisting`).
  - Add: `https://www.skyrovix.online`, `https://skyrovix.online`, `https://www.skyrovix.in`, `https://skyrovix.in`.
- **Dynamic Callback:** `returnUrl` is dynamically generated to match `window.location.origin` to avoid cross-domain mismatches.

#### Testing Payments:
- **Local Testing:** Cashfree Production credentials do not allow `localhost`. Use promo code `SKYROFREE` for instant testing without gateway calls.
- **Sandbox Testing:** Set `CASHFREE_ENVIRONMENT="SANDBOX"` in `.env` with sandbox credentials.

---

### 3.3. Document Verification Engine

Skyrovix provides public verification for three document types:
- **Offer Letters:** ID format `SKY-OL-[YEAR]-[HASH]`
- **Intern ID Cards:** ID format `SKY-ID-[YEAR]-[HASH]`
- **Completion Certificates:** ID format `SKY-CERT-[YEAR]-[HASH]`

Verification URLs:
- Base: `/verify`
- Direct by ID: `/verify/:id` (e.g. `/verify/SKY-CERT-2026-AB12CD`)
- Certificate specific: `/verify-certificate`

Each issued document includes an embedded QR code pointing to `https://skyrovix.online/verify/:id`.

---

## 4. Local Development Runbook

### Starting the Local Server
```bash
# Start Vite development server on port 3000
npm run dev

# Or use the convenient Windows batch script
start-dev.bat
```

### Type Checking & Linting
```bash
# Verify TypeScript without emitting bundle
npx tsc --noEmit

# Run ESLint rules
npm run lint
```

### Pre-Build Script
Before deploying, the prebuild step generates required static assets:
```bash
npm run prebuild
# Executes:
# 1. scripts/generate-email-assets.mjs
# 2. scripts/generate-og.mjs
# 3. scripts/generate-favicons.mjs
```

---

## 5. Troubleshooting & Gotchas

1. **"Broken Link! domain is not enabled or approved" (Cashfree):**
   - **Cause:** Domain whitelisting has not been approved in Cashfree Merchant Dashboard.
   - **Resolution:** Submit URL at `merchant.cashfree.com > Developers > Whitelisting`. In the interim, students can redeem `SKYROFREE` promo code.
2. **PostgreSQL / Supabase Pooler Timeout:**
   - **Cause:** Direct connection to `aws-1-ap-south-1.pooler.supabase.com` might face intermittent DNS resolution in restricted network environments.
   - **Fix:** Verify `DATABASE_URL` in `.env` uses IPv4 or session pooling mode (`port 5432` or `6543`).
3. **Certificate Payment Locked:**
   - **Cause:** Anti-skip security check detected pending or unsubmitted tasks.
   - **Resolution:** All required domain tasks must be approved in `/admin` before the certificate order can be initiated.
