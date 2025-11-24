'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface SecondaryChartsProps {
  metricsData: any[];
}

const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];

export function SecondaryCharts({ metricsData }: SecondaryChartsProps) {
  // Transform data for call volume bar chart
  const callVolumeData = metricsData.map((row) => ({
    date: new Date(row.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    calls: row.total_calls || 0,
    orders: row.orders_count || 0,
    reservations: row.reservations_count || 0,
  }));

  // Calculate totals for pie chart
  const totalOrders = metricsData.reduce(
    (sum, row) => sum + (row.orders_count || 0),
    0
  );
  const totalReservations = metricsData.reduce(
    (sum, row) => sum + (row.reservations_count || 0),
    0
  );
  const totalCalls = metricsData.reduce(
    (sum, row) => sum + (row.total_calls || 0),
    0
  );
  const other = Math.max(0, totalCalls - totalOrders - totalReservations);

  const pieData = [
    { name: 'Orders', value: totalOrders, color: '#10b981' },
    { name: 'Reservations', value: totalReservations, color: '#f59e0b' },
    { name: 'Inquiries', value: other, color: '#6366f1' },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Call Volume Bar Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Daily Call Activity
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={callVolumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#d1d5db"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#d1d5db"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
              iconType="circle"
            />
            <Bar
              dataKey="calls"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              name="Total Calls"
            />
            <Bar
              dataKey="orders"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="Orders"
            />
            <Bar
              dataKey="reservations"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              name="Reservations"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Call Type Pie Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Call Distribution
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} calls`, '']}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
