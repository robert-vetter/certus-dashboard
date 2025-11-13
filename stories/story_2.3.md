# Story 2.3: KPI Tile Component (with loading, empty, error states)

**Epic:** Epic 2 - Design System & UI Components
**Status:** pending
**Assignee:** frontend-developer
**Dependencies:** Story 2.1 (design tokens), Story 1.5 (Next.js scaffold)
**Estimated Effort:** M (1-2 days)

---

## Description

Build a reusable KPI Tile component to display key performance indicators on the Overview page. The component should handle loading, empty, and error states with appropriate animations per interaction specs.

---

## Acceptance Criteria

- [ ] KpiTile component accepts props: label, value, trend, icon, loading, error
- [ ] Default state renders label, value, trend indicator (up/down arrow with percentage)
- [ ] Loading state shows skeleton with shimmer animation
- [ ] Empty state shows "No data" message
- [ ] Error state shows error icon and message
- [ ] Hover interaction: subtle scale (1.01) and shadow increase (120-150ms)
- [ ] Supports optional icon (left side of label)
- [ ] Trend indicator color: green for positive, red for negative, gray for neutral
- [ ] Value formats correctly (currency, number, time based on type prop)
- [ ] Respects `prefers-reduced-motion` (no animations if user prefers)
- [ ] Works in dark mode
- [ ] Accessible: proper ARIA labels, keyboard focusable if clickable

---

## Technical Notes

**Component API:**
```tsx
interface KpiTileProps {
  label: string;
  value: number | string;
  trend?: {
    value: number;  // Percentage change
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  format?: 'currency' | 'number' | 'time';  // How to display value
  loading?: boolean;
  error?: string;
  onClick?: () => void;  // Optional for future drill-down
}
```

**Interaction Specs Reference:**
- Section 4.2: KPI Tiles
- Hover: scale 1.01, shadow increase, 120-150ms ease-out
- Loading: shimmer animation, 1200-1500ms loop
- Fade in: 180-220ms ease-out

**Example Usage:**
```tsx
<KpiTile
  label="Total Calls"
  value={1234}
  trend={{ value: 12.5, direction: 'up' }}
  format="number"
  icon={<Phone className="h-5 w-5" />}
/>

<KpiTile
  label="Total Revenue"
  value={45678.90}
  trend={{ value: -3.2, direction: 'down' }}
  format="currency"
  loading={isLoading}
/>
```

**Styling:**
```tsx
// Base styles (Tailwind)
className="
  rounded-lg border bg-card p-6 shadow-sm
  transition-all duration-150 hover:scale-[1.01] hover:shadow-md
  cursor-pointer
"

// Skeleton loading
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-8 bg-gray-200 rounded w-1/2" />
</div>
```

---

## Testing Requirements

- [ ] Unit test: component renders with all props
- [ ] Unit test: loading state shows skeleton
- [ ] Unit test: error state shows error message
- [ ] Unit test: value formats correctly (currency, number, time)
- [ ] Unit test: trend indicator renders with correct color
- [ ] Visual test: hover state works
- [ ] Accessibility test: ARIA labels present
- [ ] Accessibility test: keyboard focusable if clickable
- [ ] Dark mode test: component renders correctly

---

## Related Files

- `/components/kpi/KpiTile.tsx` (create)
- `/components/kpi/KpiTile.test.tsx` (create)
- `/lib/formatters.ts` (use for value formatting)
- `/docs/ui/interaction_specs.md` (reference)
