import React from 'react';
import { 
  Flame, 
  Zap, 
  TrendingUp, 
  Calendar, 
  Gauge, 
  ShieldCheck
} from 'lucide-react';
import { EnrichedGeneration } from '../../types/bmw';
import { Skeleton } from '../common/Skeleton';

interface KpiRibbonProps {
  generations: EnrichedGeneration[];
  onSelectModel: (model: EnrichedGeneration) => void;
  loading?: boolean;
}

export const KpiRibbon: React.FC<KpiRibbonProps> = ({ generations, onSelectModel, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-4 flex flex-col justify-between h-24 border border-[#313244]">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-7 w-7 !rounded-lg" />
            </div>
            <Skeleton className="mt-2 h-6 w-2/3" />
            <Skeleton className="mt-1 h-3.5 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const totalSales = generations.reduce((acc, g) => acc + g.totalSales, 0);
  const activeModels = generations.filter(g => g.status === 'Active');
  
  // Find highest horsepower
  const highestPowerModel = [...generations].sort((a, b) => b.primaryVariant.horsepower_hp - a.primaryVariant.horsepower_hp)[0];

  // Find quickest acceleration (0-100)
  const quickestModel = [...generations]
    .filter(g => g.primaryVariant.acceleration_0_100_s !== null && g.primaryVariant.acceleration_0_100_s > 0)
    .sort((a, b) => (a.primaryVariant.acceleration_0_100_s || 99) - (b.primaryVariant.acceleration_0_100_s || 99))[0];

  // Find best-selling generation
  const bestSeller = [...generations].sort((a, b) => b.totalSales - a.totalSales)[0];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {/* 1. Total Generations */}
      <div className="glass-card rounded-2xl p-4 transition-all hover:border-[#b4befe]/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#a6adc8]">Catalog</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#b4befe]/10 text-[#b4befe]">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-white font-['Outfit']">{generations.length}</div>
        <p className="mt-1 text-[11px] text-[#a6adc8]">Canonical Generations</p>
      </div>

      {/* 2. Active Lineup */}
      <div className="glass-card rounded-2xl p-4 transition-all hover:border-[#a6e3a1]/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#a6adc8]">Active 2026</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#a6e3a1]/10 text-[#a6e3a1]">
            <Zap className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-[#a6e3a1] font-['Outfit']">{activeModels.length}</div>
        <p className="mt-1 text-[11px] text-[#a6adc8]">In Current Production</p>
      </div>

      {/* 3. Global Volume Tracked */}
      <div className="glass-card rounded-2xl p-4 transition-all hover:border-[#94e2d5]/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#a6adc8]">Deliveries</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#94e2d5]/10 text-[#94e2d5]">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-[#94e2d5] font-['Outfit']">
          {(totalSales / 1_000_000).toFixed(1)}M+
        </div>
        <p className="mt-1 text-[11px] text-[#a6adc8]">Global Units Documented</p>
      </div>

      {/* 4. Peak Power Flagship */}
      <div 
        onClick={() => highestPowerModel && onSelectModel(highestPowerModel)}
        className="glass-card rounded-2xl p-4 transition-all hover:border-[#f38ba8]/40 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#a6adc8]">Peak Power</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f38ba8]/10 text-[#f38ba8] group-hover:scale-110 transition-transform">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-[#f38ba8] font-['Outfit']">
          {highestPowerModel?.primaryVariant.horsepower_hp || 748} <span className="text-xs font-normal text-[#a6adc8]">hp</span>
        </div>
        <p className="mt-1 text-[11px] text-[#a6adc8] truncate group-hover:text-white transition-colors">
          {highestPowerModel?.model_name} ({highestPowerModel?.primaryVariant.variant_id.replace(/_/g, ' ')})
        </p>
      </div>

      {/* 5. Quickest Acceleration */}
      <div 
        onClick={() => quickestModel && onSelectModel(quickestModel)}
        className="glass-card rounded-2xl p-4 transition-all hover:border-[#89b4fa]/40 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#a6adc8]">0-100 km/h</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#89b4fa]/10 text-[#89b4fa] group-hover:scale-110 transition-transform">
            <Gauge className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-[#89b4fa] font-['Outfit']">
          {quickestModel?.primaryVariant.acceleration_0_100_s} <span className="text-xs font-normal text-[#a6adc8]">s</span>
        </div>
        <p className="mt-1 text-[11px] text-[#a6adc8] truncate group-hover:text-white transition-colors">
          {quickestModel?.model_name} ({quickestModel?.primaryVariant.variant_id.replace(/_/g, ' ')})
        </p>
      </div>

      {/* 6. Best Selling Model */}
      <div 
        onClick={() => bestSeller && onSelectModel(bestSeller)}
        className="glass-card rounded-2xl p-4 transition-all hover:border-[#f9e2af]/40 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#a6adc8]">Top Volume</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f9e2af]/10 text-[#f9e2af] group-hover:scale-110 transition-transform">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-[#f9e2af] font-['Outfit']">
          {(bestSeller.totalSales / 1_000_000).toFixed(2)}M
        </div>
        <p className="mt-1 text-[11px] text-[#a6adc8] truncate group-hover:text-white transition-colors">
          {bestSeller?.generation_id.replace('BMW_', '').replace(/_/g, ' ')}
        </p>
      </div>
    </div>
  );
};
