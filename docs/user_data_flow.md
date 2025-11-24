# User Data Flow — Complete Guide

**Last Updated:** 2025-11-20
**Purpose:** Understand how users authenticate, access locations, and see their data in the dashboard

---

## The Complete User Journey

### 1. User Logs In with Email

User visits `/login` and enters their email (`manager@restaurant.com`).

**What happens:**
- Email is validated client-side
- Server action `checkUserExists()` verifies email is in `auth.users` AND `user_roles_permissions`
- If valid, user is signed in (dev mode bypasses magic link)
- User is redirected to `/overview`

**Code reference:** [app/login/page.tsx](../app/login/page.tsx), [app/login/actions.ts](../app/login/actions.ts)

### 2. System Determines Location Access

After successful authentication, the system determines which location(s) the user can access.

**Franchise Owner** (owner role):
```typescript
// Check accounts table for email
const { data: accountData } = await supabase
  .from('accounts')
  .select('account_id, email')
  .eq('email', user.email)
  .maybeSingle()

// If found, fetch ALL locations for this account
const { data: allLocations } = await supabase
  .from('locations')
  .select('location_id, name, certus_notification_email')
  .eq('account_id', accountData.account_id)

// User sees all locations and can switch between them
```

**Single Location Manager:**
```typescript
// Look up location by email
const { data: locationResults } = await supabase
  .from('locations')
  .select('location_id, name, certus_notification_email')
  .eq('certus_notification_email', user.email)
  .limit(1)

// User sees ONE fixed location
```

**Implementation:** Both [/overview](../app/(dashboard)/overview/page.tsx) and [/call-logs](../app/(dashboard)/call-logs/page.tsx) use this pattern.

### 3. User Lands on Overview Page

**What the user sees:**
- Time filter tabs (Today / Yesterday / Week / All)
- 6 KPI tiles showing today's metrics
- Recent activities table
- Quick actions sidebar

**What happens behind the scenes:**
```typescript
// Fetch today's aggregated metrics for user's location(s)
const today = new Date().toISOString().split('T')[0]

const { data: metrics } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .eq('location_id', selectedLocation.location_id)
  .eq('date', today)
  .single()

// Display metrics
<KPITile label="Total Calls" value={metrics.total_calls} />
<KPITile label="Revenue" value={`$${metrics.total_revenue_combined / 100}`} />
<KPITile label="Orders" value={metrics.orders_count} />
```

---

## What Data Can Users See?

### Today's Metrics (from `mv_metrics_daily`)

The materialized view aggregates these metrics **per location, per day**:

| Metric | What It Shows | Source |
|--------|---------------|--------|
| `total_calls` | Total calls received | `call_logs` |
| `orders_count` | Orders placed | `order_logs` (join on call_id) |
| `reservations_count` | Reservations made | `reservations` (join on call_id) |
| `total_revenue_combined` | Orders + estimated reservation revenue | Calculated from both tables |
| `minutes_saved` | Staff time saved by AI | `completed_calls × baseline_seconds ÷ 60` |
| `upsells_count` | Number of upsells | `upsells` table |
| `avg_call_duration_seconds` | Average call length | Avg of `duration_seconds` |

### How Often Does It Update?

**Every 5 minutes** via `pg_cron` job:

```sql
-- The cron job that keeps data fresh
SELECT cron.schedule(
  'refresh_mv_metrics_daily_every_5min',
  '*/5 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_metrics_daily;'
);
```

---

## How to Fetch Data

### Pattern 1: Single Location, Single Day (Overview Today tab)

```typescript
const today = new Date().toISOString().split('T')[0]

const { data: metrics } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .eq('location_id', locationId)
  .eq('date', today)
  .single()

// metrics = {
//   total_calls: 127,
//   orders_count: 45,
//   total_revenue_combined: 234500, // cents
//   minutes_saved: 254,
//   ...
// }
```

### Pattern 2: Multiple Locations (Franchise Owner)

```typescript
// Get today's metrics for ALL user's locations
const { data: allMetrics } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .in('location_id', userLocationIds)
  .eq('date', today)

// Aggregate across locations
const totals = allMetrics.reduce((acc, row) => ({
  total_calls: acc.total_calls + row.total_calls,
  total_revenue: acc.total_revenue + row.total_revenue_combined,
  orders_count: acc.orders_count + row.orders_count,
}), { total_calls: 0, total_revenue: 0, orders_count: 0 })
```

### Pattern 3: Time Range (Last 7 Days)

```typescript
const weekAgo = new Date()
weekAgo.setDate(weekAgo.getDate() - 7)

const { data: weekMetrics } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .eq('location_id', locationId)
  .gte('date', weekAgo.toISOString().split('T')[0])
  .order('date', { ascending: false })

// Sum up the week
const weekTotal = weekMetrics.reduce((acc, day) => ({
  total_calls: acc.total_calls + day.total_calls,
  total_revenue: acc.total_revenue + day.total_revenue_combined,
}), { total_calls: 0, total_revenue: 0 })
```

### Pattern 4: Using Helper Function

```typescript
const fromDate = new Date()
fromDate.setDate(fromDate.getDate() - 30)

const { data } = await supabase.rpc('get_metrics_for_range', {
  p_account_id: accountId,
  p_location_id: null, // NULL = all locations for account
  p_from_date: fromDate.toISOString().split('T')[0],
  p_to_date: new Date().toISOString().split('T')[0]
})
```

---

## Where Is This Data Used?

### Overview Page

**Time Filters:**
- **Today:** `eq('date', today)` → single row
- **Yesterday:** `eq('date', yesterday)` → single row
- **Last 7 Days:** `gte('date', weekAgo)` → aggregate 7 rows
- **All:** Not from metrics view, uses raw `call_logs` with counts

**KPI Tiles:**
- Total Calls
- Total Revenue (highlighted, 30% larger)
- Orders
- Reservations
- Minutes Saved
- Upsells

### Call Logs Page

**Stats Cards at Top:**
```typescript
// Same pattern - fetch today's metrics
const { data: stats } = await supabase
  .from('mv_metrics_daily')
  .select('total_calls, orders_count, reservations_count, avg_call_duration_seconds')
  .eq('location_id', selectedLocation.location_id)
  .eq('date', today)
  .single()

// Display in stat cards
<StatCard label="Total Calls" value={stats.total_calls} />
<StatCard label="Orders" value={stats.orders_count} />
```

**Call Details:**
Fetched from raw tables (`call_logs`, `order_logs`, `reservations`), not from metrics view.

### Analytics Page ✅ **IMPLEMENTED**

Uses metrics view and direct call queries depending on view type:

**Single-Day Views (Today, Yesterday):**
```typescript
// Query call_logs directly for hourly granularity
const { data: calls } = await supabase
  .from('call_logs')
  .select('*, order_logs(*), reservations(*)')
  .eq('location_id', locationId)
  .gte('started_at_utc', startOfDayUTC)
  .lte('started_at_utc', endOfDayUTC)

// Convert UTC to location timezone and group by hour
const hourlyData = {}
calls.forEach(call => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: location.time_zone,
    hour: 'numeric',
    hour12: false,
  })
  const parts = formatter.formatToParts(new Date(call.started_at_utc))
  const hour = parts.find(p => p.type === 'hour').value
  const hourKey = `${hour.padStart(2, '0')}:00`

  // Aggregate metrics by hour
  hourlyData[hourKey].total_calls++
  hourlyData[hourKey].total_revenue += call.order_logs[0]?.total || 0
})
```

**Multi-Day Views (Last 7 Days, Month, All):**
```typescript
// Use mv_metrics_daily for efficiency
const { data: metrics } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .eq('location_id', locationId)
  .gte('date', startDate)
  .lte('date', endDate)
  .order('date', { ascending: true })

// Charts display daily aggregates
```

**Call Type Filtering:**
Always queries actual tables, never uses boolean flags:
```typescript
// For "Orders" filter
const { data: orders } = await supabase
  .from('order_logs')
  .select('call_id, total')
  .in('call_id', allCallIds)

// Filter calls to only those with matching orders
const ordersOnly = calls.filter(call =>
  orders.some(order => order.call_id === call.call_id)
)
```

**Operating Hours Display:**
```typescript
// Fetch operating hours from location
const { data: location } = await supabase
  .from('locations')
  .select('time_zone, operating_hours_json')
  .eq('location_id', locationId)
  .single()

// Parse for current weekday
const weekday = new Date(displayDate).toLocaleDateString('en-US', {
  weekday: 'long'
}).toUpperCase()

const dayHours = location.operating_hours_json.find(
  h => h.weekday === weekday
)

// Render as vertical lines on chart
<ReferenceLine x={`${dayHours.startTime}:00`} stroke="green" label="Open" />
<ReferenceLine x={`${dayHours.endTime}:00`} stroke="red" label="Close" />
```

**See:** [`docs/analytics_implementation.md`](../analytics_implementation.md) for complete technical details

---

## Settings & Configuration

### Account-Level Settings

```typescript
// How to update baseline for minutes saved calculation
await supabase
  .from('account_settings')
  .upsert({
    account_id: accountId,
    minutes_saved_baseline_seconds: 180, // 3 minutes per call
    revenue_mode: 'orders_plus_res_estimate',
    avg_spend_per_head: 3500 // $35.00 per person (cents)
  })

// After updating, metrics refresh within 5 minutes automatically
```

**What These Settings Control:**

- `minutes_saved_baseline_seconds`: How many seconds each completed call saves (default: 120 = 2 minutes)
- `revenue_mode`: How to calculate revenue
  - `orders_only`: Only count actual order revenue
  - `orders_plus_res_estimate`: Count orders + estimate reservation value
- `avg_spend_per_head`: For reservation revenue estimation (in cents)

### Location-Level Overrides

```typescript
// Override avg_spend_per_head for a specific location
await supabase
  .from('location_settings')
  .upsert({
    location_id: locationId,
    avg_spend_per_head: 4500 // $45.00 per person
  })
```

Location settings **override** account settings for that specific location.

### Read Settings with Defaults

```typescript
async function getAccountSettings(accountId: string) {
  const { data } = await supabase
    .from('account_settings')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle()

  // Return defaults if not found
  return data || {
    minutes_saved_baseline_seconds: 120,
    revenue_mode: 'orders_plus_res_estimate',
    avg_spend_per_head: null
  }
}
```

---

## The Flow Diagram

```
User Email
    ↓
Login Page → Check auth.users + user_roles_permissions
    ↓
Determine Location Access (account email vs location email)
    ↓
Redirect to /overview
    ↓
Fetch mv_metrics_daily for user's location(s) + today
    ↓
Display KPIs, trends, recent activities
    ↓
User clicks time filter (Yesterday / Week)
    ↓
Re-fetch mv_metrics_daily with new date range
    ↓
Aggregate if multiple days, display updated KPIs
```

---

## Technical Implementation Details

### Database Objects

**Materialized View: `mv_metrics_daily`**

Pre-aggregated metrics per location per day. Refreshed every 5 minutes.

**Indexes:**
- Primary: `(account_id, location_id, date)` — Fast location+date lookups
- Secondary: `(location_id, date DESC)` — Time-series queries
- Concurrent refresh enabled (unique index on primary key)

**Columns:**
```sql
account_id UUID
location_id UUID
date DATE
total_calls INT
orders_count INT
reservations_count INT
completed_calls INT
total_revenue_orders NUMERIC (cents)
total_revenue_res_estimate NUMERIC (cents)
total_revenue_combined NUMERIC (cents)
upsells_count INT
total_upsell_value NUMERIC (cents)
minutes_saved NUMERIC
avg_call_duration_seconds NUMERIC
```

**Settings Tables:**

`account_settings`:
```sql
account_id UUID PRIMARY KEY
minutes_saved_baseline_seconds INT DEFAULT 120
revenue_mode TEXT CHECK (revenue_mode IN ('orders_only', 'orders_plus_res_estimate'))
avg_spend_per_head NUMERIC -- cents
```

`location_settings`:
```sql
location_id UUID PRIMARY KEY
minutes_saved_baseline_seconds INT -- overrides account setting
avg_spend_per_head NUMERIC -- overrides account setting
```

**Functions:**

- `refresh_metrics_daily()` — Refreshes materialized view, called by cron
- `get_metrics_for_range(account_id, location_id, from_date, to_date)` — Helper for date range queries

### Query Best Practices

✅ **DO:** Use specific filters
```typescript
.eq('location_id', locationId)
.eq('date', today)
```

✅ **DO:** Use indexes efficiently
```typescript
// This uses (location_id, date DESC) index
.eq('location_id', locationId)
.order('date', { ascending: false })
.limit(30)
```

❌ **DON'T:** Full table scans
```typescript
// Avoid queries without location_id or account_id filter
.select('*') // No WHERE clause - security risk!
```

### Security

The materialized view does NOT have RLS policies. **Always filter by account_id or location_id** in application code:

```typescript
// ✅ ALWAYS filter by user's locations
const { data } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .eq('location_id', userLocationId) // REQUIRED
  .eq('date', today)

// ❌ NEVER expose raw data
const { data } = await supabase
  .from('mv_metrics_daily')
  .select('*') // Missing location filter - security risk!
```

### Caching Strategy

```typescript
// Next.js Server Components
export const revalidate = 60 // Cache for 60 seconds

export default async function OverviewPage() {
  const metrics = await getMetrics() // Cached
  return <KPIDisplay data={metrics} />
}
```

---

## Installation & Setup

### 1. Enable pg_cron Extension

Supabase Dashboard → **Database** → **Extensions** → Enable `pg_cron`

### 2. Run the Migration

```bash
supabase db push
```

### 3. Verify Installation

```sql
-- Check tables exist
SELECT COUNT(*) FROM account_settings;
SELECT COUNT(*) FROM location_settings;
SELECT COUNT(*) FROM mv_metrics_daily;

-- Check cron job
SELECT * FROM cron.job WHERE jobname LIKE '%metrics%';
```

---

## Monitoring & Troubleshooting

### Check Cron Job Status

```sql
-- View all cron jobs
SELECT * FROM cron.job;

-- Recent runs for metrics job
SELECT *
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job WHERE jobname LIKE '%metrics%'
)
ORDER BY start_time DESC
LIMIT 10;

-- Check for failures
SELECT * FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;
```

### Check Materialized View

```sql
-- Row count
SELECT COUNT(*) FROM mv_metrics_daily;

-- Latest date
SELECT MAX(date) as latest_date FROM mv_metrics_daily;

-- Per-location counts
SELECT
  l.name,
  COUNT(*) as days_of_data,
  MAX(m.date) as latest_date
FROM mv_metrics_daily m
JOIN locations l ON m.location_id = l.location_id
GROUP BY l.name
ORDER BY l.name;
```

### Manual Refresh

```sql
-- Force immediate refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_metrics_daily;

-- Or via function
SELECT public.refresh_metrics_daily();
```

### Common Issues

**No data showing:**
1. Check `certus_notification_email` is set in locations table
2. Verify user's email matches location or account email
3. Check metrics view has data: `SELECT COUNT(*) FROM mv_metrics_daily;`
4. Manual refresh: `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_metrics_daily;`

**Metrics not updating:**
1. Check cron job status: `SELECT * FROM cron.job WHERE jobname LIKE '%metrics%';`
2. Check for failed runs: `SELECT * FROM cron.job_run_details WHERE status = 'failed';`

**User can't see any locations:**
- Franchise owner: Email must be in `accounts.email`
- Single location: Email must be in `locations.certus_notification_email`

**Missing data in MV:**
```sql
-- Check source data exists
SELECT COUNT(*)
FROM call_logs
WHERE started_at_utc >= CURRENT_DATE - INTERVAL '7 days';

-- Check for null location_ids
SELECT COUNT(*)
FROM call_logs
WHERE location_id IS NULL;
```

**Settings not applied:**
```sql
-- Verify account settings exist
SELECT * FROM account_settings WHERE account_id = 'your-uuid';

-- Insert defaults if missing
INSERT INTO account_settings (account_id, minutes_saved_baseline_seconds, revenue_mode)
VALUES ('your-uuid', 120, 'orders_plus_res_estimate')
ON CONFLICT (account_id) DO NOTHING;

-- Force refresh after settings change
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_metrics_daily;
```

---

## TypeScript Types

```typescript
// types/metrics.ts

export interface DailyMetrics {
  account_id: string
  location_id: string
  date: string // YYYY-MM-DD
  total_calls: number
  orders_count: number
  reservations_count: number
  completed_calls: number
  total_revenue_orders: number // cents
  total_revenue_res_estimate: number // cents
  total_revenue_combined: number // cents
  upsells_count: number
  total_upsell_value: number // cents
  minutes_saved: number
  avg_call_duration_seconds: number
}

export interface AccountSettings {
  account_id: string
  minutes_saved_baseline_seconds: number
  revenue_mode: 'orders_only' | 'orders_plus_res_estimate'
  avg_spend_per_head: number | null // cents
  created_at: string
  updated_at: string
}

export interface LocationSettings {
  location_id: string
  minutes_saved_baseline_seconds: number | null
  avg_spend_per_head: number | null // cents
  created_at: string
  updated_at: string
}
```

---

## Migration Rollback

If needed:

```sql
-- Drop cron job
SELECT cron.unschedule('refresh_mv_metrics_daily_every_5min');

-- Drop function
DROP FUNCTION IF EXISTS public.refresh_metrics_daily();
DROP FUNCTION IF EXISTS public.get_metrics_for_range(UUID, UUID, DATE, DATE);

-- Drop materialized view
DROP MATERIALIZED VIEW IF EXISTS public.mv_metrics_daily CASCADE;

-- Drop settings tables
DROP TABLE IF EXISTS public.location_settings CASCADE;
DROP TABLE IF EXISTS public.account_settings CASCADE;
```

---

## Related Documentation

- **[Authentication Flow](./auth/authentication.md)** — How users log in and get location access
- **[Roles & Permissions](./roles_and_permissions.md)** — Role hierarchy and access control
- **[Database Schema](./database_schema.md)** — Full table reference
- **[Component Patterns](./ui/component_patterns.md)** — UI patterns and design guide
