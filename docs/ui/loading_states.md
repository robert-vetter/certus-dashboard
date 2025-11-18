# Loading States — Certus Dashboard

**Version:** 1.0
**Last Updated:** 2025-11-18
**Purpose:** Document loading states and skeleton loaders across the dashboard

**Related Docs:**
- [components_map.md](./components_map.md) — Component implementation mapping
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) — Current progress and patterns
- [interaction_specs.md](./interaction_specs.md) — Animation specifications

---

## Overview

The Certus Dashboard implements a **two-tier loading strategy** to provide optimal user experience:

1. **Page-Level Loading** — `loading.tsx` files for route-based async loading
2. **Component-Level Loading** — Skeleton components for async data fetching

This approach ensures users always see content structure immediately, even while data loads.

---

## Page-Level Loading States

Next.js 14 App Router provides automatic loading UI through `loading.tsx` files in route directories.

### Overview Page Loading

**File:** [app/(dashboard)/overview/loading.tsx](../../app/(dashboard)/overview/loading.tsx)

**Layout Structure:**
```tsx
<div className="flex flex-col gap-6 px-8 py-6 flex-1 w-full">
  {/* Header with filters */}
  <div className="flex items-center justify-between">
    <Skeleton className="h-9 w-48 mb-2" />
    <Skeleton className="h-5 w-64" />
  </div>

  {/* Time Filter & Location Selector */}
  <div className="flex items-center justify-between">
    <Skeleton className="h-10 w-96 rounded-lg" />
    <div className="flex items-center gap-4">
      <Skeleton className="h-9 w-48 rounded-lg" />
      <Skeleton className="h-5 w-48" />
    </div>
  </div>

  {/* KPI Section & Quick Actions */}
  <div className="flex items-start gap-6 w-full">
    {/* KPI Tiles Grid */}
    <div className="flex flex-col gap-4 flex-1">
      {/* Top Row - Revenue (larger) + 2 KPIs */}
      <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-4">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>

      {/* Bottom Row - 3 KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>
    </div>

    {/* Quick Actions Card */}
    <div className="flex flex-col w-80 gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
      <Skeleton className="h-6 w-32" />
      <div className="flex flex-col gap-2">
        <QuickActionCardSkeleton />
        <QuickActionCardSkeleton />
        <QuickActionCardSkeleton />
      </div>
    </div>
  </div>

  {/* Recent Activities Table */}
  <RecentActivitiesTableSkeleton />
</div>
```

**Key Features:**
- Matches exact layout structure of actual page
- Uses same grid layout (`grid-cols-[1.3fr_1fr_1fr]` for revenue emphasis)
- Includes all sections: header, filters, KPIs, quick actions, table

### Call Logs Page Loading

**File:** [app/(dashboard)/call-logs/loading.tsx](../../app/(dashboard)/call-logs/loading.tsx)

**Layout Structure:**
```tsx
<div className="flex flex-col gap-6 px-8 py-6 flex-1 w-full">
  {/* Header with filters */}
  <div className="flex items-center justify-between">
    <Skeleton className="h-9 w-32 mb-2" />
    <Skeleton className="h-5 w-72" />
  </div>

  {/* Time Filter & Location Selector */}
  <div className="flex items-center justify-between">
    <Skeleton className="h-10 w-96 rounded-lg" />
    <div className="flex items-center gap-4">
      <Skeleton className="h-9 w-48 rounded-lg" />
      <Skeleton className="h-5 w-48" />
    </div>
  </div>

  {/* Stats Summary */}
  <div className="grid grid-cols-4 gap-4">
    <StatsCardSkeleton />
    <StatsCardSkeleton />
    <StatsCardSkeleton />
    <StatsCardSkeleton />
  </div>

  {/* Calls Table */}
  <RecentActivitiesTableSkeleton />
</div>
```

**Key Features:**
- Shows stats cards grid (Total Calls, Orders, Reservations, Avg Duration)
- Uses `StatsCardSkeleton` (smaller than KPI tiles)
- Table skeleton for call list

---

## Component-Level Skeleton Loaders

**File:** [components/dashboard/skeletons.tsx](../../components/dashboard/skeletons.tsx)

All skeleton components use shadcn's `<Skeleton>` primitive with consistent styling.

### 1. KPICardSkeleton

**Usage:** Overview page KPI tiles

```tsx
export function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-24 mb-2" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}
```

**Represents:**
- Label text (h-5 w-32)
- Icon (h-8 w-8 rounded-lg)
- Value (h-10 w-24)
- Trend indicator (h-4 w-40)

### 2. StatsCardSkeleton

**Usage:** Call Logs page stats summary

```tsx
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-7 w-16" />
    </div>
  );
}
```

**Represents:**
- Label (h-3 w-24)
- Value (h-7 w-16)

**Difference from KPICardSkeleton:**
- Smaller padding (p-4 vs p-6)
- No icon or trend indicator
- Simpler, more compact design

### 3. QuickActionCardSkeleton

**Usage:** Overview page Quick Actions sidebar

```tsx
export function QuickActionCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}
```

**Represents:**
- Icon badge (h-12 w-12 rounded-xl)
- Title (h-5 w-32)
- Description (h-4 w-48)

### 4. TableRowSkeleton

**Usage:** Building block for table loading states

```tsx
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
```

**Represents:**
- Avatar/icon (h-10 w-10 rounded-full)
- Primary text (h-4 w-48)
- Secondary text (h-3 w-32)
- Badge (h-6 w-16 rounded-full)
- Metadata (h-4 w-24)

### 5. RecentActivitiesTableSkeleton

**Usage:** Both Overview and Call Logs pages

```tsx
export function RecentActivitiesTableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <Skeleton className="h-6 w-40" />
      </div>
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

**Represents:**
- Section title (h-6 w-40)
- 5 table rows (default)

**Customization:**
Can adjust row count by changing array length:
```tsx
Array.from({ length: 10 })  // 10 rows instead of 5
```

### 6. CallDetailSheetSkeleton

**Usage:** Call detail drawer while fetching call data

```tsx
export function CallDetailSheetSkeleton() {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Top Banner Skeleton */}
      <Skeleton className="h-32 w-full rounded-xl" />

      {/* Recording Skeleton */}
      <div>
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Conversation Skeleton */}
      <div>
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details Skeleton */}
      <div className="border-t border-gray-200 pt-6">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-24 w-full rounded-lg mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Represents:**
- Top banner (order/reservation/complaint)
- Recording player
- Conversation transcript (4 messages)
- Order details breakdown

**Used In:**
- [components/dashboard/call-detail-sheet.tsx](../../components/dashboard/call-detail-sheet.tsx:113)
- Shown when `isLoading = true` or `call = null`

---

## Loading State Patterns

### Pattern 1: Page-Level Loading (Preferred)

**When to use:** Full page loads (navigation, initial render)

**Implementation:**
1. Create `loading.tsx` file in route directory
2. Match exact layout structure of actual page
3. Use skeleton components for all major sections
4. Next.js automatically shows while route loads

**Example:**
```tsx
// app/(dashboard)/overview/loading.tsx
export default function OverviewLoading() {
  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      {/* Match actual page structure exactly */}
      <KPICardSkeleton />
      <RecentActivitiesTableSkeleton />
    </div>
  );
}
```

**Benefits:**
- Automatic by Next.js App Router
- No manual loading state management
- Consistent across all routes
- Shows instantly on navigation

### Pattern 2: Component-Level Loading

**When to use:** Async data fetching within a page

**Implementation:**
1. Add `isLoading` prop to component
2. Conditional render: skeleton when loading, content when ready
3. Use existing skeleton components

**Example:**
```tsx
export function CallDetailSheet({ call, isLoading }: Props) {
  if (isLoading || !call) {
    return (
      <Sheet open={open}>
        <SheetContent>
          <CallDetailSheetSkeleton />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open}>
      <SheetContent>
        {/* Actual content */}
      </SheetContent>
    </Sheet>
  );
}
```

**Benefits:**
- Fine-grained control
- Can show partial loading (some content ready, some not)
- Good for drawers, modals, dynamic sections

### Pattern 3: Optimistic UI (Future)

**When to use:** User actions that modify data

**Not Yet Implemented** but planned for:
- Adding internal notes
- Updating settings
- Creating reservations

**Proposed Pattern:**
```tsx
const [optimisticNotes, setOptimisticNotes] = useOptimistic(notes);

async function addNote(text: string) {
  // Show immediately
  setOptimisticNotes([...optimisticNotes, { id: 'temp', text }]);

  // Save in background
  await saveNote(text);
}
```

---

## Skeleton Component Design Guidelines

### Consistency Rules

1. **Always match actual component structure**
   - Same padding, borders, shadows
   - Same layout grid/flex
   - Same section divisions

2. **Use realistic dimensions**
   - Text skeletons: Match expected text length
   - Icon skeletons: Match actual icon size
   - Value skeletons: Match number/currency width

3. **Maintain visual hierarchy**
   - Larger skeletons for primary content
   - Smaller skeletons for secondary info
   - Same spacing as actual components

### Styling Conventions

**Base Skeleton Styling:**
- Uses shadcn `<Skeleton>` component
- Default: `bg-gray-200 animate-pulse rounded`
- Consistent animation across all skeletons

**Container Styling:**
```tsx
// Always match the actual component's container
className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
```

**Spacing:**
```tsx
// Match actual component spacing
space-y-6   // Between major sections
gap-4       // Between grid items
mb-2        // Between related elements
```

---

## Performance Considerations

### Skeleton Count

**Keep it reasonable:**
- Overview page: 6 KPI tiles + 5 table rows = ~11 skeletons
- Call Logs page: 4 stats + 5 table rows = ~9 skeletons
- Call detail drawer: ~10-15 skeletons

**Why it matters:**
- Too many skeletons can be slow to render
- 5-10 rows is optimal for tables
- Users don't scroll during loading anyway

### Animation Performance

**Current implementation:**
- Uses CSS `animate-pulse` utility
- GPU-accelerated
- No JavaScript required
- Pauses when tab not visible

**Best practices:**
- Don't add custom animations
- Keep pulse animation consistent
- Let Tailwind handle it

---

## Testing Loading States

### Manual Testing

1. **Throttle network** in browser DevTools
2. Navigate to each page
3. Verify skeleton appears immediately
4. Confirm layout doesn't shift when content loads
5. Check all sections have skeletons

### Key Checks

✅ **Layout Stability** — No content shift when loading completes
✅ **Structure Match** — Skeletons match actual layout exactly
✅ **Timing** — Skeleton shows < 50ms, feels instant
✅ **Completeness** — All major sections have skeleton coverage

---

## Common Mistakes to Avoid

### ❌ Don't: Mismatch Layout

```tsx
// BAD: Different layout than actual page
<div className="flex">  {/* Actual is grid */}
  <KPICardSkeleton />
</div>
```

```tsx
// GOOD: Match exact layout
<div className="grid grid-cols-3 gap-4">
  <KPICardSkeleton />
  <KPICardSkeleton />
  <KPICardSkeleton />
</div>
```

### ❌ Don't: Show Raw Loading Text

```tsx
// BAD: Generic loading text
<div>Loading...</div>
```

```tsx
// GOOD: Structured skeleton
<KPICardSkeleton />
```

### ❌ Don't: Forget Conditional Loading

```tsx
// BAD: No loading state
export function Component({ data }: Props) {
  return <div>{data.value}</div>;  // Crashes if data is null
}
```

```tsx
// GOOD: Handle loading
export function Component({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return <Skeleton className="h-6 w-32" />;
  }
  return <div>{data.value}</div>;
}
```

---

## Future Enhancements

### Planned Improvements

1. **Shimmer Effect** — Add subtle shimmer animation to skeletons
2. **Staggered Appearance** — Skeletons appear with slight delay between rows
3. **Content Hints** — Show faint outlines of actual content types
4. **Partial Loading** — Show some content while rest loads

### Not Planned (Keep It Simple)

- ❌ Complex skeleton animations
- ❌ Per-character loading effects
- ❌ Custom skeleton shapes per component
- ❌ Loading progress bars (unless needed)

---

## Reference

### Files

- [components/dashboard/skeletons.tsx](../../components/dashboard/skeletons.tsx) — All skeleton components
- [app/(dashboard)/overview/loading.tsx](../../app/(dashboard)/overview/loading.tsx) — Overview page loader
- [app/(dashboard)/call-logs/loading.tsx](../../app/(dashboard)/call-logs/loading.tsx) — Call Logs page loader
- [components/ui/skeleton.tsx](../../components/ui/skeleton.tsx) — shadcn base component

### Related Docs

- [components_map.md](./components_map.md) — Component specifications
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) — Implementation progress
- [interaction_specs.md](./interaction_specs.md) — Animation guidelines

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-18 | Documentation | Initial loading states documentation |
