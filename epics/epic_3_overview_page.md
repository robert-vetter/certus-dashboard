# Epic 3: Overview Page (Dashboard Landing)

**Status:** planned
**Priority:** P0 (MVP core feature)
**Timeline:** Week 2-3
**Owner:** Frontend Developer

---

## Overview

Build the Overview page as the primary landing page for the dashboard. This page provides at-a-glance KPIs, recent call activity, and quick actions for operators to understand their AI phone system performance.

---

## Goals

1. Display 5 KPI tiles (total calls, revenue, minutes saved, orders, reservations)
2. Implement date range selector (default: last 7 days)
3. Show Recent Activities table with call_type as first column
4. Enable deep-linking to Call Logs with drawer open
5. Add Quick Actions for common configuration tasks
6. Meet performance budget: page load < 2s
7. Implement all interaction patterns from specs

---

## Related PRD Sections

- Section 2.2: US-001 (Overview KPIs), US-002 (Recent Calls)
- Section 6.2: Overview Page
- `docs/ux/page_map.md` - Section 3.2 (Overview)

---

## Success Criteria

- [ ] Page loads in under 2 seconds with seeded data
- [ ] All 5 KPI tiles render with correct data from `mv_metrics_daily`
- [ ] Date range selector works (Today, Last 7 Days, Last 30 Days, Custom)
- [ ] Location filter works (if multi-location account)
- [ ] Recent Activities table shows last 20 calls with all columns
- [ ] Clicking call row navigates to Call Logs with drawer open
- [ ] Quick Actions navigate to correct Configuration sections
- [ ] Empty states show appropriate messages
- [ ] Loading states show skeleton loaders
- [ ] Error states handled gracefully
- [ ] Playwright smoke test passes

---

## Stories

1. **Story 3.1:** Overview Page Layout & Shell
2. **Story 3.2:** KPI Tiles Query & Data Fetching (mv_metrics_daily)
3. **Story 3.3:** KPI Tiles Rendering & Animations
4. **Story 3.4:** Date Range Selector Component
5. **Story 3.5:** Location Filter (if multi-location)
6. **Story 3.6:** Recent Activities Table Query (calls_v)
7. **Story 3.7:** Recent Activities Table Rendering
8. **Story 3.8:** Call Row Click → Navigate to Call Logs with Drawer
9. **Story 3.9:** Quick Actions Section
10. **Story 3.10:** Loading, Empty, and Error States
11. **Story 3.11:** Performance Optimization (< 2s target)
12. **Story 3.12:** Playwright Smoke Test - Overview Load

---

## Dependencies

- Epic 1: Database schema, auth, Next.js scaffold
- Epic 2: KpiTile, DataTable, DatePicker components
- Story 4.7: Call Logs page routing (for deep-link)

---

## Risks & Mitigations

**Risk:** `mv_metrics_daily` query too slow
**Mitigation:** Add database indexes; pre-aggregate data; cache results

**Risk:** Recent Activities table N+1 queries
**Mitigation:** Use single query with joins; fetch all data in one call

**Risk:** Page load time exceeds 2s budget
**Mitigation:** Run performance benchmarker; optimize queries and bundle size

---

## Notes

- This is the default landing page post-auth
- KPI tiles should animate in with stagger (per interaction specs)
- Empty states: "No calls in this period. Try expanding your date range."
- Deep-link format: `/call-logs?callId={id}&date={date}&location={location}`
