---

### **Nov 11–12 — Initialization & Setup**

- [x]  Create GitHub repo and set up branch protection
- [x]  Scaffold `.claude/agents` and `/docs` folders (empty structure for now)
- [x]  Initialize **Next.js 14** project with **TypeScript**, **Tailwind**, and **shadcn/ui**
- [x]  Configure `supabase.ts` and `.env.local` with Supabase credentials
- [x]  Connect GitHub to Vercel for automatic deployments
- [x]  Create **agents** directory (`po-owner`, `scrum-master`, `dev`, `qa`, `ux`, `ui`, `test/perf`)

---

### **Nov 13–14 — UX & UI Alignment, Documentation**

- [x]  UX researcher drafts `docs/ux/page_map.md` (Overview, Call Logs, Analytics, Configuration) — outlines full user flow
- [ ]  UI designer maps Figma components into `docs/ui/components_map.md`
- [x]  Whimsy injector adds notes for micro-interactions in `docs/ui/interaction_specs.md`
- [ ]  Check typography, spacing, and color tokens match Tailwind config
- [ ]  Verify shadcn component set (Button, Card, Drawer, Table, Tabs, etc.) is complete and consistent

---

### **Nov 15–16 — Auth & Layout Shell**

- [ ]  Configure **Supabase Auth Magic Link** (email templates, redirects, site URL)
- [ ]  Create `users` table + trigger (auto-create on `auth.users` insert)
- [ ]  Add basic RLS policies — users can only see data from their `account_id`
- [ ]  Build `/app/login/page.tsx` with magic-link form
- [ ]  Add middleware to protect dashboard routes
- [ ]  Create base layout shell (sidebar nav, header, responsive container)
- [ ]  Build `mv_metrics_daily` materialized view for aggregated metrics
- [ ]  Set up pg_cron to refresh every few minutes
- [ ]  Add `account_settings` and `location_settings` tables for configuration, maybe more

---

### **Nov 17–18 — Overview Page**

- [ ]  Scaffold `/app/(dashboard)/overview/page.tsx` with layout + sidebar
- [ ]  Implement **KPI Tiles** (calls, revenue, minutes_saved, etc.)
- [ ]  Add **Recent Activities** table (seeded data + skeleton loaders)
- [ ]  Wire Supabase queries for metrics and recent calls
- [ ]  Write Playwright test: “Overview loads KPIs and recent activities successfully”

---

### **Nov 19–20 — Call Logs Base**

- [ ]  Scaffold `/app/(dashboard)/call-logs/page.tsx`
- [ ]  Build **server-paginated table** with filters (date, call_type, status)
- [ ]  Create right-hand drawer component skeleton
- [ ]  Manage filter state using Zustand
- [ ]  Add `/lib/queries/calls.ts` for paginated fetches

---

### **Nov 21–22 — Call Drawer Tabs**

- [ ]  Implement **Transcript tab** (markdown rendering + search)
- [ ]  Add **Order Details** tab (conditional mock join)
- [ ]  Add **Call Summary** tab (sentiment badges, key markers)
- [ ]  Build **Internal Chat** tab (CRUD via server actions + optimistic updates)
- [ ]  Include **audio player** if `recording_url` is available
- [ ]  Write Playwright test: “Selecting a row opens drawer with Transcript tab”

---

### **Nov 23–24 — Analytics Page (EP3)**

- [ ]  Build `/app/(dashboard)/analytics/page.tsx`
- [ ]  Implement charts: calls/day, revenue/day, minutes_saved/day, and call_type breakdown
- [ ]  Use **recharts** or **visx**, wired to `mv_metrics_daily`
- [ ]  Add **CSV export** button via server action
- [ ]  Ensure charts re-render on filter changes

---

### **Nov 25–26 — Configuration Page (EP4)**

- [ ]  Create `/app/(settings)/configuration/page.tsx`
- [ ]  Implement forms for:
    - [ ]  **Business Hours** — CRUD and persist to Supabase
    - [ ]  **AI Voice Selector** — simple persist only
    - [ ]  **Knowledge Update Trigger** — insert into `knowledge_update_requests`
    - [ ]  **API Keys** — list + generate/revoke (mock if needed)
- [ ]  Add Playwright test: “Config saves Business Hours and persists after reload”

---

### **Nov 27–28 — QA & Testing Pass (EP6)**

- [ ]  Test writer adds unit tests (Vitest) for key components/utilities
- [ ]  Run all Playwright smoke tests
- [ ]  QA reviewer marks reviewed stories as done
- [ ]  Performance benchmarker ensures Overview TTFB + render < 2 s on seed data
- [ ]  Fix any RLS or Supabase policy edge cases

---

### **Nov 29–30 — Polish & Deployment**

- [ ]  Clean up UI (empty states, skeletons, micro-animations)
- [ ]  Verify full **auth flow** (magic link + demo mode)
- [ ]  Add `README.md` with setup steps and onboarding checklist
- [ ]  Merge feature branches into `main` and deploy to Vercel (production)
- [ ]  Smoke-test production build (KPI load, Call Logs, Config saves)
- [ ]  Freeze repo for **Expo / Demo release**