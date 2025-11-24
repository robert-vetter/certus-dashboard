# Certus Operations Dashboard — Product Requirements Document (PRD)

**Version:** 1.2 (Unified + Design System)
**Previous version:** 1.1 (2025-09-25), 1.0 (2025-09-25)
**Date:** 2025-11-15
**Author:** Certus Product Architect GPT
**Approver:** TBD (you)
**Time zone (analytics & ops):** Africa/Johannesburg
**Design source:** Figma export (Overview page) + design tokens

**Related Documentation:**
- `docs/ui/tokens.json` — Design tokens from Figma
- `docs/ui/components_map.md` — Component implementation mapping
- `docs/ui/component_patterns.md` — Current progress and patterns
- `docs/ui/interaction_specs.md` — Micro-interactions and animations
- `docs/architecture.md` — Technical architecture  

---

## 0) Clarification Summary & Assumptions

This section consolidates and reconciles all clarifications from the previous outline and architecture notes.

- **Initial focus pages (MVP):**
  - **Overview** (main dashboard landing page)
  - **Call Logs**
  - **Analytics**
  - **Configuration** (settings area)

- **Primary stack (implementation constraints):**
  - Frontend: **Next.js 14 (App Router)**, **TypeScript**
  - UI: **Tailwind CSS**, **shadcn/ui**
  - Charts: **recharts** or **visx**
  - Backend: **Supabase** (Postgres, Auth, Storage), **pg_cron** enabled
  - Hosting: **Vercel** (frontend), Supabase Cloud for DB
  - Testing: **Vitest**, **Testing Library**, **Playwright** (min. 3 smoke tests)
  - Observability: basic for now (console, test assertions)

- **Agentic workflow:**
  - **Claude Code** using **BMAD** and **local project agents only**, defined in `.claude/agents` inside this repo.
  - The **only agents used in this project** are:

    - `backend-architect.md`
    - `feedback-synthesizer.md`
    - `frontend-developer.md`
    - `performance-benchmarker.md`
    - `po-owner.md`
    - `rapid-prototyper.md`
    - `test-writer-fixer.md`
    - `ui-designer.md`
    - `ux-researcher.md`
    - `whimsy-injector.md`

  - There are **no global agents** assumed (no reliance on `~/.claude/agents`). All prompts and roles live **locally** in this repository.

- **Data sources & access layer:**
  - Source tables already exist (e.g., `call_logs`, `order_logs`, `reservations`, `locations`, `accounts`).
  - We define canonical **views** (`calls_v`, `orders_v`, `reservations_v`) and a **materialized metrics view** (`mv_metrics_daily`) that the app reads.
  - `pg_cron` is available to refresh the metrics MV regularly.
  - We keep the schema **multi-tenant ready** with `accounts` (orgs) and `locations` (many per account).

- **Auth for demo / production:**
  - **Supabase magic link auth** for real deployments.
  - Optional **demo mode** that bypasses login and operates on a seeded demo `account_id` only.
  - Minimal RBAC: **admin-only** for now (operators = admins).

- **PII / recordings:**
  - Phone numbers are **obfuscated** in UI (e.g., `+27 *** *** 123`).
  - `recording_url` can be surfaced (playback) but not downloadable as raw files in the public client.
  - Call recording legality / consent is assumed to be handled contractually; UI will be configurable to hide recordings if needed.

- **Clarification gate:** PASSED.  
  All open questions are collected in Section 12, but nothing blocks the MVP.

---

## 1) Product Overview

### 1.1 App Name

**Certus Operations Dashboard**

### 1.2 User Problem

Restaurant operators (and internal Certus operations staff) need a **single operational console** to:

- Monitor AI-driven phone interactions across one or more restaurant locations.
- Understand performance at a glance:
  - Number of calls
  - Revenue driven
  - Reservations booked
  - Minutes saved vs. baseline
- Inspect any single call in depth:
  - Transcript
  - Order or reservation details (if applicable)
  - High-level summary and sentiment
  - Internal notes between team members
- Adjust key AI settings (hours, voice, knowledge refresh, busy mode, etc.) **without leaving the app**.

Currently, this information is fragmented across raw call logs, internal tools, and ad hoc reports. The dashboard solves this by offering a **coherent, real-time console** for AI call performance.

---

## 2) Core Use Case & User Stories

### 2.1 Core Use Case

As a **restaurant operator** (or Certus ops agent), I want to:

1. Open the dashboard and immediately see how my AI phone system is performing (calls, revenue, minutes saved).
2. Review recent calls and see at a glance:
   - What type of call it was (`order`, `reservation`, `catering`, `general`).
   - Whether it completed successfully.
   - How long it took.
3. Click any call to open a detailed view where I can:
   - Read the transcript (speaker turns).
   - View order/reservation details when present.
   - See a succinct summary with sentiment and key intents.
   - Add or read internal notes from the team.
4. Analyze historical performance (trends, breakdowns by call_type).
5. Adjust key settings such as business hours, AI voice, and initiate a knowledge base refresh.

### 2.2 Primary User Stories

- **US-001 (Overview KPIs)** ✅ **IMPLEMENTED**
  As an operator, I see 6 KPI tiles with trends for a selected time range, defaulting to **Today**:
  - Total Revenue (emphasized, 30% larger)
  - Total Calls
  - Orders Placed
  - Reservations
  - Upsells
  - Time Saved

  Each tile shows current value and trend comparison (e.g., "+18%")

- **US-002 (Recent Calls)** ✅ **IMPLEMENTED**
  As an operator, I see a modern table of recent activities showing:
  - Time (with health indicator dot)
  - Call type (icon + label)
  - Summary
  - Type
  - Call Health (success/warning/error)
  - From (phone number)
  - Duration

  Clicking a row navigates to Call Logs with that call's details.

- **US-003 (Call Detail Drawer)** ✅ **IMPLEMENTED**
  As an operator, I open a call's drawer and see:
  - Call details with health indicator, phone number, duration, and timestamp
  - Top banner showing order/reservation/complaint highlights
  - Conversation transcript with speaker turns (Certus AI vs Customer)
  - Recording playback (if available)
  - Order details with full breakdown (subtotal, tax, delivery, tip, total)
  - Reservation details with special requests
  - Call summary

- **US-004 (Analytics)** ✅ **IMPLEMENTED**
  As an operator, I see time-series charts and `call_type` breakdowns with date/location filters and I can **export CSV** for the selected range.

  **Implemented Features:**
  - Time range filtering (Today, Yesterday, Last 7 Days, Last Month, All Time)
  - Call type filtering (All Calls, Orders, Reservations, Catering, FAQ)
  - Single-day hourly views with timezone conversion
  - Multi-day daily aggregate views
  - Operating hours overlay on single-day charts
  - Revenue chart with trend indicators
  - Quick stats bar with 6 key metrics
  - CSV export functionality

  **See:** [`docs/analytics_implementation.md`](analytics_implementation.md) and [`docs/analytics_complete_summary.md`](analytics_complete_summary.md)

- **US-005 (Configuration)**  
  As an admin, I manage:
  - Business hours
  - AI voice
  - Busy mode settings (e.g., additional wait time / overflow handling)
  - Knowledge update requests
  - API keys and basic admin configuration

### 2.3 Sample Acceptance Criteria (Gherkin)

Feature: Overview KPIs  
Scenario: Load KPI tiles  
Given seed data exists for the last 7 days  
When I open "/overview"  
Then I see 5 KPI tiles with non-empty values  
And the page renders in under 2 seconds  

Feature: Call Logs Drawer  
Scenario: Inspect call transcript  
Given I filter call logs to a range with known calls  
When I click a row  
Then a right-hand drawer opens to the call panel for that call  
And I can scroll and search within each of the panel's tabs  

Feature: Analytics Export  
Scenario: Export CSV  
Given I select a date range  
When I click "Export CSV"  
Then a CSV downloads containing daily metrics for the range  

---

## 3) Scope of Features

### 3.1 In-Scope (Initial MVP Tranche)

1. **Overview Page** ✅ **COMPLETED**
   - 6 KPI tiles with trend indicators for selected time range
   - Revenue tile is emphasized (30% larger, gradient background)
   - Time filter tabs (All/Today/Last 24h/Yesterday), default: Today
   - Quick Actions sidebar (Update menu, Update hours, View analytics)
   - Recent Activities table with modern grid-based design:
     - Health indicator dots
     - Call type icons
     - Clickable rows that navigate to Call Logs
   - Fully responsive layout
   - Clean, scannable design optimized for restaurant owners

2. **Call Logs Page** ✅ **COMPLETED**
   - ✅ Filterable table with time range selector (Today/Yesterday/Week/All)
   - ✅ Location selector for franchise owners (multi-location support)
   - ✅ Stats summary cards (Total Calls, Orders, Reservations, Avg Duration)
   - ✅ Call type detection using actual database rows (never boolean flags)
   - ✅ Server-side rendering with proper authentication flow
   - ✅ Right-hand sheet drawer with:
     - ✅ Health indicator and call metadata in sticky header
     - ✅ Top banner for orders (revenue), reservations (guest count), complaints
     - ✅ Recording playback with audio controls
     - ✅ Conversation transcript with speaker avatars (AI/Customer)
     - ✅ Order details with complete breakdown (uses `total_amount` from reliable `order_logs`)
     - ✅ Reservation details with special requests
     - ✅ Call summary section
   - ✅ Skeleton loaders for better UX ([loading.tsx](../app/(dashboard)/call-logs/loading.tsx))

3. **Analytics Page** ✅ **COMPLETED**
   - ✅ Time range filtering (Today, Yesterday, Week, Month, All Time)
   - ✅ Call type filtering (All Calls, Orders, Reservations, Catering, FAQ)
   - ✅ Single-day hourly views with timezone conversion
   - ✅ Multi-day daily aggregates
   - ✅ Hero revenue chart with operating hours overlay
   - ✅ Quick stats bar (6 metrics with trends)
   - ✅ CSV export functionality
   - **See:** [`docs/analytics_implementation.md`](analytics_implementation.md) for complete documentation

4. **Configuration Pages**
   - Business Hours (CRUD).
   - AI Voice selection.
   - Busy mode toggles (e.g., extra wait time, overflow behavior stub).
   - Knowledge Update trigger.
   - API key metadata (view + revoke) for automation.

5. **Data & Metrics Layer**
   - Canonical views for calls, orders, reservations.
   - Materialized view `mv_metrics_daily` (with pg_cron refresh) used for KPI & analytics queries.
   - Supabase RLS & settings tables.

6. **Auth & Roles** ✅ **COMPLETED**
   - ✅ Supabase magic link authentication
   - ✅ Full RBAC system with roles and permissions (see [docs/auth/authentication.md](auth/authentication.md))
   - ✅ Two-tier location access pattern:
     - ✅ Franchise owners: Multi-location access with location selector
     - ✅ Single location managers: Fixed to one location via email
   - ✅ Pre-populated user validation (users must exist in `auth.users` and `user_roles_permissions`)
   - ✅ Double permission check (login validation + callback verification)
   - ✅ Session management with HTTP-only cookies and auto-refresh

7. **Testing & Performance**
   - Unit tests (Vitest + Testing Library).
   - 3 Playwright smoke tests.
   - Basic performance budgets: Overview < 2s load, Call drawer < 400ms.

### 3.2 Out-of-Scope (For Now)

- Payments & billing UI.
- Advanced multi-tenant billing.
- Full POS (Point-of-Sale) integration (read/write).
- Notifications & alerting (beyond per-call internal notes; a notifications table may exist but no user-facing notification center yet).
- ML classifier training / tuning UI.
- Advanced RBAC (roles beyond a simple admin).

### 3.3 Now vs Later

- **Now (MVP):**
  - All four primary pages (Overview, Call Logs, Analytics, Configuration).
  - Metrics materialized view and canonical views.
  - Minimal admin auth / demo mode.
  - Basic internal chat and `@` mentions (data model only; no email/push).

- **Later:**
  - Deep analytics drilldowns (per shift, per staff role).
  - Notifications center and alerting.
  - Advanced RBAC and multi-tenant billing configs.
  - Operational runbooks and more advanced observability.
  - Full POS read/write integration.

---

## 3.4) Design System & UI Implementation

### 3.4.1 Design Philosophy

The Certus Operations Dashboard is designed with **restaurant owners** as the primary user:

**Key Principles:**
1. **Revenue First** — Money metrics are always prominent and emphasized
2. **Today Focused** — Default time range is "Today" (not "All time")
3. **Scannable at a Glance** — Critical info visible in 3 seconds or less
4. **Clean & Modern** — Minimal, professional aesthetic with purposeful use of color
5. **Actionable** — Every element should guide toward a clear action

### 3.4.2 Visual Design System

**Typography:**
- **Font Family:** Inter Tight (Google Fonts)
- **Weights:** 300 (light), 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Scale:** Follows design tokens in `docs/ui/tokens.json`

**Color Palette:**
- **Primary Accent:** Red-500 (#EF3450) to Pink-600 gradient
  - Used sparingly for: Revenue emphasis, active nav states, primary actions
- **Success:** Emerald-500/600 (green) for positive metrics and "up" trends
- **Warning:** Amber-500 for attention-needed states
- **Error:** Red-500/600 for failures and "down" trends
- **Neutral:** Gray scale (50-900) for text, backgrounds, borders

**Component Patterns:**
- **Cards:** `bg-white rounded-xl border border-gray-100 shadow-sm`
- **Page Background:** `bg-gray-50`
- **Hover Effects:** Subtle shadow enhancement, 150-200ms transitions
- **Active States:** Gradient backgrounds with shadow indicators

### 3.4.3 Implementation Status

**✅ Completed (Phase 1):**

**Pages:**
- ✅ Overview Page — Fully functional with all components

**Components:**
- ✅ `Sidebar` — Navigation with white theme, active states
- ✅ `DashboardHeader` — Greeting, referral banner, user avatar
- ✅ `KPITile` — Metric display with trends, auto-highlights revenue
- ✅ `QuickActionCard` — Action buttons with gradient badges
- ✅ `RecentActivitiesTable` — Modern grid-based call log preview
- ✅ `FilterTabs` — Time range selector (All/Today/Last 24h/Yesterday)

**Design Decisions:**
1. Revenue tile is 30% larger than others (`grid-cols-[1.3fr_1fr_1fr]`)
2. Revenue always appears first in KPI order
3. Revenue gets automatic gradient highlight background
4. Default time filter is "Today"
5. Metric values are simplified (127 vs "127 Calls")
6. Trend labels are concise ("+18%" vs "+18% vs last week")
7. All KPIs show trend indicators with color coding

**📋 Remaining (Phase 2):**
- 🔲 Call Logs Page — Table + filters + drawer
- 🔲 Analytics Page — Charts + export
- 🔲 Configuration Page — Settings forms

**Implementation Guides:**
- See `docs/ui/component_patterns.md` for reusable patterns
- See `docs/ui/components_map.md` for component specifications

### 3.4.4 Restaurant Owner UX Optimizations

Based on restaurant operator needs, these UX decisions have been implemented:

1. **Revenue Prominence**
   - Larger tile size (30% bigger)
   - Gradient background highlighting
   - First position in layout
   - Bold, large value display

2. **Today-Centric View**
   - "Today" is default time filter (not "All")
   - Recent activities show today's calls prominently
   - Quick metrics focus on current performance

3. **Quick Scanning**
   - Health indicators use color dots (green/amber/red)
   - Trend arrows show direction at a glance
   - Call types have icons for instant recognition
   - No clutter or unnecessary decoration

4. **Actionable Quick Actions**
   - "Update menu" (most common task)
   - "Update hours" (seasonal changes)
   - "View detailed analytics" (deeper insights)

---

## 4) Backend Data Model (Supabase / Postgres)

This section consolidates both the **canonical base tables** (owned/managed by platform) and the **views/materialized views** used by the dashboard.

### 4.1 Canonical Base Entities (Existing)

- `accounts`  
  - `account_id` (UUID, PK)  
  - Other org metadata  

- `users`  
  - `user_id` (UUID, PK)  
  - `account_id` (FK)  
  - `email`, `display_name`, `role` (`admin` for now), etc.  

- `locations`  
  - `location_id` (UUID, PK)  
  - `account_id` (UUID, FK)  
  - `avg_spend_per_head`, etc.  

- `call_logs`  
  - `call_id`  
  - `location_id` (UUID)  
  - `started_at_utc`, `ended_at_utc`  
  - `call_status`  
  - `recording_url`  
  - Additional fields:
    - `inbound` (bool)
    - `customer_number`, `certus_number`
    - `corrected_duration_seconds`
    - `order_made`, `reservation_made`
    - `pathway_tags_formatted`
    - `call_summary`, `transcription_formatted`

- `order_logs`  
  - `order_id` (UUID)  
  - `location_id` (UUID, FK)  
  - `account_id` (UUID, FK)  
  - `call_id` (text)  
  - Monetary fields: `total`, `subtotal`, `total_tax`, `service_charge`, `delivery_charge`  
  - `order_status`  
  - `fulfillment_type`  
  - `created_at`  

- `reservations`  
  - `reservation_id` (UUID)  
  - `location_id` (UUID, FK)  
  - `call_id` (text)  
  - `guest_count`  
  - `reservation_datetime` or `reservation_date` + `reservation_time`  
  - `average_spend_per_head`  
  - `created_at`  

- Optional log tables:
  - `order_updates` (log / audit for orders)
  - `upsells` (recording upsell attempts and outcomes)

### 4.2 Canonical Views (Dashboard Read Layer)

The dashboard does not query the raw tables directly; it uses a set of views to normalize and enrich data.

#### 4.2.1 `calls_v`

- Normalizes call status.
- Computes `call_type` as one of:
  - `order` (if `order_made`)
  - `reservation` (if `reservation_made`)
  - `catering` (if `pathway_tags_formatted` indicates catering)
  - `general` (fallback)
- Computes `duration_seconds` based on corrected duration or `ended_at - started_at`.
- Carries `summary_md` and `transcript_md` from the base table.

Simplified definition (logic only, not including entire SQL annotation):

- `id = call_id::text`
- `location_id = c.location_id::uuid`
- `account_id = l.account_id::uuid`
- `status = normalized call_status ("completed", "in_progress", "failed", etc.)`
- `call_type` derived from flags
- `inbound`, `from_number`, `to_number`
- `started_at`, `ended_at`, `duration_seconds`
- `recording_url`
- `summary_md`, `transcript_md`

#### 4.2.2 `orders_v`

- One row per order.
- Monetary fields normalized to `double precision`:

  - `total_amount`
  - `subtotal_amount`
  - `tax_amount`
  - `service_charge_amount`
  - `delivery_amount`

- Includes `status`, `fulfillment_type`, and `created_at`.

#### 4.2.3 `reservations_v`

- One row per reservation.
- Normalizes reservation datetime into `reservation_at` (timestamptz).
- Carries:

  - `guest_count`
  - `avg_spend_per_head_override` (per-reservation override)
  - Derived `account_id` via join on locations.

### 4.3 Account & Location Settings

Two tables control metrics and revenue estimation knobs.

- `account_settings`
  - `account_id` (PK, FK to accounts)
  - `minutes_saved_baseline_seconds` (default 120)
  - `revenue_mode`:
    - `'orders_only'`
    - `'orders_plus_res_estimate'`
  - `avg_spend_per_head` (account default)
  - `updated_at`

- `location_settings`
  - `location_id` (PK, FK to locations)
  - `minutes_saved_baseline_seconds` (optional override)
  - `avg_spend_per_head` (optional override)
  - `updated_at`

### 4.4 Daily Metrics Materialized View `mv_metrics_daily` + Cron

`mv_metrics_daily` aggregates calls, orders, and reservations into daily metrics per `(account_id, location_id)`.

High-level fields:

- `account_id`, `location_id`, `date`
- `total_calls`
- `orders_count`
- `reservations_count`
- `total_revenue_orders`
- `total_revenue_res_estimate`
- `minutes_saved`

Key logic:

- `total_calls`, `orders_count`, `reservations_count` computed from `calls_v`.
- `total_revenue_orders` from `orders_v` sums of `total_amount`.
- `total_revenue_res_estimate` from reservations:
  - `avg_spend_per_head_override` or `location_settings.avg_spend_per_head` or `account_settings.avg_spend_per_head`.
  - Multiply by `guest_count`.
- `minutes_saved`:
  - `(baseline_seconds / 60) * completed_calls`
  - Baseline from `location_settings` or `account_settings`, default 120 seconds.

The MV is refreshed via `pg_cron` (e.g., every 5 minutes) and indexed on `(account_id, location_id, date)` for fast lookups.

### 4.5 ER Diagram (Conceptual)

Textual ER relationship summary:

- One `account` has many `locations` and many `users`.
- One `location` has many `call_logs`, `order_logs`, and `reservations`.
- One `call_log` may be associated with zero or one `order_log` and zero or one `reservation`.

### 4.6 Sample Data (JSONL)

Example rows:

- calls_v: fields include `id`, `location_id`, `account_id`, `call_type`, `status`, `started_at`, `duration_seconds`.
- orders_v: fields include `id`, `location_id`, `total_amount`, `created_at`.
- mv_metrics_daily: fields include `account_id`, `location_id`, `date`, `total_calls`, `orders_count`, `reservations_count`, `total_revenue_orders`, `total_revenue_res_estimate`, `minutes_saved`.

These sample rows will be included in `supabase/seed.sql` or a JSON seed file to be ingested.

---

## 5) Frontend Tech Stack & Integrations

### 5.1 Frontend Stack

- **Next.js 14 (App Router)** with **TypeScript**.
- **Tailwind CSS** configured with design tokens from `docs/ui/tokens.json`:
  - Colors
  - Typography scale
  - Spacing
  - Radii
- **shadcn/ui** components:
  - Button
  - Card
  - Tabs
  - Drawer/Sheet
  - Table (DataTable)
  - Input
  - Dialog
  - Select
  - Badge
  - Any other necessary primitives (e.g., Avatar for caller or location).
- **Charts** using `recharts` or `visx`.

### 5.2 Backend Integration

- **Supabase**:
  - Postgres (RLS, views, MV).
  - Auth (magic link).
  - Storage (optional for recordings / assets).
- **pg_cron**:
  - Refreshes `mv_metrics_daily` every few minutes.
- External integrations:
  - None required for MVP beyond Supabase.
  - POS and n8n process hooks will be added later (e.g., n8n polls `knowledge_update_requests`).

### 5.3 Hosting & CI/CD

- **Vercel** for hosting the Next.js app.
- **GitHub Actions** for CI:
  - `lint` (ESLint)
  - `test` (Vitest)
  - `e2e` (Playwright)
- Every PR triggers CI and Vercel preview deployment.
- Merges into `main` trigger production deployment (subject to branch protection rules).

### 5.4 Dependencies

Runtime:

- `next`, `react`, `react-dom`, `typescript`
- `tailwindcss`, `postcss`, `autoprefixer`
- `@supabase/supabase-js`
- `zod` (validation)
- `recharts` or `visx`
- `@radix-ui` primitives via shadcn

Dev/test:

- `eslint`, `prettier`
- `vitest`
- `@testing-library/react`
- `playwright`

### 5.5 Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE`
- `DEMO_MODE` (boolean flag)

Stored in Vercel environment; **no service role exposure to the client**.

---

## 6) User Flows & Page Specifications

### 6.1 High-Level User Journey

1. **Auth / Demo**
   - User either logs in via magic link or enters a demo account context.
2. **Overview**
   - User lands on `/overview` and sees KPIs and recent activities.
3. **Call Logs**
   - User navigates to `/call-logs` for detailed browsing and filtering.
   - Clicking a call row opens the call drawer with details.
4. **Analytics**
   - User navigates to `/analytics` to study time series and breakdowns.
5. **Configuration**
   - User navigates to `/settings/configuration` to update hours, AI voice, busy mode, knowledge updates, API keys.

### 6.2 Overview Page

Route: `/overview`

**Core elements:**

- **KPI Tiles**:
  - `total_calls`
  - `total_revenue`
  - `minutes_saved`
  - `orders_placed`
  - `reservations_booked`
- **Date Range Selector**:
  - Default: last 7 days.
  - Options: today, last 7 days, last 30 days, custom range.
- **Recent Activities Table**:
  - Columns:
    - `call_type` (first column, with icon+label)
    - Direction (`inbound` / `outbound`)
    - Business/location
    - `from_number` (obfuscated)
    - Duration
    - Status badge
    - `started_at` localized to Africa/Johannesburg (or user timezone, configurable)
  - Clicking a row:
    - Navigates to `/call-logs` with filters set to that call’s date and location.
    - Opens the RHP drawer focused on that call.

**Quick actions:**

- Change AI Voice (jumps to Configuration).
- Update Business Hours (Configuration).
- Trigger Knowledge Update (Configuration).
- Manage API Keys (Configuration).

**UX details:**

- Skeleton loaders while KPIs and table load.
- Empty state messaging defined in `docs/ui/microcopy.md`.
- Keyboard navigation and ARIA semantics for screen readers.

### 6.3 Call Logs Page

Route: `/call-logs`

**Main table:**

- **Filters:**
  - Date range
  - `call_type` (order, reservation, catering, general, other)
  - Status
  - Duration bucket (e.g., <30s, 30–120s, >120s)
  - Location
- **Columns:**
  - `call_type` (with icon)
  - `started_at`
  - Direction
  - Business/location
  - `from_number` (obfuscated)
  - Duration
  - Status
- Pagination: server-side, page size configurable (e.g., 25).

**Right-hand panel (drawer) layout:**

- **Section 1 (main detail area)**:
  - Occupies approximately 2/3 of the drawer width, ~85% of the screen height.
  - Tabbed interface:
    - Transcript
    - Summary
    - Order Details (if applicable)
    - Internal Chat

- **Section 2 (customer profile area)**:
  - Occupies approximately 1/3 of the drawer width, about half the height of Section 1.
  - Shows:
    - Obfuscated phone number
    - Total calls from this number to this location
    - Total spend at this location (aggregate of orders tied to this number)

**Tabs (Section 1) details:**

- **Transcript Tab:**
  - Renders `transcript_md` from `calls_v`.
  - Shows speaker turns (AI vs caller).
  - Inline search within transcript (client-side).
  - If timestamps are available, clicking a segment can jump audio playback to that point.

- **Order Details Tab (conditional):**
  - Visible if `call_type = 'order'` or order exists.
  - Includes:
    - Items list (if structured items exist).
    - Monetary summary (subtotal, tax, service charge, delivery charge, total).
    - Fulfillment type (delivery, pickup, dine-in).
    - POS order ID or linking field stub.

- **Call Summary Tab:**
  - Uses `summary_md`, `sentiment`, and `intents` from views.
  - Content:
    - 3–6 bullet points summarizing the call.
    - Sentiment pill (e.g., positive / neutral / negative).
    - Chips for detected intents and entities.

- **Internal Chat Tab:**
  - Chat-like call-specific notes between internal team members.
  - Features:
    - Notes stored in `internal_notes` table.
    - Support for `@mention` syntax for users (data-level only; no real notifications yet).
    - Created_at timestamp and note author (from `users` table).
  - Later extension: integrate a notifications table/center.

**Audio playback:**

- If `recording_url` is present, show audio controls:
  - Play/pause, seek.
  - Basic progress bar.
  - Ensure secure access to recording URL (no public listing).

### 6.4 Analytics Page

Route: `/analytics`

**Core charts:**

- Timeseries lines for:
  - Calls per day.
  - Revenue per day (from `total_revenue_orders` and optionally reservations).
  - Minutes saved per day.
- Breakdown (bar or pie) by `call_type`.
- Filters:
  - Date range.
  - Location.

**Export CSV:**

- Server action generating CSV for the selected date range and location(s).
- Columns:
  - `date`, `location_id`, `total_calls`, `orders_count`, `reservations_count`, `total_revenue_orders`, `total_revenue_res_estimate`, `minutes_saved`.
- Download triggers for logged-in users (or demo session).

### 6.5 Configuration Page

Route: `/settings/configuration`

Subsections:

1. **Business Hours**
   - Form to manage per-location hours.
   - Stored as structured JSON in a `settings` table or `location_settings`.
   - Validation on overlapping or invalid hours.

2. **AI Voice**
   - Selector for voice configuration (e.g., voice ID or style).
   - Stored as JSON in `settings`.

3. **Busy Mode & Wait Times**
   - Toggle for “busy mode” / extra wait behavior (concept stub).
   - Example fields:
     - `busy_mode_enabled` (boolean)
     - `extra_wait_seconds` (int)
   - Stored in `settings`.
   - For MVP, this may not wire to telephony but provides UI and data model to support it.

4. **Knowledge Update**
   - Button to request a knowledge refresh.
   - Inserts a row into `knowledge_update_requests`:
     - `org_id`, `requested_by_user_id`, `payload`, `status`, `created_at`.
   - n8n or another automation tool can poll and run the actual process.

5. **API Keys**
   - UI for listing and revoking existing keys.
   - Actual generation of Supabase service roles may be done via Supabase console; the dashboard can store and display metadata only (label, last used, created_at).

---

## 7) Functional & Non-Functional Requirements

### 7.1 Functional Requirements by Page

**Overview:**

- Must query `mv_metrics_daily` aggregated over selected date range.
- Must display all five KPIs.
- Must show Recent Activities table limited to last N calls (configurable, e.g., 20).
- Clicking a call row deep-links into Call Logs with:
  - filters aligned to call’s date and location.
  - call detail drawer open.

**Call Logs:**

- Filter controls must map to SQL WHERE clauses against `calls_v`.
- Server-side paging and sorting must be implemented to handle large datasets.
- Call drawer must:
  - Load transcript and summary for the selected call.
  - Load linked order/reservation data if present.
  - Load internal notes and support creating new ones (server action + Zod validation).
- Internal notes:
  - Insert rows into `internal_notes` with `call_id`, `author_user_id`, `note_md`, `created_at`.
  - `@mentions` are parsed client-side for display only in MVP.

**Analytics:**

- Must query `mv_metrics_daily` by date and location.
- Must support daily grouping even when some days have zero data.
- CSV export must reflect the current filter state.

**Configuration:**

- Business hours changes must persist to `settings`/`location_settings`.
- AI voice selection must persist and be readable by future call routing/AI services.
- Knowledge update requests must create entries in `knowledge_update_requests`.
- API key metadata (if stored) must be viewable and revokable.

### 7.2 Non-Functional Requirements

- **Performance:**
  - Overview:
    - TTFB + render within 2 seconds on a seeded account.
  - Call drawer:
    - Opens within 400 ms after clicking a call row when data is cached or readily available.
  - Charts:
    - Render within 1 second for typical ranges (e.g., 30 days).

- **Availability:**
  - No explicit SLO yet; rely on Vercel + Supabase defaults.
  - Future SLOs can be set once usage is better understood.

- **Security & RLS:**
  - RLS enabled on all tables.
  - Policies:
    - User’s `account_id` must match the row’s `account_id`.
    - User must have role `admin`.
  - Service role used only in server actions and CI tasks.

- **Privacy & Compliance:**
  - Phone numbers obfuscated in UI.
  - `recording_url` used for playback, but downloads and direct indexing discouraged.
  - No PCI card data collected or displayed.
  - Call recording retention policy to be clarified and implemented (Section 12).

- **Accessibility (A11y):**
  - Color contrast meets WCAG AA.
  - Keyboard navigable layout and focus management in drawers and tabs.
  - ARIA labels on interactive controls and audio player.

---

## 8) KPIs & Measurement

- **Functional readiness:**
  - 100% of pages (Overview, Call Logs, Analytics, Configuration) render correctly with seeded data.

- **Testing coverage:**
  - 3 Playwright smoke tests pass on every PR:
    - Overview loads KPI tiles and Recent Activities.
    - Call Logs loads and call drawer opens on row click with Transcript tab visible.
    - Configuration updates Business Hours and change persists after reload.

- **Performance:**
  - Overview load < 2 seconds.
  - Call drawer open < 400 ms under normal conditions.

- **Data & freshness:**
  - No FK orphans in key relations.
  - `mv_metrics_daily` latest date within 5 minutes of current wall clock time (for active accounts).

---

## 9) Implementation Plan (Tech & Repo)

### 9.1 Repo Structure

High-level layout:

- `/app`
  - `/(dashboard)/overview/page.tsx`
  - `/(dashboard)/call-logs/page.tsx`
  - `/(dashboard)/analytics/page.tsx`
  - `/(settings)/configuration/page.tsx`
  - `layout.tsx`
  - `globals.css`
  - `api/` (server actions for notes, settings, exports)
- `/components`
  - Shared components: `KpiTile`, `DataTable`, `CallDrawer`, `TranscriptView`, `Chart`, `Filters`, etc.
  - shadcn component copies.
- `/lib`
  - `supabase.ts` (browser & server clients)
  - `queries/` (typed query helpers)
  - `formatters.ts`
  - `validation.ts` (Zod schemas)
- `/supabase`
  - `schema.sql`, `policies.sql`, `seed.sql`
- `/docs`
  - `prd.md` (this document)
  - `architecture.md`
  - `timeline.md` (project timeline, task tracking, completion status)
  - `ux/`
    - `page_map.md` (complete page inventory and user flows)
    - `user_flows.md` (detailed user journey maps)
  - `ui/`
    - `tokens.json` (design tokens: colors, spacing, typography)
    - `components_map.md` (Figma to code component mapping)
    - `interaction_specs.md` (micro-interactions, animations, whimsy)
    - `layout.md` (layout specifications)
    - `microcopy.md` (UI text, labels, messages)
  - `decisions/`
  - `agent_logs/`
- `.claude/agents`
  - Local agent definitions (`po-owner.md`, `frontend-developer.md`, etc.)
- `.claude/commands`
  - Command definitions for deterministic workflows.

### 9.2 CI & Branching

- **Branching:** trunk-based, feature branches named `feat/<capability>`.
- **Branch protection:**
  - `main` requires:
    - At least one reviewer approval.
    - Passing CI (lint, test, e2e).
- **CI pipeline:**
  - Checkout → install dependencies → run lint → run unit tests → install Playwright deps → run e2e tests.

### 9.3 Task Tracking & Timeline Management

**Timeline Document (`docs/timeline.md`):**
- Central project timeline tracking all tasks, milestones, and deliverables
- Maintained by `po-owner` agent
- Updated whenever tasks are completed or status changes

**Task Completion Workflow:**
1. When any task is completed (design, development, documentation, etc.):
   - Team member or agent marks task as completed
   - `po-owner` updates `docs/timeline.md` with completion status
   - Dependencies and blockers are updated
   - Next tasks in sequence become active

2. **Responsibilities:**
   - **Developer/Designer:** Complete assigned tasks, notify of blockers
   - **PO Owner Agent:** Update timeline, track progress, identify bottlenecks
   - **Team:** Keep timeline current, report actual vs. planned progress

3. **Timeline Structure:**
   - Project phases and milestones
   - Task breakdown with owners and status
   - Dependencies between tasks
   - Completion dates (planned vs. actual)
   - Current blockers and risks

### 9.4 Query & API Contracts

Core query helpers (TypeScript type signatures):

- `getMetricsDaily({ accountId, locationId?, from, to }): Promise<MetricsRow[]>`
- `listRecentCalls({ accountId, locationId?, limit? }): Promise<CallListItem[]>`
- `getCallDetail(callId: string): Promise<CallDetail>`
  (includes joins to orders/reservations, summaries, transcripts, notes)
- `getOrderByCall(callId: string)`
- `getReservationByCall(callId: string)`
- `listInternalNotes(callId: string)`
- `createInternalNote({ callId, userId, noteMd }): Promise<void>`

These signatures are consumed by frontend components and server actions.

---

## 10) Testing & Quality

### 10.1 Unit & Component Tests

- **Components:** KPI tiles, tables, filters, drawer, tabs, charts.
- **Utilities:** formatting helpers (dates, currency), derived metrics.
- Tools: Vitest + Testing Library.

### 10.2 End-to-End Smoke Tests (Playwright)

1. **Overview Render**
   - Load `/overview` with seeded data.
   - Assert:
     - 5 KPI tiles are rendered.
     - Recent Activities table is present and shows at least 1 row.

2. **Call Logs Drawer**
   - Load `/call-logs`.
   - Filter to a known date range with seeded calls.
   - Click a row.
   - Assert:
     - Drawer opens.
     - Transcript tab is active and transcript content is visible.

3. **Configuration Persistence**
   - Load `/settings/configuration`.
   - Modify business hours and save.
   - Reload the page.
   - Assert:
     - Updated business hours are still present.

### 10.3 Performance Sanity

- Use Lighthouse or equivalent to profile:
  - `/overview` on seeded dataset.
  - `/call-logs` with typical filters.
- Ensure we remain below our defined thresholds.

---

## 11) Agent Architecture & BMAD Operating Model

This section defines how **local Claude Code agents** collaborate to implement and extend the dashboard while keeping context manageable.

### 11.1 Agent Roster (Local Only)

All agents live in `.claude/agents` inside this repo. **No global agents** are assumed.

- **`po-owner.md`**
  - Reads `docs/prd.md` and `docs/architecture.md`.
  - Shards work into epics and stories, writing into:
    - `/epics/*`
    - `/stories/story_X.Y.md`
  - Maintains epic/story status fields.
  - **Task Tracking Responsibilities:**
    - Updates `docs/timeline.md` with project timeline and task completion status
    - Marks tasks as "done" when completed by any team member
    - Tracks dependencies, blockers, and progress across all work streams
    - Maintains high-level project status and milestone tracking

- **`backend-architect.md`**  
  - Designs and evolves the database schema, views, MV, and RLS policies.
  - Writes to:
    - `supabase/schema.sql`
    - `supabase/policies.sql`
    - `supabase/seed.sql`
    - `docs/architecture.md`
    - `docs/decisions/*.md` (for architecture decisions)

- **`frontend-developer.md`**  
  - Implements application pages, components, and client/server logic.
  - Writes to:
    - `/app`
    - `/components`
    - `/lib` (queries, formatters, server actions)

- **`ux-researcher.md`**  
  - Produces and updates the IA, user flows, and page maps.
  - Writes to:
    - `docs/ux/page_map.md`
    - `docs/ux/user_flows.md`

- **`ui-designer.md`**  
  - Maintains design tokens and component inventory.
  - Aligns Figma with shadcn components.
  - Writes to:
    - `docs/ui/tokens.json`
    - `docs/ui/components_map.md`
    - `docs/ui/layout.md`
    - `docs/ui/microcopy.md`

- **`whimsy-injector.md`**  
  - Defines micro-interactions, motion specs, hover/focus states, and subtle playful touches.
  - Writes to:
    - `docs/ui/interaction_specs.md`

- **`rapid-prototyper.md`**  
  - Quickly scaffolds features and experiment UIs.
  - Can be chained before `frontend-developer` for fast iterations.

- **`test-writer-fixer.md`**  
  - Writes and improves unit and e2e tests.
  - Fixes small code issues uncovered by tests.
  - Writes to:
    - `tests/*`
    - `app`/`components` (small test-driven fixes)
    - `docs/agent_logs/*` (test coverage notes)

- **`performance-benchmarker.md`**  
  - Profiles hot paths and identifies performance issues (e.g., slow queries, heavy components).
  - Writes to:
    - `docs/decisions/performance_*.md`

- **`feedback-synthesizer.md`**  
  - Aggregates user feedback (internal or external) and synthesizes it into:
    - Prioritized changes
    - UX improvements
    - Future backlog items
  - Writes to:
    - `docs/decisions/feedback_*.md`
    - May propose updates to `docs/prd.md` via `po-owner`.

### 11.2 Directory & File Conventions for Agents

To maintain **file-backed context** and minimize token bloat:

- `/docs`
  - `prd.md` (this PRD)
  - `architecture.md`
  - `ux/` — UX flows, IA, page maps
  - `ui/` — tokens, component inventory, interaction specs, microcopy
  - `decisions/` — ADR-style decision logs
  - `agent_logs/` — short summaries by each agent after major tasks

- `/epics` — epic descriptions generated by `po-owner`.
- `/stories` — story definitions like `story_1.1.md` etc.
- `/supabase` — schema, policies, seed; owned by `backend-architect`.
- `/app`, `/components`, `/lib` — front-end and integration code; owned by `frontend-developer`.

Agents **must**:

- Produce succinct outputs and write them to files.
- Return only short summaries and file references to the controller session.

### 11.3 Slash-Commands & Deterministic Workflows

Local commands defined in `.claude/commands`:

- `/shard-docs`
  - Invokes `po-owner` with references to `docs/prd.md` and `docs/architecture.md`.
  - Output: `/epics/*` and `/stories/*`.

- `/implement-story <id>`
  - Invokes `frontend-developer`.
  - Optionally chains `rapid-prototyper` first for scaffolding.
  - Focused on single story file `stories/story_<id>.md`.

- `/design-ux`
  - Invokes `ux-researcher` to update `docs/ux/page_map.md` and `user_flows.md`.

- `/design-ui`
  - Invokes `ui-designer` (and optionally `whimsy-injector`) to update tokens, components map, and interactions.

- `/write-tests <id>`
  - Invokes `test-writer-fixer` to create or update tests for a specific story or module.

- `/perf-scan`
  - Invokes `performance-benchmarker` to profile and log performance decisions.

- `/synthesize-feedback`
  - Invokes `feedback-synthesizer` to turn scattered notes into actionable backlog items.

These commands provide **deterministic gates**, while the agents perform deep work in their respective domains.

---

## 12) Open Questions & Risks

1. **Minutes Saved Baseline**
   - Currently default is 120 seconds.
   - Question: Should this value differ by account, by location, or by call_type?
   - Action: `backend-architect` and product owner to confirm and update `account_settings` / `location_settings` accordingly.

2. **Demo Mode Behavior**
   - Should demo mode be strictly read-only, or allow ephemeral writes (e.g., notes) that are periodically cleared?
   - Recommended: demo = read-only aside from internal notes on a sandbox account.

3. **Analytics Accuracy**
   - Are there any additional business rules for:
     - Reservation revenue estimation?
     - Inclusion of catering orders?
   - Clarify weighting or special handling, especially for `revenue_mode = 'orders_plus_res_estimate'`.

4. **Recording Retention Policy**
   - How long should `recording_url` remain accessible in UI?
   - Are there legal or contractual requirements affecting how far back historical audio can be played?

5. **Busy Mode Behavior**
   - For MVP, busy mode is mostly a configuration stub.
   - Later: define exactly how busy mode affects routing (e.g., wait times, fallback to human, message content).

6. **Multi-Tenant Evolution**
   - When do we introduce more advanced tenant configs (per-location hours, billing plan, feature flags)?
   - How will this integrate with future billing/stripe systems?

---

## 13) Changelog

- **v1.0 — 2025-09-25**
  - Initial full PRD covering:
    - Pages & features
    - Tech stack
    - Canonical views & MV metrics
    - BMAD/subagents
    - CI/CD
    - Security

- **v1.1 — Unified dashboard PRD (this document)**
  - Consolidated the original PRD outline and the BMAD/agent architecture notes.
  - Updated to use **only local project agents**:
    - `backend-architect`, `frontend-developer`, `feedback-synthesizer`,
      `po-owner`, `rapid-prototyper`, `test-writer-fixer`, `performance-benchmarker`,
      `ui-designer`, `ux-researcher`, `whimsy-injector`.
  - Removed references to unused agents and global agent installs.
  - Clarified page layouts (especially Call Logs drawer and customer profile section).
  - Explicitly captured all Supabase schema, views, MV, and pg_cron behavior.
  - Expanded Configuration to include busy mode stub and knowledge update pipeline.
