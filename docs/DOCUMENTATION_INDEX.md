# Certus Operations Dashboard — Documentation Index

**Last Updated:** 2025-11-24
**Version:** 1.2

---

## Overview

This document provides a complete index of all documentation for the Certus Operations Dashboard project. Use this as your starting point to navigate the documentation.

---

## 1. Core Product Documentation

### 1.1 Product Requirements Document (PRD)
**File:** [`docs/prd.md`](prd.md)
**Purpose:** Complete product specification including features, user stories, technical stack, and implementation requirements
**Status:** Up to date, includes all implemented features

**Key Sections:**
- User stories (US-001 through US-005)
- Tech stack and dependencies
- Data model and database schema
- Page specifications
- BMAD agent architecture

**Recently Updated:**
- ✅ US-004 (Analytics) marked as implemented
- ✅ Analytics page scope section completed

### 1.2 Architecture Documentation
**File:** [`docs/architecture.md`](architecture.md)
**Purpose:** System architecture, component hierarchy, data flow, and technical decisions
**Status:** Up to date with analytics implementation

**Key Sections:**
- High-level system overview
- Data model (Supabase/Postgres)
- Next.js application structure
- Authentication and location access patterns
- BMAD agent architecture

**Recently Updated:**
- ✅ Analytics page implementation details added

### 1.3 Database Schema
**File:** [`docs/database_schema.md`](database_schema.md)
**Purpose:** Complete database table definitions, relationships, and field types
**Status:** Comprehensive reference document

**Contains:**
- All table schemas (call_logs, order_logs, reservations, locations, etc.)
- Field types and constraints
- Relationships and foreign keys
- Materialized views (mv_metrics_daily)

---

## 2. Feature-Specific Documentation

### 2.1 Analytics Implementation ✅ **NEW**
**Files:**
- [`docs/analytics_implementation.md`](analytics_implementation.md) — Detailed technical documentation
- [`docs/analytics_complete_summary.md`](analytics_complete_summary.md) — Executive summary of all work

**Purpose:** Complete documentation of analytics page features, bug fixes, and implementation details

**Covers:**
- Time range filtering (Today, Yesterday, Week, Month, All)
- Call type filtering (never uses boolean flags)
- Single-day vs multi-day logic
- Timezone conversion implementation
- Operating hours overlay
- Revenue calculation fixes
- CSV export functionality

**Bug Fixes Documented:**
- ✅ Revenue multiplication bug (removed incorrect × 100)
- ✅ Timezone conversion (using `Intl.DateTimeFormat`)
- ⚠️ Operating hours display (requires complete database data)

### 2.2 Authentication & Access Control
**Files:**
- [`docs/auth/authentication.md`](auth/authentication.md) — Authentication flow and session management
- [`docs/roles_and_permissions.md`](roles_and_permissions.md) — RBAC system
- [`docs/user_management_access_control.md`](user_management_access_control.md) — User management guide

**Key Topics:**
- Magic link authentication
- Two-tier location access (franchise owners vs single location managers)
- Session management
- Permission checks

### 2.3 User Data Flow
**File:** [`docs/user_data_flow.md`](user_data_flow.md)
**Purpose:** How users authenticate, access locations, and see their data

**Recently Updated:**
- ✅ Analytics page section added with code examples
- ✅ Single-day vs multi-day query patterns
- ✅ Operating hours display logic

**Key Sections:**
- Complete user journey (login → location access → data viewing)
- Database query patterns
- Metrics calculation (mv_metrics_daily)
- Settings and configuration

### 2.4 User Creation Guide
**File:** [`docs/user_creation_guide.md`](user_creation_guide.md)
**Purpose:** Step-by-step guide for creating new users in the system

**Covers:**
- Pre-requisites and requirements
- Database insertion steps
- Testing and verification
- Troubleshooting

---

## 3. UX & Design Documentation

### 3.1 Page Map
**File:** [`docs/ux/page_map.md`](ux/page_map.md)
**Purpose:** Complete inventory of all pages, user flows, and navigation architecture

**Contains:**
- Detailed page specifications (Overview, Call Logs, Analytics, Configuration)
- User journey maps
- Navigation flows
- Performance requirements
- Empty states and error states

**Analytics Section:**
- Should be updated to match implemented features (see issue below)

### 3.2 UI Components
**Files:**
- [`docs/ui/tokens.json`](ui/tokens.json) — Design tokens (colors, spacing, typography)
- [`docs/ui/components_map.md`](ui/components_map.md) — Figma to code component mapping
- [`docs/ui/component_patterns.md`](ui/component_patterns.md) — Reusable UI patterns
- [`docs/ui/interaction_specs.md`](ui/interaction_specs.md) — Micro-interactions and animations
- [`docs/ui/loading_states.md`](ui/loading_states.md) — Loading state patterns

**Purpose:** Design system documentation and component specifications

---

## 4. Development Documentation

### 4.1 Timeline & Task Tracking
**File:** [`docs/timeline.md`](timeline.md)
**Purpose:** Project timeline, task tracking, and completion status
**Maintained By:** PO Owner Agent

**Contains:**
- Project phases and milestones
- Task breakdown with owners and status
- Dependencies between tasks
- Completion dates (planned vs actual)
- Current blockers and risks

### 4.2 Agent Architecture
**Directory:** `.claude/agents/`
**Purpose:** Local BMAD agent definitions

**Agents:**
- `backend-architect.md`
- `frontend-developer.md`
- `ux-researcher.md`
- `ui-designer.md`
- `po-owner.md`
- `test-writer-fixer.md`
- And more...

**See:** PRD Section 11 for complete agent roster and responsibilities

---

## 5. Quick Reference

### 5.1 Finding Information

**"How do I...?"**
- Create a user → [`docs/user_creation_guide.md`](user_creation_guide.md)
- Understand authentication flow → [`docs/auth/authentication.md`](auth/authentication.md)
- Query analytics data → [`docs/analytics_implementation.md`](analytics_implementation.md)
- Find database tables → [`docs/database_schema.md`](database_schema.md)
- Understand page structure → [`docs/ux/page_map.md`](ux/page_map.md)

**"What is...?"**
- A specific feature → [`docs/prd.md`](prd.md) (User Stories section)
- The system architecture → [`docs/architecture.md`](architecture.md)
- How data flows → [`docs/user_data_flow.md`](user_data_flow.md)
- The design system → [`docs/ui/tokens.json`](ui/tokens.json) and [`docs/ui/component_patterns.md`](ui/component_patterns.md)

**"Why does...?"**
- Analytics show certain hours → See timezone conversion in [`docs/analytics_implementation.md`](analytics_implementation.md#timezone-conversion)
- Revenue display in cents → See database schema in [`docs/database_schema.md`](database_schema.md)
- Call type filtering work → See [`docs/analytics_complete_summary.md`](analytics_complete_summary.md#never-use-boolean-flags)

### 5.2 Recently Completed Work

**Analytics Page (November 23-24, 2025):**
- ✅ Revenue calculation bug fixed
- ✅ Timezone conversion improved
- ✅ Operating hours overlay implemented
- ✅ Database query enhanced (timezone and operating_hours_json)
- ✅ Comprehensive documentation created

**See:** [`docs/analytics_complete_summary.md`](analytics_complete_summary.md) for complete summary

---

## 6. Documentation Health

### 6.1 Up to Date ✅
- [`docs/prd.md`](prd.md) — Analytics marked as implemented
- [`docs/architecture.md`](architecture.md) — Analytics section updated
- [`docs/user_data_flow.md`](user_data_flow.md) — Analytics patterns added
- [`docs/analytics_implementation.md`](analytics_implementation.md) — Complete and current
- [`docs/analytics_complete_summary.md`](analytics_complete_summary.md) — Comprehensive summary

### 6.2 Needs Review ⚠️
- [`docs/ux/page_map.md`](ux/page_map.md) — Analytics section should be updated with implemented features (currently shows original specification, not actual implementation)

**Recommended Update:**
The Analytics section in page_map.md should reflect:
- Actual query params (`?range=` and `callType=` not `?dateFrom=`)
- Implemented UI (tabs not dropdowns)
- Hero revenue chart (not multiple separate charts)
- Operating hours overlay feature
- Single-day hourly vs multi-day daily logic

### 6.3 Documentation Gaps (None Critical)
All major features are documented. Future enhancements and planned features are noted in respective documents.

---

## 7. Document Relationships

```
prd.md (Product Requirements)
   ↓
architecture.md (System Design)
   ↓
┌──────────────────────────────────────┐
│                                      │
↓                                      ↓
analytics_implementation.md      user_data_flow.md
   ↓                                   ↓
analytics_complete_summary.md    database_schema.md
                                      ↓
                                  auth/authentication.md
```

**Page-Specific Docs:**
```
ux/page_map.md (All Pages)
   ├── Overview Page → (implemented in code)
   ├── Call Logs Page → (implemented in code)
   ├── Analytics Page → analytics_implementation.md
   └── Configuration Page → (to be implemented)
```

---

## 8. Contributing to Documentation

### 8.1 When to Update Docs
- **After implementing a feature:** Update PRD, architecture, and page_map
- **After fixing a bug:** Document in implementation file or create summary
- **After major refactor:** Update architecture and affected feature docs
- **After user research:** Update UX documentation

### 8.2 Documentation Standards
- Use markdown format
- Include file references with line numbers (e.g., `file.ts:42-51`)
- Add ✅ checkmarks for completed features
- Link to related documentation
- Include code examples for complex logic
- Maintain version history in document header

### 8.3 Document Owners
- **PRD:** Product Owner Agent
- **Architecture:** Backend Architect Agent
- **Analytics Docs:** Frontend Developer + Backend Architect
- **UX Docs:** UX Researcher Agent
- **UI Docs:** UI Designer Agent
- **Auth Docs:** Backend Architect Agent

---

## 9. Deployment Checklist Documentation

Before deploying to production, verify:

1. **Core Docs Current:**
   - [ ] PRD reflects all implemented features
   - [ ] Architecture matches actual implementation
   - [ ] Database schema is up to date

2. **Feature Docs Complete:**
   - [x] Analytics implementation documented
   - [x] Auth flow documented
   - [x] User data flow documented

3. **Known Issues Documented:**
   - [x] Analytics bugs and fixes documented
   - [x] Operating hours data requirements documented
   - [ ] Any open issues noted in relevant docs

---

## 10. External References

**Tech Stack Documentation:**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Recharts: https://recharts.org/en-US/
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/

**Tools:**
- TypeScript: https://www.typescriptlang.org/docs/
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/

---

## 11. Getting Started (For New Team Members)

**Read in this order:**

1. [`docs/prd.md`](prd.md) — Understand what we're building
2. [`docs/architecture.md`](architecture.md) — Understand how it's built
3. [`docs/database_schema.md`](database_schema.md) — Understand the data model
4. [`docs/user_data_flow.md`](user_data_flow.md) — Understand how data flows
5. [`docs/ux/page_map.md`](ux/page_map.md) — Understand the user experience
6. Feature-specific docs as needed (e.g., [`docs/analytics_implementation.md`](analytics_implementation.md))

**Onboarding Checklist:**

- [ ] Read core documentation (items 1-5 above)
- [ ] Set up local development environment
- [ ] Review codebase structure
- [ ] Understand authentication flow
- [ ] Run the application locally
- [ ] Review recent work (analytics implementation)
- [ ] Familiarize with BMAD agent architecture

---

## 12. Contact & Support

**Documentation Questions:**
- Check this index first
- Search docs for keywords
- Review related documents
- Ask team lead or PO owner

**Documentation Improvements:**
- Submit PR with updates
- Tag relevant document owner
- Update this index if adding new docs

---

**Document Maintained By:** Product Owner + Documentation Team
**Last Review:** 2025-11-24
**Next Review:** After next major feature completion
