'use client';

import React from 'react';
import Image from 'next/image';
import { RecentActivity } from '@/lib/mock-data';

interface RecentActivitiesTableProps {
  activities: RecentActivity[];
  onRowClick?: (activity: RecentActivity) => void;
}

const healthColorMap = {
  success: {
    bg: '#00ba00',
    border: '#008800',
  },
  warning: {
    bg: '#ffda47',
    border: '#ffc300',
  },
  error: {
    bg: '#ff0000',
    border: '#aa0000',
  },
};

export function RecentActivitiesTable({ activities, onRowClick }: RecentActivitiesTableProps) {
  return (
    <div className="flex flex-col items-start gap-4 w-full">
      <div className="flex items-center gap-4 px-2 py-0 w-full">
        <h2 className="font-['Inter_Tight'] font-normal text-variable-collection-colors-primary-color text-xl leading-normal whitespace-nowrap">
          Recent Activities
        </h2>
      </div>

      <div className="flex flex-col items-start gap-4 p-2 w-full bg-white rounded-xl border border-variable-collection-colors-white backdrop-blur-[8.75px]">
        {/* Table Header */}
        <div className="flex items-start gap-4 px-2 py-3 w-full bg-[#f7f8fa] rounded-lg">
          <div className="flex items-center gap-2.5 px-1 py-0 flex-1">
            <div className="font-['Inter_Tight'] font-medium text-variable-collection-colors-p-shade2 text-base leading-normal whitespace-nowrap">
              Time
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-1 py-0 flex-1">
            <div className="font-['Inter_Tight'] font-medium text-variable-collection-colors-p-shade2 text-base leading-normal whitespace-nowrap">
              Type
            </div>
          </div>

          <div className="flex flex-col w-[250px] items-start justify-center gap-2.5 px-2 py-0">
            <div className="font-['Inter_Tight'] font-medium text-variable-collection-colors-p-shade2 text-base leading-normal whitespace-nowrap">
              Summary
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 px-1 py-0 flex-1">
            <div className="font-['Inter_Tight'] font-medium text-variable-collection-colors-p-shade2 text-base leading-normal whitespace-nowrap">
              Call Health
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-1 py-0 flex-1">
            <div className="font-['Inter_Tight'] font-medium text-variable-collection-colors-p-shade2 text-base leading-normal whitespace-nowrap">
              From
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-1 py-0 flex-1">
            <div className="font-['Inter_Tight'] font-medium text-variable-collection-colors-p-shade2 text-base leading-normal whitespace-nowrap">
              Duration
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col items-start gap-2.5 px-2 py-0 w-full">
          <div className="flex flex-col items-start gap-5 w-full bg-variable-collection-colors-white rounded-[var(--variable-collection-radius-small-radius)] border-[0.5px] border-variable-collection-colors-white-card">
            {activities.map((activity) => {
              const healthColors = healthColorMap[activity.callHealth];

              return (
                <button
                  key={activity.id}
                  onClick={() => onRowClick?.(activity)}
                  className="flex items-center gap-4 w-full hover:bg-[#f7f8fa] transition-colors duration-120 cursor-pointer text-left"
                >
                  {/* Time */}
                  <div className="flex items-center gap-2.5 px-1 py-0 flex-1">
                    <div className="font-['Inter_Tight'] font-normal text-variable-collection-colors-p-shade3 text-sm leading-normal">
                      {activity.time}
                    </div>
                  </div>

                  {/* Type */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex w-[100px] items-center px-1 py-0">
                      <Image
                        src={`/icons/${activity.icon}.svg`}
                        alt=""
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      <div className="inline-flex flex-col items-start justify-center gap-2.5 px-2 py-0">
                        <div className="font-['Inter_Tight'] font-normal text-variable-collection-colors-p-shade3 text-sm leading-normal">
                          {activity.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="flex flex-col w-[250px] items-start justify-center gap-2.5 px-2 py-0">
                    <div className="font-['Inter_Tight'] font-normal text-variable-collection-colors-p-shade3 text-sm leading-normal">
                      {activity.summary}
                    </div>
                  </div>

                  {/* Call Health */}
                  <div className="flex justify-center gap-4 flex-1 items-center">
                    <div
                      className="w-3.5 h-3.5 rounded-[32px] border"
                      style={{
                        backgroundColor: healthColors.bg,
                        borderColor: healthColors.border,
                      }}
                    />
                  </div>

                  {/* From */}
                  <div className="flex flex-col items-center gap-2.5 flex-1">
                    <div className="flex items-center px-1 py-0 w-full gap-2.5">
                      <div className="w-[120px] font-['Inter_Tight'] font-normal text-variable-collection-colors-p-shade3 text-sm leading-normal">
                        {activity.from}
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-6 flex-1">
                    <div className="flex w-[123px] items-center gap-2.5 px-1 py-0">
                      <div className="font-['Inter_Tight'] font-normal text-variable-collection-colors-p-shade3 text-sm leading-normal">
                        {activity.duration}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
