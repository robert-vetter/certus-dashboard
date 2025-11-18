# Metrics System - Quick Start Guide

**Last Updated:** 2025-11-18
**Status:** ✅ Production Ready

---

## Overview

The metrics system provides pre-aggregated daily KPIs per location, automatically refreshed every 1 minute.

**Key Tables:**
- `mv_metrics_daily` - Materialized view with daily metrics per location
- `account_settings` - Account-level metric configuration
- `location_settings` - Location-specific overrides

---

## Implementation Steps

### 1. Get User's Locations

Create `lib/auth/get-user-locations.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'

export async function getUserLocations() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  // Look up locations by email
  const { data: locations } = await supabase
    .from('locations')
    .select(`
      location_id,
      name,
      account_id,
      accounts!inner (account_id, display_name)
    `)
    .ilike('certus_notification_email', user.email)

  if (!locations || locations.length === 0) return null

  return {
    userId: user.id,
    email: user.email,
    locations: locations.map(loc => ({
      locationId: loc.location_id,
      locationName: loc.name,
      accountId: loc.account_id,
      accountName: loc.accounts.display_name
    })),
    // Convenience properties for single-location users
    primaryLocation: locations[0].location_id,
    primaryAccount: locations[0].account_id
  }
}
```

### 2. Query Metrics in Pages

**Single Location:**

```typescript
// app/(dashboard)/overview/page.tsx
import { getUserLocations } from '@/lib/auth/get-user-locations'

export default async function OverviewPage() {
  const userLocations = await getUserLocations()
  if (!userLocations) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: metrics } = await supabase
    .from('mv_metrics_daily')
    .in('location_id', userLocations.locations.map(l => l.locationId))
    .eq('date', today)

  // Aggregate and display...
}
```

**Multi-Location/Franchise:**

```typescript
// Add location selector
export default async function OverviewPage({ searchParams }) {
  const userLocations = await getUserLocations()
  const selectedLocation = searchParams.location || 'all'

  let query = supabase
    .from('mv_metrics_daily')
    .select('*')
    .eq('date', today)

  if (selectedLocation === 'all') {
    query = query.in('location_id', userLocations.locations.map(l => l.locationId))
  } else {
    query = query.eq('location_id', selectedLocation)
  }

  const { data: metrics } = await query
  // ...
}
```

---

## Data Setup

### Required: Populate Location Emails

Make sure each location has `certus_notification_email` set:

```sql
-- Check which locations have emails
SELECT location_id, name, certus_notification_email
FROM locations
WHERE certus_notification_email IS NOT NULL;

-- Update a location's email
UPDATE locations
SET certus_notification_email = 'manager@restaurant.com'
WHERE location_id = 'your-location-uuid';
```

### Optional: Configure Settings

```sql
-- Set account-level baseline (default: 120 seconds)
INSERT INTO account_settings (account_id, minutes_saved_baseline_seconds, revenue_mode)
VALUES ('account-uuid', 180, 'orders_plus_res_estimate')
ON CONFLICT (account_id) DO UPDATE
SET minutes_saved_baseline_seconds = 180;

-- Set location-specific override
INSERT INTO location_settings (location_id, avg_spend_per_head)
VALUES ('location-uuid', 45.00)
ON CONFLICT (location_id) DO UPDATE
SET avg_spend_per_head = 45.00;
```

---

## Metrics Available

From `mv_metrics_daily`:

- `total_calls` - Total calls on date
- `orders_count` - Orders placed
- `reservations_count` - Reservations made
- `completed_calls` - Calls that ended successfully
- `total_revenue_orders` - Revenue from orders
- `total_revenue_res_estimate` - Estimated reservation revenue
- `total_revenue_combined` - Total revenue (orders + reservations)
- `upsells_count` - Number of upsells
- `total_upsell_value` - Total upsell value
- `minutes_saved` - Minutes saved (completed_calls × baseline ÷ 60)
- `avg_call_duration_seconds` - Average call duration

---

## Common Queries

**Today's metrics for user:**
```typescript
const { data } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .in('location_id', userLocations.locations.map(l => l.locationId))
  .eq('date', new Date().toISOString().split('T')[0])
```

**Last 7 days:**
```typescript
const weekAgo = new Date()
weekAgo.setDate(weekAgo.getDate() - 7)

const { data } = await supabase
  .from('mv_metrics_daily')
  .select('*')
  .eq('location_id', locationId)
  .gte('date', weekAgo.toISOString().split('T')[0])
  .order('date', { ascending: false })
```

**Aggregate across locations:**
```typescript
const totals = metrics.reduce((acc, row) => ({
  total_calls: acc.total_calls + row.total_calls,
  total_revenue: acc.total_revenue + row.total_revenue_combined,
  minutes_saved: acc.minutes_saved + row.minutes_saved
}), { total_calls: 0, total_revenue: 0, minutes_saved: 0 })
```

---

## Troubleshooting

**No data returned:**
1. Check `certus_notification_email` is populated in locations table
2. Verify user's email matches the location email
3. Check mv has data: `SELECT COUNT(*) FROM mv_metrics_daily;`
4. Manual refresh: `SELECT public.refresh_metrics_daily();`

**Metrics not updating:**
1. Check pg_cron status: `SELECT * FROM cron.job WHERE jobname = 'refresh_metrics_daily';`
2. Check for errors: `SELECT * FROM cron.job_run_details WHERE status = 'failed';`

**User has no locations:**
- Update location: `UPDATE locations SET certus_notification_email = 'user@email.com' WHERE location_id = '...';`

---

## Reference

- **Complete Guide:** [metrics_implementation_guide.md](./metrics_implementation_guide.md)
- **Database Schema:** [database_schema.md](./database_schema.md)
- **Migration File:** `supabase/migrations/20251115_metrics_and_settings.sql`
