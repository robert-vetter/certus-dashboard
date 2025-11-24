import React from 'react';

interface OrderMetricsProps {
  ordersCompleted: number;
  revenueGenerated: number; // in cents
  upsellCount: number;
  totalUpsellValue: number; // in cents
  ordersCompleted_prev: number;
  revenueGenerated_prev: number;
  upsellCount_prev: number;
}

function MetricCard({
  label,
  value,
  delta,
  icon,
  valueColor = 'text-gray-900',
  subtitle,
}: {
  label: string;
  value: string | number;
  delta?: { value: string; positive: boolean } | null;
  icon: React.ReactNode;
  valueColor?: string;
  subtitle?: string;
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
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
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

export function OrderMetrics({
  ordersCompleted,
  revenueGenerated,
  upsellCount,
  totalUpsellValue,
  ordersCompleted_prev,
  revenueGenerated_prev,
  upsellCount_prev,
}: OrderMetricsProps) {
  // Calculate deltas
  const calculateDelta = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    const percentChange = ((current - previous) / previous) * 100;
    return {
      value: `${Math.abs(percentChange).toFixed(1)}%`,
      positive: percentChange >= 0,
    };
  };

  // Calculate AOV (Average Order Value)
  const aov = ordersCompleted > 0 ? revenueGenerated / ordersCompleted : 0;
  const aov_prev =
    ordersCompleted_prev > 0 ? revenueGenerated_prev / ordersCompleted_prev : 0;

  // Calculate upsell success rate
  const upsellSuccessRate =
    ordersCompleted > 0 ? (upsellCount / ordersCompleted) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-900">Order Metrics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Orders Completed */}
        <MetricCard
          label="Orders Completed"
          value={ordersCompleted.toLocaleString()}
          delta={calculateDelta(ordersCompleted, ordersCompleted_prev)}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
        />

        {/* Revenue Generated */}
        <MetricCard
          label="Revenue Generated"
          value={`$${(revenueGenerated / 100).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          delta={calculateDelta(revenueGenerated, revenueGenerated_prev)}
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        {/* Average Order Value */}
        <MetricCard
          label="Average Order Value"
          value={`$${(aov / 100).toFixed(2)}`}
          delta={calculateDelta(aov, aov_prev)}
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
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          }
        />

        {/* Upsell Success Rate */}
        <MetricCard
          label="Upsell Success"
          value={`${upsellSuccessRate.toFixed(1)}%`}
          subtitle={`${upsellCount} upsells`}
          delta={calculateDelta(upsellCount, upsellCount_prev)}
          valueColor="text-purple-600"
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

        {/* Total Upsell Value */}
        <MetricCard
          label="Total Upsell Value"
          value={`$${(totalUpsellValue / 100).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          valueColor="text-indigo-600"
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}
