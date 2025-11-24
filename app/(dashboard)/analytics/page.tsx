import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { AnalyticsFilters } from './analytics-filters';
import { HeroRevenueChart } from './hero-revenue-chart';
import { QuickStatsBar } from './quick-stats-bar';
import { SecondaryCharts } from './secondary-charts';
import { ExportButton } from './export-button';

type CallType = 'all' | 'orders' | 'reservations' | 'catering' | 'complaints';
type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'all';

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: {
    callType?: CallType;
    range?: TimeRange;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  };
}) {
  const callType = searchParams.callType || 'all';
  const timeRange = searchParams.range || 'week';
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    redirect('/login');
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data: userLocationRows } = await supabaseAdmin
    .from('user_roles_permissions')
    .select(
      `
      location_id,
      locations!inner (
        location_id,
        name,
        certus_notification_email,
        account_id,
        time_zone,
        operating_hours_json
      )
    `
    )
    .eq('user_id', user.id);

  if (!userLocationRows || userLocationRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Location Found
          </h2>
          <p className="text-gray-600 mb-6">
            No location is associated with{' '}
            <span className="font-semibold">{user.email}</span>.
          </p>
        </div>
      </div>
    );
  }

  const selectedLocation = {
    location_id: (userLocationRows[0].locations as any).location_id,
    name: (userLocationRows[0].locations as any).name,
    account_id: (userLocationRows[0].locations as any).account_id,
    time_zone: (userLocationRows[0].locations as any).time_zone || 'America/New_York', // Default to ET if not set
    operating_hours_json: (userLocationRows[0].locations as any).operating_hours_json,
  };

  // Calculate date range
  const today = new Date();
  let startDate: string;
  let endDate = today.toISOString().split('T')[0];

  if (searchParams.startDate && searchParams.endDate) {
    startDate = searchParams.startDate;
    endDate = searchParams.endDate;
  } else {
    switch (timeRange) {
      case 'today':
        startDate = endDate;
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
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'all':
      default:
        // For 'all', we'll fetch all available data
        startDate = '2020-01-01'; // Set a reasonable earliest date
        break;
    }
  }

  // Determine if this is a single-day view
  const isSingleDay = startDate === endDate;

  // For single-day views, we need hourly data from call_logs
  // For multi-day views, use mv_metrics_daily
  let metricsRows: any[] = [];

  if (isSingleDay) {
    // Fetch hourly data from call_logs for single-day views
    // Use a wider date range to account for timezone differences
    const startDateTime = `${startDate}T00:00:00`;
    const endDateTime = `${endDate}T23:59:59`;

    // First, fetch all calls for the day
    const { data: allCalls, error: callsError } = await supabaseAdmin
      .from('call_logs')
      .select('call_id, started_at_utc')
      .eq('location_id', selectedLocation.location_id)
      .gte('started_at_utc', startDateTime)
      .lte('started_at_utc', endDateTime);

    if (callsError) console.error('Calls query error:', callsError);

    let filteredCallLogs: any[] = [];

    if (callType === 'orders') {
      // Get order_logs for this date range
      const { data: orders, error: ordersError } = await supabaseAdmin
        .from('order_logs')
        .select('call_id, total')
        .in('call_id', (allCalls || []).map(c => c.call_id));

      if (ordersError) console.error('Orders query error:', ordersError);

      // Combine call data with order data
      filteredCallLogs = (allCalls || [])
        .map(call => {
          const orderData = orders?.filter(o => o.call_id === call.call_id) || [];
          if (orderData.length > 0) {
            return {
              ...call,
              order_logs: orderData
            };
          }
          return null;
        })
        .filter(c => c !== null);

    } else if (callType === 'reservations') {
      // Get reservations for this date range
      const { data: reservations, error: resError } = await supabaseAdmin
        .from('reservations')
        .select('call_id, guest_count')
        .in('call_id', (allCalls || []).map(c => c.call_id));

      if (resError) console.error('Reservations query error:', resError);

      // Combine call data with reservation data
      filteredCallLogs = (allCalls || [])
        .map(call => {
          const resData = reservations?.filter(r => r.call_id === call.call_id) || [];
          if (resData.length > 0) {
            return {
              ...call,
              reservations: resData
            };
          }
          return null;
        })
        .filter(c => c !== null);

    } else {
      // For 'all', fetch both orders and reservations
      const callIds = (allCalls || []).map(c => c.call_id);

      const { data: orders, error: ordersErr } = await supabaseAdmin
        .from('order_logs')
        .select('call_id, total')
        .in('call_id', callIds.length > 0 ? callIds : ['']);

      const { data: reservations, error: resErr } = await supabaseAdmin
        .from('reservations')
        .select('call_id, guest_count')
        .in('call_id', callIds.length > 0 ? callIds : ['']);

      if (ordersErr) console.error('Orders fetch error:', ordersErr);
      if (resErr) console.error('Reservations fetch error:', resErr);

      // Combine all data
      filteredCallLogs = (allCalls || []).map(call => ({
        ...call,
        order_logs: orders?.filter(o => o.call_id === call.call_id) || [],
        reservations: reservations?.filter(r => r.call_id === call.call_id) || []
      }));
    }

    // Initialize all 24 hours with zero values
    const hourlyData: { [key: string]: any } = {};
    for (let h = 0; h < 24; h++) {
      const hourKey = `${h.toString().padStart(2, '0')}:00`;
      hourlyData[hourKey] = {
        date: hourKey,
        total_calls: 0,
        orders_count: 0,
        reservations_count: 0,
        total_revenue_orders: 0,
        total_revenue_res_estimate: 0,
        total_revenue_combined: 0,
      };
    }

    // Populate with actual data
    (filteredCallLogs || []).forEach((call) => {
      // Convert UTC to location's local time for proper hour grouping
      const callDate = new Date(call.started_at_utc);

      // Use Intl.DateTimeFormat for reliable timezone conversion
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: selectedLocation.time_zone,
        hour: 'numeric',
        hour12: false,
      });

      // Get the local hour in the location's timezone
      const parts = formatter.formatToParts(callDate);
      const hourPart = parts.find(part => part.type === 'hour');
      const hour = hourPart ? parseInt(hourPart.value, 10) : callDate.getUTCHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;

      hourlyData[hourKey].total_calls += 1;

      if (call.order_logs && call.order_logs.length > 0) {
        hourlyData[hourKey].orders_count += 1;
        const orderRevenue = call.order_logs[0].total || 0; // Already in cents
        hourlyData[hourKey].total_revenue_orders += orderRevenue;
        hourlyData[hourKey].total_revenue_combined += orderRevenue;
      }

      if (call.reservations && call.reservations.length > 0) {
        hourlyData[hourKey].reservations_count += 1;
        // Estimate $50 per person for reservations
        const guestCount = call.reservations[0].guest_count || 2;
        const resRevenue = guestCount * 50 * 100; // in cents
        hourlyData[hourKey].total_revenue_res_estimate += resRevenue;
        hourlyData[hourKey].total_revenue_combined += resRevenue;
      }
    });

    metricsRows = Object.values(hourlyData).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  } else {
    // For multi-day views, use mv_metrics_daily but filter based on call type
    if (callType === 'all') {
      const { data } = await supabaseAdmin
        .from('mv_metrics_daily')
        .select('*')
        .eq('location_id', selectedLocation.location_id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
      metricsRows = data || [];
    } else {
      // For specific call types, we need to query call_logs and aggregate by day
      const { data: allCalls } = await supabaseAdmin
        .from('call_logs')
        .select('call_id, started_at_utc')
        .eq('location_id', selectedLocation.location_id)
        .gte('started_at_utc', `${startDate}T00:00:00`)
        .lte('started_at_utc', `${endDate}T23:59:59`);

      let callLogs: any[] = [];

      if (callType === 'orders') {
        const { data: orders } = await supabaseAdmin
          .from('order_logs')
          .select('call_id, total')
          .in('call_id', (allCalls || []).map(c => c.call_id));

        callLogs = (allCalls || [])
          .map(call => {
            const orderData = orders?.filter(o => o.call_id === call.call_id) || [];
            if (orderData.length > 0) {
              return {
                ...call,
                order_logs: orderData
              };
            }
            return null;
          })
          .filter(c => c !== null);

      } else if (callType === 'reservations') {
        const { data: reservations } = await supabaseAdmin
          .from('reservations')
          .select('call_id, guest_count')
          .in('call_id', (allCalls || []).map(c => c.call_id));

        callLogs = (allCalls || [])
          .map(call => {
            const resData = reservations?.filter(r => r.call_id === call.call_id) || [];
            if (resData.length > 0) {
              return {
                ...call,
                reservations: resData
              };
            }
            return null;
          })
          .filter(c => c !== null);
      }

      // Group by date
      const dailyData: { [key: string]: any } = {};

      callLogs.forEach((call) => {
        const date = call.started_at_utc.split('T')[0];

        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            total_calls: 0,
            orders_count: 0,
            reservations_count: 0,
            total_revenue_orders: 0,
            total_revenue_res_estimate: 0,
            total_revenue_combined: 0,
          };
        }

        dailyData[date].total_calls += 1;

        if (call.order_logs && call.order_logs.length > 0) {
          dailyData[date].orders_count += 1;
          const orderRevenue = call.order_logs[0].total || 0; // Already in cents
          dailyData[date].total_revenue_orders += orderRevenue;
          dailyData[date].total_revenue_combined += orderRevenue;
        }

        if (call.reservations && call.reservations.length > 0) {
          dailyData[date].reservations_count += 1;
          const guestCount = call.reservations[0].guest_count || 2;
          const resRevenue = guestCount * 50 * 100; // in cents
          dailyData[date].total_revenue_res_estimate += resRevenue;
          dailyData[date].total_revenue_combined += resRevenue;
        }
      });

      metricsRows = Object.values(dailyData).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    }
  }

  const aggregatedMetrics = (metricsRows || []).reduce(
    (acc, row) => ({
      total_calls: (acc.total_calls || 0) + (row.total_calls || 0),
      orders_count: (acc.orders_count || 0) + (row.orders_count || 0),
      reservations_count:
        (acc.reservations_count || 0) + (row.reservations_count || 0),
      completed_calls: (acc.completed_calls || 0) + (row.completed_calls || 0),
      total_revenue_orders:
        (acc.total_revenue_orders || 0) + (row.total_revenue_orders || 0),
      total_revenue_res_estimate:
        (acc.total_revenue_res_estimate || 0) +
        (row.total_revenue_res_estimate || 0),
      total_revenue_combined:
        (acc.total_revenue_combined || 0) + (row.total_revenue_combined || 0),
      upsells_count: (acc.upsells_count || 0) + (row.upsells_count || 0),
      total_upsell_value:
        (acc.total_upsell_value || 0) + (row.total_upsell_value || 0),
      minutes_saved: (acc.minutes_saved || 0) + (row.minutes_saved || 0),
      avg_call_duration_seconds:
        (acc.avg_call_duration_seconds || 0) +
        (row.avg_call_duration_seconds || 0),
      days_count: acc.days_count + 1,
    }),
    {
      total_calls: 0,
      orders_count: 0,
      reservations_count: 0,
      completed_calls: 0,
      total_revenue_orders: 0,
      total_revenue_res_estimate: 0,
      total_revenue_combined: 0,
      upsells_count: 0,
      total_upsell_value: 0,
      minutes_saved: 0,
      avg_call_duration_seconds: 0,
      days_count: 0,
    } as any
  );

  if (aggregatedMetrics.days_count > 0) {
    aggregatedMetrics.avg_call_duration_seconds =
      aggregatedMetrics.avg_call_duration_seconds / aggregatedMetrics.days_count;
  }

  const daysDiff = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - daysDiff - 1);
  const previousEndDate = new Date(startDate);
  previousEndDate.setDate(previousEndDate.getDate() - 1);

  const { data: previousMetricsRows } = await supabaseAdmin
    .from('mv_metrics_daily')
    .select('*')
    .eq('location_id', selectedLocation.location_id)
    .gte('date', previousStartDate.toISOString().split('T')[0])
    .lte('date', previousEndDate.toISOString().split('T')[0]);

  const previousMetrics = (previousMetricsRows || []).reduce(
    (acc, row) => ({
      total_calls: (acc.total_calls || 0) + (row.total_calls || 0),
      total_revenue_combined:
        (acc.total_revenue_combined || 0) + (row.total_revenue_combined || 0),
      orders_count: (acc.orders_count || 0) + (row.orders_count || 0),
      reservations_count:
        (acc.reservations_count || 0) + (row.reservations_count || 0),
    }),
    {
      total_calls: 0,
      total_revenue_combined: 0,
      orders_count: 0,
      reservations_count: 0,
    } as any
  );

  const { data: callTimeData } = await supabaseAdmin
    .from('call_logs')
    .select('corrected_duration_seconds')
    .eq('location_id', selectedLocation.location_id)
    .gte('started_at_utc', `${startDate}T00:00:00Z`)
    .lte('started_at_utc', `${endDate}T23:59:59Z`);

  const totalCallTimeSeconds = (callTimeData || []).reduce(
    (sum, call) => sum + (call.corrected_duration_seconds || 0),
    0
  );

  return (
    <div className="flex flex-col gap-4 px-6 py-4 flex-1 w-full bg-gray-50 min-h-screen">
      {/* Integrated Header & Filters */}
      <div className="flex items-center justify-between gap-4">
        <AnalyticsFilters
          currentCallType={callType}
          currentRange={timeRange}
          locationName={selectedLocation.name}
          startDate={startDate}
          endDate={endDate}
        />
        <ExportButton
          locationId={selectedLocation.location_id}
          locationName={selectedLocation.name}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      {/* HERO SECTION: Massive Revenue Chart */}
      <HeroRevenueChart
        metricsData={metricsRows || []}
        totalRevenue={aggregatedMetrics.total_revenue_combined}
        previousRevenue={previousMetrics.total_revenue_combined}
        totalCalls={aggregatedMetrics.total_calls}
        ordersCount={aggregatedMetrics.orders_count}
        reservationsCount={aggregatedMetrics.reservations_count}
        operatingHours={selectedLocation.operating_hours_json}
        displayDate={startDate}
      />

      {/* Quick Stats Bar - Compact metrics */}
      <QuickStatsBar
        totalCalls={aggregatedMetrics.total_calls}
        ordersCount={aggregatedMetrics.orders_count}
        reservationsCount={aggregatedMetrics.reservations_count}
        upsellCount={aggregatedMetrics.upsells_count}
        labourSavedHours={aggregatedMetrics.minutes_saved / 60}
        totalCallTimeSeconds={totalCallTimeSeconds}
        previousCalls={previousMetrics.total_calls}
        previousOrders={previousMetrics.orders_count}
        previousReservations={previousMetrics.reservations_count}
      />

      {/* Secondary Charts - Side by side */}
      <SecondaryCharts metricsData={metricsRows || []} />
    </div>
  );
}
