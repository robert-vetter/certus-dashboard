# Epic 6: Configuration & Settings

**Status:** planned
**Priority:** P0 (MVP core feature)
**Timeline:** Week 5-6
**Owner:** Frontend Developer

---

## Overview

Build the Configuration page allowing operators to manage business hours, AI voice settings, busy mode, knowledge updates, and API keys. This page provides essential operational controls without requiring developer intervention.

---

## Goals

1. Build Business Hours configuration UI with validation
2. Implement AI Voice selector
3. Create Busy Mode toggle and settings (stub for MVP)
4. Add Knowledge Update request functionality
5. Display API Keys metadata with revoke capability
6. Implement section navigation (hash anchors)
7. Ensure all settings persist correctly

---

## Related PRD Sections

- Section 2.2: US-005 (Configuration)
- Section 6.5: Configuration Page
- `docs/ux/page_map.md` - Section 3.2 (Configuration)

---

## Success Criteria

- [ ] All 5 configuration sections accessible via hash anchors
- [ ] Business Hours: CRUD for per-location hours with validation
- [ ] AI Voice: Selector with voice preview (if samples available)
- [ ] Busy Mode: Toggle and settings (stub, no telephony integration)
- [ ] Knowledge Update: Request button inserts row into knowledge_update_requests
- [ ] API Keys: Table shows metadata, revoke button works
- [ ] Form validation works (client + server side)
- [ ] Save actions show loading states and success/error toasts
- [ ] Settings persist and reload correctly
- [ ] Section navigation smooth scrolls to anchors
- [ ] Playwright smoke test passes (Business Hours persistence)

---

## Stories

1. **Story 6.1:** Configuration Page Layout & Section Navigation
2. **Story 6.2:** Business Hours Section - UI & Form
3. **Story 6.3:** Business Hours - Validation Logic
4. **Story 6.4:** Business Hours - Save Server Action
5. **Story 6.5:** Business Hours - Copy Hours Functionality
6. **Story 6.6:** AI Voice Section - Voice Selector UI
7. **Story 6.7:** AI Voice - Save Server Action
8. **Story 6.8:** Busy Mode Section - Toggle & Settings UI
9. **Story 6.9:** Busy Mode - Save Server Action (stub)
10. **Story 6.10:** Knowledge Update Section - UI & Status Display
11. **Story 6.11:** Knowledge Update - Request Server Action
12. **Story 6.12:** Knowledge Update - Polling for Status Updates
13. **Story 6.13:** API Keys Section - Display Table
14. **Story 6.14:** API Keys - Revoke Functionality
15. **Story 6.15:** Form Validation Framework (Zod schemas)
16. **Story 6.16:** Toast Notifications for Save Actions
17. **Story 6.17:** Loading, Empty, and Error States
18. **Story 6.18:** Playwright Smoke Test - Configuration Persistence

---

## Dependencies

- Epic 1: Database tables (account_settings, location_settings, settings, knowledge_update_requests)
- Epic 2: Form components, toast system, button components
- Epic 3: Overview Quick Actions (for navigation testing)

---

## Risks & Mitigations

**Risk:** Business hours validation edge cases (overnight shifts, holidays)
**Mitigation:** Clear validation rules; test edge cases; provide helpful error messages

**Risk:** Knowledge update requests never processed (n8n not set up)
**Mitigation:** For MVP, just insert row and show status; n8n integration is post-MVP

**Risk:** API key revocation doesn't actually revoke in Supabase
**Mitigation:** Document limitation; for MVP, update metadata only; actual revocation via Supabase console

---

## Notes

- Business hours stored as JSONB in location_settings
- AI voice stored as JSONB in settings table
- Busy mode is configuration stub only - no telephony integration in MVP
- Knowledge update triggers insert into knowledge_update_requests table
- API keys section shows metadata only; actual key generation via Supabase console
- Hash anchors: #business-hours, #ai-voice, #busy-mode, #knowledge, #api-keys
