'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState } from 'react';

type TimeRange = 'today' | 'yesterday' | 'week' | 'all';

const timeFilters: { id: TimeRange; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'Last 7 Days' },
  { id: 'all', label: 'All Time' },
];

export function TimeFilterTabs({ currentRange }: { currentRange: TimeRange }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingRange, setPendingRange] = useState<TimeRange | null>(null);

  const handleFilterChange = (range: TimeRange) => {
    setPendingRange(range);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('range', range);
      router.push(`?${params.toString()}`);
    });
  };

  const activeRange = isPending && pendingRange ? pendingRange : currentRange;

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {timeFilters.map((filter) => {
        const isActive = filter.id === activeRange;
        const isLoading = isPending && filter.id === pendingRange;

        return (
          <button
            key={filter.id}
            onClick={() => handleFilterChange(filter.id)}
            disabled={isPending}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
