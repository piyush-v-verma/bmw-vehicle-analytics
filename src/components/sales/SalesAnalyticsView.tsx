import React, { useState } from 'react';
import { EnrichedGeneration, BmwSales } from '../../types/bmw';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { TrendingUp, BarChart3, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';
import { KpiCardSkeleton } from '../common/KpiCardSkeleton';
import { ChartSkeleton } from '../common/ChartSkeleton';

interface SalesAnalyticsViewProps {
  generations: EnrichedGeneration[];
  allSales: BmwSales[];
  onSelectModel: (model: EnrichedGeneration) => void;
  loading?: boolean;
}

export const SalesAnalyticsView: React.FC<SalesAnalyticsViewProps> = ({
  generations,
  allSales,
  onSelectModel,
  loading
}) => {
  const [selectedSeries, setSelectedSeries] = useState<string>('All');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartSkeleton heightClass="h-96" />
          <ChartSkeleton heightClass="h-96" />
        </div>
      </div>
    );
  }

  // Top 10 Best Selling Generations
  const topGenerations = [...generations]
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 10)
    .map((g) => ({
      id: g.generation_id.replace('BMW_', '').replace(/_/g, ' '),
      fullModel: g,
      sales: g.totalSales,
      salesM: Number((g.totalSales / 1_000_000).toFixed(2)),
      years: `${g.production_start}${g.production_end ? `–${g.production_end}` : '–pres.'}`
    }));

  // Monthly delivery breakdown for recent years (where month is present)
  const monthlyData = allSales
    .filter((s) => s.month !== null && s.month !== undefined && s.year >= 2024)
    .map((s) => ({
      label: `${s.generation_id.replace('BMW_', '')} M${s.month}`,
      units: s.units_sold,
      month: `Month ${s.month}`,
      gid: s.generation_id
    }));

  // Annual sales summary
  const annualMap = new Map<number, number>();
  for (const s of allSales) {
    annualMap.set(s.year, (annualMap.get(s.year) || 0) + s.units_sold);
  }

  const annualTrend = Array.from(annualMap.entries())
    .map(([year, units]) => ({ year, units, unitsM: Number((units / 1_000_000).toFixed(2)) }))
    .sort((a, b) => a.year - b.year);

  const totalGlobalUnits = Array.from(annualMap.values()).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-2xl p-5 border border-[#313244]">
          <div className="flex items-center justify-between text-xs text-[#a6adc8]">
            <span className="uppercase font-semibold tracking-wider">Total Recorded Volume</span>
            <TrendingUp className="h-4 w-4 text-[#94e2d5]" />
          </div>
          <div className="text-3xl font-black text-white font-['Outfit'] mt-2">
            {(totalGlobalUnits / 1_000_000).toFixed(2)}M+
          </div>
          <p className="text-xs text-[#a6adc8] mt-1">Verified global deliveries across 1929–2024</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#313244]">
          <div className="flex items-center justify-between text-xs text-[#a6adc8]">
            <span className="uppercase font-semibold tracking-wider">Top-Selling Generation</span>
            <BarChart3 className="h-4 w-4 text-[#b4befe]" />
          </div>
          <div className="text-3xl font-black text-[#b4befe] font-['Outfit'] mt-2">
            3 Series E46
          </div>
          <p className="text-xs text-[#a6adc8] mt-1">3.27 Million units produced (1997–2006)</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#313244]">
          <div className="flex items-center justify-between text-xs text-[#a6adc8]">
            <span className="uppercase font-semibold tracking-wider">Historical Time Span</span>
            <Calendar className="h-4 w-4 text-[#f9e2af]" />
          </div>
          <div className="text-3xl font-black text-[#f9e2af] font-['Outfit'] mt-2">
            97 Years
          </div>
          <p className="text-xs text-[#a6adc8] mt-1">1929 Pre-War 3/15 to 2026 Electrified Lineup</p>
        </div>
      </div>

      {/* Top 10 Leaderboard Bar Chart */}
      <div className="glass-card rounded-2xl p-5 border border-[#313244]">
        <div className="flex items-center justify-between border-b border-[#313244] pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Top 10 Best-Selling BMW Generations of All Time
            </h3>
            <p className="text-xs text-[#a6adc8] mt-0.5">
              Ranked by cumulative global manufacturing and delivery volume (Bar Graph)
            </p>
          </div>
          <span className="text-xs text-[#94e2d5] font-mono font-semibold">
            All-Time Volume Leaders
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topGenerations} layout="vertical" margin={{ left: 40, right: 30, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#313244" horizontal={false} />
              <XAxis type="number" stroke="#a6adc8" fontSize={11} tickFormatter={(v) => `${v}M`} />
              <YAxis type="category" dataKey="id" stroke="#cdd6f4" fontSize={11} width={100} tickLine={false} />
              <Tooltip
                formatter={(val: any, name: any, item: any) => [
                  `${item.payload.sales.toLocaleString()} units (${item.payload.salesM} Million)`,
                  'Total Volume'
                ]}
                labelFormatter={(label) => `BMW ${label}`}
                contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
              />
              <Bar dataKey="salesM" fill="#0066b1" radius={[0, 6, 6, 0]}>
                {topGenerations.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#b4befe' : index < 3 ? '#89b4fa' : '#0066b1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Global Annual Progression & Monthly 2024 Breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Annual Timeline Line Chart */}
        <div className="glass-card rounded-2xl p-5 border border-[#313244]">
          <div className="flex items-center justify-between border-b border-[#313244] pb-3 mb-4">
            <h4 className="text-sm font-bold text-white font-['Outfit']">
              Annual Global Deliveries Growth (1929–2024)
            </h4>
            <span className="text-xs text-[#b4befe] font-mono">Line Graph</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={annualTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#313244" vertical={false} />
                <XAxis dataKey="year" stroke="#a6adc8" fontSize={10} />
                <YAxis stroke="#a6adc8" fontSize={10} tickFormatter={(v) => `${(v/1_000_000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(v: any) => [`${Number(v).toLocaleString()} units`, 'Deliveries']}
                  contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
                />
                <Line type="monotone" dataKey="units" stroke="#94e2d5" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Sales Records Table */}
        <div className="glass-card rounded-2xl p-5 border border-[#313244] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#313244] pb-3 mb-3">
              <h4 className="text-sm font-bold text-white font-['Outfit']">
                Historical Series Volume Overview
              </h4>
              <span className="text-xs text-[#a6adc8]">Ranked</span>
            </div>

            <div className="overflow-y-auto max-h-56 pr-2 space-y-2 text-xs">
              {topGenerations.map((g, idx) => (
                <div
                  key={g.id}
                  onClick={() => onSelectModel(g.fullModel)}
                  className="flex items-center justify-between rounded-xl bg-[#11111b] p-2.5 border border-[#313244] hover:border-[#b4befe]/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white">{g.fullModel.model_name}</div>
                      <div className="text-[10px] text-[#a6adc8] font-mono">{g.id} ({g.years})</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#b4befe]">{g.salesM}M units</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#a6adc8]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
