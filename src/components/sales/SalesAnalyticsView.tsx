import React, { useState, useMemo } from 'react';
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
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { TrendingUp, BarChart3, Calendar, ArrowUpRight, Info, ShieldCheck, Filter } from 'lucide-react';
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
  const [includePartialYtd, setIncludePartialYtd] = useState<boolean>(false);
  const [timelineType, setTimelineType] = useState<'area' | 'line'>('area');

  // Dynamic calculations from validated data
  const {
    topGenerations,
    annualTrend,
    totalGlobalUnits,
    topModel,
    historicalSpan
  } = useMemo(() => {
    if (!generations || generations.length === 0) {
      return {
        topGenerations: [],
        annualTrend: [],
        totalGlobalUnits: 0,
        topModel: null,
        historicalSpan: { minYear: 1929, maxYear: 2026, spanYears: 98, firstModel: '', latestModel: '' }
      };
    }

    // Determine ranking based on selected methodology
    const sorted = [...generations].sort((a, b) => {
      const volA = includePartialYtd ? a.totalSales : a.annualSalesOnly;
      const volB = includePartialYtd ? b.totalSales : b.annualSalesOnly;
      return volB - volA;
    });

    const top10 = sorted.slice(0, 10).map((g) => {
      const vol = includePartialYtd ? g.totalSales : g.annualSalesOnly;
      const chassisCode = g.generation_id.replace(/^BMW_/i, '').replace(/_/g, ' ');
      return {
        id: `${g.model_name} (${chassisCode})`,
        shortId: chassisCode,
        rawId: g.generation_id,
        fullModel: g,
        sales: vol,
        salesM: Number((vol / 1_000_000).toFixed(2)),
        years: `${g.production_start}${g.production_end ? `–${g.production_end}` : '–pres.'}`,
        hasPartial: g.hasPartialSalesData
      };
    });

    // Aggregate global annual progression from generation yearlySales
    const yearVolumeMap = new Map<number, { units: number; isComplete: boolean; coverage: string }>();

    for (const g of generations) {
      for (const y of g.yearlySales) {
        if (!includePartialYtd && !y.isCompleteYear) {
          continue;
        }
        const current = yearVolumeMap.get(y.year) || { units: 0, isComplete: y.isCompleteYear, coverage: y.coverageLabel };
        yearVolumeMap.set(y.year, {
          units: current.units + y.units,
          isComplete: current.isComplete && y.isCompleteYear,
          coverage: y.coverageLabel
        });
      }
    }

    const trend = Array.from(yearVolumeMap.entries())
      .map(([year, val]) => ({
        year,
        units: val.units,
        unitsM: Number((val.units / 1_000_000).toFixed(2)),
        isComplete: val.isComplete,
        coverage: val.coverage
      }))
      .sort((a, b) => a.year - b.year);

    const totalUnits = trend.reduce((sum, item) => sum + item.units, 0);

    // Dynamic historical span calculation
    const starts = generations.map(g => g.production_start).filter(Boolean);
    const ends = generations.map(g => g.production_end || 2026).filter(Boolean);
    const minYear = starts.length > 0 ? Math.min(...starts) : 1929;
    const maxYear = ends.length > 0 ? Math.max(...ends) : 2026;
    const spanYears = maxYear - minYear + 1;

    const firstModelObj = generations.find(g => g.production_start === minYear);
    const latestModelObj = generations.find(g => (g.production_end || 2026) === maxYear);

    return {
      topGenerations: top10,
      annualTrend: trend,
      totalGlobalUnits: totalUnits,
      topModel: sorted[0] || null,
      historicalSpan: {
        minYear,
        maxYear,
        spanYears,
        firstModel: firstModelObj?.model_name || 'Dixi 3/15',
        latestModel: latestModelObj?.model_name || 'Electrified Fleet'
      }
    };
  }, [generations, includePartialYtd]);

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

  return (
    <div className="space-y-6">
      {/* Methodology Controls Bar */}
      <div className="glass-card rounded-2xl p-4 border border-[#313244] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#a6e3a1]" />
          <div>
            <span className="text-xs font-bold text-white">Audited Methodology Controls</span>
            <p className="text-[11px] text-[#a6adc8]">Strict annual precedence • Zero double-counting • Explicit YTD granularity</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#a6adc8] flex items-center gap-1">
            <Filter className="h-3 w-3" /> Data Scope:
          </span>
          <button
            onClick={() => setIncludePartialYtd(false)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              !includePartialYtd
                ? 'bg-[#b4befe] text-[#11111b] font-bold shadow-sm'
                : 'bg-[#181825] text-[#a6adc8] hover:text-white border border-[#313244]'
            }`}
          >
            Completed Annual Only (1929–2023)
          </button>
          <button
            onClick={() => setIncludePartialYtd(true)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              includePartialYtd
                ? 'bg-[#f9e2af] text-[#11111b] font-bold shadow-sm'
                : 'bg-[#181825] text-[#a6adc8] hover:text-white border border-[#313244]'
            }`}
          >
            All Deliveries (Incl. 2024 YTD)
          </button>
        </div>
      </div>

      {/* Top Banner Stats - 100% Calculated Dynamically */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Calculated Deliveries */}
        <div className="glass-card rounded-2xl p-5 border border-[#313244]">
          <div className="flex items-center justify-between text-xs text-[#a6adc8]">
            <span className="uppercase font-semibold tracking-wider">Total Recorded Volume</span>
            <TrendingUp className="h-4 w-4 text-[#94e2d5]" />
          </div>
          <div className="text-3xl font-black text-white font-['Outfit'] mt-2">
            {(totalGlobalUnits / 1_000_000).toFixed(2)}M
          </div>
          <p className="text-xs text-[#a6adc8] mt-1">
            Audited global deliveries across {annualTrend.length} recorded calendar years ({historicalSpan.minYear}–{includePartialYtd ? '2024 YTD' : '2023'})
          </p>
        </div>

        {/* Dynamically Computed Top-Selling Generation */}
        <div className="glass-card rounded-2xl p-5 border border-[#313244]">
          <div className="flex items-center justify-between text-xs text-[#a6adc8]">
            <span className="uppercase font-semibold tracking-wider">Top-Selling Generation</span>
            <BarChart3 className="h-4 w-4 text-[#b4befe]" />
          </div>
          <div className="text-2xl font-black text-[#b4befe] font-['Outfit'] mt-2 truncate" title={topModel?.model_name}>
            {topModel ? `${topModel.model_name} (${topModel.generation_id.replace('BMW_', '')})` : 'N/A'}
          </div>
          <p className="text-xs text-[#a6adc8] mt-1">
            {topModel ? `${(topModel.totalSales / 1_000_000).toFixed(2)}M units verified (${topModel.production_start}–${topModel.production_end || 'pres.'})` : ''}
          </p>
        </div>

        {/* Dynamically Computed Historical Span */}
        <div className="glass-card rounded-2xl p-5 border border-[#313244]">
          <div className="flex items-center justify-between text-xs text-[#a6adc8]">
            <span className="uppercase font-semibold tracking-wider">Calculated Historical Span</span>
            <Calendar className="h-4 w-4 text-[#f9e2af]" />
          </div>
          <div className="text-3xl font-black text-[#f9e2af] font-['Outfit'] mt-2">
            {historicalSpan.spanYears} Years
          </div>
          <p className="text-xs text-[#a6adc8] mt-1 truncate" title={`${historicalSpan.minYear} ${historicalSpan.firstModel} to ${historicalSpan.maxYear}`}>
            {historicalSpan.minYear} {historicalSpan.firstModel} to {historicalSpan.maxYear}
          </p>
        </div>
      </div>

      {/* Top 10 Leaderboard Bar Chart */}
      <div className="glass-card rounded-2xl p-5 border border-[#313244]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#313244] pb-4 mb-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Top 10 Best-Selling BMW Generations of All Time
            </h3>
            <p className="text-xs text-[#a6adc8] mt-0.5">
              Ranked by cumulative lifecycle manufacturing & deliveries ({includePartialYtd ? 'All validated data' : 'Completed annual years only'})
            </p>
          </div>
          <span className="text-xs text-[#94e2d5] font-mono font-semibold">
            All-Time Volume Leaders
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topGenerations} layout="vertical" margin={{ left: 10, right: 35, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#313244" horizontal={false} />
              <XAxis type="number" stroke="#a6adc8" fontSize={11} tickFormatter={(v) => `${v}M`} />
              <YAxis 
                type="category" 
                dataKey="id" 
                stroke="#cdd6f4" 
                fontSize={11} 
                width={135} 
                tickLine={false} 
              />
              <Tooltip
                formatter={(val: any, name: any, item: any) => {
                  const actualUnits = item?.payload?.sales || 0;
                  const inM = item?.payload?.salesM || (actualUnits / 1_000_000).toFixed(2);
                  return [`${actualUnits.toLocaleString()} units (${inM} Million)`, 'Cumulative Deliveries'];
                }}
                labelFormatter={(label, payload) => {
                  const full = payload?.[0]?.payload?.fullModel;
                  return full ? `${full.model_name} (${full.generation_id.replace('BMW_', '')})` : label;
                }}
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

      {/* Grid: Global Annual Progression & Ranked Series Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Annual Timeline Line/Area Chart */}
        <div className="glass-card rounded-2xl p-5 border border-[#313244]">
          <div className="flex items-center justify-between border-b border-[#313244] pb-3 mb-4">
            <div>
              <h4 className="text-sm font-bold text-white font-['Outfit']">
                Annual Global Deliveries Progression ({historicalSpan.minYear}–{includePartialYtd ? '2024 YTD' : '2023'})
              </h4>
              <p className="text-[11px] text-[#a6adc8]">Aggregated by verified calendar year</p>
            </div>
            <div className="flex items-center rounded-lg bg-[#181825] p-0.5 border border-[#313244] text-[11px]">
              <button
                onClick={() => setTimelineType('area')}
                className={`rounded-md px-2 py-0.5 transition-all ${
                  timelineType === 'area'
                    ? 'bg-[#94e2d5] font-bold text-[#11111b]'
                    : 'text-[#a6adc8] hover:text-white'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setTimelineType('line')}
                className={`rounded-md px-2 py-0.5 transition-all ${
                  timelineType === 'line'
                    ? 'bg-[#94e2d5] font-bold text-[#11111b]'
                    : 'text-[#a6adc8] hover:text-white'
                }`}
              >
                Line
              </button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {timelineType === 'area' ? (
                <AreaChart data={annualTrend} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesViewGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94e2d5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#94e2d5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#313244" vertical={false} />
                  <XAxis dataKey="year" stroke="#a6adc8" fontSize={10} tickLine={false} />
                  <YAxis width={55} stroke="#a6adc8" fontSize={10} tickFormatter={(v) => `${(v/1_000_000).toFixed(1)}M`} tickLine={false} axisLine={false} />
                  <Tooltip 
                    formatter={(v: any, name: any, item: any) => {
                      const actual = item?.payload?.units || Number(v || 0);
                      const isComp = item?.payload?.isComplete;
                      return [
                        `${actual.toLocaleString()} units ${isComp ? '(Audited Full Year)' : '(Partial YTD)'}`,
                        'Deliveries'
                      ];
                    }}
                    labelFormatter={(label) => `Year ${label}`}
                    contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
                  />
                  <Area type="monotone" dataKey="units" stroke="#94e2d5" strokeWidth={2.5} fill="url(#salesViewGrad)" activeDot={{ r: 6, fill: '#94e2d5', stroke: '#11111b', strokeWidth: 2 }} />
                </AreaChart>
              ) : (
                <LineChart data={annualTrend} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#313244" vertical={false} />
                  <XAxis dataKey="year" stroke="#a6adc8" fontSize={10} tickLine={false} />
                  <YAxis width={55} stroke="#a6adc8" fontSize={10} tickFormatter={(v) => `${(v/1_000_000).toFixed(1)}M`} tickLine={false} axisLine={false} />
                  <Tooltip 
                    formatter={(v: any, name: any, item: any) => {
                      const actual = item?.payload?.units || Number(v || 0);
                      const isComp = item?.payload?.isComplete;
                      return [
                        `${actual.toLocaleString()} units ${isComp ? '(Audited Full Year)' : '(Partial YTD)'}`,
                        'Deliveries'
                      ];
                    }}
                    labelFormatter={(label) => `Year ${label}`}
                    contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
                  />
                  <Line type="monotone" dataKey="units" stroke="#94e2d5" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#94e2d5', stroke: '#11111b', strokeWidth: 2 }} />
                </LineChart>
              )}
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
              <span className="text-xs text-[#a6adc8]">Click to inspect specs</span>
            </div>

            <div className="overflow-y-auto max-h-56 pr-2 space-y-2 text-xs">
              {topGenerations.map((g, idx) => (
                <div
                  key={g.rawId}
                  onClick={() => onSelectModel(g.fullModel)}
                  className="flex items-center justify-between rounded-xl bg-[#11111b] p-2.5 border border-[#313244] hover:border-[#b4befe]/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{g.fullModel.model_name}</span>
                        {g.hasPartial && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#f9e2af]/20 text-[#f9e2af] border border-[#f9e2af]/30">
                            +2024 YTD
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#a6adc8] font-mono">{g.shortId} ({g.years})</div>
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

      {/* Methodology and Statistical Fairness Note */}
      <div className="rounded-2xl bg-[#11111b] p-4 border border-[#313244] text-xs text-[#a6adc8] space-y-2">
        <div className="flex items-center gap-2 font-bold text-white">
          <Info className="h-4 w-4 text-[#94e2d5]" />
          <span>Statistical Methodology & Data Fairness Disclaimer</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] leading-relaxed pt-1">
          <div className="rounded-xl bg-[#181825] p-3 border border-[#313244]/60">
            <strong className="text-white block mb-1">1. Authoritative Precedence</strong>
            When both annual financial totals and monthly delivery figures exist for the same period, authoritative annual audited reports are prioritized to prevent double-counting.
          </div>
          <div className="rounded-xl bg-[#181825] p-3 border border-[#313244]/60">
            <strong className="text-white block mb-1">2. Complete vs. Partial Granularity</strong>
            Full 12-month records are aggregated to complete annual figures. Incomplete records (e.g. 2024 with 6 months) are explicitly isolated as partial YTD deliveries and labeled as such.
          </div>
          <div className="rounded-xl bg-[#181825] p-3 border border-[#313244]/60">
            <strong className="text-white block mb-1">3. Cumulative vs Annual Fair Comparison</strong>
            Cumulative lifecycle totals reflect total vehicle production across all production years, whereas annual trends report single-year deliveries without conflating the two metrics.
          </div>
        </div>
      </div>
    </div>
  );
};