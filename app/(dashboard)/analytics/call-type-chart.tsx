'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CallTypeChartProps {
  ordersCount: number;
  reservationsCount: number;
  totalCalls: number;
}

const COLORS = {
  orders: '#10b981',
  reservations: '#f59e0b',
  inquiries: '#6366f1',
  other: '#8b5cf6',
};

export function CallTypeChart({
  ordersCount,
  reservationsCount,
  totalCalls,
}: CallTypeChartProps) {
  // Calculate other call types
  const inquiriesAndOther = totalCalls - ordersCount - reservationsCount;

  const data = [
    { name: 'Orders', value: ordersCount, color: COLORS.orders },
    {
      name: 'Reservations',
      value: reservationsCount,
      color: COLORS.reservations,
    },
    {
      name: 'Inquiries & Other',
      value: inquiriesAndOther,
      color: COLORS.inquiries,
    },
  ].filter((item) => item.value > 0);

  // Custom label for percentages
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          Call Type Distribution
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Breakdown of calls by type
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Pie Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `${value} calls`,
                '',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend with counts */}
        <div className="flex flex-col gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  {item.name}
                </span>
                <span className="text-xs text-gray-600">
                  {item.value.toLocaleString()} calls (
                  {((item.value / totalCalls) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
