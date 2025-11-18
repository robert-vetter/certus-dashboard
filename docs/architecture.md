# Certus Operations Dashboard — Architecture

**Version:** 1.0  
**Last updated:** 2025-09-25  
**Owner:** Backend Architect + Product Owner  
**Related docs:**
- `docs/prd.md` (v1.1, unified PRD)
- `docs/auth/authentication.md` (Auth system documentation)
- `.claude/agents/*` (local agent definitions)
- `supabase/schema.sql`, `supabase/policies.sql`, `supabase/seed.sql`  

---

## 1. High-Level System Overview

The Certus Operations Dashboard is a **Next.js 14** web application backed by **Supabase (Postgres + Auth + Storage)**, deployed on **Vercel**. It provides an operational console for AI-driven phone interactions across restaurants.

At a high level:

- **Data ingestion** (outside this project) writes to operational tables (`call_logs`, `order_logs`, `reservations`, `locations`, `accounts`, etc.).
- **Supabase** exposes:
  - Canonical **views** for calls, orders, and reservations (`calls_v`, `orders_v`, `reservations_v`).
  - A **materialized metrics view** (`mv_metrics_daily`) refreshed via `pg_cron`.
  - RLS to enforce tenant boundaries.
- **Next.js app** reads from views/MV using typed query helpers and presents:
  - **Overview** (KPIs + recent calls)
  - **Call Logs** (drill-down drawer)
  - **Analytics** (charts)
  - **Configuration** (settings, knowledge updates, API keys, busy mode)
- **Claude Code local agents** (BMAD-style) help design, implement, test, and evolve the system, writing to file-backed contexts in `docs/`, `supabase/`, and `app/`.

---

## 2. Architecture Goals & Constraints

### 2.1 Goals

1. **Operational clarity:** Give operators and internal Certus staff one place to see AI call performance, drill into calls, and tweak settings.
2. **Performance:** Overview and Call Logs must feel responsive with realistic data volumes.
3. **Scalability:** The architecture must scale across multiple restaurant accounts and locations.
4. **Agent-friendly:** The codebase must be easily navigable for Claude Code subagents to safely extend.
5. **Security:** Enforce tenant isolation and protect PII (especially phone numbers and audio recordings).

### 2.2 Constraints

- Frontend must use **Next.js 14 (App Router)** with **TypeScript**.
- UI must use **Tailwind CSS** and **shadcn/ui**.
- Backend must use **Supabase Postgres** with **pg_cron** for scheduled tasks.
- Tests: **Vitest**, **Testing Library**, **Playwright** (3 smoke tests minimum).
- All AI/agent automation must use **local project agents only** (no global `~/.claude/agents` dependence).

---

## 3. System Components & Data Flow

### 3.1 Components

1. **Frontend Application (Next.js 14)**
   - Routes:
     - `/overview`
     - `/call-logs`
     - `/analytics`
     - `/settings/configuration`
   - Uses server components for data fetching.
   - Uses server actions for mutations (notes, settings, exports).

2. **Backend Data Layer (Supabase)**
   - **Base tables**:
     - `accounts`, `users`, `locations`
     - `call_logs`, `order_logs`, `reservations`
     - `account_settings`, `location_settings`
     - `knowledge_update_requests`, `internal_notes`, `settings` (if separate)
   - **Views**:
     - `calls_v`, `orders_v`, `reservations_v`
   - **Materialized view**:
     - `mv_metrics_daily`
   - **RLS policies**:
     - Enforce `account_id`-scoped access and `admin` role.

3. **Auth**
   - Supabase Auth (magic link) for production.
   - Optional `DEMO_MODE` flag for read-only seeded demo account.

4. **Automation / Integrations (Future)**
   - **n8n** or similar polls `knowledge_update_requests`.
   - POS integrations read from `orders_v` and attach `pos_order_id`.

### 3.2 Data Flow

**Inbound data (outside scope, described for context):**

1. Telephony/AI service processes calls for a given restaurant/location.
2. Events are written into base tables:
   - `call_logs` with call metadata, summary, transcript, recording URL.
   - `order_logs` for orders related to call IDs.
   - `reservations` for reservation-related calls.

**Transformation & aggregation:**

3. `calls_v`, `orders_v`, `reservations_v` project and normalize data from base tables.
4. `mv_metrics_daily` aggregates:
   - Daily totals for calls, orders, reservations.
   - Revenue from orders and estimated revenue from reservations.
   - Estimated `minutes_saved` using account/location settings.

**Dashboard reads & writes:**

5. **Overview**:
   - Reads `mv_metrics_daily` for KPI tiles.
   - Reads `calls_v` for recent calls.
6. **Call Logs**:
   - Reads `calls_v` with filters/pagination.
   - For a selected call:
     - Reads `orders_v` and `reservations_v` by `call_id`.
     - Reads `internal_notes`.
   - Writes `internal_notes` via server actions.
7. **Analytics**:
   - Reads `mv_metrics_daily` for charts and CSV export.
8. **Configuration**:
   - Reads/writes `account_settings`, `location_settings`, `settings`.
   - Inserts into `knowledge_update_requests`.

---

## 4. Supabase Data Model & Access Layer

> Full DDL lives in `supabase/schema.sql`. This section documents the conceptual model and access patterns.

### 4.1 Core Entities

**Accounts & Users**

- `accounts` (orgs)
  - `account_id uuid pk`
  - `name text`
  - `created_at timestamptz`
- `users`
  - `user_id uuid pk`
  - `account_id uuid fk accounts`
  - `email text`
  - `display_name text`
  - `role text` (`admin` for MVP)
  - `created_at timestamptz`

**Locations**

- `locations`
  - `location_id uuid pk`
  - `account_id uuid fk accounts`
  - `name text`
  - `avg_spend_per_head numeric(10,2)` (baseline)
  - `created_at timestamptz`

**Calls**

- `call_logs`
  - `call_id text pk`
  - `location_id uuid fk locations`
  - `started_at_utc timestamptz`
  - `ended_at_utc timestamptz`
  - `call_status text`
  - `inbound boolean`
  - `customer_number text`
  - `certus_number text`
  - `corrected_duration_seconds int`
  - `order_made boolean`
  - `reservation_made boolean`
  - `pathway_tags_formatted text`
  - `recording_url text`
  - `call_summary text` (markdown or plain)
  - `transcription_formatted text` (markdown or plain)
  - Additional upstream fields as needed.

**Orders**

- `order_logs`
  - `order_id uuid pk`
  - `location_id uuid fk locations`
  - `account_id uuid fk accounts`
  - `call_id text` (relates to `call_logs.call_id`)
  - `total numeric`
  - `subtotal numeric`
  - `total_tax numeric`
  - `service_charge numeric`
  - `delivery_charge numeric`
  - `order_status text`
  - `fulfillment_type text`
  - `created_at timestamptz`

**Reservations**

- `reservations`
  - `reservation_id uuid pk`
  - `location_id uuid fk locations`
  - `call_id text`
  - `guest_count int`
  - `reservation_datetime text` or (`reservation_date`, `reservation_time`)
  - `average_spend_per_head numeric`
  - `created_at timestamptz`

### 4.2 Settings & Notes

**Settings**

- `account_settings`
  - `account_id uuid pk fk accounts`
  - `minutes_saved_baseline_seconds int default 120`
  - `revenue_mode text` (`'orders_only' | 'orders_plus_res_estimate'`)
  - `avg_spend_per_head numeric(10,2)` (account default)
  - `updated_at timestamptz`

- `location_settings`
  - `location_id uuid pk fk locations`
  - `minutes_saved_baseline_seconds int` (optional override)
  - `avg_spend_per_head numeric(10,2)` (optional override)
  - `updated_at timestamptz`

- `settings` (optional consolidated table)
  - `account_id uuid pk fk accounts`
  - `business_hours jsonb`
  - `ai_voice jsonb`
  - `busy_mode jsonb` (e.g., `enabled`, `extra_wait_seconds`)
  - `theme jsonb`
  - `updated_at timestamptz`

**Knowledge Updates**

- `knowledge_update_requests`
  - `id uuid pk`
  - `account_id uuid fk accounts`
  - `requested_by_user_id uuid fk users`
  - `payload jsonb`
  - `status text` (`queued|processing|done|error`)
  - `created_at timestamptz`

**Internal Notes**

- `internal_notes`
  - `id uuid pk`
  - `call_id text`
  - `author_user_id uuid fk users`
  - `note_md text`
  - `created_at timestamptz`

### 4.3 Views

> Views are the only read targets for the dashboard app (except internal tables like `internal_notes`, `settings`, etc.).

**`calls_v`**

- Fields (simplified):
  - `id text` (`call_id`)
  - `location_id uuid`
  - `account_id uuid` (from join with `locations`)
  - `status text` (`completed|in_progress|failed|missed`, normalized)
  - `call_type text` (`order|reservation|catering|general|other`)
  - `inbound boolean`
  - `from_number text`
  - `to_number text`
  - `started_at timestamptz`
  - `ended_at timestamptz`
  - `duration_seconds int`
  - `recording_url text`
  - `summary_md text`
  - `transcript_md text`

**`orders_v`**

- Fields (simplified):
  - `id uuid`
  - `call_id text`
  - `location_id uuid`
  - `account_id uuid`
  - `total_amount double precision`
  - `subtotal_amount double precision`
  - `tax_amount double precision`
  - `service_charge_amount double precision`
  - `delivery_amount double precision`
  - `status text`
  - `fulfillment_type text`
  - `created_at timestamptz`

**`reservations_v`**

- Fields (simplified):
  - `id uuid`
  - `call_id text`
  - `location_id uuid`
  - `account_id uuid`
  - `guest_count int`
  - `reservation_at timestamptz` (normalized)
  - `avg_spend_per_head_override numeric(10,2)`

### 4.4 Materialized View `mv_metrics_daily`

**Key fields:**

- `account_id uuid`
- `location_id uuid`
- `date date`
- `total_calls int`
- `orders_count int`
- `reservations_count int`
- `total_revenue_orders double precision`
- `total_revenue_res_estimate double precision`
- `minutes_saved double precision`

**Computation:**

- `calls` CTE aggregates calls per day.
- `orders` CTE aggregates order revenue per day.
- `res_est` CTE estimates reservation revenue per day.
- `minutes` CTE calculates minutes saved:
  - `completed_calls * (baseline_seconds / 60)`
  - Baseline from `location_settings` or `account_settings`.

**Refresh strategy:**

- `pg_cron` schedule: every 5 minutes.
- Index on `(account_id, location_id, date)` for fast lookups.

### 4.5 RLS & Security

- RLS enabled on all base tables and views where applicable.
- Policies:
  - Ensure `users.account_id = table.account_id`.
  - Ensure `users.role = 'admin'` (MVP).
- Service role key only used in:
  - Server-side Next.js code (server actions).
  - CI scripts (if needed).
- No service role key on the client.

### 4.6 Authentication & Location Access

The dashboard implements a **two-tier location access pattern** to support both franchise owners (multi-location) and single location managers.

**Authentication Flow:**

1. **User Login** — Magic link authentication via Supabase Auth
2. **Permission Check** — User must have entry in `user_roles_permissions` table
3. **Location Access Determination** — Two-tier pattern:

#### Tier 1: Franchise Owner (Multi-Location Access)

If user has `role_permission_id = 5` (owner permissions):

```typescript
// Step 1: Check if user has an account (franchise owner)
const { data: accountData } = await supabaseAdmin
  .from('accounts')
  .select('account_id, email')
  .eq('email', user.email)
  .maybeSingle();

if (accountData) {
  // Step 2: Fetch ALL locations for this account
  const { data: allLocations } = await supabaseAdmin
    .from('locations')
    .select('location_id, name, certus_notification_email')
    .eq('account_id', accountData.account_id);

  // User can access all locations, switch between them
}
```

**Franchise Owner Features:**
- Access to multiple locations
- Location selector dropdown in UI
- URL-based location selection (`?locationId=123`)
- Default to first location if not specified

#### Tier 2: Single Location Manager

If not a franchise owner or no account found:

```typescript
// Fall back to email-based lookup for single location
const { data: locationResults } = await supabaseAdmin
  .from('locations')
  .select('location_id, name, certus_notification_email')
  .eq('certus_notification_email', user.email)
  .limit(1);

if (locationResults && locationResults.length > 0) {
  selectedLocation = locationResults[0];
  locations = [selectedLocation]; // Only one location
}
```

**Single Location Manager Features:**
- Access to one specific location only
- No location selector (fixed to their location)
- Tied to location via `certus_notification_email` field

**Implementation Files:**
- [app/(dashboard)/overview/page.tsx](../app/(dashboard)/overview/page.tsx:34-89) — Reference implementation
- [app/(dashboard)/call-logs/page.tsx](../app/(dashboard)/call-logs/page.tsx:34-89) — Same pattern
- See [docs/auth/authentication.md](auth/authentication.md) for complete auth documentation

**URL State Management:**
- Franchise owners: `?locationId=123` to select location
- Location persists across page navigation
- Single location managers: no location param needed

---

## 5. Application Architecture (Next.js)

### 5.1 Folder Structure

```bash
/app
  /(dashboard)/overview/page.tsx
  /(dashboard)/call-logs/page.tsx
  /(dashboard)/analytics/page.tsx
  /(settings)/configuration/page.tsx
  layout.tsx
  globals.css
  api/          # server actions (TypeScript modules)
    notes/
    settings/
    analytics/
components/
  layout/
  kpi/
  tables/
  call/
  charts/
  forms/
  ui/           # shadcn components
lib/
  supabase/
    client.ts   # browser client (anon)
    server.ts   # server client (service role)
  queries/
    metrics.ts
    calls.ts
    orders.ts
    reservations.ts
    notes.ts
    settings.ts
  formatters.ts
  validation.ts
supabase/
  schema.sql
  policies.sql
  seed.sql
docs/
  prd.md
  architecture.md
  ux/
  ui/
  decisions/
  agent_logs/
.claude/
  agents/
  commands/
tests/
  unit/
  e2e/          # Playwright
```

### 5.2 Page Responsibilities

**`/overview`**

- Fetches KPI data from `mv_metrics_daily` via `getMetricsDaily`.
- Fetches recent calls from `calls_v` via `listRecentCalls`.
- Renders:
  - 5 KPI tiles.
  - Date range selector.
  - Recent Activities table (with `call_type` first column).
- Row click:
  - Navigates to `/call-logs` with relevant query params (date/location).
  - Possibly includes `callId` in URL to auto-open drawer.

**`/call-logs`**

- Uses search params for filters: date range, `call_type`, `status`, duration bucket, location.
- Fetches:
  - Paginated `calls_v` matching filters.
- Renders:
  - Table with filters.
  - Right-hand drawer when `callId` present.
- Drawer fetches:
  - `getCallDetail(callId)` → call, order, reservation, summary, transcript.
  - `listInternalNotes(callId)`.

**`/analytics`**

- Fetches timeseries from `mv_metrics_daily`.
- Renders:
  - Calls, revenue, minutes saved charts.
  - `call_type` distribution charts (derived from `calls_v` or aggregated from MV).
- Export CSV button (server action sends file).

**`/settings/configuration`**

- Fetches settings from `account_settings`, `location_settings`, `settings`.
- Renders forms for:
  - Business hours.
  - AI voice settings.
  - Busy mode.
- Knowledge update button triggers server action that inserts into `knowledge_update_requests`.
- API keys section reads metadata and allows revoking keys.

### 5.3 Data Access Patterns

**Reads:**

- Server components call typed query helpers in `lib/queries/*`.
- Each helper wraps Supabase client calls and returns typed objects.

**Mutations:**

- Implemented as server actions:  
  `addNote`, `updateSettings`, `requestKnowledgeUpdate`, etc.
- Each action:
  - Validates input with Zod.
  - Uses Supabase server client with service role.
  - Enforces account-level checks (e.g., current user’s account ID).

**Caching & Revalidation:**

- Next.js `revalidate` semantics:
  - KPIs/analytics may be cached for 60–120 seconds.
  - Call Logs & notes: shorter or no cache, use dynamic rendering as needed.

---

## 6. UI & UX Architecture

### 6.1 Design System

Tailwind CSS configured via `tailwind.config.js` from `docs/ui/tokens.json`:

- Color palette (primary, secondary, neutral, semantic).
- Typography scale (Display, H1–H3, Body, Small, Tiny).
- Spacing system (4/8/16/24/32/48 px).
- Radius tokens (e.g., `rounded-lg`, `rounded-xl`).

shadcn/ui components:

- `Button`, `Card`, `Tabs`, `Sheet`/`Drawer`, `Table`, `Input`, `Dialog`, `Select`, `Badge`, `Avatar`.

Custom wrappers for:

- `KpiTile`
- `DataTable`
- `CallDrawer`
- `TranscriptView`
- `ChartWrapper`

### 6.2 Layout & Navigation

**Global layout:**

- Sidebar (navigation).
- Top bar (account/location selector, user info).
- Main content area with responsive layout.

**Navigation:**

- Primary nav items: Overview, Call Logs, Analytics, Configuration.
- Breadcrumbs optional for clarity.

### 6.3 Call Drawer Layout

Drawer splits into:

- Main panel (≈ 2/3 width, 85% height) with tabs:
  - Transcript
  - Summary
  - Order Details (conditional)
  - Internal Chat
- Customer profile panel (≈ 1/3 width, ~42.5% height):
  - Obfuscated phone number.
  - Total calls from this number to this location.
  - Total spend aggregate.

### 6.4 Whimsy & Micro-Interactions

Defined in `docs/ui/interaction_specs.md` by the whimsy-injector agent:

- Button hover: subtle scale + shadow.
- Success actions: small bounce or confetti for first major milestone.
- Loading states: skeletons with subtle shimmer.
- Error states: friendly microcopy and non-blocking animations.

---

## 7. Security, Privacy, and Compliance

### 7.1 Tenant Isolation

RLS policies guarantee:

- User’s `account_id` must match row `account_id`.
- Only `role = 'admin'` users can read/write.
- All queries from Next.js include the user’s account context.

### 7.2 Secrets Management

Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE`
- `DEMO_MODE`

Service role key never exposed to the browser.

### 7.3 PII & Recordings

**Phone numbers:**

- Display obfuscated form by default (e.g., `+27 *** *** 123`).
- Raw numbers not exported in CSV by default.

**Recordings:**

- `recording_url` used for playback in UI.
- Direct links should not be guessable or indexed.
- Retention policy to be defined (open question).

### 7.4 Compliance

- No payment card (PCI) data handled in the dashboard.
- Call recording legalities assumed covered by contracts; UI can hide audio if required.

---

## 8. Testing & Observability

### 8.1 Unit & Component Testing

Framework: Vitest + Testing Library.

Coverage focus:

- KPI tiles logic.
- Query helpers (mocks).
- Data table filtering/pagination.
- Drawer/tab switching.
- Forms (configuration).

### 8.2 E2E Testing

Framework: Playwright.

**Smoke tests (required):**

- **Overview loads**
  - `/overview` renders 5 KPI tiles and a populated Recent Activities table.
- **Call drawer opens**
  - `/call-logs` with seeded data.
  - Clicking a row opens drawer with Transcript tab visible.
- **Configuration persists**
  - `/settings/configuration`:
    - Change Business Hours.
    - Save.
    - Reload and verify changes persisted.

### 8.3 Performance Monitoring

Initial perf measurement via Lighthouse / Playwright trace:

- Overview load time (< 2s).
- Drawer open time (< 400ms).

Future:

- Optional Sentry integration for error tracking.

---

## 9. Environments & Deployment

### 9.1 Environments

**Local**

- Developer Supabase project or Dockerized Postgres matching schema.
- `npm run dev` for app.

**Preview**

- Vercel preview per PR.
- Uses preview Supabase instance or separate schema.

**Production**

- Vercel production deployment.
- Supabase production project with appropriate RLS and secrets.

### 9.2 Deploy Process

1. Developer creates feature branch `feat/<capability>`.
2. Implement feature and tests.
3. Open PR to `main`.
4. GitHub Actions:
   - Run lint, unit tests, e2e.
   - Vercel creates preview deployment.
5. Reviewer approves.
6. Merge to `main` → Vercel deploys to production.

---

## 10. BMAD + Claude Code Agent Architecture

### 10.1 Agent Roster (Local Only)

All agents live in `.claude/agents`:

- `backend-architect.md`
- `frontend-developer.md`
- `feedback-synthesizer.md`
- `performance-benchmarker.md`
- `po-owner.md`
- `rapid-prototyper.md`
- `test-writer-fixer.md`
- `ui-designer.md`
- `ux-researcher.md`
- `whimsy-injector.md`

No global agents are assumed.

### 10.2 Responsibilities & Files

**po-owner**

- Shards `docs/prd.md` and `docs/architecture.md` into:
  - `/epics/*`
  - `/stories/story_X.Y.md`

**backend-architect**

Owns:

- `supabase/schema.sql`
- `supabase/policies.sql`
- `supabase/seed.sql`
- `docs/architecture.md`
- `docs/decisions/*` (architecture ADRs)

**frontend-developer**

Owns:

- `/app`, `/components`, `/lib/queries`, `/lib/formatters`, `/lib/validation`

**ux-researcher**

Owns:

- `docs/ux/page_map.md`
- `docs/ux/user_flows.md`

**ui-designer**

Owns:

- `docs/ui/tokens.json`
- `docs/ui/components_map.md`
- `docs/ui/layout.md`
- `docs/ui/microcopy.md`

**whimsy-injector**

Owns:

- `docs/ui/interaction_specs.md`

**rapid-prototyper**

- Helps scaffold new modules quickly, especially new pages or features.

**test-writer-fixer**

Owns:

- `tests/*`
- Small test-driven fixes in `app/components`.

**performance-benchmarker**

Writes:

- `docs/decisions/performance_*.md` with recommendations.

**feedback-synthesizer**

Writes:

- `docs/decisions/feedback_*.md`
- Suggests updates to `docs/prd.md` via `po-owner`.

### 10.3 File-Backed Context Rules

Agents should:

- Write structured output to files in `docs/`, `supabase/`, `app/`.
- Return short summaries and file references in chat.

Controller (you) coordinates:

- Which agent to call.
- Which files to pass as references.

### 10.4 Commands (`.claude/commands`)

Suggested commands:

- `/shard-docs`
  - Call `po-owner` on `docs/prd.md` and `docs/architecture.md`.
- `/implement-story <id>`
  - Call `frontend-developer` (optionally `rapid-prototyper` first).
- `/design-ux`
  - Call `ux-researcher` to update IA / flows.
- `/design-ui`
  - Call `ui-designer` + `whimsy-injector` for visual + micro-interactions.
- `/write-tests <id>`
  - Call `test-writer-fixer` for story-specific tests.
- `/perf-scan`
  - Call `performance-benchmarker` after big UI/DB changes.
- `/synthesize-feedback`
  - Call `feedback-synthesizer` on user feedback docs.

---

## 11. Onboarding Checklist (Engineer)

1. Install Node 20+, Git, and Claude Code.
2. Clone repo; run `npm install`.
3. Set up env:
   - `cp .env.example .env.local`
   - Add Supabase URL/keys and `DEMO_MODE` if needed.
4. Run DB setup:
   - `npm run db:setup` (applies `schema.sql`, `policies.sql`, `seed.sql`).
5. Run app:
   - `npm run dev`.
6. Run tests:
   - `npm run test` (unit)
   - `npm run e2e` (Playwright)
7. Read:
   - `docs/prd.md`
   - `docs/architecture.md` (this file)
   - `docs/ux/page_map.md`
   - `docs/ui/components_map.md`, `docs/ui/tokens.json`
8. Use Claude Code with local agents:
   - Run `/shard-docs` if starting a new milestone.
   - Pick stories from `/stories/*`.
   - Use `/implement-story`, `/write-tests`, `/design-ui`, etc.

---

## 12. Open Questions & Future Work

**Minutes Saved Baseline Granularity**

- Should vary by account, location, and/or `call_type`.
- Current design allows account/location-level overrides.

**Demo Mode Semantics**

- Read-only vs ephemeral writes (e.g., notes) that are periodically cleared.

**Revenue Business Rules**

- Clarify inclusion of catering and other special cases.
- Confirm treatment of partial orders, refunds.

**Recording Retention**

- Define maximum age for playable recordings.
- Consider toggle per account to show/hide audio.

**Busy Mode Behavior**

- For now: configuration-only.
- Future: define exact interaction with telephony/AI routing.

**Multi-Tenant Advanced Features**

- Billing plans, feature flags, per-location overrides.
- Stripe or other billing integration.
