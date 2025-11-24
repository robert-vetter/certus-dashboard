import React from 'react';

interface GeneralCallMetricsProps {
  totalCalls: number;
  totalCallTimeSeconds: number;
  avgCallDurationSeconds: number;
  completedCalls: number;
  totalCalls_prev: number;
  labourDeltaMinutes: number;
}

function MetricCard({
  label,
  value,
  delta,
  icon,
  valueColor = 'text-gray-900',
}: {
  label: string;
  value: string | number;
  delta?: { value: string; positive: boolean } | null;
  icon: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-gray-500">{icon}</div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
          </div>
          <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
          {delta && (
            <div className="flex items-center gap-1 mt-2">
              <svg
                className={`w-4 h-4 ${
                  delta.positive ? 'text-green-600' : 'text-red-600'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {delta.positive ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                )}
              </svg>
              <span
                className={`text-sm font-semibold ${
                  delta.positive ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {delta.value}
              </span>
              <span className="text-xs text-gray-500">vs previous period</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function GeneralCallMetrics({
  totalCalls,
  totalCallTimeSeconds,
  avgCallDurationSeconds,
  completedCalls,
  totalCalls_prev,
  labourDeltaMinutes,
}: GeneralCallMetricsProps) {
  // Calculate deltas
  const calculateDelta = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    const percentChange = ((current - previous) / previous) * 100;
    return {
      value: `${Math.abs(percentChange).toFixed(1)}%`,
      positive: percentChange >= 0,
    };
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  // Calculate AI success rate
  const aiSuccessRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-900">General Call Metrics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Calls */}
        <MetricCard
          label="Total Calls"
          value={totalCalls.toLocaleString()}
          delta={calculateDelta(totalCalls, totalCalls_prev)}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          }
        />

        {/* Total Call Time */}
        <MetricCard
          label="Total Call Time"
          value={formatTime(totalCallTimeSeconds)}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        {/* Average Call Duration */}
        <MetricCard
          label="Average Call Duration"
          value={formatDuration(avgCallDurationSeconds)}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        />

        {/* AI Success Rate */}
        <MetricCard
          label="AI Success Rate"
          value={`${aiSuccessRate.toFixed(1)}%`}
          valueColor="text-green-600"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        {/* Labour Delta (Time Saved) */}
        <MetricCard
          label="Labour Saved"
          value={`${(labourDeltaMinutes / 60).toFixed(1)} hrs`}
          valueColor="text-blue-600"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}
