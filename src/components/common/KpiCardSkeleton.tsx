import React from 'react';
import { Skeleton } from './Skeleton';

export const KpiCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-[#313244] flex items-center gap-4 h-24">
      {/* Circle icon skeleton */}
      <Skeleton circle={true} className="h-12 w-12 flex-shrink-0" />
      <div className="space-y-2 flex-1">
        {/* Label skeleton */}
        <Skeleton className="h-3 w-1/2" />
        {/* Value skeleton */}
        <Skeleton className="h-6 w-3/4" />
      </div>
    </div>
  );
};
