# Implementation Status — Certus Dashboard

**Version:** 1.0
**Last Updated:** 2025-11-15
**Purpose:** Track what's been implemented vs what's planned

---

## ✅ Completed: Overview Page

### Components Implemented

#### Layout Components
- ✅ **Sidebar** (`/components/layout/sidebar.tsx`)
  - White background with Certus logo
  - Navigation items: Home, Analytics, Call Logs, Settings
  - Active state with gradient background + indicator bar
  - Fully responsive

- ✅ **Dashboard Header** (`/components/layout/dashboard-header.tsx`)
  - Greeting and subtitle
  - Referral banner ("Earn £200")
  - User avatar with initials

- ✅ **Dashboard Layout** (`/app/(dashboard)/layout.tsx`)
  - Sidebar + Header + Main content structure
  - Gray-50 background for content area

#### Dashboard Components
- ✅ **KPI Tile** (`/components/dashboard/kpi-tile.tsx`)
  - Icon + Label + Value display
  - Trend indicators (up/down arrows with percentage)
  - Revenue tile gets automatic highlighting
  - Gradient backgrounds for revenue emphasis
  - Hover effects

- ✅ **Quick Action Card** (`/components/dashboard/quick-action-card.tsx`)
  - Icon with gradient badge
  - Title + Description
  - Optional status badge
  - Hover animations

- ✅ **Recent Activities Table** (`/components/dashboard/recent-activities-table.tsx`)
  - Grid-based layout (not traditional table)
  - Health indicators (success/warning/error)
  - Type icons and labels
  - Clickable rows
  - Modern styling with hover states

### Pages Implemented
- ✅ **Overview Page** (`/app/(dashboard)/overview/page.tsx`)
  - Time filter tabs (All, Today, Last 24 hours, Yesterday)
  - 6 KPI tiles in 2 rows
  - Revenue tile is 30% larger
  - Quick Actions sidebar
  - Recent Activities table
  - Default filter: "Today"

### Design System

#### Typography
- ✅ **Font:** Inter Tight (Google Fonts)
- ✅ **Weights:** 300, 400, 500, 600, 700
- ✅ **Variable font** properly configured

#### Colors
- ✅ **Primary:** Red-500 to Pink-600 gradient
- ✅ **Accent colors:** Emerald (good), Amber (warning), Red (error)
- ✅ **Neutral palette:** Gray scale for text and backgrounds
- ✅ **Status colors:** Green, Yellow for health indicators

#### Styling Patterns
- ✅ **Rounded corners:** xl (12px) for cards
- ✅ **Shadows:** Subtle shadows with hover enhancement
- ✅ **Borders:** 1px gray-100 borders
- ✅ **Transitions:** 150-200ms for smooth interactions
- ✅ **Gradients:** Used sparingly for emphasis (revenue, nav active state)

### Data Layer
- ✅ **Mock Data** (`/lib/mock-data.ts`)
  - KPI data with trends
  - Quick actions
  - Recent activities
  - Time filter options
  - Properly typed interfaces

### Restaurant Owner Focus

✅ **Implemented Improvements:**
1. Revenue is first and 30% larger
2. Default view is "Today" (not "All")
3. Simplified data displays (127 calls, not "127 Calls")
4. Cleaner trend labels ("+18%" not "+18% vs last week")
5. Revenue tile highlighted with gradient background
6. Trend indicators on all KPIs
7. Practical quick actions

---

## ✅ Completed: Call Logs Page

### Components Implemented

#### Call Logs Components
- ✅ **Call Detail Sheet** (`/components/dashboard/call-detail-sheet.tsx`)
  - Drawer/sheet implementation with shadcn Sheet component
  - Sticky header with phone number, health indicator, metadata
  - Conditional top banners (Order/Reservation/Complaint with gradient backgrounds)
  - Audio recording playback
  - Conversation transcript with speaker avatars
  - Order details with reliable `total_amount` usage
  - Reservation details with special requests
  - Call summary section
  - Skeleton loader for async loading states

- ✅ **Call Logs Client** (`/app/(dashboard)/call-logs/call-logs-client.tsx`)
  - Client-side state management (filters, selected call)
  - Location selector for multi-location franchise owners
  - Time range filter tabs (Today/Yesterday/Week/All)
  - Stats summary cards (Total Calls, Orders, Reservations, Avg Duration)
  - Call list table with clickable rows
  - Opens CallDetailSheet in drawer on row click

- ✅ **Skeleton Components** (`/components/dashboard/skeletons.tsx`)
  - `CallDetailSheetSkeleton` for call drawer loading
  - `StatsCardSkeleton` for stats cards
  - `RecentActivitiesTableSkeleton` for table loading
  - `KPICardSkeleton` for KPI tiles
  - Consistent shimmer animations

### Pages Implemented
- ✅ **Call Logs Page** (`/app/(dashboard)/call-logs/page.tsx`)
  - Server-side rendering with authentication
  - Two-tier location access (franchise owner vs single location)
  - Batch fetches for call type determination (Set-based O(1) lookups)
  - Pre-fetches selected call data if `callId` in URL
  - Time range filtering (Today/Yesterday/Week/All)
  - Calls table with health indicators and metadata
  - Deep linking support (`?callId=123` auto-opens drawer)

- ✅ **Call Logs Loading State** (`/app/(dashboard)/call-logs/loading.tsx`)
  - Skeleton loader for page-level async loading
  - Matches actual page layout structure

### Data Patterns

#### Call Type Detection (Never Use Boolean Flags!)
```typescript
// ✅ CORRECT: Check actual rows in related tables
const callIds = calls?.map(c => c.id) || [];
const [allOrders, allReservations] = await Promise.all([
  supabaseAdmin.from('order_logs').select('call_id').in('call_id', callIds),
  supabaseAdmin.from('reservations').select('call_id').in('call_id', callIds)
]);

// Create lookup sets for O(1) access
const orderCallIds = new Set(allOrders.data?.map(o => o.call_id) || []);
const reservationCallIds = new Set(allReservations.data?.map(r => r.call_id) || []);

// Determine type
if (orderCallIds.has(call.id)) displayType = 'order';
else if (reservationCallIds.has(call.id)) displayType = 'reservation';
else if (call.pathway_tags_formatted?.includes('catering')) displayType = 'catering';
else displayType = 'inquiry';
```

#### Order Total Calculation (Always Reliable!)
```typescript
// ✅ CORRECT: Use total_amount directly from order_logs
const displayTotal = order.total_amount || 0;
const formattedTotal = `$${(displayTotal / 100).toFixed(2)}`;

// ❌ WRONG: Never calculate from components
const calculatedTotal = (order.subtotal || 0) + (order.total_tax || 0) + ...;
```

### Database Reliability Rules

#### ✅ Fully Reliable Tables
- `order_logs` — All fields including `total_amount`, `subtotal`, `total_tax`, etc.
- `reservations` — All fields
- `complaints` — All fields
- `upsells` — All fields

#### ❌ Unreliable Fields
- `call_logs.order_made` — Often false even when orders exist
- `call_logs.reservation_made` — Often false even when reservations exist
- `call_logs.order_completed` — Unreliable status

**Best Practice:** Always query related tables directly, never trust boolean flags in `call_logs`.

### Authentication & Location Access

#### Two-Tier Pattern Implemented
1. **Franchise Owner** (`role_permission_id = 5`):
   - Check email in `accounts` table
   - If found, fetch ALL locations for that account
   - Show location selector dropdown
   - URL param for location selection (`?locationId=123`)

2. **Single Location Manager**:
   - Query `locations.certus_notification_email = user.email`
   - User gets ONE fixed location
   - No location selector shown

**Implementation:** Both `/overview` and `/call-logs` pages use identical pattern

---

## 📋 Remaining Pages

### Analytics Page (`/app/(dashboard)/analytics/page.tsx`)
**Status:** Not started

**Required Components:**
- [ ] Chart components (likely Recharts or similar)
  - [ ] Line chart for trends over time
  - [ ] Bar chart for call type distribution
  - [ ] Revenue chart
  - [ ] Minutes saved chart
- [ ] Date range selector
- [ ] Export CSV button
- [ ] Metric cards/summary

**Data Needs:**
- `mv_metrics_daily` materialized view
- Aggregated data from `calls_v`

### Configuration Page (`/app/(dashboard)/configuration/page.tsx`)
**Status:** Not started

**Required Components:**
- [ ] Settings form sections
- [ ] Business hours editor
- [ ] AI voice settings
- [ ] Busy mode toggle/config
- [ ] Knowledge update button
- [ ] API keys management
- [ ] Location settings (if multi-location)

**Data Needs:**
- `account_settings` table
- `location_settings` table
- `settings` table (jsonb)
- `knowledge_update_requests` table

---

## 🎨 Reusable Patterns for Remaining Pages

### Use These Components Everywhere
1. **KPITile** - For any metric display
2. **QuickActionCard** - For action buttons
3. **Sidebar** - Already global via layout
4. **DashboardHeader** - Already global via layout

### Design Patterns to Follow

#### Card Pattern
```tsx
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
  {/* Content */}
</div>
```

#### Section Header Pattern
```tsx
<h2 className="text-lg font-semibold text-gray-900 mb-4">
  Section Title
</h2>
```

#### Filter Tabs Pattern
```tsx
<div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
  <button className={active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}>
    Filter Option
  </button>
</div>
```

#### Table/Grid Pattern
```tsx
<div className="grid grid-cols-[...] gap-4">
  {/* Use grid, not traditional table, for modern look */}
</div>
```

#### Gradient Accent Pattern (use sparingly)
```tsx
// For emphasis or active states only
className="bg-gradient-to-br from-red-500 to-pink-600"
```

---

## 🔧 Technical Patterns

### Data Fetching
```tsx
// Server component pattern
export default async function Page() {
  const data = await fetchData(); // Direct DB call in server component
  return <ClientComponent data={data} />;
}
```

### Client Interactivity
```tsx
'use client';

export function InteractiveComponent() {
  const [state, setState] = useState();
  // Only use 'use client' when needed
}
```

### Mock Data Pattern
```tsx
// Continue using /lib/mock-data.ts structure
export interface DataType {
  id: string;
  // ... fields
}

export const mockData: DataType[] = [
  // ... data
];
```

---

## 📊 Data Priorities for Next Steps

### 1. Call Logs Implementation Priority
Most important for restaurant owners:

1. **Table view** with essential columns:
   - Time
   - Call type (icon + label)
   - Summary
   - Duration
   - Status/Health

2. **Filters** (in order of importance):
   - Date range
   - Call type (order/reservation/other)
   - Status (completed/failed)

3. **Call Drawer** (tabs in priority order):
   - Summary (quick overview)
   - Transcript (full details)
   - Order Details (if order)
   - Internal Notes (team collaboration)

### 2. Analytics Page Priority
Focus on actionable insights:

1. **Revenue over time** (line chart)
2. **Call volume** (daily/weekly)
3. **Success rate** (percentage)
4. **Call type breakdown** (pie/bar chart)

Lower priority:
- Minutes saved (interesting but not critical)
- Complex cross-filters
- Export features

### 3. Configuration Page Priority
Keep it simple:

1. **Menu/knowledge updates** (highest value)
2. **Business hours** (operational necessity)
3. **Location settings** (if multi-location)

Lower priority:
- AI voice customization
- Advanced settings
- API keys (unless integrations are active)

---

## 🎯 Design Principles to Maintain

1. **Restaurant Owner First**
   - Revenue and money metrics always prominent
   - "Today" is the default time range
   - Quick actions are practical, not clever
   - Data is scannable at a glance

2. **Clean & Modern**
   - White backgrounds
   - Subtle shadows
   - Rounded corners (xl)
   - Ample whitespace
   - Gray-50 page backgrounds

3. **Purposeful Color**
   - Red/Pink gradients ONLY for:
     - Revenue emphasis
     - Active navigation states
     - Primary action buttons
   - Green for success/good metrics
   - Amber for warnings/attention needed
   - Gray for neutral/secondary elements

4. **Trend Information**
   - Always show direction (↑ or ↓)
   - Keep comparisons simple ("+18%" not long text)
   - Green for up, red for down (with context)

5. **Interaction Polish**
   - Hover states on clickable elements
   - Smooth 150-200ms transitions
   - Subtle scale on buttons (1.01 or 1.02)
   - Shadow enhancement on hover

---

## 🚀 Next Steps Recommendations

### For Call Logs Page:
1. Start with the table/grid layout (reuse patterns from Recent Activities)
2. Add basic filters (date range + call type)
3. Implement drawer with tabs
4. Add transcript/summary display
5. Polish interactions last

### For Analytics Page:
1. Choose chart library (Recharts recommended)
2. Create time-series line chart component
3. Add date range selector
4. Implement basic metric cards at top
5. Add remaining charts

### For Configuration Page:
1. Start with simple form sections
2. Implement business hours editor
3. Add knowledge update feature
4. Polish form validation and feedback

---

## 💡 Tips for Implementation

### Reuse, Don't Rebuild
- Copy the patterns from Overview page
- KPITile can be used in Analytics for summary metrics
- Table/grid pattern from Recent Activities works for Call Logs
- Filter tabs pattern works everywhere

### Keep It Simple
- Don't over-engineer
- Ship functional first, polish later
- Mock data is fine for now
- Real DB integration comes after UI is solid

### Test as You Go
- Click through every interaction
- Check hover states
- Verify responsive behavior
- Make sure it "feels" good

### Restaurant Owner Lens
Always ask: "Would a busy restaurant owner understand this in 3 seconds?"
- If no → simplify
- If yes → you're on the right track
