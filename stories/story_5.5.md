# Story 5.5: Daily Calls Volume Chart (recharts/visx)

**Epic:** Epic 5 - Analytics & Reporting
**Status:** pending
**Assignee:** frontend-developer
**Dependencies:** Story 2.9 (Chart wrapper), Story 5.4 (Time series query)
**Estimated Effort:** M (1-2 days)

---

## Description

Implement the Daily Calls Volume line chart on the Analytics page using recharts or visx. The chart should display call volume trends over the selected date range with smooth animations and interactive tooltips.

---

## Acceptance Criteria

- [ ] Line chart renders correctly with data from mv_metrics_daily
- [ ] X-axis: Date (daily buckets)
- [ ] Y-axis: Number of calls
- [ ] Line animates in from baseline (~220-260ms ease-out)
- [ ] Hover shows tooltip with date, count, % change from previous day
- [ ] Tooltip fades in fast (~80-100ms)
- [ ] Chart handles sparse data (fills missing dates with zero)
- [ ] Chart renders in < 1s for typical ranges (30-90 days)
- [ ] Responsive: works on mobile, tablet, desktop
- [ ] Dark mode: line color adjusts for dark background
- [ ] Accessibility: data points keyboard navigable
- [ ] Respects `prefers-reduced-motion` (no animation if preferred)

---

## Technical Notes

**Chart Library Decision:**
- **recharts**: Easier API, good for standard charts
- **visx**: More flexible, better performance, D3-based
- **Recommendation:** Start with recharts for speed; switch to visx if performance issues

**Implementation with recharts:**
```tsx
// /components/analytics/CallsVolumeChart.tsx

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

interface CallsVolumeChartProps {
  data: Array<{
    date: string;
    totalCalls: number;
  }>;
}

export function CallsVolumeChart({ data }: CallsVolumeChartProps) {
  // Fill missing dates with zero
  const filledData = fillMissingDates(data);

  // Calculate % change from previous day
  const enrichedData = filledData.map((d, i) => ({
    ...d,
    percentChange: i > 0 ? ((d.totalCalls - filledData[i - 1].totalCalls) / filledData[i - 1].totalCalls) * 100 : 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22 }}
      className="w-full h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={enrichedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(parseISO(date), 'MMM d')}
            className="text-xs"
          />
          <YAxis className="text-xs" />
          <Tooltip
            content={<CustomTooltip />}
            animationDuration={100}
          />
          <Line
            type="monotone"
            dataKey="totalCalls"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            animationDuration={240}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const percentChange = data.percentChange;

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium">{format(parseISO(data.date), 'MMM d, yyyy')}</p>
      <p className="text-lg font-bold">{data.totalCalls} calls</p>
      {percentChange !== 0 && (
        <p className={`text-xs ${percentChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {percentChange > 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}% from previous day
        </p>
      )}
    </div>
  );
}

// Helper to fill missing dates
function fillMissingDates(data: Array<{ date: string; totalCalls: number }>) {
  if (data.length === 0) return [];

  const filled: typeof data = [];
  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const start = parseISO(sorted[0].date);
  const end = parseISO(sorted[sorted.length - 1].date);

  let current = start;
  while (current <= end) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const existing = sorted.find((d) => d.date === dateStr);
    filled.push(existing || { date: dateStr, totalCalls: 0 });
    current.setDate(current.getDate() + 1);
  }

  return filled;
}
```

**Usage:**
```tsx
// /app/(dashboard)/analytics/page.tsx

import { CallsVolumeChart } from '@/components/analytics/CallsVolumeChart';
import { getTimeSeriesData } from '@/lib/queries/metrics';

export default async function AnalyticsPage({ searchParams }: { searchParams: { dateFrom?: string; dateTo?: string } }) {
  const data = await getTimeSeriesData({
    accountId: 'current-account',
    dateFrom: searchParams.dateFrom || '2025-01-01',
    dateTo: searchParams.dateTo || '2025-01-31',
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Daily Calls Volume</h2>
      <CallsVolumeChart data={data} />
    </div>
  );
}
```

---

## Testing Requirements

- [ ] Visual test: chart renders with correct data points
- [ ] Visual test: line animates in smoothly
- [ ] Unit test: fillMissingDates fills gaps correctly
- [ ] Unit test: percent change calculated correctly
- [ ] Integration test: chart updates when data changes
- [ ] Performance test: chart renders in < 1s with 90 days of data
- [ ] Accessibility test: keyboard navigation works
- [ ] Test reduced motion: no animation when preferred
- [ ] Dark mode test: chart colors work in dark mode

---

## Related Files

- `/components/analytics/CallsVolumeChart.tsx` (create)
- `/lib/queries/metrics.ts` (time series query helper)
- `/app/(dashboard)/analytics/page.tsx` (integrate chart)
