import React from 'react';
import { Skeleton } from './Skeleton';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 8, cols = 4 }) => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-[#313244] overflow-x-auto w-full">
      {/* Header controls placeholder */}
      <div className="flex justify-between items-center border-b border-[#313244] pb-3 mb-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3.5 w-24" />
      </div>

      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#313244]">
            <th className="py-2.5 px-3">
              <Skeleton className="h-3 w-24" />
            </th>
            {Array.from({ length: cols - 1 }).map((_, idx) => (
              <th key={idx} className="py-2.5 px-3">
                <Skeleton className="h-3.5 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#313244]/60">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr key={rIdx}>
              {/* Row header label */}
              <td className="py-3 px-3">
                <Skeleton className="h-3 w-28" />
              </td>
              {/* Column value cells */}
              {Array.from({ length: cols - 1 }).map((_, cIdx) => (
                <td key={cIdx} className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-12" />
                    {cIdx === 0 && rIdx % 3 === 0 && <Skeleton circle={true} className="h-3.5 w-3.5" />}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
