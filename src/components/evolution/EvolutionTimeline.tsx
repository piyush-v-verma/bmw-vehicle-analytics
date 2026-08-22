import React, { useState } from 'react';
import { EnrichedGeneration } from '../../types/bmw';
import { History, Calendar, Flame, Gauge, ArrowRight, Zap } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

interface EvolutionTimelineProps {
  generations: EnrichedGeneration[];
  onSelectModel: (model: EnrichedGeneration) => void;
  loading?: boolean;
}

export const EvolutionTimeline: React.FC<EvolutionTimelineProps> = ({
  generations,
  onSelectModel,
  loading
}) => {
  const [selectedLineage, setSelectedLineage] = useState<string>('3-series');

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Lineage Tabs Skeleton */}
        <div className="flex flex-wrap gap-2 border-b border-[#313244] pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-24 !rounded-xl" />
          ))}
        </div>
        
        {/* Vertical Timeline Skeleton */}
        <div className="relative border-l-2 border-[#313244] ml-4 pl-8 space-y-8 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative">
              {/* Dot indicator */}
              <div className="absolute -left-[41px] top-1.5 h-4 w-4 rounded-full bg-[#313244] border-4 border-[#1e1e2e]" />
              <div className="glass-card rounded-2xl p-5 max-w-2xl border border-[#313244] space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
                <Skeleton className="h-3 w-1/3" />
                <div className="h-[1px] bg-[#313244]/40 my-3" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter lineage
  const timelineModels = generations.filter((g) => {
    const gid = g.generation_id.toLowerCase();
    const name = g.model_name.toLowerCase();

    if (selectedLineage === '3-series') {
      return gid.includes('bmw_3_') || gid.includes('bmw_02_') || gid.includes('bmw_3-15');
    }
    if (selectedLineage === '5-series') {
      return gid.includes('bmw_5_') || gid.includes('bmw_nk_') || gid.includes('bmw_501');
    }
    if (selectedLineage === '7-series') {
      return gid.includes('bmw_7_') || gid.includes('bmw_e3_') || gid.includes('bmw_502');
    }
    if (selectedLineage === 'x-series') {
      return gid.includes('bmw_x1_') || gid.includes('bmw_x3_') || gid.includes('bmw_x5_') || gid.includes('bmw_x7_') || gid.includes('bmw_xm_');
    }
    if (selectedLineage === 'i-series') {
      return gid.includes('bmw_i') || gid.includes('bmw_ix');
    }
    if (selectedLineage === 'pre-war') {
      return g.era === 'Pre-War (1929-1941)';
    }
    return true;
  }).sort((a, b) => a.production_start - b.production_start);

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className="glass-card rounded-2xl p-5 border border-[#313244]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#313244] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#b4befe]" />
              <h3 className="text-base font-bold text-white font-['Outfit']">
                BMW Model Lineage & Generation Evolution
              </h3>
            </div>
            <p className="text-xs text-[#a6adc8] mt-0.5">
              Follow the chronological technical progression and design leap across 97 years of BMW history
            </p>
          </div>

          {/* Lineage Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: '3-series', label: '3 Series Lineage' },
              { id: '5-series', label: '5 Series Lineage' },
              { id: '7-series', label: '7 Series Lineage' },
              { id: 'x-series', label: 'X Series (SAV)' },
              { id: 'i-series', label: 'i-Series (Electrified)' },
              { id: 'pre-war', label: 'Pre-War Pioneers (1929–1941)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedLineage(tab.id)}
                className={`rounded-xl px-3 py-1.5 font-medium transition-all ${
                  selectedLineage === tab.id
                    ? 'bg-[#b4befe] text-[#11111b] font-bold shadow-sm'
                    : 'bg-[#181825] text-[#a6adc8] hover:text-white border border-[#313244]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="mt-8 relative">
          {/* Central Vertical Timeline Line */}
          <div className="absolute top-0 bottom-0 left-6 sm:left-1/2 w-0.5 bg-gradient-to-b from-[#b4befe] via-[#89b4fa] to-[#94e2d5] transform -translate-x-1/2" />

          {/* Timeline Nodes */}
          <div className="space-y-8 relative">
            {timelineModels.map((model, idx) => {
              const isEven = idx % 2 === 0;
              const p = model.primaryVariant;

              return (
                <div
                  key={model.generation_id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Content Card */}
                  <div className="w-full sm:w-[calc(50%-2rem)] pl-12 sm:pl-0">
                    <div
                      onClick={() => onSelectModel(model)}
                      className="glass-card glass-card-hover rounded-2xl p-4 border border-[#313244] hover:border-[#b4befe]/50 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="rounded bg-[#181825] px-2 py-0.5 font-mono text-[#b4befe] border border-[#313244]">
                          {model.generation_id.replace('BMW_', '')}
                        </span>
                        <span className="font-mono text-[#a6adc8]">
                          {model.production_start}{model.production_end ? `–${model.production_end}` : '–present'}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <div className="h-16 w-24 rounded-lg overflow-hidden bg-black/50 shrink-0 border border-white/5">
                          <img
                            src={model.imageUrl}
                            alt={model.model_name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#b4befe] transition-colors truncate">
                            {model.model_name}
                          </h4>
                          <p className="text-[11px] text-[#a6adc8] truncate font-mono">
                            {p.variant_id.replace(/_/g, ' ')}
                          </p>

                          <div className="mt-2 flex items-center gap-3 text-[11px] font-mono">
                            <span className="text-[#f38ba8] font-bold">{p.horsepower_hp} hp</span>
                            <span className="text-[#89b4fa]">{p.acceleration_0_100_s ? `${p.acceleration_0_100_s}s` : 'N/A'}</span>
                            <span className="text-[#94e2d5]">{p.top_speed_kmh} km/h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Central Node Badge */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#11111b] border-2 border-[#b4befe] text-white shadow-glow-accent z-10">
                    <span className="text-[10px] font-black">{idx + 1}</span>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
