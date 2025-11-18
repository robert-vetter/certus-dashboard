# Epic 1: Foundation & Infrastructure Setup

**Status:** planned
**Priority:** P0 (blocking)
**Timeline:** Week 1
**Owner:** Backend Architect + Frontend Developer

---

## Overview

Establish the foundational infrastructure for the Certus Operations Dashboard, including database schema, authentication, core UI framework, and development tooling. This epic must be completed before any feature development can begin.

---

## Goals

1. Set up Supabase project with complete database schema, views, and materialized metrics
2. Implement RLS policies for multi-tenant security
3. Configure Next.js 14 App Router with TypeScript and Tailwind CSS
4. Set up shadcn/ui component library
5. Implement authentication (magic link + demo mode)
6. Configure CI/CD pipeline with GitHub Actions and Vercel
7. Establish testing infrastructure (Vitest + Playwright)

---

## Related PRD Sections

- Section 4: Backend Data Model (Supabase / Postgres)
- Section 5: Frontend Tech Stack & Integrations
- Section 9: Implementation Plan (Tech & Repo)
- Section 10: Testing & Quality

---

## Success Criteria

- [ ] Supabase project provisioned with all tables, views, and materialized views
- [ ] RLS policies enforce account-level isolation
- [ ] `mv_metrics_daily` refreshes via pg_cron every 5 minutes
- [ ] Next.js app runs locally and deploys to Vercel
- [ ] Authentication works with magic links and demo mode
- [ ] CI pipeline passes: lint, unit tests (even if minimal), e2e setup
- [ ] Design tokens from `docs/ui/tokens.json` integrated into Tailwind config
- [ ] shadcn/ui components installed and working

---

## Stories

1. **Story 1.1:** Supabase Project Setup & Base Tables
2. **Story 1.2:** Database Views (calls_v, orders_v, reservations_v)
3. **Story 1.3:** Materialized Metrics View & pg_cron
4. **Story 1.4:** RLS Policies & Security
5. **Story 1.5:** Next.js App Scaffold & Routing Structure
6. **Story 1.6:** Tailwind + Design Tokens Integration
7. **Story 1.7:** shadcn/ui Component Installation
8. **Story 1.8:** Supabase Auth Integration (Magic Link + Demo Mode)
9. **Story 1.9:** CI/CD Pipeline (GitHub Actions + Vercel)
10. **Story 1.10:** Testing Infrastructure (Vitest + Playwright Setup)
11. **Story 1.11:** Environment Variables & Secrets Management
12. **Story 1.12:** Database Seeding for Development & Demo

---

## Dependencies

- None (this is the foundation)

---

## Risks & Mitigations

**Risk:** RLS policies too restrictive, blocking valid queries
**Mitigation:** Test policies with seeded multi-tenant data; document bypass patterns for admin operations

**Risk:** pg_cron refresh fails silently
**Mitigation:** Add monitoring/logging for cron job execution; manual refresh endpoint for debugging

**Risk:** Demo mode accidentally exposes real data
**Mitigation:** Separate demo account with synthetic data; feature flag check in every query

---

## Notes

- Prioritize database schema first (Stories 1.1-1.4) so backend and frontend can work in parallel
- Design tokens integration (Story 1.6) should happen before any UI components are built
- Demo mode is critical for sales/demos; ensure it's robust and read-only
