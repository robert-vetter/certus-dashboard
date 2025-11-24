'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface HeroRevenueChartProps {
  metricsData: any[];
  totalRevenue: number;
  previousRevenue: number;
  totalCalls: number;
  ordersCount: number;
  reservationsCount: number;
  operatingHours?: any;
  displayDate?: string;
}

export function HeroRevenueChart({
  metricsData,
  totalRevenue,
  previousRevenue,
  totalCalls,
  ordersCount,
  reservationsCount,
  operatingHours,
  displayDate,
}: HeroRevenueChartProps) {
  // Transform data for chart
  // Check if this is hourly data (date field looks like "09:00") or daily data
  const isHourlyData = metricsData.length > 0 && metricsData[0].date.includes(':');

  const chartData = metricsData.map((row) => ({
    date: isHourlyData
      ? row.date // Use hour directly for single-day views
      : new Date(row.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
    revenue: (row.total_revenue_combined || 0) / 100,
  }));

  // Calculate delta
  const revenueDelta =
    previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;
  const isPositive = revenueDelta >= 0;

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Parse operating hours for the given day
  const operatingHoursForDay = React.useMemo(() => {
    if (!isHourlyData || !operatingHours || !displayDate) return [];

    try {
      const date = new Date(displayDate);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

      const hoursArray = Array.isArray(operatingHours) ? operatingHours : [];
      const dayHours = hoursArray.filter((h: any) => h.weekday === weekday);

      console.log('Operating hours lookup:', {
        displayDate,
        weekday,
        availableDays: hoursArray.map((h: any) => h.weekday),
        foundHours: dayHours.length > 0,
      });

      const periods: Array<{ start: number; end: number }> = [];
      dayHours.forEach((h: any) => {
        if (h.timePeriods && Array.isArray(h.timePeriods)) {
          h.timePeriods.forEach((period: any) => {
            if (period.startTime && period.endTime) {
              const startHour = parseInt(period.startTime.split(':')[0], 10);
              const endHour = parseInt(period.endTime.split(':')[0], 10);
              periods.push({ start: startHour, end: endHour });
            }
          });
        }
      });

      return periods;
    } catch (error) {
      console.error('Error parsing operating hours:', error);
      return [];
    }
  }, [operatingHours, displayDate, isHourlyData]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
      {/* Header with total revenue */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Total Revenue</p>
          <div className="flex items-baseline gap-4">
            <h2 className="text-6xl font-bold bg-gradient-to-br from-red-500 to-pink-600 bg-clip-text text-transparent">
              ${(totalRevenue / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
            {previousRevenue > 0 && (
              <div className="flex items-center gap-2">
                <svg
                  className={`w-7 h-7 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isPositive ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  )}
                </svg>
                <span
                  className={`text-3xl font-bold ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {Math.abs(revenueDelta).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats on the right */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Orders</p>
              <p className="text-2xl font-bold text-gray-900">{ordersCount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Reservations</p>
              <p className="text-2xl font-bold text-gray-900">{reservationsCount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900">{totalCalls}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Massive Chart with Brand Gradient */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="50%" stopColor="#ec4899" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />

          {/* Operating hours vertical lines */}
          {operatingHoursForDay.map((period, index) => (
            <React.Fragment key={index}>
              <ReferenceLine
                x={`${period.start.toString().padStart(2, '0')}:00`}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: 'Open',
                  position: 'top',
                  fill: '#10b981',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <ReferenceLine
                x={`${period.end.toString().padStart(2, '0')}:00`}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: 'Close',
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            </React.Fragment>
          ))}

          <XAxis
            dataKey="date"
            tick={{ fontSize: 13, fill: '#9ca3af', fontWeight: 500 }}
            stroke="#e5e7eb"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 13, fill: '#9ca3af', fontWeight: 500 }}
            stroke="#e5e7eb"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
            width={70}
          />
          <Tooltip
            formatter={formatCurrency}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: '12px 16px',
            }}
            labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: '4px', fontSize: '13px' }}
            itemStyle={{ color: '#ef4444', fontWeight: 600, fontSize: '14px' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#ef4444"
            strokeWidth={3}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
