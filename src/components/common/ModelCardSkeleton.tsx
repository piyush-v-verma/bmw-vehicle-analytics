import React from 'react';
import { Skeleton } from './Skeleton';

export const ModelCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between border border-[#313244] h-[410px] relative">
      {/* Top Image Container Skeleton */}
      <div className="relative h-48 w-full bg-[#181825]/90 border-b border-[#313244]/50 flex items-center justify-center">
        {/* SVG Landscape Icon */}
        <svg className="h-14 w-14 text-[#313244]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        {/* Top-Left Pill */}
        <Skeleton className="absolute top-3 left-3 h-5 w-16 !rounded-full" />
        {/* Top-Right Pill */}
        <Skeleton className="absolute top-3 right-3 h-5 w-14 !rounded-full" />
        {/* Bottom-Left Era Pill */}
        <Skeleton className="absolute bottom-2.5 left-3 h-4.5 w-12 !rounded-md" />
        {/* Bottom-Right Vehicle Type Pill */}
        <Skeleton className="absolute bottom-2.5 right-3 h-4.5 w-16 !rounded-md" />
      </div>

      {/* Card Body Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Trim Badge Row */}
          <div className="flex justify-between items-center gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4.5 w-14 !rounded-md" />
          </div>
          {/* Subheader */}
          <Skeleton className="h-3.5 w-1/3 mt-2" />

          {/* Grid of 2x2 Specs */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2 rounded-xl bg-[#181825]/60 p-2 border border-[#313244]/40">
                {/* Circle Icon */}
                <Skeleton circle={true} className="h-6 w-6 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-2 w-1/2" />
                  <Skeleton className="h-1.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Row */}
        <div className="mt-4 border-t border-[#313244] pt-3 flex items-center justify-between">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-7 w-24 !rounded-xl" />
        </div>
      </div>
    </div>
  );
};
