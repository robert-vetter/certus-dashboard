# Epic 2: Design System & UI Components

**Status:** planned
**Priority:** P0 (blocking feature development)
**Timeline:** Week 1-2
**Owner:** UI Designer + Frontend Developer

---

## Overview

Build the complete design system and reusable UI component library that will power all pages. This includes implementing design tokens, creating core components aligned with shadcn/ui, and establishing interaction patterns from the interaction specs.

---

## Goals

1. Implement all design tokens from `docs/ui/tokens.json` in Tailwind config
2. Build core reusable components (KPI tiles, data tables, drawers, charts, forms)
3. Implement all interaction patterns from `docs/ui/interaction_specs.md`
4. Create component documentation and Storybook (optional)
5. Ensure accessibility compliance (WCAG 2.1 AA)
6. Implement dark mode support
7. Set up responsive breakpoints and mobile adaptations

---

## Related PRD Sections

- Section 5.1: Frontend Stack
- Section 6: User Flows & Page Specifications
- `docs/ui/tokens.json`
- `docs/ui/interaction_specs.md` (v1.1)

---

## Success Criteria

- [ ] All design tokens from tokens.json integrated into Tailwind
- [ ] Core components built and tested: Button, Card, KpiTile, DataTable, Drawer, Tabs, Badge, etc.
- [ ] All animations under 250ms as specified
- [ ] Hover states, focus states, active states implemented per interaction specs
- [ ] Components pass accessibility audit (focus management, ARIA labels, keyboard nav)
- [ ] Dark mode works across all components
- [ ] Responsive behavior tested on mobile, tablet, desktop
- [ ] Component library documented in `docs/ui/components_map.md`

---

## Stories

1. **Story 2.1:** Design Tokens Implementation (colors, typography, spacing, radii)
2. **Story 2.2:** Button Component Suite (Primary, Secondary, Ghost, Destructive)
3. **Story 2.3:** KPI Tile Component (with loading, empty, error states)
4. **Story 2.4:** Data Table Component (server-side pagination, sorting, filtering)
5. **Story 2.5:** Drawer/Sheet Component (Call Detail Drawer structure)
6. **Story 2.6:** Tabs Component (for Call Detail Drawer tabs)
7. **Story 2.7:** Badge Component (status indicators, call types)
8. **Story 2.8:** Form Components (Input, Select, DatePicker, Checkbox)
9. **Story 2.9:** Chart Wrapper Component (recharts integration)
10. **Story 2.10:** Toast Notification System
11. **Story 2.11:** Loading States (skeletons, spinners, shimmer animations)
12. **Story 2.12:** Empty & Error State Components
13. **Story 2.13:** Modal/Dialog Component
14. **Story 2.14:** Accessibility Audit & Fixes
15. **Story 2.15:** Dark Mode Implementation
16. **Story 2.16:** Responsive Behavior & Breakpoints
17. **Story 2.17:** Component Documentation (components_map.md)

---

## Dependencies

- Epic 1 (Stories 1.5, 1.6, 1.7) - Next.js scaffold and shadcn/ui setup

---

## Risks & Mitigations

**Risk:** Design tokens don't match Figma designs (if Figma exists)
**Mitigation:** Review tokens.json with designer; update as needed before implementation

**Risk:** Animations too slow, violating 250ms budget
**Mitigation:** Profile all animations; use performance benchmarker agent

**Risk:** Accessibility issues discovered late
**Mitigation:** Run accessibility audits early (Story 2.14) and continuously

---

## Notes

- All animations must respect `prefers-reduced-motion`
- Focus on speed and clarity over decoration (per interaction specs philosophy)
- Components should be built with composition in mind (reusable, composable)
- Test with keyboard navigation from the start
