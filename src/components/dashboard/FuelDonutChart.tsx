import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { BmwSpecs, EnrichedGeneration } from '../../types/bmw';
import { PieChart as PieIcon } from 'lucide-react';
import { ChartSkeleton } from '../common/ChartSkeleton';

interface FuelDonutChartProps {
  allSpecs: BmwSpecs[];
  generations: EnrichedGeneration[];
  loading?: boolean;
}

export const FuelDonutChart: React.FC<FuelDonutChartProps> = ({ allSpecs, generations, loading }) => {
  const [viewMode, setViewMode] = useState<'fuel' | 'engine' | 'body'>('fuel');

  if (loading) {
    return <ChartSkeleton heightClass="h-[380px]" />;
  }

  // 1. Fuel breakdown
  const fuelMap = new Map<string, number>();
  for (const s of allSpecs) {
    fuelMap.set(s.fuel_type, (fuelMap.get(s.fuel_type) || 0) + 1);
  }

  // 2. Engine layout breakdown
  const engineMap = new Map<string, number>();
  for (const s of allSpecs) {
    const layout = s.engine_type || 'Other';
    engineMap.set(layout, (engineMap.get(layout) || 0) + 1);
  }

  // 3. Body style breakdown
  const bodyMap = new Map<string, number>();
  for (const g of generations) {
    let b = g.vehicle_type;
    if (b.includes('SUV')) b = 'SAV / SAC (SUV)';
    else if (b.includes('Sedan') || b.includes('Saloon')) b = 'Sedan / Saloon';
    else if (b.includes('Coupe')) b = 'Coupe / GT';
    else if (b.includes('Roadster') || b.includes('Convertible')) b = 'Roadster / Cabrio';
    else if (b.includes('Hatchback') || b.includes('Microcar')) b = 'Hatchback / Microcar';
    bodyMap.set(b, (bodyMap.get(b) || 0) + 1);
  }

  const activeDataMap = viewMode === 'fuel' ? fuelMap : viewMode === 'engine' ? engineMap : bodyMap;
  const totalCount = Array.from(activeDataMap.values()).reduce((a, b) => a + b, 0);

  const chartData = Array.from(activeDataMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalCount) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value);

  const DONUT_COLORS = [
    '#94e2d5', // Teal
    '#b4befe', // Lavender
    '#89b4fa', // Blue
    '#a6e3a1', // Green
    '#f9e2af', // Yellow
    '#f38ba8', // Pink
    '#cba6f7', // Purple
    '#fab387', // Peach
    '#74c7ec'  // Sky
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#313244] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#94e2d5]/15 text-[#94e2d5]">
              <PieIcon className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Powertrain & Architecture Distribution
            </h3>
          </div>
          <p className="text-xs text-[#a6adc8] mt-0.5">
            Circular / Donut graph showing distribution of powertrains & layouts
          </p>
        </div>

        {/* Dimension Toggle */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#181825] p-1 border border-[#313244] text-xs">
          <button
            onClick={() => setViewMode('fuel')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              viewMode === 'fuel'
                ? 'bg-[#94e2d5] font-semibold text-[#11111b]'
                : 'text-[#a6adc8] hover:text-white'
            }`}
          >
            Fuel Types
          </button>
          <button
            onClick={() => setViewMode('engine')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              viewMode === 'engine'
                ? 'bg-[#94e2d5] font-semibold text-[#11111b]'
                : 'text-[#a6adc8] hover:text-white'
            }`}
          >
            Engine Layouts
          </button>
          <button
            onClick={() => setViewMode('body')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              viewMode === 'body'
                ? 'bg-[#94e2d5] font-semibold text-[#11111b]'
                : 'text-[#a6adc8] hover:text-white'
            }`}
          >
            Body Styles
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 h-72">
        <div className="relative h-full w-full md:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any, item: any) => [
                  `${value} items (${item.payload.percentage}%)`,
                  item.payload.name
                ]}
                contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Central Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-white font-['Outfit']">{totalCount}</span>
            <span className="text-[10px] uppercase font-bold text-[#a6adc8] tracking-wider">
              {viewMode === 'fuel' ? 'Variants' : viewMode === 'engine' ? 'Engines' : 'Generations'}
            </span>
          </div>
        </div>

        {/* Rich Legend List */}
        <div className="w-full md:w-1/2 flex flex-col gap-2 overflow-y-auto max-h-60 pr-2">
          {chartData.map((item, index) => (
            <div 
              key={item.name} 
              className="flex items-center justify-between rounded-lg bg-[#181825] px-3 py-1.5 border border-[#313244] text-xs hover:border-[#94e2d5]/30 transition-all"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="h-2.5 w-2.5 rounded-full" 
                  style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }} 
                />
                <span className="text-white font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[#a6adc8]">{item.value}</span>
                <span className="font-semibold text-[#94e2d5] w-12 text-right">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
