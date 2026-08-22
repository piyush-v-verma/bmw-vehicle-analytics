import React, { useState } from 'react';
import { EnrichedGeneration } from '../../types/bmw';
import { Flame, Gauge, Trophy, ArrowRight, Zap } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

interface TopPerformersProps {
  generations: EnrichedGeneration[];
  onSelectModel: (model: EnrichedGeneration) => void;
  loading?: boolean;
}

export const TopPerformers: React.FC<TopPerformersProps> = ({ generations, onSelectModel, loading }) => {
  const [tab, setTab] = useState<'power' | 'speed' | 'sales'>('power');

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 h-[380px] flex flex-col justify-between border border-[#313244]">
        <div className="flex justify-between items-center border-b border-[#313244] pb-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-7 w-28 !rounded-lg" />
        </div>
        <div className="flex-1 space-y-4 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton circle={true} className="h-7 w-7 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-2 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const topPower = [...generations]
    .sort((a, b) => b.primaryVariant.horsepower_hp - a.primaryVariant.horsepower_hp)
    .slice(0, 5);

  const topSpeed = [...generations]
    .filter(g => g.primaryVariant.acceleration_0_100_s && g.primaryVariant.acceleration_0_100_s > 0)
    .sort((a, b) => (a.primaryVariant.acceleration_0_100_s || 99) - (b.primaryVariant.acceleration_0_100_s || 99))
    .slice(0, 5);

  const topSales = [...generations]
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5);

  const activeList = tab === 'power' ? topPower : tab === 'speed' ? topSpeed : topSales;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#313244] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#f9e2af]/15 text-[#f9e2af]">
              <Trophy className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              BMW Performance & Heritage Hall of Fame
            </h3>
          </div>
          <p className="text-xs text-[#a6adc8] mt-0.5">
            Top 5 pinnacle records in horsepower, acceleration, and historical production volume
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#181825] p-1 border border-[#313244] text-xs">
          <button
            onClick={() => setTab('power')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-all ${
              tab === 'power'
                ? 'bg-[#f38ba8] font-semibold text-[#11111b]'
                : 'text-[#a6adc8] hover:text-white'
            }`}
          >
            <Flame className="h-3 w-3" />
            Peak Power
          </button>
          <button
            onClick={() => setTab('speed')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-all ${
              tab === 'speed'
                ? 'bg-[#89b4fa] font-semibold text-[#11111b]'
                : 'text-[#a6adc8] hover:text-white'
            }`}
          >
            <Gauge className="h-3 w-3" />
            Quickest 0-100
          </button>
          <button
            onClick={() => setTab('sales')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-all ${
              tab === 'sales'
                ? 'bg-[#f9e2af] font-semibold text-[#11111b]'
                : 'text-[#a6adc8] hover:text-white'
            }`}
          >
            <Zap className="h-3 w-3" />
            Top Volume
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {activeList.map((model, idx) => (
          <div
            key={model.generation_id}
            onClick={() => onSelectModel(model)}
            className="group glass-card-hover rounded-xl bg-[#181825] p-3 border border-[#313244] cursor-pointer flex flex-col justify-between hover:border-[#b4befe]/50 relative overflow-hidden"
          >
            {/* Rank Badge */}
            <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">
              #{idx + 1}
            </div>

            <div>
              {/* Image thumbnail */}
              <div className="relative h-24 w-full rounded-lg overflow-hidden bg-black/40 border border-white/5 mb-2.5">
                <img
                  src={model.imageUrl}
                  alt={model.model_name}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute bottom-1 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-[#a6adc8]">
                  {model.production_start}{model.production_end ? `–${model.production_end}` : '–pres.'}
                </div>
              </div>

              <h4 className="text-xs font-bold text-white group-hover:text-[#b4befe] transition-colors truncate">
                {model.model_name}
              </h4>
              <p className="text-[11px] text-[#a6adc8] truncate font-mono">
                {model.generation_id.replace('BMW_', '').replace(/_/g, ' ')}
              </p>
            </div>

            <div className="mt-3 border-t border-[#313244]/60 pt-2 flex items-center justify-between">
              {tab === 'power' && (
                <div className="font-mono">
                  <span className="text-sm font-black text-[#f38ba8]">{model.primaryVariant.horsepower_hp}</span>
                  <span className="text-[10px] text-[#a6adc8] ml-1">hp</span>
                </div>
              )}
              {tab === 'speed' && (
                <div className="font-mono">
                  <span className="text-sm font-black text-[#89b4fa]">{model.primaryVariant.acceleration_0_100_s}</span>
                  <span className="text-[10px] text-[#a6adc8] ml-1">sec</span>
                </div>
              )}
              {tab === 'sales' && (
                <div className="font-mono">
                  <span className="text-sm font-black text-[#f9e2af]">{(model.totalSales / 1_000_000).toFixed(2)}</span>
                  <span className="text-[10px] text-[#a6adc8] ml-1">Million</span>
                </div>
              )}

              <ArrowRight className="h-3.5 w-3.5 text-[#a6adc8] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
