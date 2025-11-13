# Epic 5: Analytics & Reporting

**Status:** planned
**Priority:** P0 (MVP core feature)
**Timeline:** Week 4-5
**Owner:** Frontend Developer

---

## Overview

Build the Analytics page with time-series charts, call type breakdowns, and CSV export functionality. This page allows operators to analyze historical performance trends and export data for reporting.

---

## Goals

1. Display time-series charts for daily calls, revenue, and minutes saved
2. Show call type distribution (pie/donut chart)
3. Implement date range and location filters
4. Enable CSV export for selected date range
5. Show performance metrics table with sortable columns
6. Meet performance budget: charts render < 1s

---

## Related PRD Sections

- Section 2.2: US-004 (Analytics)
- Section 6.4: Analytics Page
- `docs/ux/page_map.md` - Section 3.2 (Analytics)

---

## Success Criteria

- [ ] Page loads with 30 days of data in < 1.5s
- [ ] All charts render correctly from mv_metrics_daily
- [ ] Time-series charts: Daily Calls, Daily Revenue, Minutes Saved
- [ ] Call Type Distribution chart (pie or donut)
- [ ] Date range filter updates all charts
- [ ] Location filter works (if multi-location)
- [ ] CSV export downloads correct data
- [ ] Performance metrics table shows daily breakdown
- [ ] Chart tooltips show on hover with correct data
- [ ] Empty states show when no data available
- [ ] Charts respect dark mode
- [ ] Playwright smoke test passes (if applicable)

---

## Stories

1. **Story 5.1:** Analytics Page Layout & Shell
2. **Story 5.2:** Filter Controls (Date Range, Location)
3. **Story 5.3:** Key Metrics Summary Cards
4. **Story 5.4:** Time Series Query (mv_metrics_daily aggregation)
5. **Story 5.5:** Daily Calls Volume Chart (recharts/visx)
6. **Story 5.6:** Daily Revenue Chart (stacked area/line)
7. **Story 5.7:** Minutes Saved Chart (bar chart)
8. **Story 5.8:** Call Type Distribution Chart (pie/donut)
9. **Story 5.9:** Call Type Trends Chart (stacked bar)
10. **Story 5.10:** Performance Metrics Table
11. **Story 5.11:** CSV Export Server Action
12. **Story 5.12:** CSV Export Button & Download Trigger
13. **Story 5.13:** Chart Animations & Interactions (per specs)
14. **Story 5.14:** Loading, Empty, and Error States
15. **Story 5.15:** Chart Responsiveness (mobile, tablet)
16. **Story 5.16:** Performance Optimization (< 1.5s load, < 1s chart render)

---

## Dependencies

- Epic 1: mv_metrics_daily materialized view
- Epic 2: Chart wrapper component, date picker, button components
- Story 1.3: Materialized metrics view must be working

---

## Risks & Mitigations

**Risk:** Chart library too large, impacts bundle size
**Mitigation:** Use tree-shaking; consider lightweight alternative (visx vs recharts)

**Risk:** CSV export times out for large date ranges
**Mitigation:** Limit export to max 365 days; stream CSV generation

**Risk:** Charts don't handle sparse data well (missing days)
**Mitigation:** Fill missing dates with zero values in query

---

## Notes

- Use `mv_metrics_daily` for all aggregations
- CSV filename format: `certus-analytics-{account}-{date-range}-{timestamp}.csv`
- Chart colors should match design tokens
- Tooltips should show formatted values (currency, time, etc.)
- Consider caching chart data for 60-120 seconds
