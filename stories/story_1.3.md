# Story 1.3: Materialized Metrics View & pg_cron

**Epic:** Epic 1 - Foundation & Infrastructure Setup
**Status:** pending
**Assignee:** backend-architect
**Dependencies:** Story 1.1 (base tables), Story 1.2 (views)
**Estimated Effort:** L (2-3 days)

---

## Description

Create the `mv_metrics_daily` materialized view that aggregates calls, orders, and reservations into daily metrics per account and location. Set up pg_cron to refresh this view every 5 minutes to keep metrics current.

---

## Acceptance Criteria

- [ ] `mv_metrics_daily` materialized view created with correct schema
- [ ] View aggregates data from calls_v, orders_v, reservations_v
- [ ] View includes all required fields:
  - account_id, location_id, date
  - total_calls, orders_count, reservations_count
  - total_revenue_orders, total_revenue_res_estimate
  - minutes_saved
- [ ] Revenue calculation respects account_settings.revenue_mode
- [ ] Minutes saved uses baseline from location_settings or account_settings
- [ ] Reservation revenue estimate uses avg_spend_per_head hierarchy (reservation override > location > account)
- [ ] pg_cron enabled on Supabase project
- [ ] Cron job scheduled to refresh view every 5 minutes
- [ ] Indexes created on (account_id, location_id, date) for fast lookups
- [ ] Manual refresh function available for debugging
- [ ] View refresh completes in < 5 seconds with 100k+ call records

---

## Technical Notes

**Reference:**
- PRD Section 4.4: Daily Metrics Materialized View
- Architecture Section 4.4: Materialized View mv_metrics_daily

**Key Logic:**
```sql
CREATE MATERIALIZED VIEW mv_metrics_daily AS
WITH calls AS (
  SELECT
    account_id,
    location_id,
    DATE(started_at) AS date,
    COUNT(*) AS total_calls,
    SUM(CASE WHEN call_type = 'order' THEN 1 ELSE 0 END) AS orders_count,
    SUM(CASE WHEN call_type = 'reservation' THEN 1 ELSE 0 END) AS reservations_count,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_calls
  FROM calls_v
  GROUP BY account_id, location_id, DATE(started_at)
),
orders AS (
  SELECT
    account_id,
    location_id,
    DATE(created_at) AS date,
    SUM(total_amount) AS total_revenue_orders
  FROM orders_v
  GROUP BY account_id, location_id, DATE(created_at)
),
res_est AS (
  SELECT
    r.account_id,
    r.location_id,
    DATE(r.created_at) AS date,
    SUM(
      r.guest_count *
      COALESCE(
        r.avg_spend_per_head_override,
        ls.avg_spend_per_head,
        acs.avg_spend_per_head
      )
    ) AS total_revenue_res_estimate
  FROM reservations_v r
  LEFT JOIN location_settings ls ON r.location_id = ls.location_id
  LEFT JOIN account_settings acs ON r.account_id = acs.account_id
  GROUP BY r.account_id, r.location_id, DATE(r.created_at)
),
minutes AS (
  SELECT
    c.account_id,
    c.location_id,
    c.date,
    (c.completed_calls * COALESCE(ls.minutes_saved_baseline_seconds, acs.minutes_saved_baseline_seconds, 120) / 60.0) AS minutes_saved
  FROM calls c
  LEFT JOIN location_settings ls ON c.location_id = ls.location_id
  LEFT JOIN account_settings acs ON c.account_id = acs.account_id
)
SELECT
  COALESCE(c.account_id, o.account_id, r.account_id, m.account_id) AS account_id,
  COALESCE(c.location_id, o.location_id, r.location_id, m.location_id) AS location_id,
  COALESCE(c.date, o.date, r.date, m.date) AS date,
  COALESCE(c.total_calls, 0) AS total_calls,
  COALESCE(c.orders_count, 0) AS orders_count,
  COALESCE(c.reservations_count, 0) AS reservations_count,
  COALESCE(o.total_revenue_orders, 0) AS total_revenue_orders,
  COALESCE(r.total_revenue_res_estimate, 0) AS total_revenue_res_estimate,
  COALESCE(m.minutes_saved, 0) AS minutes_saved
FROM calls c
FULL OUTER JOIN orders o USING (account_id, location_id, date)
FULL OUTER JOIN res_est r USING (account_id, location_id, date)
FULL OUTER JOIN minutes m USING (account_id, location_id, date);

-- Index for fast lookups
CREATE INDEX idx_mv_metrics_daily_account_location_date
ON mv_metrics_daily (account_id, location_id, date);

-- pg_cron refresh job
SELECT cron.schedule(
  'refresh-metrics-daily',
  '*/5 * * * *',  -- Every 5 minutes
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_metrics_daily;'
);
```

**Manual Refresh Function:**
```sql
CREATE OR REPLACE FUNCTION refresh_metrics_daily()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_metrics_daily;
END;
$$ LANGUAGE plpgsql;
```

---

## Testing Requirements

- [ ] Insert test data (calls, orders, reservations) spanning multiple days
- [ ] Run manual refresh and verify aggregations correct
- [ ] Query mv_metrics_daily with different date ranges
- [ ] Verify revenue calculations match expected values
- [ ] Verify minutes_saved calculation uses correct baseline
- [ ] Test performance: query for 30 days should be < 100ms
- [ ] Verify cron job executes successfully (check Supabase logs)
- [ ] Test concurrent refresh (should not lock table)

---

## Related Files

- `/supabase/schema.sql` (add MV definition)
- `/supabase/functions/refresh_metrics.sql` (manual refresh function)
- `/lib/queries/metrics.ts` (frontend queries will use this view)
