# Story 3.2: KPI Tiles Query & Data Fetching (mv_metrics_daily)

**Epic:** Epic 3 - Overview Page
**Status:** pending
**Assignee:** frontend-developer
**Dependencies:** Story 1.3 (mv_metrics_daily), Story 2.3 (KpiTile component)
**Estimated Effort:** M (1-2 days)

---

## Description

Implement the data fetching logic to query `mv_metrics_daily` and calculate KPI values for the Overview page. This includes creating typed query helpers, handling date range filters, and aggregating metrics across the selected period.

---

## Acceptance Criteria

- [ ] Query helper function `getMetricsDaily()` created in `/lib/queries/metrics.ts`
- [ ] Function accepts parameters: accountId, locationId (optional), dateFrom, dateTo
- [ ] Returns aggregated metrics for the date range:
  - total_calls (sum)
  - total_revenue (sum of orders + res_estimate based on revenue_mode)
  - minutes_saved (sum)
  - orders_placed (sum of orders_count)
  - reservations_booked (sum of reservations_count)
- [ ] Function uses Supabase client (server-side)
- [ ] Query executes in < 200ms for typical date ranges (7-30 days)
- [ ] Handles errors gracefully (returns null or throws with clear message)
- [ ] TypeScript types defined for return values
- [ ] Query respects RLS policies (account_id filtering)
- [ ] Works with location filter (if locationId provided, filter to that location)
- [ ] Default date range is last 7 days if not provided

---

## Technical Notes

**Query Helper Implementation:**
```tsx
// /lib/queries/metrics.ts

import { createServerClient } from '@/lib/supabase/server';

export interface MetricsSummary {
  totalCalls: number;
  totalRevenue: number;
  minutesSaved: number;
  ordersPlaced: number;
  reservationsBooked: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export async function getMetricsDaily(params: {
  accountId: string;
  locationId?: string;
  dateFrom: string;  // ISO date string
  dateTo: string;    // ISO date string
}): Promise<MetricsSummary | null> {
  const supabase = createServerClient();

  try {
    let query = supabase
      .from('mv_metrics_daily')
      .select('*')
      .eq('account_id', params.accountId)
      .gte('date', params.dateFrom)
      .lte('date', params.dateTo);

    if (params.locationId) {
      query = query.eq('location_id', params.locationId);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Aggregate across all rows
    const summary = data.reduce(
      (acc, row) => ({
        totalCalls: acc.totalCalls + row.total_calls,
        totalRevenue: acc.totalRevenue + row.total_revenue_orders + row.total_revenue_res_estimate,
        minutesSaved: acc.minutesSaved + row.minutes_saved,
        ordersPlaced: acc.ordersPlaced + row.orders_count,
        reservationsBooked: acc.reservationsBooked + row.reservations_count,
      }),
      {
        totalCalls: 0,
        totalRevenue: 0,
        minutesSaved: 0,
        ordersPlaced: 0,
        reservationsBooked: 0,
      }
    );

    return {
      ...summary,
      dateRange: {
        from: params.dateFrom,
        to: params.dateTo,
      },
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw new Error('Failed to fetch metrics');
  }
}

// Helper for default date range (last 7 days)
export function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);

  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}
```

**Usage in Overview Page:**
```tsx
// /app/(dashboard)/overview/page.tsx

import { getMetricsDaily, getDefaultDateRange } from '@/lib/queries/metrics';

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: { dateFrom?: string; dateTo?: string; location?: string };
}) {
  const { from, to } = searchParams.dateFrom && searchParams.dateTo
    ? { from: searchParams.dateFrom, to: searchParams.dateTo }
    : getDefaultDateRange();

  const accountId = 'current-user-account-id'; // From auth context
  const locationId = searchParams.location;

  const metrics = await getMetricsDaily({
    accountId,
    locationId,
    dateFrom: from,
    dateTo: to,
  });

  if (!metrics) {
    return <EmptyState message="No data for selected period" />;
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      <KpiTile label="Total Calls" value={metrics.totalCalls} format="number" />
      <KpiTile label="Total Revenue" value={metrics.totalRevenue} format="currency" />
      <KpiTile label="Minutes Saved" value={metrics.minutesSaved} format="time" />
      <KpiTile label="Orders Placed" value={metrics.ordersPlaced} format="number" />
      <KpiTile label="Reservations Booked" value={metrics.reservationsBooked} format="number" />
    </div>
  );
}
```

---

## Testing Requirements

- [ ] Unit test: query returns correct aggregated values
- [ ] Unit test: query filters by location correctly
- [ ] Unit test: query handles empty results
- [ ] Unit test: query throws on database error
- [ ] Integration test: query works with seeded mv_metrics_daily data
- [ ] Performance test: query completes in < 200ms with 1000+ rows
- [ ] Test default date range helper returns last 7 days

---

## Related Files

- `/lib/queries/metrics.ts` (create)
- `/lib/supabase/server.ts` (Supabase server client)
- `/app/(dashboard)/overview/page.tsx` (use this query)
- `/tests/unit/queries/metrics.test.ts` (create)
