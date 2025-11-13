# Epic 4: Call Logs & Detail Inspection

**Status:** planned
**Priority:** P0 (MVP core feature)
**Timeline:** Week 3-4
**Owner:** Frontend Developer

---

## Overview

Build the Call Logs page with advanced filtering, server-side pagination, and the comprehensive Call Detail Drawer. This is the most complex page in the MVP, allowing deep inspection of individual calls with transcript, order details, summary, and internal team notes.

---

## Goals

1. Implement filterable, paginated call table (server-side)
2. Build right-hand Call Detail Drawer with multi-tab layout
3. Display call transcript with search functionality
4. Show order/reservation details when applicable
5. Implement Internal Chat for team notes with @mentions
6. Add Customer Profile panel with call history and spend
7. Integrate audio playback for recordings
8. Meet performance budget: drawer open < 400ms

---

## Related PRD Sections

- Section 2.2: US-003 (Call Detail Drawer)
- Section 6.3: Call Logs Page
- `docs/ux/page_map.md` - Section 3.2 (Call Logs)

---

## Success Criteria

- [ ] Call table loads with server-side pagination (25 rows/page)
- [ ] All filters work: date range, call type, status, duration, location
- [ ] Drawer opens in < 400ms when clicking call row
- [ ] All 4 tabs render correctly: Transcript, Summary, Order Details, Internal Chat
- [ ] Transcript search works (client-side)
- [ ] Audio player plays recordings (if recording_url present)
- [ ] Internal notes can be posted and display correctly
- [ ] @mentions are highlighted (data only, no notifications)
- [ ] Customer profile panel shows: phone, total calls, total spend
- [ ] Drawer animations follow interaction specs (220ms open, 180ms close)
- [ ] Keyboard navigation works (Tab, Escape, arrow keys)
- [ ] Playwright smoke test passes

---

## Stories

1. **Story 4.1:** Call Logs Page Layout & Shell
2. **Story 4.2:** Filter Panel Component (date, call type, status, duration, location)
3. **Story 4.3:** Calls Data Table Query (calls_v with pagination)
4. **Story 4.4:** Calls Table Rendering & Sorting
5. **Story 4.5:** Server-Side Pagination Logic
6. **Story 4.6:** Search by Phone/Call ID
7. **Story 4.7:** Call Drawer Component Structure & Animations
8. **Story 4.8:** Call Drawer Header & Metadata Display
9. **Story 4.9:** Transcript Tab - Data Fetching & Rendering
10. **Story 4.10:** Transcript Search Functionality
11. **Story 4.11:** Summary Tab - Sentiment & Intents Display
12. **Story 4.12:** Order Details Tab (conditional rendering)
13. **Story 4.13:** Internal Chat Tab - Notes Display
14. **Story 4.14:** Internal Chat - Post Note Functionality
15. **Story 4.15:** Internal Chat - @Mention Parsing & Autocomplete
16. **Story 4.16:** Customer Profile Panel - Data Aggregation
17. **Story 4.17:** Customer Profile Panel - UI Rendering
18. **Story 4.18:** Audio Player Integration
19. **Story 4.19:** Drawer State Management (URL params, deep-linking)
20. **Story 4.20:** Loading, Empty, and Error States for Drawer
21. **Story 4.21:** Performance Optimization (< 400ms drawer open)
22. **Story 4.22:** Playwright Smoke Test - Call Logs & Drawer

---

## Dependencies

- Epic 1: Database views (calls_v, orders_v, reservations_v, internal_notes)
- Epic 2: Drawer, Tabs, Badge, DataTable components
- Epic 3: Overview page for deep-link testing

---

## Risks & Mitigations

**Risk:** Drawer data fetching too slow
**Mitigation:** Fetch all drawer data in single query; cache aggressively

**Risk:** Transcript rendering performance with long conversations
**Mitigation:** Virtualize long transcripts; lazy load audio

**Risk:** @mention autocomplete UX is clunky
**Mitigation:** Use proven library (e.g., tiptap, draft.js); test extensively

**Risk:** Customer profile aggregation query slow
**Mitigation:** Pre-aggregate in database view or MV; add indexes

---

## Notes

- Drawer layout: Main tabs (65% width) + Customer profile (35% width)
- Transcript tab is default active tab
- Audio playback should sync with transcript timestamps (if available)
- Internal notes stored in `internal_notes` table with call_id FK
- Phone numbers obfuscated: `+27 *** *** 123`
- Recording URL should be secure (no public listing)
