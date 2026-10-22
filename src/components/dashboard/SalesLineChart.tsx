import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';
import { EnrichedGeneration } from '../../types/bmw';
import { TrendingUp, ShieldCheck, Filter } from 'lucide-react';
import { ChartSkeleton } from '../common/ChartSkeleton';

interface SalesLineChartProps {
  generations: EnrichedGeneration[];
  loading?: boolean;
}

export const SalesLineChart: React.FC<SalesLineChartProps> = ({ generations, loading }) => {
  const [selectedEra, setSelectedEra] = useState<string>('All');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [includePartial2024, setIncludePartial2024] = useState<boolean>(false);

  // Methodologically sound aggregation distinguishing complete vs partial years
  const chartData = useMemo(() => {
    const annualMap = new Map<number, { units: number; isComplete: boolean; coverage: string }>();

    for (const g of generations) {
      for (const s of g.yearlySales) {
        if (!includePartial2024 && !s.isCompleteYear) {
          continue;
        }
        const current = annualMap.get(s.year) || { units: 0, isComplete: s.isCompleteYear, coverage: s.coverageLabel };
        annualMap.set(s.year, {
          units: current.units + s.units,
          isComplete: current.isComplete && s.isCompleteYear,
          coverage: s.coverageLabel
        });
      }
    }

    let data = Array.from(annualMap.entries())
      .map(([year, val]) => ({
        year,
        units: val.units,
        isComplete: val.isComplete,
        coverage: val.coverage,
        formattedUnits: (val.units >= 1_000_000 ? `${(val.units / 1_000_000).toFixed(2)}M` : `${(val.units / 1_000).toFixed(0)}k`)
      }))
      .sort((a, b) => a.year - b.year);

    if (selectedEra === 'Pre-War (1929-1945)') {
      data = data.filter(d => d.year <= 1945);
    } else if (selectedEra === 'Post-War (1950-1975)') {
      data = data.filter(d => d.year >= 1950 && d.year <= 1975);
    } else if (selectedEra === 'Modern (1976-2010)') {
      data = data.filter(d => d.year >= 1976 && d.year <= 2010);
    } else if (selectedEra === 'Current (2011-2024)') {
      data = data.filter(d => d.year >= 2011);
    }

    return data;
  }, [generations, selectedEra, includePartial2024]);

  if (loading) {
    return <ChartSkeleton heightClass="h-[380px]" />;
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#313244] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#89b4fa]/15 text-[#89b4fa]">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Global Annual Production & Deliveries
            </h3>
          </div>
          <p className="text-xs text-[#a6adc8] mt-0.5">
            Verified global delivery volume from 1929 through {includePartial2024 ? '2024 YTD' : '2023'}
          </p>
        </div>

        {/* Controls: Chart style & 2024 toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Complete vs 2024 Toggle */}
          <button
            onClick={() => setIncludePartial2024(!includePartial2024)}
            className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
              includePartial2024
                ? 'bg-[#f9e2af] text-[#11111b] font-bold shadow-sm'
                : 'bg-[#181825] text-[#a6adc8] hover:text-white border border-[#313244]'
            }`}
            title="Toggle inclusion of 2024 partial Q1 YTD data"
          >
            {includePartial2024 ? '✓ Incl. 2024 YTD' : '+ 2024 YTD'}
          </button>

          {/* Area vs Line Toggle */}
          <div className="flex items-center rounded-lg bg-[#181825] p-0.5 border border-[#313244] text-[11px]">
            <button
              onClick={() => setChartType('area')}
              className={`rounded-md px-2 py-0.5 transition-all ${
                chartType === 'area'
                  ? 'bg-[#89b4fa] font-bold text-[#11111b]'
                  : 'text-[#a6adc8] hover:text-white'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`rounded-md px-2 py-0.5 transition-all ${
                chartType === 'line'
                  ? 'bg-[#89b4fa] font-bold text-[#11111b]'
                  : 'text-[#a6adc8] hover:text-white'
              }`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      {/* Era Filter Pill Selector */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        {['All', 'Pre-War (1929-1945)', 'Post-War (1950-1975)', 'Modern (1976-2010)', 'Current (2011-2024)'].map((era) => (
          <button
            key={era}
            onClick={() => setSelectedEra(era)}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              selectedEra === era
                ? 'bg-[#89b4fa] font-semibold text-[#11111b] shadow-sm'
                : 'bg-[#181825] text-[#a6adc8] hover:text-white border border-[#313244]'
            }`}
          >
            {era === 'All' ? 'Full 95-Yr Timeline' : era.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 25, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#89b4fa" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#89b4fa" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#313244" vertical={false} />
              <XAxis 
                dataKey="year" 
                stroke="#a6adc8" 
                fontSize={11}
                tickLine={false}
              />
              <YAxis 
                width={55}
                stroke="#a6adc8" 
                fontSize={11} 
                tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: any, name: any, item: any) => {
                  const isComp = item?.payload?.isComplete;
                  const label = isComp ? 'Full Audited Year' : 'Partial YTD Deliveries';
                  const valNum = Number(value || 0);
                  const inMillions = valNum >= 100_000 ? ` (${(valNum / 1_000_000).toFixed(2)}M)` : '';
                  return [`${valNum.toLocaleString()} units${inMillions} • ${label}`, 'Deliveries'];
                }}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
              />
              <Area 
                type="monotone" 
                dataKey="units" 
                stroke="#89b4fa" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#salesGradient)"
                dot={selectedEra !== 'All' ? { r: 3, fill: '#89b4fa' } : false}
                activeDot={{ r: 6, fill: '#b4befe', stroke: '#11111b', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 25, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#313244" vertical={false} />
              <XAxis dataKey="year" stroke="#a6adc8" fontSize={11} tickLine={false} />
              <YAxis 
                width={55}
                stroke="#a6adc8" 
                fontSize={11} 
                tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: any, name: any, item: any) => {
                  const isComp = item?.payload?.isComplete;
                  const label = isComp ? 'Full Audited Year' : 'Partial YTD Deliveries';
                  const valNum = Number(value || 0);
                  const inMillions = valNum >= 100_000 ? ` (${(valNum / 1_000_000).toFixed(2)}M)` : '';
                  return [`${valNum.toLocaleString()} units${inMillions} • ${label}`, 'Deliveries'];
                }}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
              />
              <Line 
                type="monotone" 
                dataKey="units" 
                stroke="#89b4fa" 
                strokeWidth={2.5} 
                dot={selectedEra !== 'All' ? { r: 3, fill: '#89b4fa' } : false}
                activeDot={{ r: 6, fill: '#b4befe', stroke: '#11111b', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#a6adc8] border-t border-[#313244]/50 pt-2.5 gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#a6e3a1]" />
          <span>
            {includePartial2024
              ? 'Showing all data including 2024 partial Q1 YTD (874,310 units).'
              : 'Showing complete audited annual figures (1929–2023). Toggle "+ 2024 YTD" to include Q1.'}
          </span>
        </div>
        <div className="font-semibold text-[#89b4fa] font-mono">
          Data Points: {chartData.length} Years
        </div>
      </div>
    </div>
  );
};