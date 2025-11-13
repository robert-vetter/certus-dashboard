# Stories Directory

This directory contains detailed story files for the Certus Operations Dashboard MVP.

## Story Naming Convention

Stories use the format: `story_<epic>.<number>.md`

Examples:
- `story_1.1.md` - Epic 1, Story 1
- `story_4.7.md` - Epic 4, Story 7

## Sample Stories Created (7 detailed examples)

The following stories have been created as templates/examples:

### Epic 1: Foundation
- **[story_1.1.md](./story_1.1.md)** - Supabase Project Setup & Base Tables
- **[story_1.3.md](./story_1.3.md)** - Materialized Metrics View & pg_cron

### Epic 2: Design System
- **[story_2.3.md](./story_2.3.md)** - KPI Tile Component (with states)

### Epic 3: Overview Page
- **[story_3.2.md](./story_3.2.md)** - KPI Tiles Query & Data Fetching

### Epic 4: Call Logs
- **[story_4.7.md](./story_4.7.md)** - Call Drawer Component Structure & Animations

### Epic 5: Analytics
- **[story_5.5.md](./story_5.5.md)** - Daily Calls Volume Chart

### Epic 7: Testing
- **[story_7.10.md](./story_7.10.md)** - Playwright Smoke Test 1 - Overview Load

## Story Template Structure

Each story follows this structure:

```markdown
# Story <EPIC>.<NUM>: <Title>

**Epic:** <Epic Name>
**Status:** pending | in_progress | completed | blocked
**Assignee:** <Agent or role>
**Dependencies:** <List story IDs>
**Estimated Effort:** S/M/L/XL

## Description
What needs to be built/done

## Acceptance Criteria
- [ ] Testable criterion 1
- [ ] Testable criterion 2
- [ ] ...

## Technical Notes
Implementation details, code examples, references

## Testing Requirements
What needs to be tested and how

## Related Files
Files that will be created or modified
```

## Remaining Stories to Create

**Total stories planned:** 133
**Created as examples:** 7
**Remaining to create:** 126

Use the 7 sample stories as templates to create the remaining stories for each epic.

### Epic 1: Foundation (12 stories)
- ✅ Story 1.1: Supabase Project Setup & Base Tables
- Story 1.2: Database Views (calls_v, orders_v, reservations_v)
- ✅ Story 1.3: Materialized Metrics View & pg_cron
- Story 1.4: RLS Policies & Security
- Story 1.5: Next.js App Scaffold & Routing Structure
- Story 1.6: Tailwind + Design Tokens Integration
- Story 1.7: shadcn/ui Component Installation
- Story 1.8: Supabase Auth Integration (Magic Link + Demo Mode)
- Story 1.9: CI/CD Pipeline (GitHub Actions + Vercel)
- Story 1.10: Testing Infrastructure (Vitest + Playwright Setup)
- Story 1.11: Environment Variables & Secrets Management
- Story 1.12: Database Seeding for Development & Demo

### Epic 2: Design System (17 stories)
- Story 2.1: Design Tokens Implementation
- Story 2.2: Button Component Suite
- ✅ Story 2.3: KPI Tile Component
- Story 2.4: Data Table Component
- Story 2.5: Drawer/Sheet Component
- Story 2.6: Tabs Component
- Story 2.7: Badge Component
- Story 2.8: Form Components
- Story 2.9: Chart Wrapper Component
- Story 2.10: Toast Notification System
- Story 2.11: Loading States
- Story 2.12: Empty & Error State Components
- Story 2.13: Modal/Dialog Component
- Story 2.14: Accessibility Audit & Fixes
- Story 2.15: Dark Mode Implementation
- Story 2.16: Responsive Behavior & Breakpoints
- Story 2.17: Component Documentation

### Epic 3: Overview Page (12 stories)
- Story 3.1: Overview Page Layout & Shell
- ✅ Story 3.2: KPI Tiles Query & Data Fetching
- Story 3.3: KPI Tiles Rendering & Animations
- Story 3.4: Date Range Selector Component
- Story 3.5: Location Filter
- Story 3.6: Recent Activities Table Query
- Story 3.7: Recent Activities Table Rendering
- Story 3.8: Call Row Click Navigation
- Story 3.9: Quick Actions Section
- Story 3.10: Loading, Empty, and Error States
- Story 3.11: Performance Optimization
- Story 3.12: Playwright Smoke Test - Overview

### Epic 4: Call Logs (22 stories)
- Story 4.1: Call Logs Page Layout & Shell
- Story 4.2: Filter Panel Component
- Story 4.3: Calls Data Table Query
- Story 4.4: Calls Table Rendering & Sorting
- Story 4.5: Server-Side Pagination Logic
- Story 4.6: Search by Phone/Call ID
- ✅ Story 4.7: Call Drawer Component Structure & Animations
- Story 4.8: Call Drawer Header & Metadata
- Story 4.9: Transcript Tab - Rendering
- Story 4.10: Transcript Search
- Story 4.11: Summary Tab - Sentiment & Intents
- Story 4.12: Order Details Tab
- Story 4.13: Internal Chat Tab - Display
- Story 4.14: Internal Chat - Post Note
- Story 4.15: Internal Chat - @Mentions
- Story 4.16: Customer Profile - Aggregation
- Story 4.17: Customer Profile - UI
- Story 4.18: Audio Player Integration
- Story 4.19: Drawer State Management
- Story 4.20: Drawer States (Loading, Empty, Error)
- Story 4.21: Performance Optimization
- Story 4.22: Playwright Smoke Test - Call Drawer

### Epic 5: Analytics (16 stories)
- Story 5.1: Analytics Page Layout
- Story 5.2: Filter Controls
- Story 5.3: Key Metrics Summary Cards
- Story 5.4: Time Series Query
- ✅ Story 5.5: Daily Calls Volume Chart
- Story 5.6: Daily Revenue Chart
- Story 5.7: Minutes Saved Chart
- Story 5.8: Call Type Distribution Chart
- Story 5.9: Call Type Trends Chart
- Story 5.10: Performance Metrics Table
- Story 5.11: CSV Export Server Action
- Story 5.12: CSV Export Button
- Story 5.13: Chart Animations & Interactions
- Story 5.14: Loading, Empty, Error States
- Story 5.15: Chart Responsiveness
- Story 5.16: Performance Optimization

### Epic 6: Configuration (18 stories)
- Story 6.1: Configuration Layout & Navigation
- Story 6.2: Business Hours - UI & Form
- Story 6.3: Business Hours - Validation
- Story 6.4: Business Hours - Save Action
- Story 6.5: Business Hours - Copy Functionality
- Story 6.6: AI Voice - Selector UI
- Story 6.7: AI Voice - Save Action
- Story 6.8: Busy Mode - UI
- Story 6.9: Busy Mode - Save Action
- Story 6.10: Knowledge Update - UI & Status
- Story 6.11: Knowledge Update - Request Action
- Story 6.12: Knowledge Update - Status Polling
- Story 6.13: API Keys - Display
- Story 6.14: API Keys - Revoke
- Story 6.15: Form Validation Framework
- Story 6.16: Toast Notifications
- Story 6.17: Loading, Empty, Error States
- Story 6.18: Playwright Smoke Test - Config

### Epic 7: Testing (21 stories)
- Story 7.1: Unit Test Setup
- Story 7.2: Unit Tests - Query Helpers
- Story 7.3: Unit Tests - Formatters
- Story 7.4: Unit Tests - Validation
- Story 7.5: Component Tests - Buttons
- Story 7.6: Component Tests - KPI Tiles
- Story 7.7: Component Tests - Data Table
- Story 7.8: Component Tests - Forms
- Story 7.9: Playwright Setup
- ✅ Story 7.10: Playwright Test 1 - Overview
- Story 7.11: Playwright Test 2 - Call Drawer
- Story 7.12: Playwright Test 3 - Configuration
- Story 7.13: Performance Benchmarking Setup
- Story 7.14: Performance Test - Overview
- Story 7.15: Performance Test - Drawer
- Story 7.16: Performance Test - Charts
- Story 7.17: Accessibility Audit - Components
- Story 7.18: Accessibility Audit - Pages
- Story 7.19: Accessibility Fixes
- Story 7.20: CI Pipeline Integration
- Story 7.21: Test Documentation

### Epic 8: Deployment (15 stories)
- Story 8.1: Production Vercel Setup
- Story 8.2: Production Supabase Setup
- Story 8.3: Environment Variables Config
- Story 8.4: Database Migrations - Production
- Story 8.5: Seed Data - Demo Account
- Story 8.6: CI/CD - Auto-deploy Main
- Story 8.7: CI/CD - Preview Deployments
- Story 8.8: Error Monitoring Setup
- Story 8.9: Analytics/Observability
- Story 8.10: Deployment Documentation
- Story 8.11: User Documentation
- Story 8.12: Onboarding Checklist
- Story 8.13: Final QA - Production
- Story 8.14: Launch Checklist
- Story 8.15: Post-Launch Monitoring Plan

## Story Status Tracking

Story status should be tracked in `/docs/timeline.md`.

**Status values:**
- `pending` - Not yet started
- `in_progress` - Currently being worked on
- `blocked` - Waiting on dependency or decision
- `completed` - Done and tested

**Effort estimates:**
- `S` (Small) - < 1 day
- `M` (Medium) - 1-2 days
- `L` (Large) - 2-3 days
- `XL` (Extra Large) - 3+ days

## How to Use Stories

1. **Read the story** - Understand description and acceptance criteria
2. **Check dependencies** - Ensure prerequisite stories are complete
3. **Implement** - Follow technical notes and acceptance criteria
4. **Test** - Verify all acceptance criteria pass
5. **Update status** - Mark as completed in timeline.md

## Creating New Stories

When creating remaining stories, use this process:

1. **Reference sample stories** - Follow the established pattern
2. **Link to PRD/Architecture** - Connect to specific sections
3. **Define clear acceptance criteria** - Make them testable
4. **Include code examples** - Help developers understand implementation
5. **Specify testing** - What tests are needed and why

## Related Documentation

- **Epics:** `/epics/` - High-level epic descriptions
- **Timeline:** `/docs/timeline.md` - Project timeline and status
- **PRD:** `/docs/prd.md` - Product requirements
- **Architecture:** `/docs/architecture.md` - Technical design
