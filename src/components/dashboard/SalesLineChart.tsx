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
import { TrendingUp, Info, ShieldCheck } from 'lucide-react';
import { ChartSkeleton } from '../common/ChartSkeleton';

interface SalesLineChartProps {
  generations: EnrichedGeneration[];
  loading?: boolean;
}

export const SalesLineChart: React.FC<SalesLineChartProps> = ({ generations, loading }) => {
  const [selectedEra, setSelectedEra] = useState<string>('All');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');

  // Methodologically sound aggregation distinguishing complete vs partial years
  const chartData = useMemo(() => {
    const annualMap = new Map<number, { units: number; isComplete: boolean; coverage: string }>();

    for (const g of generations) {
      for (const s of g.yearlySales) {
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
  }, [generations, selectedEra]);

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
            Verified global delivery volume from 1929 through 2024 (Line Graph)
          </p>
        </div>

        {/* Era Filter Pill Selector */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
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
              {era === 'All' ? 'Full Timeline' : era.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                stroke="#a6adc8" 
                fontSize={11} 
                tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: any, name: any, item: any) => [
                  `${Number(value).toLocaleString()} units ${item.payload.isComplete ? '(Audited Full Year)' : '(Partial YTD Deliveries)'}`,
                  'Global Deliveries'
                ]}
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
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#313244" vertical={false} />
              <XAxis dataKey="year" stroke="#a6adc8" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="#a6adc8" 
                fontSize={11} 
                tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: any, name: any, item: any) => [
                  `${Number(value).toLocaleString()} units ${item.payload.isComplete ? '(Audited Full Year)' : '(Partial YTD Deliveries)'}`,
                  'Global Deliveries'
                ]}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
              />
              <Line type="monotone" dataKey="units" stroke="#89b4fa" strokeWidth={2.5} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#a6adc8] border-t border-[#313244]/50 pt-2.5 gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#a6e3a1]" />
          <span>Audited annual precedence applied. 2024 data represents partial monthly YTD without double-counting.</span>
        </div>
        <div className="font-semibold text-[#89b4fa] font-mono">
          Data Points: {chartData.length} Years
        </div>
      </div>
    </div>
  );
};