import { Skeleton } from '@/components/ui/skeleton';
import { KPICardSkeleton, QuickActionCardSkeleton, RecentActivitiesTableSkeleton } from '@/components/dashboard/skeletons';

export default function OverviewLoading() {
  return (
    <div className="flex flex-col gap-6 px-8 py-6 flex-1 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>

      {/* Time Filter & Location Info Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-96 rounded-lg" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      {/* KPI Section & Quick Actions */}
      <div className="flex items-start gap-6 w-full">
        {/* KPI Tiles Grid Skeleton */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Top Row - Revenue (larger) + 2 KPIs */}
          <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-4">
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </div>

          {/* Bottom Row - 3 KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </div>
        </div>

        {/* Quick Actions Card Skeleton */}
        <div className="flex flex-col w-80 gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Skeleton className="h-6 w-32" />
          <div className="flex flex-col gap-2">
            <QuickActionCardSkeleton />
            <QuickActionCardSkeleton />
            <QuickActionCardSkeleton />
          </div>
        </div>
      </div>

      {/* Recent Activities Table Skeleton */}
      <RecentActivitiesTableSkeleton />
    </div>
  );
}
