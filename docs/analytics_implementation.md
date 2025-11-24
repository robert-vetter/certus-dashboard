# Analytics Page Implementation Documentation

**Version:** 1.0
**Last updated:** 2025-11-24
**Owner:** Frontend Developer + Backend Architect
**Status:** ✅ Core features implemented, Operating hours display in progress

---

## Table of Contents

1. [Overview](#1-overview)
2. [Implementation Summary](#2-implementation-summary)
3. [Features](#3-features)
4. [Technical Architecture](#4-technical-architecture)
5. [Data Flow](#5-data-flow)
6. [Known Issues & Solutions](#6-known-issues--solutions)
7. [Future Enhancements](#7-future-enhancements)

---

## 1. Overview

The Analytics page ([`app/(dashboard)/analytics/page.tsx`](../app/(dashboard)/analytics/page.tsx)) provides comprehensive revenue and call metrics visualization for restaurant operators. It supports both single-day (hourly) and multi-day (daily) views with automatic timezone conversion and call type filtering.

### Key User Stories Addressed

- **US-004 (Analytics)** ✅ **IMPLEMENTED**
  - Time-series charts for revenue, calls, orders, and reservations
  - Call type filtering (All Calls, Orders, Reservations, Catering, FAQ)
  - Time range filtering (Today, Yesterday, Last 7 Days, Last Month, All Time)
  - CSV export functionality
  - Operating hours overlay for single-day views

---

## 2. Implementation Summary

### 2.1 Timeline

**Initial Implementation:**
- **Date Range**: November 2025
- **Summary**: Basic analytics page with charts and filters

**Major Refinements (Summarized from Previous Sessions):**
- Fixed call type filtering to use database queries instead of boolean flags
- Implemented single-day vs multi-day view logic
- Added hourly granularity for today/yesterday views
- Implemented timezone conversion for accurate hour grouping
- Added operating hours vertical lines for single-day charts

**Current Session (November 23-24, 2025):**
- Fixed revenue display (removed incorrect multiplication by 100)
- Improved timezone conversion using `Intl.DateTimeFormat`
- Added operating hours display with ReferenceLine components
- Fixed database query to fetch `time_zone` and `operating_hours_json` fields

### 2.2 Files Modified/Created

**Core Implementation:**
- [`app/(dashboard)/analytics/page.tsx`](../app/(dashboard)/analytics/page.tsx) — Main analytics page server component
- [`app/(dashboard)/analytics/analytics-filters.tsx`](../app/(dashboard)/analytics/analytics-filters.tsx) — Filter controls
- [`app/(dashboard)/analytics/hero-revenue-chart.tsx`](../app/(dashboard)/analytics/hero-revenue-chart.tsx) — Main revenue chart
- [`app/(dashboard)/analytics/quick-stats-bar.tsx`](../app/(dashboard)/analytics/quick-stats-bar.tsx) — Summary statistics
- [`app/(dashboard)/analytics/export-button.tsx`](../app/(dashboard)/analytics/export-button.tsx) — CSV export

**Supporting Files:**
- [`app/(dashboard)/analytics/secondary-charts.tsx`](../app/(dashboard)/analytics/secondary-charts.tsx) — Additional charts
- [`app/(dashboard)/analytics/call-type-chart.tsx`](../app/(dashboard)/analytics/call-type-chart.tsx) — Call type breakdown
- [`app/(dashboard)/analytics/export-actions.ts`](../app/(dashboard)/analytics/export-actions.ts) — Export logic

---

## 3. Features

### 3.1 Time Range Filtering ✅

**Implemented Ranges:**
- **Today** — Shows hourly data for current day
- **Yesterday** — Shows hourly data for previous day
- **Last 7 Days** — Shows daily aggregates for past week
- **Last Month** — Shows daily aggregates for past 30 days
- **All Time** — Shows all historical data from 2020-01-01

**Implementation Details:**
```typescript
// In page.tsx
switch (timeRange) {
  case 'today':
    startDate = endDate; // Same as today
    break;
  case 'yesterday':
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    startDate = yesterday.toISOString().split('T')[0];
    endDate = startDate;
    break;
  case 'week':
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    startDate = weekAgo.toISOString().split('T')[0];
    break;
  // ... other cases
}
```

### 3.2 Call Type Filtering ✅

**Implemented Filters:**
- **All Calls** — No filtering
- **Orders** — Calls with associated `order_logs` entries
- **Reservations** — Calls with associated `reservations` entries
- **Catering** — Currently mapped to complaints/FAQ
- **FAQ/Complaints** — General inquiry calls

**Critical Implementation Note:**

The analytics page **never uses boolean flags** from `call_logs` (like `order_made`, `reservation_made`). Instead, it performs actual database queries to `order_logs` and `reservations` tables:

```typescript
// CORRECT: Query order_logs table
if (callType === 'orders') {
  const { data: orders } = await supabaseAdmin
    .from('order_logs')
    .select('call_id, total')
    .in('call_id', callIds);

  // Filter to only calls that have matching orders
  filteredCallLogs = allCalls.filter(call =>
    orders?.some(o => o.call_id === call.call_id)
  );
}
```

**Why This Matters:**

Boolean flags can be unreliable or outdated. Querying the actual `order_logs` and `reservations` tables ensures the analytics reflect true data integrity.

### 3.3 Single-Day vs Multi-Day Views ✅

**Automatic View Selection:**

```typescript
const isSingleDay = startDate === endDate;

if (isSingleDay) {
  // Fetch hourly data from call_logs
  // Initialize all 24 hours (00:00 - 23:00)
  // Group calls by hour in location timezone
} else {
  // Fetch daily aggregates from mv_metrics_daily or call_logs
  // Group by date
}
```

**Hourly Data Structure:**

```typescript
interface HourlyMetrics {
  date: string; // "14:00", "15:00", etc.
  total_calls: number;
  orders_count: number;
  reservations_count: number;
  total_revenue_orders: number; // in cents
  total_revenue_res_estimate: number; // in cents
  total_revenue_combined: number; // in cents
}
```

### 3.4 Timezone Conversion ✅

**Problem Solved:**

Call timestamps are stored in UTC (`started_at_utc`), but analytics need to display times in the restaurant's local timezone.

**Solution:**

```typescript
// Use Intl.DateTimeFormat for reliable timezone conversion
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: selectedLocation.time_zone, // e.g., 'America/New_York'
  hour: 'numeric',
  hour12: false,
});

const parts = formatter.formatToParts(callDate);
const hourPart = parts.find(part => part.type === 'hour');
const hour = hourPart ? parseInt(hourPart.value, 10) : callDate.getUTCHours();
const hourKey = `${hour.toString().padStart(2, '0')}:00`;
```

**Example:**
- UTC time: `2025-11-23T23:44:17+00:00`
- Location timezone: `America/New_York`
- Local hour: `18` (6 PM EST)
- Hourly bucket: `18:00`

### 3.5 Revenue Calculation ✅

**Critical Fix:**

Revenue data in `order_logs.total` is already stored in cents. Previous implementation incorrectly multiplied by 100, showing $47.12 as $47,120.00.

```typescript
// CORRECT (current implementation):
const orderRevenue = call.order_logs[0].total || 0; // Already in cents
hourlyData[hourKey].total_revenue_orders += orderRevenue;

// INCORRECT (old implementation):
const orderRevenue = (call.order_logs[0].total || 0) * 100; // ❌ WRONG
```

**Display:**

```typescript
// Chart displays in dollars
revenue: (row.total_revenue_combined || 0) / 100, // Convert cents to dollars
```

### 3.6 Operating Hours Display 🔧

**Feature:**

For single-day views, vertical lines indicate restaurant opening and closing times.

**Implementation:**

```typescript
// In hero-revenue-chart.tsx
const operatingHoursForDay = React.useMemo(() => {
  if (!isHourlyData || !operatingHours || !displayDate) return [];

  const date = new Date(displayDate);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  const hoursArray = Array.isArray(operatingHours) ? operatingHours : [];
  const dayHours = hoursArray.filter((h: any) => h.weekday === weekday);

  const periods: Array<{ start: number; end: number }> = [];
  dayHours.forEach((h: any) => {
    if (h.timePeriods && Array.isArray(h.timePeriods)) {
      h.timePeriods.forEach((period: any) => {
        if (period.startTime && period.endTime) {
          const startHour = parseInt(period.startTime.split(':')[0], 10);
          const endHour = parseInt(period.endTime.split(':')[0], 10);
          periods.push({ start: startHour, end: endHour });
        }
      });
    }
  });

  return periods;
}, [operatingHours, displayDate, isHourlyData]);
```

**Rendering:**

```tsx
{/* Operating hours vertical lines */}
{operatingHoursForDay.map((period, index) => (
  <React.Fragment key={index}>
    <ReferenceLine
      x={`${period.start.toString().padStart(2, '0')}:00`}
      stroke="#10b981"
      strokeWidth={2}
      strokeDasharray="3 3"
      label={{
        value: 'Open',
        position: 'top',
        fill: '#10b981',
        fontSize: 11,
        fontWeight: 600,
      }}
    />
    <ReferenceLine
      x={`${period.end.toString().padStart(2, '0')}:00`}
      stroke="#ef4444"
      strokeWidth={2}
      strokeDasharray="3 3"
      label={{
        value: 'Close',
        position: 'top',
        fill: '#ef4444',
        fontSize: 11,
        fontWeight: 600,
      }}
    />
  </React.Fragment>
))}
```

**Visual Design:**
- **Open time**: Green (#10b981) dashed vertical line with "Open" label
- **Close time**: Red (#ef4444) dashed vertical line with "Close" label

**Current Status:**

✅ Implementation complete
⚠️ Operating hours only display if `operating_hours_json` includes the specific weekday

**Known Issue:**

If `operating_hours_json` doesn't include weekend days (FRIDAY, SATURDAY), the vertical lines won't appear for those days. Restaurant operators must ensure all 7 weekdays are populated in the database.

**Expected Data Structure:**

```json
[
  { "weekday": "SUNDAY", "timePeriods": [{"startTime": "11:00", "endTime": "21:30"}] },
  { "weekday": "MONDAY", "timePeriods": [{"startTime": "11:00", "endTime": "21:30"}] },
  { "weekday": "TUESDAY", "timePeriods": [{"startTime": "11:00", "endTime": "21:30"}] },
  { "weekday": "WEDNESDAY", "timePeriods": [{"startTime": "11:00", "endTime": "21:30"}] },
  { "weekday": "THURSDAY", "timePeriods": [{"startTime": "11:00", "endTime": "21:30"}] },
  { "weekday": "FRIDAY", "timePeriods": [{"startTime": "11:00", "endTime": "21:30"}] },
  { "weekday": "SATURDAY", "timePeriods": [{"startTime": "11:00", "endTime": "21:30"}] }
]
```

### 3.7 Quick Stats Bar ✅

**Metrics Displayed:**
- **Total Calls** — with trend indicator
- **Orders** — with trend indicator
- **Reservations** — with trend indicator
- **Upsells** — count only
- **Labour Saved** — calculated in hours (baseline × calls)
- **Call Time** — total duration formatted as hours/minutes

**Trend Calculation:**

```typescript
const calculateDelta = (current: number, previous: number) => {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};
```

### 3.8 CSV Export ✅

**Implementation:**

```typescript
// In export-button.tsx
const handleExport = async () => {
  setIsExporting(true);
  try {
    const blob = await exportAnalyticsData({
      locationId,
      locationName,
      startDate,
      endDate,
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${locationName}_${startDate}_to_${endDate}.csv`;
    a.click();
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    setIsExporting(false);
  }
};
```

**CSV Columns:**
- Date
- Location
- Total Calls
- Orders Count
- Reservations Count
- Total Revenue
- Minutes Saved

---

## 4. Technical Architecture

### 4.1 Component Hierarchy

```
app/(dashboard)/analytics/page.tsx (Server Component)
├── AnalyticsFilters (Client Component)
│   ├── Time Range Tabs
│   ├── Location Display
│   └── Call Type Filters
├── HeroRevenueChart (Client Component)
│   ├── Revenue Display with Trend
│   ├── Quick Stats (Orders, Reservations, Total Calls)
│   ├── AreaChart (Recharts)
│   └── Operating Hours ReferenceLine
├── QuickStatsBar (Client Component)
│   └── 6 StatCard components
├── SecondaryCharts (Client Component)
│   ├── Call Type Distribution
│   └── Additional metrics
└── ExportButton (Client Component)
```

### 4.2 Data Access Pattern

**Server Component (page.tsx):**
1. Fetches user authentication and location data
2. Determines time range from URL params
3. Fetches timezone and operating hours from locations table
4. Queries call data based on filters:
   - Single day: Direct `call_logs` queries with joins
   - Multi-day: `mv_metrics_daily` or aggregated `call_logs`
5. Aggregates previous period metrics for trend calculation
6. Passes data as props to client components

**Database Queries:**

```typescript
// Fetch location with timezone and operating hours
const { data: userLocationRows } = await supabaseAdmin
  .from('user_roles_permissions')
  .select(`
    location_id,
    locations!inner (
      location_id,
      name,
      certus_notification_email,
      account_id,
      time_zone,
      operating_hours_json
    )
  `)
  .eq('user_id', user.id);
```

### 4.3 State Management

**URL State (Search Params):**
- `range`: Time range filter ('today' | 'yesterday' | 'week' | 'month' | 'all')
- `callType`: Call type filter ('all' | 'orders' | 'reservations' | 'catering' | 'complaints')

**No Client-Side State:**
- All filters are controlled via URL
- Page reloads on filter change (server-side rendering)

---

## 5. Data Flow

### 5.1 Single-Day View Flow

```
1. User selects "Today" or "Yesterday"
   ↓
2. Server Component (page.tsx)
   - Sets startDate = endDate
   - Fetches all calls for that UTC day
   ↓
3. Apply Call Type Filter
   - Query order_logs for orders filter
   - Query reservations for reservations filter
   - Join call data with order/reservation data
   ↓
4. Timezone Conversion & Hourly Grouping
   - Convert UTC timestamps to location timezone
   - Group calls by hour (00:00 - 23:00)
   - Initialize all 24 hours with zero values
   ↓
5. Calculate Metrics Per Hour
   - Count calls
   - Sum order revenue
   - Estimate reservation revenue
   - Aggregate totals
   ↓
6. Pass to Client Components
   - metricsData: Array of hourly metrics
   - operatingHours: JSON array from locations table
   - displayDate: Date being viewed
   ↓
7. Render Chart
   - HeroRevenueChart detects hourly data
   - Renders AreaChart with hour labels
   - Overlays operating hours ReferenceLine(s)
```

### 5.2 Multi-Day View Flow

```
1. User selects "Last 7 Days", "Last Month", or "All Time"
   ↓
2. Server Component (page.tsx)
   - Sets startDate and endDate range
   ↓
3. Query Strategy Decision
   - If callType === 'all': Query mv_metrics_daily
   - Otherwise: Query call_logs with joins
   ↓
4. Aggregate by Date
   - Group by YYYY-MM-DD
   - Sum metrics per day
   ↓
5. Pass to Client Components
   - metricsData: Array of daily metrics
   - No operating hours overlay (multi-day view)
   ↓
6. Render Chart
   - HeroRevenueChart detects daily data
   - Renders AreaChart with date labels (e.g., "Nov 17")
```

---

## 6. Known Issues & Solutions

### 6.1 Revenue Displayed 1000x Too High ✅ FIXED

**Problem:**
- Revenue was showing as $47,120.00 instead of $47.12

**Root Cause:**
- Code was multiplying `order_logs.total` by 100
- The `total` field is already stored in cents

**Solution:**
```typescript
// Before:
const orderRevenue = (call.order_logs[0].total || 0) * 100; // ❌

// After:
const orderRevenue = call.order_logs[0].total || 0; // ✅ Already in cents
```

**Verification:**
- Chart displays: `(row.total_revenue_combined || 0) / 100` to convert to dollars
- Database stores in cents, display converts to dollars

### 6.2 Timezone Conversion Issues ✅ FIXED

**Problem:**
- Calls showing at incorrect hours (e.g., 1am when restaurant was closed)
- Used `getUTCHours()` which doesn't account for timezone

**Root Cause:**
- Previous implementation used `toLocaleString()` incorrectly
- Extracted hour from full time string instead of using `formatToParts()`

**Solution:**
```typescript
// Before:
const localTimeString = callDate.toLocaleString('en-US', {
  timeZone: selectedLocation.time_zone,
  hour: '2-digit',
  hour12: false,
});
const hour = parseInt(localTimeString.split(':')[0], 10); // ❌ Unreliable

// After:
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: selectedLocation.time_zone,
  hour: 'numeric',
  hour12: false,
});
const parts = formatter.formatToParts(callDate);
const hourPart = parts.find(part => part.type === 'hour');
const hour = hourPart ? parseInt(hourPart.value, 10) : callDate.getUTCHours(); // ✅
```

**Verification:**
- UTC `2025-11-23T23:44:17+00:00` → EST hour `18` (6 PM) ✅
- UTC `2025-11-24T01:44:26+00:00` → EST hour `20` (8 PM) ✅

### 6.3 Operating Hours Not Displaying ⚠️ PARTIAL

**Problem:**
- Operating hours vertical lines don't appear on chart
- Only affects certain days of the week

**Root Cause:**
- Database query wasn't fetching `time_zone` and `operating_hours_json` fields
- Some locations have incomplete operating hours (missing FRIDAY/SATURDAY)

**Solution (Applied):**
```typescript
// Added to database query:
locations!inner (
  location_id,
  name,
  certus_notification_email,
  account_id,
  time_zone,           // ✅ Added
  operating_hours_json // ✅ Added
)
```

**Remaining Issue:**
- If `operating_hours_json` doesn't include a specific weekday, no lines appear
- Example: Missing SATURDAY means no lines on Saturday view

**Recommended Fix for Users:**
- Ensure `operating_hours_json` includes all 7 weekdays in the database
- Update via Configuration page or database migration

### 6.4 Database Column Names ✅ FIXED (Previous Session)

**Issues Found:**
- Code referenced `order_total_cents` instead of `total`
- Code referenced `party_size` instead of `guest_count`

**Solution:**
- Updated all references to match actual database schema
- Used `database_schema.md` as source of truth

---

## 7. Future Enhancements

### 7.1 Planned Features

**Multi-Location Comparison:**
- Side-by-side charts for franchise owners
- Location selector with "Compare" mode
- Aggregated vs individual location views

**Advanced Metrics:**
- Average order value trends
- Peak hour analysis
- Day-of-week patterns
- Seasonal trends

**Interactive Drilldowns:**
- Click a chart point to see calls for that hour/day
- Filter by call outcome (completed, missed, abandoned)
- Duration distribution histograms

**Export Enhancements:**
- Scheduled email reports
- PDF reports with charts
- Custom date range picker
- Export filtered data only

### 7.2 Performance Optimizations

**Caching Strategy:**
- Cache `mv_metrics_daily` queries with 5-minute TTL
- Cache operating hours per location
- Implement ISR (Incremental Static Regeneration) for historical dates

**Query Optimization:**
- Use `mv_metrics_daily` for all multi-day views
- Add composite indexes on `(location_id, started_at_utc)`
- Implement query result pagination for large date ranges

**Chart Rendering:**
- Lazy load secondary charts
- Implement virtual scrolling for large datasets
- Use Web Workers for data aggregation

### 7.3 UX Improvements

**Better Empty States:**
- Illustrative graphics when no data
- Helpful onboarding tips
- Quick actions to populate data

**Mobile Optimization:**
- Responsive chart layouts
- Swipeable filters
- Collapsible stats bar

**Accessibility:**
- Keyboard navigation for chart interactions
- Screen reader announcements for metrics
- High contrast mode support

---

## Appendix A: File References

**Core Implementation:**
- [app/(dashboard)/analytics/page.tsx:239-261](../app/(dashboard)/analytics/page.tsx#L239-L261) — Timezone conversion logic
- [app/(dashboard)/analytics/page.tsx:59-60](../app/(dashboard)/analytics/page.tsx#L59-L60) — Database query with timezone and operating hours
- [app/(dashboard)/analytics/hero-revenue-chart.tsx:65-90](../app/(dashboard)/analytics/hero-revenue-chart.tsx#L65-L90) — Operating hours parsing
- [app/(dashboard)/analytics/hero-revenue-chart.tsx:137-166](../app/(dashboard)/analytics/hero-revenue-chart.tsx#L137-L166) — Operating hours rendering

**Related Documentation:**
- [docs/database_schema.md](database_schema.md) — Database schema reference
- [docs/architecture.md](architecture.md) — Overall system architecture
- [docs/prd.md](prd.md) — Product requirements

---

## Appendix B: Debugging Checklist

When troubleshooting analytics issues:

1. **Check Database Schema:**
   - Verify column names match code references
   - Confirm data types (cents vs dollars, timestamps vs dates)

2. **Verify Timezone Data:**
   - Ensure `locations.time_zone` is populated with valid IANA timezone
   - Check that `started_at_utc` is truly UTC

3. **Inspect Operating Hours:**
   - Query `locations.operating_hours_json` directly
   - Verify all 7 weekdays are present
   - Check time period format ("HH:MM")

4. **Test Timezone Conversion:**
   - Add console.logs showing UTC → local time conversion
   - Verify `formatToParts()` output structure
   - Test with calls across midnight boundaries

5. **Review Query Results:**
   - Check if `order_logs` and `reservations` queries return expected data
   - Verify joins are correct (call_id matching)
   - Look for null/undefined values in aggregations

---

**Document End**
