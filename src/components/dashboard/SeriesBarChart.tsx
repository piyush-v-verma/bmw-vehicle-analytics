import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { EnrichedGeneration } from '../../types/bmw';
import { BarChart3 } from 'lucide-react';
import { ChartSkeleton } from '../common/ChartSkeleton';

interface SeriesBarChartProps {
  generations: EnrichedGeneration[];
  loading?: boolean;
}

export const SeriesBarChart: React.FC<SeriesBarChartProps> = ({ generations, loading }) => {
  const [metric, setMetric] = useState<'sales' | 'power' | 'variants'>('sales');

  if (loading) {
    return <ChartSkeleton heightClass="h-[380px]" />;
  }

  // Categorize generations into standard series groups
  const seriesGroups: Record<string, { totalSales: number; totalPower: number; count: number; variantCount: number }> = {};

  for (const g of generations) {
    let group = 'Historical / Classic';
    const s = g.model_name.toLowerCase();
    const gid = g.generation_id.toLowerCase();

    if (s.includes('3 series') || gid.includes('bmw_3_')) group = '3 Series';
    else if (s.includes('5 series') || gid.includes('bmw_5_')) group = '5 Series';
    else if (s.includes('7 series') || gid.includes('bmw_7_')) group = '7 Series';
    else if (s.includes('x1') || s.includes('x2') || s.includes('x3') || s.includes('x4') || s.includes('x5') || s.includes('x6') || s.includes('x7') || s.includes('xm') || gid.includes('bmw_x')) group = 'X Family (SAV/SAC)';
    else if (s.includes('1 series') || gid.includes('bmw_1_')) group = '1 Series';
    else if (s.includes('2 series') || gid.includes('bmw_2_')) group = '2 Series';
    else if (s.includes('4 series') || gid.includes('bmw_4_')) group = '4 Series';
    else if (s.includes('6 series') || s.includes('8 series') || gid.includes('bmw_6_') || gid.includes('bmw_8_')) group = '6 & 8 Series';
    else if (s.includes('z1') || s.includes('z3') || s.includes('z4') || s.includes('z8') || gid.includes('bmw_z')) group = 'Z Roadsters';
    else if (s.startsWith('i') || gid.includes('bmw_i')) group = 'i-Series (EV/PHEV)';

    if (!seriesGroups[group]) {
      seriesGroups[group] = { totalSales: 0, totalPower: 0, count: 0, variantCount: 0 };
    }
    seriesGroups[group].totalSales += g.totalSales;
    seriesGroups[group].totalPower += g.primaryVariant.horsepower_hp;
    seriesGroups[group].count += 1;
    seriesGroups[group].variantCount += g.variants.length;
  }

  const chartData = Object.entries(seriesGroups).map(([name, data]) => ({
    name,
    sales: data.totalSales,
    salesMillions: Number((data.totalSales / 1_000_000).toFixed(2)),
    avgPower: Math.round(data.totalPower / (data.count || 1)),
    variants: data.variantCount,
    generations: data.count
  })).sort((a, b) => {
    if (metric === 'sales') return b.sales - a.sales;
    if (metric === 'power') return b.avgPower - a.avgPower;
    return b.variants - a.variants;
  });

  const BAR_COLORS = [
    '#0066b1', // BMW M Blue
    '#2a2d7c', // BMW M Dark Blue
    '#b4befe', // Lavender Accent
    '#94e2d5', // Teal
    '#a6e3a1', // Green
    '#f9e2af', // Yellow
    '#89b4fa', // Blue
    '#cba6f7', // Purple
    '#f38ba8', // Pink
    '#fab387'  // Peach
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#313244] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#b4befe]/15 text-[#b4befe]">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Series Performance Comparison
            </h3>
          </div>
          <p className="text-xs text-[#a6adc8] mt-0.5">
            Model family leaderboards by delivery volume, power, & variants (Bar Graph)
          </p>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#181825] p-1 border border-[#313244] text-xs">
          <button
            onClick={() => setMetric('sales')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              metric === 'sales'
                ? 'bg-[#b4befe] font-semibold text-[#11111b]'
                : 'text-[#a6adc8] hover:text-white'
            }`}
          >
            Total Deliveries
          </button>
          <button
            onClick={() => setMetric('power')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              metric === 'power'
                ? 'bg-[#b4befe] font-semibold text-[#11111b]'
                : 'text-[#a6adc8] hover:text-white'
            }`}
          >
            Avg Horsepower
          </button>
          <button
            onClick={() => setMetric('variants')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              metric === 'variants'
                ? 'bg-[#b4befe] font-semibold text-[#11111b]'
                : 'text-[#a6adc8] hover:text-white'
            }`}
          >
            Variant Count
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#313244" horizontal={false} />
            <XAxis 
              type="number" 
              stroke="#a6adc8" 
              fontSize={11}
              tickFormatter={(v) => {
                if (metric === 'sales') return `${v}M`;
                if (metric === 'power') return `${v} hp`;
                return `${v}`;
              }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#cdd6f4" 
              fontSize={11}
              tickLine={false}
              width={110}
            />
            <Tooltip
              formatter={(value: any, name: any, item: any) => {
                if (metric === 'sales') return [`${Number(value).toFixed(2)}M units (${item.payload.sales.toLocaleString()})`, 'Total Volume'];
                if (metric === 'power') return [`${value} hp average`, 'Peak Power Average'];
                return [`${value} documented engines/trims`, 'Powertrain Variants'];
              }}
              contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
            />
            <Bar 
              dataKey={metric === 'sales' ? 'salesMillions' : metric === 'power' ? 'avgPower' : 'variants'} 
              radius={[0, 6, 6, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
