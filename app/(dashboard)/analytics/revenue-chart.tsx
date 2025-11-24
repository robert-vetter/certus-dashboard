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
  Legend,
} from 'recharts';

interface RevenueChartProps {
  metricsData: any[];
}

export function RevenueChart({ metricsData }: RevenueChartProps) {
  // Transform data for chart
  const chartData = metricsData.map((row) => ({
    date: new Date(row.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    orders: (row.total_revenue_orders || 0) / 100,
    reservations: (row.total_revenue_res_estimate || 0) / 100,
    total: (row.total_revenue_combined || 0) / 100,
  }));

  // Custom tooltip formatter
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Daily Revenue</h3>
        <p className="text-sm text-gray-600 mt-1">
          Revenue breakdown from orders and reservations
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            formatter={formatCurrency}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            iconType="rect"
          />
          <Area
            type="monotone"
            dataKey="orders"
            stackId="1"
            stroke="#10b981"
            fill="url(#colorOrders)"
            name="Order Revenue"
          />
          <Area
            type="monotone"
            dataKey="reservations"
            stackId="1"
            stroke="#f59e0b"
            fill="url(#colorReservations)"
            name="Reservation Revenue (Est.)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
