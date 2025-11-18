import { Skeleton } from '@/components/ui/skeleton';
import { StatsCardSkeleton, RecentActivitiesTableSkeleton } from '@/components/dashboard/skeletons';

export default function CallLogsLoading() {
  return (
    <div className="flex flex-col gap-6 px-8 py-6 flex-1 w-full">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
      </div>

      {/* Time Filter & Location Selector */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-96 rounded-lg" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Calls Table */}
      <RecentActivitiesTableSkeleton />
    </div>
  );
}
