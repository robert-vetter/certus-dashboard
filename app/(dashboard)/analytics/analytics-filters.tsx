'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type CallType = 'all' | 'orders' | 'reservations' | 'catering' | 'complaints';
type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'all';

interface AnalyticsFiltersProps {
  currentCallType: CallType;
  currentRange: TimeRange;
  locationName: string;
  startDate: string;
  endDate: string;
}

export function AnalyticsFilters({
  currentCallType,
  currentRange,
  locationName,
  startDate,
  endDate,
}: AnalyticsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCallTypeChange = (type: CallType) => {
    const params = new URLSearchParams(searchParams);
    params.set('callType', type);
    router.push(`/analytics?${params.toString()}`);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams(searchParams);
    params.set('range', range);
    if (range !== 'custom') {
      params.delete('startDate');
      params.delete('endDate');
    }
    router.push(`/analytics?${params.toString()}`);
  };

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last Month' },
    { value: 'all', label: 'All Time' },
  ];

  const callTypes: { value: CallType; label: string }[] = [
    { value: 'all', label: 'All Calls' },
    { value: 'orders', label: 'Orders' },
    { value: 'reservations', label: 'Reservations' },
    { value: 'catering', label: 'Catering' },
    { value: 'complaints', label: 'FAQ' },
  ];

  const formatDateRange = () => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const end = new Date(endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return startDate === endDate ? start : `${start} - ${end}`;
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left: Time Range Tabs (Brand Gradient) */}
      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleTimeRangeChange(range.value)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
              currentRange === range.value
                ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Center: Location & Date Range */}
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {locationName}
        </div>
        <span className="text-gray-300">•</span>
        <span className="text-gray-600">{formatDateRange()}</span>
      </div>

      {/* Right: Call Type Filter (Clean Pills) */}
      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
        {callTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => handleCallTypeChange(type.value)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
              currentCallType === type.value
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
