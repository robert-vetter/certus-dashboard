'use client';

import { useRouter } from 'next/navigation';
import { RecentActivitiesTable } from '@/components/dashboard/recent-activities-table';
import { RecentActivity } from '@/lib/mock-data';

interface RecentActivitiesTableWrapperProps {
  activities: RecentActivity[];
}

export function RecentActivitiesTableWrapper({ activities }: RecentActivitiesTableWrapperProps) {
  const router = useRouter();

  const handleRowClick = (activity: RecentActivity) => {
    // Navigate to call-logs page with the selected call ID
    router.push(`/call-logs?callId=${activity.id}`);
  };

  return (
    <RecentActivitiesTable
      activities={activities}
      onRowClick={handleRowClick}
    />
  );
}
