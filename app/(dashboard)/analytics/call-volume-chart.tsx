'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CallVolumeChartProps {
  metricsData: any[];
  startDate: string;
  endDate: string;
}

export function CallVolumeChart({
  metricsData,
  startDate,
  endDate,
}: CallVolumeChartProps) {
  // Transform data for chart
  const chartData = metricsData.map((row) => ({
    date: new Date(row.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    calls: row.total_calls || 0,
    completed: row.completed_calls || 0,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Daily Call Volume</h3>
        <p className="text-sm text-gray-600 mt-1">
          Total calls vs completed calls over time
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
          />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="calls"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Total Calls"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="Completed Calls"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
