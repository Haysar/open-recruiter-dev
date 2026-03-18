# Open-Recruiter — Agent Task Guide

## Project Overview

**Open-Recruiter** is a community-driven recruiter accountability platform. Candidates can leave authenticated, multi-dimensional reviews of recruiters, and recruiters can build a portable public reputation independent of their employer.

**Tech Stack:**
- **Framework:** Next.js 16 (App Router, server actions)
- **Language:** TypeScript 5
- **Database:** PostgreSQL via Supabase (Prisma 7 ORM with `@prisma/adapter-postgresql`)
- **Auth:** NextAuth v5 beta — LinkedIn, Google, Apple OAuth + Email magic links
- **Storage:** Supabase Storage (S3-compatible) for review evidence uploads
- **Payments:** Payrexx API (gateway creation + HMAC-verified webhooks)
- **AI Moderation:** Multi-provider (Mistral / Gemini / Claude / OpenAI) — configured via Admin panel
- **UI:** Tailwind CSS 4, Shadcn/UI, Radix UI, Lucide icons

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages + server actions
│   ├── (auth)/sign-in/     # Sign-in page
│   ├── (onboarding)/welcome/  # Role selection (first sign-in)
│   ├── admin/              # Admin settings panel
│   ├── api/
│   │   ├── auth/           # NextAuth handlers (+ session route)
│   │   └── webhooks/payrexx/  # Payment webhook (HMAC-SHA256 verified)
│   ├── c/[slug]/           # Company public profiles
│   ├── c/onboarding/       # Company setup flow
│   ├── dashboard/          # Role-based dashboard (candidate/recruiter/company)
│   ├── join/[inviteLink]/  # Recruiter joining a company
│   ├── r/[slug]/           # Recruiter public profiles
│   ├── r/onboarding/       # Recruiter setup flow
│   ├── review/[slug]/      # Review submission for a recruiter
│   ├── search/             # Recruiter search & browse
│   └── subscribe/          # Subscription / payment flow
├── components/
│   ├── auth/               # OAuth sign-in buttons, forms
│   ├── review/             # Rating form, star input
│   └── ui/                 # Shadcn components (button, card, badge, etc.)
├── lib/
│   ├── auth.ts             # NextAuth v5 config
│   ├── prisma.ts           # Prisma client singleton
│   ├── storage.ts          # Supabase Storage upload helper
│   ├── payrexx.ts          # Payrexx API client (createPayrexxGateway — READY BUT UNUSED)
│   ├── ai-moderation.ts    # 4-provider AI moderation
│   ├── encryption.ts       # AES-256-GCM for AI API keys
│   └── utils.ts            # General utilities
├── types/
│   └── next-auth.d.ts      # Session type extensions
└── test/                   # Vitest setup & test utilities
prisma/
├── schema.prisma           # 11 models — see Data Models below
└── migrations/
tests/e2e/                  # Playwright e2e specs
```

### Data Models (prisma/schema.prisma)

| Model | Purpose |
|---|---|
| `User` | Auth + role (ADMIN/RECRUITER/COMPANY/CANDIDATE) + subscription status |
| `Account` / `Session` / `VerificationToken` | Auth.js standard models |
| `RecruiterProfile` | Slug, bio, photo, 4-dimension aggregated ratings, invite code |
| `CompanyProfile` | Slug, logo, invite link, aggregated ratings from connected recruiters |
| `Review` | 4 ratings (experience/speed/transparency/knowledge), comment, evidence, AI moderation status |
| `Subscription` | TRIAL→ACTIVE→CANCELLED lifecycle, Payrexx transaction reference |
| `ReferralCode` / `ReferralUsage` | 20% discount referral system |
| `AdminSettings` | Singleton — AI provider + AES-256 encrypted API key |

### Key Server Actions

| File | Actions |
|---|---|
| `app/(onboarding)/welcome/actions.ts` | Initial role selection |
| `app/r/onboarding/actions.ts` | Create recruiter profile |
| `app/c/onboarding/actions.ts` | Create company profile |
| `app/review/[slug]/actions.ts` | Submit review (validation + AI moderation + rating aggregation) |
| `app/dashboard/edit/actions.ts` | Edit profile |
| `app/subscribe/actions.ts` | Start subscription (currently static link — see Task 1) |
| `app/join/[inviteLink]/actions.ts` | Recruiter join company |
| `app/admin/actions.ts` | Update admin AI settings |

---

## Current State

### Complete / Working
- Full OAuth + magic-link authentication flow
- Recruiter and company profile creation + public pages
- Review submission with 4-dimensional ratings, evidence upload, AI moderation
- Role-based dashboards (candidate / recruiter / company)
- Subscription trial (30-day auto-created) with trial countdown
- Payrexx payment webhook (HMAC verified, updates subscription status)
- Admin settings panel (AI provider + encrypted key storage)
- Search and browse recruiters
- Referral code system (data layer complete)
- Privacy policy + terms of service pages
- AES-256-GCM encryption for stored API keys

### Incomplete / Broken

| Area | Status | Details |
|---|---|---|
| Payment gateway | ⚠️ Partial | Static link only; dynamic gateway code written but not wired up |
| Admin moderation | ⚠️ Partial | AI flags reviews but no dashboard to act on them |
| Search | ⚠️ Basic | Uses `contains` SQL — full-text index exists but unused |
| Testing | ✗ Broken | devDependencies missing; configs present but tests can't run |
| Rate limiting | ✗ Missing | No rate limiting on any endpoints |
| Evidence verification | ⚠️ Partial | Upload works; `isVerifiedEvidence` flag always false |
| README | ✗ Outdated | Still the Next.js starter template |

---

## Outstanding Tasks

### TASK 1 — Wire Up Dynamic Payrexx Payment Gateways
**Priority: High**

`src/lib/payrexx.ts` has a complete `createPayrexxGateway()` implementation that is never called.
`src/app/subscribe/actions.ts` (line 8) has a hardcoded static payment link as a temporary placeholder.

**What to do:**
1. Replace the static link in `subscribe/actions.ts` with a call to `createPayrexxGateway()` from `src/lib/payrexx.ts`
2. Pass the returned gateway URL to the client for redirect
3. Ensure the Payrexx webhook (`src/app/api/webhooks/payrexx/route.ts`) correctly maps the transaction back to the user
4. Test the full payment flow: subscribe → Payrexx → webhook → subscription activated

**Env vars required:** `PAYREXX_API_KEY`, `PAYREXX_INSTANCE_NAME`, `PAYREXX_WEBHOOK_SECRET`, `PAYREXX_BASE_URL`

---

### TASK 2 — Fix Broken Test Setup
**Priority: High**

Test configs (`vitest.config.ts`, `playwright.config.ts`) are present and complete, but the required devDependencies are not in `package.json`, so all test commands fail.

**What to do:**
1. Add missing devDependencies to `package.json`:
   ```
   vitest
   @vitejs/plugin-react
   @testing-library/react
   @testing-library/user-event
   @testing-library/jest-dom
   @playwright/test
   @vitest/coverage-v8
   @vitest/ui
   ```
2. Run `npm install` and confirm `npm test` passes
3. Run `npm run test:e2e` and confirm Playwright can execute `tests/e2e/home.spec.ts`
4. Expand test coverage — priority areas:
   - `src/app/review/[slug]/actions.ts` — core review submission logic
   - `src/app/api/webhooks/payrexx/route.ts` — payment webhook
   - `src/lib/ai-moderation.ts` — AI provider switching
   - Server actions for onboarding flows

**Reference:** `TESTING.md` has a complete guide for writing tests in this project.

---

### TASK 3 — Admin Moderation Dashboard
**Priority: High**

Reviews flagged by AI moderation land with status `UNDER_REVIEW` or `FLAGGED`. There is no admin interface to view, approve, or reject them.

**What to do:**
1. Add a moderation page at `src/app/admin/moderation/page.tsx`
2. Query reviews with status `UNDER_REVIEW` or `FLAGGED` from Prisma
3. Display review content, author, evidence URL, and AI flag reason
4. Add approve (→ `PUBLISHED`) and reject (→ `REMOVED`) server actions
5. Protect the route so only users with `role === 'ADMIN'` can access it
6. Add a nav link to the existing admin panel at `src/app/admin/page.tsx`

---

### TASK 4 — Upgrade Search to Full-Text
**Priority: Medium**

`src/app/search/page.tsx` (line 34–36) notes that a full-text index exists on `RecruiterProfile.bio` but the query uses a simple `contains` filter instead.

**What to do:**
1. Switch the Prisma search query to use `search` (full-text) mode on the `bio`, `User.name`, and `CompanyProfile.name` fields
2. Verify the `@@fulltext([bio])` index in `schema.prisma` is correct for PostgreSQL (may need a migration if using `pg_trgm`)
3. Consider adding trigram GIN index via a raw migration for fuzzy matching
4. Test that search results are relevant and performant

---

### TASK 5 — Add Rate Limiting to API Routes
**Priority: Medium**

No rate limiting is applied to any endpoint. The project previously referenced `express-rate-limit` but it was removed.

**What to do:**
1. Add rate limiting middleware to:
   - `/api/auth/*` — prevent brute-force on magic-link requests
   - `/api/webhooks/payrexx` — already HMAC-verified but should still rate-limit
   - Review submission server action — prevent review spam
2. Use Next.js middleware (`src/middleware.ts`) with an in-memory or Redis-backed store, or use a package like `@upstash/ratelimit` (Upstash Redis) for edge-compatible rate limiting
3. Return `429 Too Many Requests` with a `Retry-After` header

---

### TASK 6 — Evidence Verification Workflow
**Priority: Low**

`Review.isVerifiedEvidence` is always `false`. There is no admin flow to verify uploaded evidence.

**What to do:**
1. Add a "Mark Evidence Verified" action to the admin moderation dashboard (see Task 3)
2. When an admin verifies evidence, set `isVerifiedEvidence = true` on the review
3. Display a verified badge on the public review if `isVerifiedEvidence === true`

---

### TASK 7 — Update README
**Priority: Low**

`README.md` is still the boilerplate Next.js starter template.

**What to do:**
1. Replace with a project-specific README covering:
   - What the project is and why it exists
   - Local development setup (prerequisites, env vars, migrations, dev server)
   - Brief architecture overview
   - Link to TESTING.md
   - Deployment notes

---

## Environment Variables

All required variables are documented in `.env.example`. Minimum required for local development:

```
DATABASE_URL          # Supabase PostgreSQL connection string
AUTH_SECRET           # Generate: npx auth secret
AUTH_URL              # http://localhost:3000
AUTH_LINKEDIN_ID / AUTH_LINKEDIN_SECRET
AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
SUPABASE_URL / SUPABASE_SERVICE_KEY / SUPABASE_STORAGE_BUCKET
ENCRYPTION_KEY        # 64 hex chars (32 bytes)
```

Payment and AI moderation are optional for local dev — they degrade gracefully if not configured.

---

## Notes for Agents

- **Server actions** are the primary mutation pattern — prefer them over new API routes
- **Prisma transactions** are used for review creation + rating aggregation in `review/[slug]/actions.ts` — follow this pattern for any write that touches multiple tables
- **`AdminSettings` is a singleton** — the app enforces one row at the application layer, not via a DB constraint
- **Auth.js v5 (beta)** — session access differs from v4: use `auth()` from `src/lib/auth.ts`, not `getServerSession()`
- **`src/lib/prisma.ts`** uses `@prisma/adapter-postgresql` (not the default Node.js engine) — do not swap to the standard Prisma client
- **AES-256-GCM encryption** in `src/lib/encryption.ts` must be used when storing any AI API key — never store plaintext keys
- **Webhook signature verification** in `src/app/api/webhooks/payrexx/route.ts` must not be removed or bypassed
