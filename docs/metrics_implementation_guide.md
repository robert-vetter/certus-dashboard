# Metrics Implementation Guide

**Version:** 1.1
**Last Updated:** 2025-11-18
**Purpose:** Guide for using `mv_metrics_daily` and settings tables in the dashboard

---

## Quick Start

### 1. Enable pg_cron Extension

Before running the migration, enable pg_cron in your Supabase project:

1. Go to Supabase Dashboard → **Database** → **Extensions**
2. Search for `pg_cron`
3. Click **Enable**

### 2. Run the Migration

```bash
# Apply the migration
supabase db push

# Or if using direct SQL
psql -h your-host -U postgres -d postgres < supabase/migrations/20251115_metrics_and_settings.sql
```

### 3. Verify Installation

```sql
-- Check if settings tables exist
SELECT COUNT(*) FROM account_settings;
SELECT COUNT(*) FROM location_settings;

-- Check materialized view
SELECT COUNT(*) FROM mv_metrics_daily;

-- Verify pg_cron job
SELECT * FROM cron.job WHERE jobname = 'refresh_metrics_daily';
```

---

## Security & Row Level Security (RLS)

### RLS for Metrics Data

**Important:** Users must only see metrics for their own account(s). The migration provides two approaches:

#### Approach 1: Application-Level Filtering (Recommended)

Query `mv_metrics_daily` directly and filter by `account_id` in your application code:

```typescript
// Always filter by user's account_id
const { data } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .eq('account_id', userAccount.accountId) // ✅ REQUIRED
  .eq('date', today)
```

#### Approach 2: Use RLS Helper Function

Use the `user_can_access_account()` function for additional validation:

```typescript
// Server-side validation
const { data: canAccess } = await supabase.rpc('user_can_access_account', {
  p_account_id: accountId
})

if (!canAccess) {
  throw new Error('Access denied')
}
```

#### Approach 3: Use RLS-Enabled View Wrapper

Query `metrics_daily_v` instead of `mv_metrics_daily` (future enhancement):

```typescript
// This view has security_invoker = on for RLS
const { data } = await supabase
  .from('metrics_daily_v')  // Note: _v suffix
  .select('*')
  .eq('date', today)
// Auto-filtered to user's account via RLS
```

**⚠️ Security Warning:** Always filter by `account_id` when querying `mv_metrics_daily`. Never expose raw metrics data to frontend without account filtering.

---

## Using mv_metrics_daily in the Dashboard

### Important: User Context & Authentication

**Authentication Flow:**
1. Users authenticate via Supabase magic link
2. User's locations are determined by matching their email to `certus_notification_email` in locations table
3. Users can see metrics for their location(s) and the associated account

**Helper Function to Get User's Locations:**

```typescript
// lib/auth/get-user-locations.ts
import { createClient } from '@/lib/supabase/server'

export async function getUserLocations() {
  const supabase = createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user?.email) {
    return null
  }

  // Look up locations by email
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select(`
      location_id,
      name,
      account_id,
      certus_notification_email,
      accounts!inner (
        account_id,
        display_name
      )
    `)
    .ilike('certus_notification_email', user.email)

  if (locationsError || !locations || locations.length === 0) {
    console.error('No locations found for user email:', user.email)
    return null
  }

  // Get role information
  const { data: roleData } = await supabase
    .from('user_roles_permissions')
    .select(`
      roles_permissions!inner (
        roles!inner (
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  return {
    userId: user.id,
    email: user.email,
    locations: locations.map(loc => ({
      locationId: loc.location_id,
      locationName: loc.name,
      accountId: loc.account_id,
      accountName: loc.accounts.display_name
    })),
    // For single-location users, provide convenience properties
    primaryLocation: locations[0].location_id,
    primaryLocationName: locations[0].name,
    primaryAccount: locations[0].account_id,
    primaryAccountName: locations[0].accounts.display_name,
    role: roleData?.roles_permissions?.roles?.name || 'staff'
  }
}
```

**Franchise/Multi-Location Support:**

For users managing multiple locations (franchise owners, regional managers):

```typescript
// Get all locations user has access to
const userLocations = await getUserLocations()

// Query metrics for all their locations
const { data: metrics } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .in('location_id', userLocations.locations.map(l => l.locationId))
  .eq('date', today)

// Or query by account to see all locations in the account
const { data: accountMetrics } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .eq('account_id', userLocations.primaryAccount)
  .eq('date', today)
```

**Note:** Make sure each location has `certus_notification_email` populated with the user's email address.

### Overview Page KPIs

**Single-Location User:**

```typescript
// app/(dashboard)/overview/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getUserLocations } from '@/lib/auth/get-user-locations'
import { redirect } from 'next/navigation'

export default async function OverviewPage() {
  const supabase = createClient()
  const userLocations = await getUserLocations()

  if (!userLocations) {
    redirect('/login')
  }

  const today = new Date().toISOString().split('T')[0]

  // Query today's metrics for user's location(s)
  const { data: metrics, error } = await supabase
    .from('mv_metrics_daily')
    .select('*')
    .in('location_id', userLocations.locations.map(l => l.locationId))
    .eq('date', today)

  if (error) {
    console.error('Failed to fetch metrics:', error)
    return <ErrorState />
  }

  // Aggregate metrics across all user's locations
  const totals = metrics.reduce((acc, row) => ({
    total_calls: acc.total_calls + row.total_calls,
    total_revenue: acc.total_revenue + row.total_revenue_combined,
    minutes_saved: acc.minutes_saved + row.minutes_saved,
    orders_count: acc.orders_count + row.orders_count,
    reservations_count: acc.reservations_count + row.reservations_count,
  }), {
    total_calls: 0,
    total_revenue: 0,
    minutes_saved: 0,
    orders_count: 0,
    reservations_count: 0,
  })

  return (
    <div>
      <h1>{userLocations.primaryAccountName} - Overview</h1>
      {userLocations.locations.length > 1 && (
        <p>Showing data for {userLocations.locations.length} locations</p>
      )}

      <div className="grid grid-cols-5 gap-6">
        <KPITile label="Total Calls" value={totals.total_calls} />
        <KPITile label="Total Revenue" value={`$${totals.total_revenue.toFixed(2)}`} />
        <KPITile label="Minutes Saved" value={Math.round(totals.minutes_saved)} />
        <KPITile label="Orders" value={totals.orders_count} />
        <KPITile label="Reservations" value={totals.reservations_count} />
      </div>
    </div>
  )
}
```

**Multi-Location/Franchise Owner:**

```typescript
// Add location selector for franchise owners
export default async function OverviewPage({
  searchParams
}: {
  searchParams: { location?: string }
}) {
  const userLocations = await getUserLocations()
  if (!userLocations) redirect('/login')

  const selectedLocationId = searchParams.location || 'all'
  const today = new Date().toISOString().split('T')[0]

  // Build query based on selection
  let query = supabase
    .from('mv_metrics_daily')
    .select('*')
    .eq('date', today)

  if (selectedLocationId === 'all') {
    // Show all locations user has access to
    query = query.in('location_id', userLocations.locations.map(l => l.locationId))
  } else {
    // Show specific location (verify user has access)
    const hasAccess = userLocations.locations.some(l => l.locationId === selectedLocationId)
    if (!hasAccess) redirect('/overview')
    query = query.eq('location_id', selectedLocationId)
  }

  const { data: metrics } = await query

  // Aggregate and display...
  return (
    <div>
      <LocationSelector
        locations={userLocations.locations}
        selected={selectedLocationId}
      />
      <KPITiles data={aggregateMetrics(metrics)} />
    </div>
  )
}
```


### Time Filter Tabs (Today, Yesterday, Last 7 Days)

```typescript
// Get metrics for different time ranges
async function getMetricsForPeriod(
  locationId: string,
  period: 'today' | 'yesterday' | 'last7days' | 'last24hours'
) {
  const supabase = createClient()

  let fromDate: string
  let toDate: string = new Date().toISOString().split('T')[0]

  switch (period) {
    case 'today':
      fromDate = toDate
      break
    case 'yesterday':
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      fromDate = yesterday.toISOString().split('T')[0]
      toDate = fromDate
      break
    case 'last7days':
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      fromDate = weekAgo.toISOString().split('T')[0]
      break
    case 'last24hours':
      // For last 24 hours, query today + yesterday and sum
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 1)
      fromDate = dayAgo.toISOString().split('T')[0]
      break
  }

  const { data, error } = await supabase
    .from('mv_metrics_daily')
    .select('*')
    .eq('location_id', locationId)
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: false })

  if (error) throw error

  // For single-day periods, return first row
  if (period === 'today' || period === 'yesterday') {
    return data[0] || null
  }

  // For multi-day periods, aggregate the results
  return aggregateMetrics(data)
}

function aggregateMetrics(dailyMetrics: any[]) {
  return dailyMetrics.reduce((acc, day) => ({
    total_calls: (acc.total_calls || 0) + day.total_calls,
    orders_count: (acc.orders_count || 0) + day.orders_count,
    reservations_count: (acc.reservations_count || 0) + day.reservations_count,
    total_revenue_combined: (acc.total_revenue_combined || 0) + day.total_revenue_combined,
    minutes_saved: (acc.minutes_saved || 0) + day.minutes_saved,
    upsells_count: (acc.upsells_count || 0) + day.upsells_count,
  }), {})
}
```

### Analytics Page - Charts

**Line chart for revenue over last 30 days:**

```typescript
// app/(dashboard)/analytics/page.tsx
async function getRevenueChartData(locationId: string, days: number = 30) {
  const supabase = createClient()

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)

  const { data, error } = await supabase
    .from('mv_metrics_daily')
    .select('date, total_revenue_combined')
    .eq('location_id', locationId)
    .gte('date', fromDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) throw error

  // Format for Recharts
  return data.map(row => ({
    date: row.date,
    revenue: parseFloat(row.total_revenue_combined),
  }))
}

// In component
export default async function AnalyticsPage() {
  const chartData = await getRevenueChartData('location-uuid', 30)

  return (
    <LineChart width={600} height={300} data={chartData}>
      <XAxis dataKey="date" />
      <YAxis />
      <Line type="monotone" dataKey="revenue" stroke="#ef4444" />
    </LineChart>
  )
}
```

### Trend Calculations (vs Previous Period)

```typescript
// Calculate trend: today vs yesterday
async function getTodayTrend(locationId: string) {
  const supabase = createClient()

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('mv_metrics_daily')
    .select('date, total_calls, total_revenue_combined')
    .eq('location_id', locationId)
    .in('date', [today, yesterdayStr])
    .order('date', { ascending: false })

  if (error || !data || data.length < 2) {
    return null
  }

  const todayData = data[0]
  const yesterdayData = data[1]

  return {
    calls: {
      value: todayData.total_calls,
      change: calculatePercentChange(
        yesterdayData.total_calls,
        todayData.total_calls
      ),
    },
    revenue: {
      value: todayData.total_revenue_combined,
      change: calculatePercentChange(
        yesterdayData.total_revenue_combined,
        todayData.total_revenue_combined
      ),
    },
  }
}

function calculatePercentChange(oldValue: number, newValue: number) {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return ((newValue - oldValue) / oldValue) * 100
}
```

---

## Using Settings Tables

### Read Account Settings

```typescript
async function getAccountSettings(accountId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('account_settings')
    .select('*')
    .eq('account_id', accountId)
    .single()

  if (error) {
    // No settings found, return defaults
    return {
      minutes_saved_baseline_seconds: 120,
      revenue_mode: 'orders_plus_res_estimate',
      avg_spend_per_head: null,
    }
  }

  return data
}
```

### Update Account Settings

```typescript
// Configuration page - update settings
async function updateAccountSettings(
  accountId: string,
  settings: {
    minutes_saved_baseline_seconds?: number
    revenue_mode?: 'orders_only' | 'orders_plus_res_estimate'
    avg_spend_per_head?: number | null
  }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('account_settings')
    .upsert({
      account_id: accountId,
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Location Settings Override

```typescript
// Set location-specific override for avg_spend_per_head
async function setLocationAvgSpend(locationId: string, avgSpend: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('location_settings')
    .upsert({
      location_id: locationId,
      avg_spend_per_head: avgSpend,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  // After updating settings, refresh metrics to apply new calculations
  // Note: pg_cron will refresh within 5 minutes automatically
  // For immediate update, call the refresh function:
  await supabase.rpc('refresh_metrics_daily')

  return data
}
```

---

## Helper Functions

### Using the Built-in Helper Function

The migration includes a SQL function for easy date-range queries:

```typescript
// Get metrics for last 30 days using helper function
async function getMetricsRange(
  accountId: string,
  locationId: string | null,
  days: number = 30
) {
  const supabase = createClient()

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)

  const { data, error } = await supabase.rpc('get_metrics_for_range', {
    p_account_id: accountId,
    p_location_id: locationId, // NULL for all locations
    p_from_date: fromDate.toISOString().split('T')[0],
    p_to_date: new Date().toISOString().split('T')[0],
  })

  if (error) throw error
  return data
}
```

### Manual Refresh (Admin Only)

If you need to force an immediate refresh:

```typescript
async function forceRefreshMetrics() {
  const supabase = createClient()

  const { error } = await supabase.rpc('refresh_metrics_daily')

  if (error) throw error
  console.log('Metrics refreshed successfully')
}
```

---

## TypeScript Types

Add these types to your project:

```typescript
// types/metrics.ts
export interface DailyMetrics {
  account_id: string
  location_id: string
  date: string
  total_calls: number
  orders_count: number
  reservations_count: number
  completed_calls: number
  total_revenue_orders: number
  total_revenue_res_estimate: number
  total_revenue_combined: number
  upsells_count: number
  total_upsell_value: number
  minutes_saved: number
  avg_call_duration_seconds: number
}

export interface AccountSettings {
  account_id: string
  minutes_saved_baseline_seconds: number
  revenue_mode: 'orders_only' | 'orders_plus_res_estimate'
  avg_spend_per_head: number | null
  created_at: string
  updated_at: string
}

export interface LocationSettings {
  location_id: string
  minutes_saved_baseline_seconds: number | null
  avg_spend_per_head: number | null
  created_at: string
  updated_at: string
}
```

---

## Performance Optimization

### Query Patterns

✅ **DO:** Query specific location + date range
```typescript
const { data } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .eq('location_id', locationId)
  .gte('date', fromDate)
  .lte('date', toDate)
```

✅ **DO:** Use indexes efficiently
```typescript
// This query uses the (location_id, date DESC) index
const { data } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .eq('location_id', locationId)
  .order('date', { ascending: false })
  .limit(30)
```

❌ **DON'T:** Select all data without filters
```typescript
// Avoid full table scans
const { data } = await supabase
  .from('mv_metrics_daily')
  .select('*')  // No WHERE clause!
```

### Caching Strategy

```typescript
// Use React Server Components for automatic caching
// app/(dashboard)/overview/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds

export default async function OverviewPage() {
  // This data is cached for 60 seconds
  const metrics = await getMetrics()
  return <KPIDisplay data={metrics} />
}
```

---

## Monitoring

### Check pg_cron Job Status

```sql
-- View all cron jobs
SELECT * FROM cron.job;

-- View recent job runs
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'refresh_metrics_daily')
ORDER BY start_time DESC
LIMIT 10;

-- Check for failed runs
SELECT * FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;
```

### Materialized View Stats

```sql
-- Check when last refreshed
SELECT
  schemaname,
  matviewname,
  last_refresh
FROM pg_catalog.pg_stat_user_tables
WHERE relname = 'mv_metrics_daily';

-- Check row count
SELECT COUNT(*) FROM mv_metrics_daily;

-- Check data freshness
SELECT MAX(date) as latest_date FROM mv_metrics_daily;
```

---

## Troubleshooting

### pg_cron Not Running

**Symptom:** Metrics not updating automatically

**Solution:**
```sql
-- Check if extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- If not enabled, enable it
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Reschedule the job
SELECT cron.schedule(
  'refresh_metrics_daily',
  '*/2 * * * *',
  $$CALL public.refresh_metrics_daily()$$
);
```

### Missing Data in Materialized View

**Symptom:** `mv_metrics_daily` is empty or missing recent data

**Solution:**
```sql
-- Manual refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_metrics_daily;

-- Check source data exists
SELECT COUNT(*) FROM call_logs WHERE started_at_utc >= CURRENT_DATE - INTERVAL '7 days';

-- Check for null location_ids
SELECT COUNT(*) FROM call_logs WHERE location_id IS NULL;
```

### Settings Not Applied

**Symptom:** Minutes saved or revenue calculations using wrong values

**Solution:**
```sql
-- Check account settings exist
SELECT * FROM account_settings WHERE account_id = 'your-account-uuid';

-- Insert default if missing
INSERT INTO account_settings (account_id, minutes_saved_baseline_seconds, revenue_mode)
VALUES ('your-account-uuid', 120, 'orders_plus_res_estimate')
ON CONFLICT (account_id) DO NOTHING;

-- Force refresh after settings change
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_metrics_daily;
```

---

## Migration Rollback

If you need to rollback the migration:

```sql
-- Drop pg_cron job
SELECT cron.unschedule('refresh_metrics_daily');

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

- [Database Schema](./database_schema.md) - Full schema reference
- [Architecture](./architecture.md) - System architecture
- [PRD](./prd.md) - Product requirements
