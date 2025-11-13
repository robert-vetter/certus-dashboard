# Epic 7: Testing & Quality Assurance

**Status:** planned
**Priority:** P0 (required for MVP)
**Timeline:** Ongoing (Weeks 1-6)
**Owner:** Test Writer Fixer + Performance Benchmarker

---

## Overview

Establish comprehensive testing coverage including unit tests, component tests, and end-to-end tests. Ensure performance budgets are met and accessibility standards are maintained throughout the application.

---

## Goals

1. Achieve meaningful unit test coverage for utilities and business logic
2. Write component tests for all UI components
3. Implement 3 required Playwright smoke tests (minimum)
4. Set up performance monitoring and budgets
5. Conduct accessibility audits and fix issues
6. Establish CI/CD testing pipeline
7. Document testing patterns and best practices

---

## Related PRD Sections

- Section 7: Functional & Non-Functional Requirements
- Section 8: KPIs & Measurement
- Section 10: Testing & Quality
- `docs/architecture.md` - Section 8: Testing & Observability

---

## Success Criteria

- [ ] 3 Playwright smoke tests pass on every PR:
  - Overview loads KPI tiles and Recent Activities
  - Call Logs drawer opens with Transcript tab visible
  - Configuration Business Hours persist after reload
- [ ] Unit test coverage for query helpers, formatters, validation
- [ ] Component tests for all design system components
- [ ] Performance budgets met:
  - Overview load < 2s
  - Drawer open < 400ms
  - Charts render < 1s
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] CI pipeline runs all tests on every PR
- [ ] Test documentation in place

---

## Stories

1. **Story 7.1:** Unit Test Setup & Configuration (Vitest)
2. **Story 7.2:** Unit Tests - Query Helpers (metrics, calls, orders, etc.)
3. **Story 7.3:** Unit Tests - Formatters (dates, currency, phone numbers)
4. **Story 7.4:** Unit Tests - Validation Schemas (Zod)
5. **Story 7.5:** Component Tests - Button Suite
6. **Story 7.6:** Component Tests - KPI Tiles
7. **Story 7.7:** Component Tests - Data Table
8. **Story 7.8:** Component Tests - Forms
9. **Story 7.9:** Playwright Setup & Configuration
10. **Story 7.10:** Playwright Smoke Test 1 - Overview Load
11. **Story 7.11:** Playwright Smoke Test 2 - Call Logs Drawer
12. **Story 7.12:** Playwright Smoke Test 3 - Configuration Persistence
13. **Story 7.13:** Performance Benchmarking Setup (Lighthouse/Playwright)
14. **Story 7.14:** Performance Tests - Overview Page
15. **Story 7.15:** Performance Tests - Call Drawer
16. **Story 7.16:** Performance Tests - Analytics Charts
17. **Story 7.17:** Accessibility Audit - Component Library
18. **Story 7.18:** Accessibility Audit - All Pages
19. **Story 7.19:** Accessibility Fixes & Improvements
20. **Story 7.20:** CI Pipeline Integration (lint, test, e2e)
21. **Story 7.21:** Test Documentation & Patterns

---

## Dependencies

- Epic 1: Testing infrastructure setup
- Epic 2-6: Features to test
- All other epics (testing happens alongside development)

---

## Risks & Mitigations

**Risk:** Playwright tests flaky or slow
**Mitigation:** Use best practices (wait for elements, avoid sleeps); run in CI with retries

**Risk:** Performance budgets not met
**Mitigation:** Profile early and often; optimize before features land

**Risk:** Accessibility issues discovered late
**Mitigation:** Run automated audits continuously; manual testing with screen readers

---

## Notes

- Tests should run quickly (< 5 min total in CI)
- Use test seeds for consistent data
- Mock external services (Supabase in unit tests)
- Performance tests should run against seeded data
- Accessibility tests: automated (axe) + manual (keyboard nav, screen reader)
- Document testing patterns in `docs/testing.md` or similar
