import React from 'react';
import { redirect } from 'next/navigation';
import { KPITile } from '@/components/dashboard/kpi-tile';
import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { RecentActivitiesTable } from '@/components/dashboard/recent-activities-table';
import {
  mockQuickActions,
  KPIData,
  RecentActivity,
} from '@/lib/mock-data';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { TimeFilterTabs } from './time-filter-tabs';
import { LocationSelector } from './location-selector';
import { RecentActivitiesTableWrapper } from './recent-activities-wrapper';

type TimeRange = 'today' | 'yesterday' | 'week' | 'all';

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: { range?: TimeRange; locationId?: string };
}) {
  const timeRange = searchParams.range || 'week';
  const supabase = await createServerSupabaseClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    console.error('Auth error:', authError);
    redirect('/login');
  }

  // Use service role client to bypass RLS for location lookup
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Get user's locations from user_roles_permissions table
  const { data: userLocationRows, error: locationsError } = await supabaseAdmin
    .from('user_roles_permissions')
    .select(`
      location_id,
      locations!inner (
        location_id,
        name,
        certus_notification_email
      )
    `)
    .eq('user_id', user.id);

  console.log('User email:', user.email);
  console.log('User locations:', userLocationRows);

  let locations: Array<{ location_id: number; name: string; certus_notification_email: string }> = [];
  let selectedLocation: { location_id: number; name: string; certus_notification_email: string } | null = null;

  if (userLocationRows && userLocationRows.length > 0) {
    // Extract unique locations from user_roles_permissions
    locations = userLocationRows.map(row => ({
      location_id: (row.locations as any).location_id,
      name: (row.locations as any).name,
      certus_notification_email: (row.locations as any).certus_notification_email
    }));

    // Remove duplicates (in case user has multiple roles at same location)
    const uniqueLocationIds = new Set();
    locations = locations.filter(loc => {
      if (uniqueLocationIds.has(loc.location_id)) {
        return false;
      }
      uniqueLocationIds.add(loc.location_id);
      return true;
    });

    // Use selected location from URL param, or default to first location
    if (searchParams.locationId) {
      const locationIdNum = parseInt(searchParams.locationId);
      selectedLocation = locations.find(loc => loc.location_id === locationIdNum) || locations[0];
    } else {
      selectedLocation = locations[0];
    }
  }

  if (!selectedLocation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Location Found</h2>
          <p className="text-gray-600 mb-6">
            No location is associated with <span className="font-semibold">{user.email}</span>.
            <br />
            Please contact your administrator.
          </p>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl shadow-lg font-semibold"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate date range based on timeRange
  const today = new Date();
  let startDate: string;
  let endDate = today.toISOString().split('T')[0];

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
    case 'all':
    default:
      startDate = '2020-01-01'; // Far back date to get all data
      break;
  }

  // First, check if we have ANY metrics data for this location (all time)
  const { data: allTimeCheck } = await supabaseAdmin
    .from('mv_metrics_daily')
    .select('date')
    .eq('location_id', selectedLocation.location_id)
    .limit(1);

  const hasAnyMetrics = allTimeCheck && allTimeCheck.length > 0;

  // If no metrics data exists at all for this location, show a different message
  if (!hasAnyMetrics) {
    return (
      <div className="flex flex-col gap-6 px-8 py-6 flex-1 w-full">
        {/* Header with location info */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing data for: <span className="font-semibold text-gray-900">{selectedLocation.name}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* No Data Message */}
        <div className="flex flex-col items-center justify-center flex-1 py-20">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Metrics Data Yet</h2>
            <p className="text-gray-600 mb-2">
              We haven't collected any metrics data for <span className="font-semibold">{selectedLocation.name}</span> yet.
            </p>
            <p className="text-sm text-gray-500">
              Data will appear here once your Certus AI assistant starts handling calls.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate previous period dates for comparison
  let previousStartDate: string;
  let previousEndDate: string;

  switch (timeRange) {
    case 'today':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      previousStartDate = yesterday.toISOString().split('T')[0];
      previousEndDate = previousStartDate;
      break;
    case 'yesterday':
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      previousStartDate = twoDaysAgo.toISOString().split('T')[0];
      previousEndDate = previousStartDate;
      break;
    case 'week':
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      previousStartDate = twoWeeksAgo.toISOString().split('T')[0];
      const weekBeforeLastWeek = new Date(today);
      weekBeforeLastWeek.setDate(weekBeforeLastWeek.getDate() - 8);
      previousEndDate = weekBeforeLastWeek.toISOString().split('T')[0];
      break;
    case 'all':
    default:
      // For "all time", don't calculate comparison
      previousStartDate = '';
      previousEndDate = '';
      break;
  }

  // Fetch current period metrics from materialized view and aggregate
  let query = supabaseAdmin
    .from('mv_metrics_daily')
    .select('*')
    .eq('location_id', selectedLocation.location_id)
    .gte('date', startDate)
    .lte('date', endDate);

  const { data: metricsRows } = await query;

  // Aggregate metrics across the date range
  const metricsData = metricsRows?.reduce((acc, row) => ({
    total_calls: (acc.total_calls || 0) + (row.total_calls || 0),
    orders_count: (acc.orders_count || 0) + (row.orders_count || 0),
    reservations_count: (acc.reservations_count || 0) + (row.reservations_count || 0),
    total_revenue_combined: (acc.total_revenue_combined || 0) + (row.total_revenue_combined || 0),
    upsells_count: (acc.upsells_count || 0) + (row.upsells_count || 0),
    minutes_saved: (acc.minutes_saved || 0) + (row.minutes_saved || 0),
  }), {} as any) || null;

  // Fetch previous period metrics for comparison
  let previousMetricsData = null;
  if (previousStartDate && previousEndDate && timeRange !== 'all') {
    const previousQuery = supabaseAdmin
      .from('mv_metrics_daily')
      .select('*')
      .eq('location_id', selectedLocation.location_id)
      .gte('date', previousStartDate)
      .lte('date', previousEndDate);

    const { data: previousMetricsRows } = await previousQuery;

    previousMetricsData = previousMetricsRows?.reduce((acc, row) => ({
      total_calls: (acc.total_calls || 0) + (row.total_calls || 0),
      orders_count: (acc.orders_count || 0) + (row.orders_count || 0),
      reservations_count: (acc.reservations_count || 0) + (row.reservations_count || 0),
      total_revenue_combined: (acc.total_revenue_combined || 0) + (row.total_revenue_combined || 0),
      upsells_count: (acc.upsells_count || 0) + (row.upsells_count || 0),
      minutes_saved: (acc.minutes_saved || 0) + (row.minutes_saved || 0),
    }), {} as any) || null;
  }

  // Helper function to calculate trend
  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    const percentChange = ((current - previous) / previous) * 100;
    return {
      direction: (percentChange >= 0 ? 'up' : 'down') as 'up' | 'down',
      value: `${Math.abs(percentChange).toFixed(1)}%`
    };
  };

  // Check if current time range has no data (but location has data for other periods)
  const hasDataForRange = metricsRows && metricsRows.length > 0;

  // Fetch recent call activities (last 10 calls)
  const { data: recentCalls } = await supabaseAdmin
    .from('calls_v')
    .select('*')
    .eq('location_id', selectedLocation.location_id)
    .order('started_at', { ascending: false })
    .limit(10);

  // For each call, fetch related orders and reservations to determine TRUE call type
  const callsWithRelations = await Promise.all((recentCalls || []).map(async (call) => {
    // Check for orders
    const { data: orders } = await supabaseAdmin
      .from('orders_v')
      .select('id, total_amount')
      .eq('call_id', call.id);

    // Check for reservations
    const { data: reservations } = await supabaseAdmin
      .from('reservations_v')
      .select('id, guest_count, reservation_name')
      .eq('call_id', call.id);

    return {
      ...call,
      orders: orders || [],
      reservations: reservations || []
    };
  }));

  // Transform calls into activities format
  const recentActivities: RecentActivity[] = callsWithRelations.map(call => {
    const startedAt = new Date(call.started_at);
    const now = new Date();
    const diffInHours = (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60);

    // Format time intelligently
    let timeDisplay: string;
    if (diffInHours < 1) {
      // Less than an hour ago - show "X minutes ago"
      const minutes = Math.floor(diffInHours * 60);
      timeDisplay = minutes === 0 ? 'Just now' : `${minutes}m ago`;
    } else if (diffInHours < 24) {
      // Today - show time like "2:30 PM"
      timeDisplay = startedAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 48) {
      // Yesterday - show "Yesterday 2:30 PM"
      timeDisplay = `Yesterday ${startedAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;
    } else {
      // Older - show "Sep 25 . 6:32 PM"
      timeDisplay = startedAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }) + ' . ' + startedAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }

    // Determine call health based on status
    let callHealth: 'success' | 'warning' | 'error' = 'success';
    if (call.status === 'failed' || call.status === 'error') {
      callHealth = 'error';
    } else if (call.status === 'in_progress') {
      callHealth = 'warning';
    }

    // Determine ACTUAL call type by checking related tables (not flags!)
    let actualCallType: 'order' | 'reservation' | 'inquiry' | 'other' = 'inquiry';
    let callTypeName = 'General Inquiry';

    // Check if there's an actual order in orders_v
    const hasOrder = call.orders && Array.isArray(call.orders) && call.orders.length > 0;
    // Check if there's an actual reservation in reservations_v
    const hasReservation = call.reservations && Array.isArray(call.reservations) && call.reservations.length > 0;

    if (hasOrder) {
      actualCallType = 'order';
      callTypeName = 'Order';
    } else if (hasReservation) {
      actualCallType = 'reservation';
      callTypeName = 'Reservation';
    } else {
      // Check pathway tags for catering (since that's not a separate table)
      if (call.transcript_md && call.transcript_md.toLowerCase().includes('catering')) {
        actualCallType = 'other';
        callTypeName = 'Catering';
      } else {
        actualCallType = 'inquiry';
        callTypeName = 'General Inquiry';
      }
    }

    // Map call_type to appropriate icon
    const iconMap: Record<string, string> = {
      'order': 'ClipboardText',
      'reservation': 'CallBell',
      'catering': 'Phone',
      'inquiry': 'Phone',
      'other': 'Phone'
    };

    // Format duration
    const duration = call.duration_seconds || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationDisplay = `${minutes}m ${seconds}s`;

    // Format phone number
    const formatPhoneNumber = (num: string) => {
      if (!num) return 'Unknown';
      const cleaned = num.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      if (cleaned.length === 11 && cleaned[0] === '1') {
        return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
      }
      return num;
    };

    // Create a better summary
    let summary = call.summary_md ? call.summary_md.substring(0, 100) : 'No summary available';

    // If we have order or reservation details, enhance the summary
    if (hasOrder && call.orders[0]) {
      const orderAmount = call.orders[0].total_amount;
      summary = `Order placed - $${(orderAmount / 100).toFixed(2)}`;
    } else if (hasReservation && call.reservations[0]) {
      const reservation = call.reservations[0];
      const guestCount = reservation.guest_count || 0;
      const name = reservation.reservation_name || 'Unknown';
      summary = `Reservation for ${guestCount} - ${name}`;
    }

    return {
      id: call.id,
      time: timeDisplay,
      callType: actualCallType as any,
      icon: iconMap[actualCallType] || 'Phone',
      summary,
      type: actualCallType as any,
      callHealth,
      from: formatPhoneNumber(call.from_number),
      duration: durationDisplay
    };
  });

  // Transform metrics data into KPI format with trends
  const kpiData: KPIData[] = [
    {
      id: 'total-revenue',
      icon: 'CreditCard',
      label: 'Total Revenue',
      value: metricsData?.total_revenue_combined
        ? `$${(metricsData.total_revenue_combined / 100).toFixed(2)}`
        : '$0.00',
      trend: previousMetricsData
        ? calculateTrend(
            metricsData?.total_revenue_combined || 0,
            previousMetricsData.total_revenue_combined || 0
          ) || undefined
        : undefined,
    },
    {
      id: 'total-calls',
      icon: 'Phone',
      label: 'Total Calls',
      value: metricsData?.total_calls || 0,
      trend: previousMetricsData
        ? calculateTrend(
            metricsData?.total_calls || 0,
            previousMetricsData.total_calls || 0
          ) || undefined
        : undefined,
    },
    {
      id: 'orders-placed',
      icon: 'ListDashes',
      label: 'Orders Placed',
      value: metricsData?.orders_count || 0,
      trend: previousMetricsData
        ? calculateTrend(
            metricsData?.orders_count || 0,
            previousMetricsData.orders_count || 0
          ) || undefined
        : undefined,
    },
    {
      id: 'reservations-booked',
      icon: 'CallBell',
      label: 'Reservations',
      value: metricsData?.reservations_count || 0,
      trend: previousMetricsData
        ? calculateTrend(
            metricsData?.reservations_count || 0,
            previousMetricsData.reservations_count || 0
          ) || undefined
        : undefined,
    },
    {
      id: 'upsells-attempted',
      icon: 'TrendUp',
      label: 'Upsells',
      value: metricsData?.upsells_count || 0,
      trend: previousMetricsData
        ? calculateTrend(
            metricsData?.upsells_count || 0,
            previousMetricsData.upsells_count || 0
          ) || undefined
        : undefined,
    },
    {
      id: 'minutes-saved',
      icon: 'ClockCountdown',
      label: 'Time Saved',
      value: metricsData?.minutes_saved
        ? `${(metricsData.minutes_saved / 60).toFixed(1)} hrs`
        : '0 hrs',
      trend: previousMetricsData
        ? calculateTrend(
            metricsData?.minutes_saved || 0,
            previousMetricsData.minutes_saved || 0
          ) || undefined
        : undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-8 py-6 flex-1 w-full">
      {/* Time Filter & Location Info */}
      <div className="flex items-center justify-between">
        <TimeFilterTabs currentRange={timeRange} />
        <div className="flex items-center gap-4">
          <LocationSelector
            locations={locations}
            selectedLocationId={selectedLocation.location_id}
          />
          <div className="text-sm text-gray-600">
            Showing data for: <span className="font-semibold text-gray-900">{selectedLocation.name}</span>
          </div>
        </div>
      </div>

      {/* Show message if no data for this time range */}
      {!hasDataForRange && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">No data for this time range</p>
              <p className="text-sm text-blue-700 mt-1">
                Try selecting "All Time" to see your available data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Section & Quick Actions */}
      <div className="flex items-start gap-6 w-full">
        {/* KPI Tiles Grid */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Top Row - Revenue (larger) + 2 KPIs */}
          <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-4">
            {kpiData.slice(0, 3).map((kpi) => (
              <KPITile key={kpi.id} {...kpi} />
            ))}
          </div>

          {/* Bottom Row - 3 KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {kpiData.slice(3, 6).map((kpi) => (
              <KPITile key={kpi.id} {...kpi} />
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="flex flex-col w-80 gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>

          <div className="flex flex-col gap-2">
            {mockQuickActions.map((action) => (
              <QuickActionCard key={action.id} {...action} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities Table */}
      <RecentActivitiesTableWrapper
        activities={recentActivities}
      />
    </div>
  );
}
