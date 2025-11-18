'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RecentActivitiesTable } from '@/components/dashboard/recent-activities-table';
import { CallDetailSheet, CallDetailData } from '@/components/dashboard/call-detail-sheet';
import { RecentActivity } from '@/lib/mock-data';
import { TimeFilterTabs } from '../overview/time-filter-tabs';
import { LocationSelector } from '../overview/location-selector';

interface CallLogsClientProps {
  calls: RecentActivity[];
  selectedCall: CallDetailData | null;
  locations: Array<{ location_id: number; name: string; certus_notification_email: string }>;
  selectedLocation: { location_id: number; name: string; certus_notification_email: string };
  currentRange: 'today' | 'yesterday' | 'week' | 'all';
}

export function CallLogsClient({
  calls,
  selectedCall,
  locations,
  selectedLocation,
  currentRange,
}: CallLogsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Open sheet when a call is selected
  useEffect(() => {
    if (selectedCall) {
      setIsSheetOpen(true);
    }
  }, [selectedCall]);

  const handleRowClick = (activity: RecentActivity) => {
    // Update URL to include the selected call ID
    const params = new URLSearchParams(searchParams.toString());
    params.set('callId', activity.id);
    router.push(`?${params.toString()}`);
  };

  const handleSheetClose = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      // Remove callId from URL when sheet is closed
      const params = new URLSearchParams(searchParams.toString());
      params.delete('callId');
      const newUrl = params.toString() ? `?${params.toString()}` : '/call-logs';
      router.push(newUrl);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-8 py-6 flex-1 w-full">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Call Logs</h1>
          <p className="text-gray-600 mt-1">View and analyze all your call history</p>
        </div>
      </div>

      {/* Time Filter & Location Selector */}
      <div className="flex items-center justify-between">
        <TimeFilterTabs currentRange={currentRange} />
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

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Calls</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{calls.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Success Rate</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {calls.length > 0
              ? `${Math.round((calls.filter(c => c.callHealth === 'success').length / calls.length) * 100)}%`
              : '0%'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Failed Calls</div>
          <div className="text-2xl font-bold text-red-600 mt-2">
            {calls.filter(c => c.callHealth === 'error').length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Duration</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {calls.length > 0
              ? (() => {
                  const avgSeconds = calls.reduce((sum, call) => {
                    const [min, sec] = call.duration.replace('m ', ':').replace('s', '').split(':');
                    return sum + parseInt(min) * 60 + parseInt(sec);
                  }, 0) / calls.length;
                  const mins = Math.floor(avgSeconds / 60);
                  return `${mins}m`;
                })()
              : '0m'}
          </div>
        </div>
      </div>

      {/* Calls Table */}
      {calls.length > 0 ? (
        <RecentActivitiesTable
          activities={calls}
          onRowClick={handleRowClick}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Calls Found</h2>
            <p className="text-gray-600">
              There are no calls for the selected time period. Try adjusting your filters.
            </p>
          </div>
        </div>
      )}

      {/* Call Detail Sheet */}
      <CallDetailSheet
        call={selectedCall}
        open={isSheetOpen}
        onOpenChange={handleSheetClose}
      />
    </div>
  );
}
