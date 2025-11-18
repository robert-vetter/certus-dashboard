import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { CallLogsClient } from './call-logs-client';

export default async function CallLogsPage({
  searchParams,
}: {
  searchParams: { callId?: string; range?: 'today' | 'yesterday' | 'week' | 'all'; locationId?: string };
}) {
  const supabase = await createServerSupabaseClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    console.error('Auth error:', authError);
    redirect('/login');
  }

  // Use service role client to bypass RLS
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

  // Check user's role permission level
  const { data: userPermission } = await supabaseAdmin
    .from('user_roles_permissions')
    .select('role_permission_id')
    .eq('user_id', user.id)
    .maybeSingle();

  console.log('User email:', user.email);
  console.log('User permission:', userPermission);

  let locations: Array<{ location_id: number; name: string; certus_notification_email: string }> = [];
  let selectedLocation: { location_id: number; name: string; certus_notification_email: string } | null = null;

  // Check if user has highest permissions (franchise owner)
  if (userPermission?.role_permission_id === 5) {
    // Check if user has an account (franchise owner)
    const { data: accountData } = await supabaseAdmin
      .from('accounts')
      .select('account_id, email')
      .eq('email', user.email)
      .maybeSingle();

    if (accountData) {
      // Fetch all locations for this account
      const { data: allLocations, error: locationsError } = await supabaseAdmin
        .from('locations')
        .select('location_id, name, certus_notification_email')
        .eq('account_id', accountData.account_id);

      if (!locationsError && allLocations && allLocations.length > 0) {
        locations = allLocations;

        // Use selected location from URL param, or default to first location
        if (searchParams.locationId) {
          const locationIdNum = parseInt(searchParams.locationId);
          selectedLocation = locations.find(loc => loc.location_id === locationIdNum) || locations[0];
        } else {
          selectedLocation = locations[0];
        }
      }
    }
  }

  // If not a franchise owner or no account found, fall back to email-based lookup
  if (!selectedLocation) {
    const { data: locationResults } = await supabaseAdmin
      .from('locations')
      .select('location_id, name, certus_notification_email')
      .eq('certus_notification_email', user.email)
      .limit(1);

    if (locationResults && locationResults.length > 0) {
      selectedLocation = locationResults[0];
      locations = [selectedLocation];
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

  // Calculate date range
  const timeRange = searchParams.range || 'week';
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
      startDate = '2020-01-01';
      break;
  }

  // Fetch all calls for this location
  const { data: calls } = await supabaseAdmin
    .from('calls_v')
    .select('*')
    .eq('location_id', selectedLocation.location_id)
    .gte('started_at', startDate)
    .lte('started_at', endDate + ' 23:59:59')
    .order('started_at', { ascending: false })
    .limit(100);

  // Fetch all orders and reservations for these calls to determine types
  const callIds = calls?.map(c => c.id) || [];
  const [allOrders, allReservations] = await Promise.all([
    supabaseAdmin
      .from('order_logs')
      .select('call_id')
      .in('call_id', callIds),
    supabaseAdmin
      .from('reservations')
      .select('call_id')
      .in('call_id', callIds)
  ]);

  // Create lookup sets for fast type determination
  const orderCallIds = new Set(allOrders.data?.map(o => o.call_id) || []);
  const reservationCallIds = new Set(allReservations.data?.map(r => r.call_id) || []);

  // If a specific call is requested, fetch its complete details
  let selectedCallData = null;
  if (searchParams.callId && calls) {
    const call = calls.find(c => c.id === searchParams.callId);

    if (call) {
      // Fetch all related data for this call
      const [ordersData, reservationsData, upsellsData, complaintsData] = await Promise.all([
        supabaseAdmin
          .from('order_logs')
          .select('*')
          .eq('call_id', call.id),
        supabaseAdmin
          .from('reservations')
          .select('*')
          .eq('call_id', call.id),
        supabaseAdmin
          .from('upsells')
          .select('*')
          .eq('order_id', call.id), // Note: upsells are linked to order_id, not call_id
        supabaseAdmin
          .from('complaints')
          .select('*')
          .eq('call_id', call.id)
      ]);

      // Determine call health
      let callHealth: 'success' | 'warning' | 'error' = 'success';
      if (call.status === 'failed' || call.status === 'error') {
        callHealth = 'error';
      } else if (call.status === 'in_progress') {
        callHealth = 'warning';
      }

      // Determine call type based on actual related data
      let callType = 'General Inquiry';
      const hasOrder = ordersData.data && ordersData.data.length > 0;
      const hasReservation = reservationsData.data && reservationsData.data.length > 0;

      if (hasOrder) {
        callType = 'Order';
      } else if (hasReservation) {
        callType = 'Reservation';
      }

      selectedCallData = {
        id: call.id,
        call_id: call.id,
        started_at: call.started_at,
        ended_at: call.ended_at,
        duration_seconds: call.duration_seconds || 0,
        from_number: call.from_number,
        certus_number: call.certus_number,
        status: call.status,
        recording_url: call.recording_url,
        transcript_md: call.transcript_md,
        summary_md: call.summary_md,
        call_summary: call.call_summary,
        call_summary_short: call.call_summary_short,
        call_type: callType,
        pathway_tags_formatted: call.pathway_tags_formatted,
        call_health: callHealth,
        orders: ordersData.data || [],
        reservations: reservationsData.data || [],
        upsells: upsellsData.data || [],
        complaints: complaintsData.data || [],
        internal_notes: [], // Can be fetched if needed
      };
    }
  }

  // Transform calls into table format
  const callsForTable = (calls || []).map(call => {
    const startedAt = new Date(call.started_at);
    const now = new Date();
    const diffInHours = (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60);

    // Format time intelligently
    let timeDisplay: string;
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      timeDisplay = minutes === 0 ? 'Just now' : `${minutes}m ago`;
    } else if (diffInHours < 24) {
      timeDisplay = startedAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 48) {
      timeDisplay = `Yesterday ${startedAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;
    } else {
      timeDisplay = startedAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }) + ' . ' + startedAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }

    // Determine call health
    let callHealth: 'success' | 'warning' | 'error' = 'success';
    if (call.status === 'failed' || call.status === 'error') {
      callHealth = 'error';
    } else if (call.status === 'in_progress') {
      callHealth = 'warning';
    }

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

    // Format duration
    const duration = call.duration_seconds || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationDisplay = `${minutes}m ${seconds}s`;

    // Determine call type by checking actual rows in related tables
    let displayType: 'order' | 'reservation' | 'catering' | 'inquiry' = 'inquiry';
    if (orderCallIds.has(call.id)) {
      displayType = 'order';
    } else if (reservationCallIds.has(call.id)) {
      displayType = 'reservation';
    } else if (call.pathway_tags_formatted?.toLowerCase().includes('catering')) {
      displayType = 'catering';
    }

    return {
      id: call.id,
      time: timeDisplay,
      callType: 'phone' as const,
      icon: 'Phone',
      summary: call.call_summary_short || call.summary_md?.substring(0, 100) || 'No summary',
      type: displayType,
      callHealth,
      from: formatPhoneNumber(call.from_number),
      duration: durationDisplay,
    };
  });

  return (
    <CallLogsClient
      calls={callsForTable}
      selectedCall={selectedCallData}
      locations={locations}
      selectedLocation={selectedLocation}
      currentRange={timeRange}
    />
  );
}
