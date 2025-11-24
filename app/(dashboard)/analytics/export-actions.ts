'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function exportAnalyticsCSV(
  locationId: number,
  startDate: string,
  endDate: string
) {
  const supabase = await createServerSupabaseClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    throw new Error('Unauthorized');
  }

  // Use admin client to fetch data
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

  // Fetch metrics data
  const { data: metricsRows, error: metricsError } = await supabaseAdmin
    .from('mv_metrics_daily')
    .select('*')
    .eq('location_id', locationId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (metricsError) {
    throw new Error('Failed to fetch metrics data');
  }

  // Generate CSV content
  const headers = [
    'Date',
    'Total Calls',
    'Completed Calls',
    'Orders Count',
    'Order Revenue ($)',
    'Reservations Count',
    'Reservation Revenue ($)',
    'Total Revenue ($)',
    'Upsells Count',
    'Upsell Value ($)',
    'Minutes Saved',
    'Avg Call Duration (sec)',
  ];

  const rows = (metricsRows || []).map((row) => [
    row.date,
    row.total_calls || 0,
    row.completed_calls || 0,
    row.orders_count || 0,
    ((row.total_revenue_orders || 0) / 100).toFixed(2),
    row.reservations_count || 0,
    ((row.total_revenue_res_estimate || 0) / 100).toFixed(2),
    ((row.total_revenue_combined || 0) / 100).toFixed(2),
    row.upsells_count || 0,
    ((row.total_upsell_value || 0) / 100).toFixed(2),
    (row.minutes_saved || 0).toFixed(2),
    (row.avg_call_duration_seconds || 0).toFixed(2),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}
