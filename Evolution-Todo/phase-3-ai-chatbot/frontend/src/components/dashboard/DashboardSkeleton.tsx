'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatsCardSkeleton() {
  return (
    <Card className="h-full bg-white/10 backdrop-blur-md border border-white/20 dark:bg-gray-900/30 dark:border-gray-700/50 p-6 rounded-xl">
      <div className="pb-2">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div>
        <Skeleton className="h-3 w-20" />
      </div>
    </Card>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      </div>
      <Skeleton className="h-8 w-16 rounded" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 dark:bg-gray-900/30 dark:border-gray-700/50 rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-44" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 dark:bg-gray-900/30 dark:border-gray-700/50 rounded-xl p-6 shadow-sm">
          <div className="space-y-2">
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-44" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 dark:bg-gray-900/30 dark:border-gray-700/50 rounded-xl p-6 shadow-sm">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="space-y-3">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      </div>
    </div>
  );
}