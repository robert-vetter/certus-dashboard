'use client';

import React, { useState } from 'react';
import { KPITile } from '@/components/dashboard/kpi-tile';
import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { RecentActivitiesTable } from '@/components/dashboard/recent-activities-table';
import {
  mockKPIData,
  mockQuickActions,
  mockRecentActivities,
  timeFilterOptions,
  TimeFilter,
} from '@/lib/mock-data';

export default function OverviewPage() {
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilter>('all');

  return (
    <div className="flex flex-col items-start gap-8 px-7 py-6 flex-1 w-full">
      {/* Time Filter Tabs */}
      <div className="flex flex-col items-start gap-4 w-full">
        <div className="inline-flex items-center gap-2 p-1 bg-white rounded-[var(--variable-collection-radius-small-radius)] shadow-[0px_1px_3px_#00000005,0px_6px_6px_#00000005,0px_13px_8px_#00000003,0px_24px_10px_transparent,0px_37px_10px_transparent]">
          {timeFilterOptions.map((filter) =>
            filter.id === activeTimeFilter ? (
              <button
                key={filter.id}
                onClick={() => setActiveTimeFilter(filter.id)}
                className="flex flex-col w-20 items-center justify-center gap-4 px-6 py-1.5 bg-[#ef345008] rounded-lg border-[0.5px] border-variable-collection-colors-a-shade4"
              >
                <div className="font-['Inter_Tight'] font-medium text-[#ee344f] text-xs text-center leading-normal">
                  {filter.label}
                </div>
              </button>
            ) : (
              <button
                key={filter.id}
                onClick={() => setActiveTimeFilter(filter.id)}
                className="flex w-20 items-center justify-center gap-2.5"
              >
                <div className="font-['Inter_Tight'] font-normal text-[#747577] text-[10px] text-center leading-normal whitespace-nowrap">
                  {filter.label}
                </div>
              </button>
            ),
          )}
        </div>

        {/* KPI Section & Quick Actions */}
        <div className="flex items-start gap-4 w-full">
          {/* KPI Tiles Grid */}
          <div className="flex flex-col items-end gap-2.5 flex-1">
            {/* Top Row - 3 KPIs */}
            <div className="flex h-[140px] items-start gap-2.5 w-full">
              {mockKPIData.slice(0, 3).map((kpi) => (
                <KPITile key={kpi.id} {...kpi} />
              ))}
            </div>

            {/* Bottom Row - 3 KPIs */}
            <div className="flex h-[140px] items-start gap-2.5 w-full">
              {mockKPIData.slice(3, 6).map((kpi) => (
                <KPITile key={kpi.id} {...kpi} />
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="flex flex-col w-[362px] h-72 items-end gap-6 p-5 bg-variable-collection-colors-white rounded-[var(--variable-collection-radius-small-radius)] border-[0.5px] border-variable-collection-colors-p-shade6 shadow-[0px_1px_3px_#00000005,0px_6px_6px_#00000005,0px_13px_8px_#00000003,0px_24px_10px_transparent,0px_37px_10px_transparent]">
            <h2 className="font-['Inter_Tight'] font-normal text-variable-collection-colors-primary-color text-xl leading-normal w-full">
              Quick Actions
            </h2>

            <div className="flex flex-col items-start gap-2.5 flex-1 w-full">
              {mockQuickActions.map((action) => (
                <QuickActionCard key={action.id} {...action} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Table */}
      <RecentActivitiesTable
        activities={mockRecentActivities}
        onRowClick={(activity) => {
          console.log('Clicked activity:', activity);
          // TODO: Navigate to call logs with drawer open
        }}
      />
    </div>
  );
}
