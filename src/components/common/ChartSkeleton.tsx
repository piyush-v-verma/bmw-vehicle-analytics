import React from 'react';
import { Skeleton } from './Skeleton';

interface ChartSkeletonProps {
  heightClass?: string; // e.g. "h-80" or "h-96"
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ heightClass = 'h-80' }) => {
  return (
    <div className={`glass-card rounded-2xl p-5 border border-[#313244] flex flex-col justify-between ${heightClass}`}>
      {/* Header title placeholder */}
      <div className="flex justify-between items-center border-b border-[#313244] pb-3 mb-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-16" />
      </div>
      
      {/* Simulated chart grid lines pulsing */}
      <div className="flex-1 flex flex-col justify-around py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 w-full">
            <Skeleton className="h-2 w-8" /> {/* Y-axis label */}
            <Skeleton className="h-[1px] flex-1 bg-[#313244]/40" /> {/* Grid line */}
          </div>
        ))}
      </div>
      
      {/* Simulated X-axis labels */}
      <div className="flex justify-between pl-12 pr-4 pt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-2.5 w-10" />
        ))}
      </div>
    </div>
  );
};
