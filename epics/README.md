# Epics Directory

This directory contains all 8 epics for the Certus Operations Dashboard MVP.

## Quick Navigation

| Epic | Stories | Timeline | Priority | Status |
|------|---------|----------|----------|--------|
| [Epic 1: Foundation](./epic_1_foundation.md) | 12 | Week 1 | P0 | pending |
| [Epic 2: Design System](./epic_2_design_system.md) | 17 | Week 1-2 | P0 | pending |
| [Epic 3: Overview Page](./epic_3_overview_page.md) | 12 | Week 2-3 | P0 | pending |
| [Epic 4: Call Logs](./epic_4_call_logs.md) | 22 | Week 3-4 | P0 | pending |
| [Epic 5: Analytics](./epic_5_analytics.md) | 16 | Week 4-5 | P0 | pending |
| [Epic 6: Configuration](./epic_6_configuration.md) | 18 | Week 4-5 | P0 | pending |
| [Epic 7: Testing](./epic_7_testing.md) | 21 | Ongoing | P0 | pending |
| [Epic 8: Deployment](./epic_8_deployment.md) | 15 | Week 6 | P1 | pending |

**Total:** 133 stories across 8 epics

## Epic Summaries

### Epic 1: Foundation & Infrastructure Setup
Database, authentication, Next.js scaffold, CI/CD, and testing infrastructure.

**Key Deliverables:**
- Supabase project with all tables, views, and materialized metrics
- RLS policies enforcing multi-tenant security
- Next.js 14 App Router with TypeScript
- CI/CD pipeline (GitHub Actions + Vercel)

### Epic 2: Design System & UI Components
Reusable component library with accessibility and animations under 250ms.

**Key Deliverables:**
- Design tokens integrated into Tailwind
- Core components: Button, KpiTile, DataTable, Drawer, Tabs, Forms
- Dark mode support
- Accessibility compliance (WCAG 2.1 AA)

### Epic 3: Overview Page (Dashboard Landing)
First production-ready page with KPIs and recent activity.

**Key Deliverables:**
- 5 KPI tiles from mv_metrics_daily
- Date range selector and location filter
- Recent Activities table with deep-linking
- Performance: < 2s load time

### Epic 4: Call Logs & Detail Inspection
Most complex page with filtering, pagination, and comprehensive drawer.

**Key Deliverables:**
- Filterable, paginated call table
- Call Detail Drawer with 4 tabs (Transcript, Summary, Order, Chat)
- Customer Profile panel
- Audio playback
- Performance: < 400ms drawer open

### Epic 5: Analytics & Reporting
Charts and data export for historical analysis.

**Key Deliverables:**
- Time-series charts (calls, revenue, minutes saved)
- Call type distribution charts
- CSV export functionality
- Performance: < 1.5s load, < 1s chart render

### Epic 6: Configuration & Settings
Operational controls for business hours, AI voice, and knowledge updates.

**Key Deliverables:**
- Business Hours CRUD with validation
- AI Voice selector
- Busy Mode toggle
- Knowledge Update requests
- API Keys display & revoke

### Epic 7: Testing & Quality Assurance
Comprehensive test coverage running parallel to development.

**Key Deliverables:**
- Unit tests for all business logic
- Component tests for all UI
- 3 Playwright smoke tests (required)
- Performance benchmarking
- Accessibility audits

### Epic 8: Deployment & Documentation
Production launch with monitoring and documentation.

**Key Deliverables:**
- Production Vercel deployment
- Production Supabase with RLS
- Database migrations
- Demo account seeding
- Error monitoring

## Related Documentation

- **Overall Timeline:** `/docs/timeline.md` - Comprehensive 6-week project timeline
- **Planning Summary:** `/PLANNING_SUMMARY.md` - Quick start guide
- **Stories Directory:** `/stories/` - Detailed story files
- **PRD:** `/docs/prd.md` (v1.1) - Product requirements
- **Architecture:** `/docs/architecture.md` (v1.0) - Technical design
- **UX Flows:** `/docs/ux/page_map.md` - User journeys
- **UI Specs:** `/docs/ui/interaction_specs.md` (v1.1) - Animation timings

## How to Use This Directory

1. **Start with Epic 1** - Foundation must be complete before other work
2. **Read each epic file** - Understand goals, success criteria, risks
3. **Review story list** - Each epic links to its stories
4. **Check dependencies** - Some epics depend on others
5. **Track progress** - Update story status in `/docs/timeline.md`

## Epic File Structure

Each epic file contains:
- Overview and goals
- Related PRD sections
- Success criteria (checklist format)
- Complete story list with IDs
- Dependencies on other epics
- Risks and mitigations
- Implementation notes

## Next Steps

1. Review Epic 1: Foundation & Infrastructure Setup
2. Assign stories to team members (backend-architect, frontend-developer)
3. Begin implementation following story acceptance criteria
4. Update timeline.md as stories complete
5. Flag blockers immediately
