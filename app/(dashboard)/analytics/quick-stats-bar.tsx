import React from 'react';

interface QuickStatsBarProps {
  totalCalls: number;
  ordersCount: number;
  reservationsCount: number;
  upsellCount: number;
  labourSavedHours: number;
  totalCallTimeSeconds: number;
  previousCalls: number;
  previousOrders: number;
  previousReservations: number;
}

function StatCard({
  label,
  value,
  delta,
  icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
}: {
  label: string;
  value: string | number;
  delta?: number | null;
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
}) {
  const isPositive = delta !== null && delta !== undefined && delta >= 0;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 mb-0.5">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {delta !== null && delta !== undefined && !isNaN(delta) && (
              <span
                className={`text-xs font-semibold ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? '+' : ''}
                {delta.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuickStatsBar({
  totalCalls,
  ordersCount,
  reservationsCount,
  upsellCount,
  labourSavedHours,
  totalCallTimeSeconds,
  previousCalls,
  previousOrders,
  previousReservations,
}: QuickStatsBarProps) {
  const calculateDelta = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label="Total Calls"
        value={totalCalls.toLocaleString()}
        delta={calculateDelta(totalCalls, previousCalls)}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        }
        iconColor="text-red-500"
        iconBg="bg-red-50"
      />

      <StatCard
        label="Orders"
        value={ordersCount.toLocaleString()}
        delta={calculateDelta(ordersCount, previousOrders)}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        }
        iconColor="text-pink-600"
        iconBg="bg-pink-50"
      />

      <StatCard
        label="Reservations"
        value={reservationsCount.toLocaleString()}
        delta={calculateDelta(reservationsCount, previousReservations)}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
        iconColor="text-red-600"
        iconBg="bg-red-50"
      />

      <StatCard
        label="Upsells"
        value={upsellCount.toLocaleString()}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        }
        iconColor="text-pink-500"
        iconBg="bg-pink-50"
      />

      <StatCard
        label="Labour Saved"
        value={`${labourSavedHours.toFixed(1)}h`}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        iconColor="text-gray-600"
        iconBg="bg-gray-50"
      />

      <StatCard
        label="Call Time"
        value={formatTime(totalCallTimeSeconds)}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        }
        iconColor="text-gray-700"
        iconBg="bg-gray-50"
      />
    </div>
  );
}
