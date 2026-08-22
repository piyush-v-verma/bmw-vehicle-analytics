import React, { useState } from 'react';
import { EnrichedGeneration, BmwSpecs } from '../../types/bmw';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts';
import { GitCompare, X, Plus, Trophy, Flame, Gauge, Zap, Weight, Fuel, ExternalLink } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';
import { ChartSkeleton } from '../common/ChartSkeleton';
import { TableSkeleton } from '../common/TableSkeleton';

interface ModelComparisonViewProps {
  generations: EnrichedGeneration[];
  comparedModels: EnrichedGeneration[];
  onRemoveFromCompare: (model: EnrichedGeneration) => void;
  onAddCompare: (model: EnrichedGeneration) => void;
  onSelectModel: (model: EnrichedGeneration) => void;
  loading?: boolean;
}

export const ModelComparisonView: React.FC<ModelComparisonViewProps> = ({
  generations,
  comparedModels,
  onRemoveFromCompare,
  onAddCompare,
  onSelectModel,
  loading
}) => {
  const [selectedToAddGid, setSelectedToAddGid] = useState<string>('');

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header/Selectors Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 h-36 border border-[#313244] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-6 !rounded-full" />
              </div>
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
        
        {/* Table/Radar Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ChartSkeleton heightClass="h-[450px]" />
          </div>
          <div className="lg:col-span-2">
            <TableSkeleton rows={8} cols={4} />
          </div>
        </div>
      </div>
    );
  }

  const activeCompared = comparedModels;

  // Normalize metrics for Radar Chart (0 to 100 scale)
  const maxPower = Math.max(...generations.map(g => g.primaryVariant.horsepower_hp), 750);
  const maxTorque = Math.max(...generations.map(g => g.primaryVariant.torque_nm), 1000);
  const maxSpeed = Math.max(...generations.map(g => g.primaryVariant.top_speed_kmh), 320);

  const radarData = [
    {
      subject: 'Horsepower',
      ...Object.fromEntries(
        activeCompared.map((c, i) => [
          `car_${i}`,
          Math.round(((c.primaryVariant.horsepower_hp || 0) / maxPower) * 100)
        ])
      )
    },
    {
      subject: 'Torque',
      ...Object.fromEntries(
        activeCompared.map((c, i) => [
          `car_${i}`,
          Math.round(((c.primaryVariant.torque_nm || 0) / maxTorque) * 100)
        ])
      )
    },
    {
      subject: 'Top Speed',
      ...Object.fromEntries(
        activeCompared.map((c, i) => [
          `car_${i}`,
          Math.round(((c.primaryVariant.top_speed_kmh || 0) / maxSpeed) * 100)
        ])
      )
    },
    {
      subject: '0-100 Quickness',
      ...Object.fromEntries(
        activeCompared.map((c, i) => {
          const acc = c.primaryVariant.acceleration_0_100_s || 12;
          // Invert: 3.0s -> 100, 15.0s -> 10
          const score = Math.max(10, Math.round((1 - (acc - 2.5) / 12) * 100));
          return [`car_${i}`, score];
        })
      )
    },
    {
      subject: 'Weight Efficiency',
      ...Object.fromEntries(
        activeCompared.map((c, i) => {
          const w = c.primaryVariant.weight_kg || 1800;
          // Lighter is better
          const score = Math.max(10, Math.round((1 - (w - 700) / 1800) * 100));
          return [`car_${i}`, score];
        })
      )
    }
  ];

  const RADAR_COLORS = ['#b4befe', '#94e2d5', '#f38ba8', '#f9e2af'];

  // Best values for highlights
  const highestHp = Math.max(...activeCompared.map(c => c.primaryVariant.horsepower_hp));
  const fastestAcc = Math.min(...activeCompared.map(c => c.primaryVariant.acceleration_0_100_s || 99));
  const lightestWeight = Math.min(...activeCompared.map(c => c.primaryVariant.weight_kg || 9999));
  const highestSales = Math.max(...activeCompared.map(c => c.totalSales));

  return (
    <div className="space-y-6">
      {/* Top Banner & Car Selector */}
      <div className="glass-card rounded-2xl p-5 border border-[#313244]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#313244] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-[#b4befe]" />
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Side-by-Side Model & Variant Comparator
              </h3>
            </div>
            <p className="text-xs text-[#a6adc8] mt-0.5">
              Compare engineering specs, power-to-weight, and commercial milestones across up to 4 BMW generations
            </p>
          </div>

          {/* Add Car Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedToAddGid}
              onChange={(e) => setSelectedToAddGid(e.target.value)}
              className="rounded-xl glass-input py-2 px-3 text-xs text-white"
            >
              <option value="">+ Select a BMW Model to Add...</option>
              {generations
                .filter(g => !activeCompared.some(c => c.generation_id === g.generation_id))
                .map(g => (
                  <option key={g.generation_id} value={g.generation_id}>
                    {g.model_name} ({g.generation_id.replace('BMW_', '')})
                  </option>
                ))}
            </select>

            <button
              onClick={() => {
                if (selectedToAddGid) {
                  const target = generations.find(g => g.generation_id === selectedToAddGid);
                  if (target) {
                    onAddCompare(target);
                    setSelectedToAddGid('');
                  }
                }
              }}
              disabled={!selectedToAddGid || activeCompared.length >= 4}
              className="flex items-center gap-1 rounded-xl bg-[#b4befe] px-3.5 py-2 text-xs font-bold text-[#11111b] disabled:opacity-40 hover:bg-[#cba6f7] transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Selected Compared Cars Cards */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activeCompared.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-[#a6adc8] border border-dashed border-[#313244] rounded-2xl bg-[#11111b]/30">
              <GitCompare className="h-8 w-8 text-[#a6adc8]/40 mx-auto mb-2.5" />
              No models selected for comparison. Use the dropdown above or click "+ Compare" on a model card to add models.
            </div>
          ) : (
            activeCompared.map((car, idx) => (
              <div
                key={car.generation_id}
                className="relative rounded-2xl bg-[#11111b] p-3.5 border border-[#313244] flex flex-col justify-between"
                style={{ borderTopColor: RADAR_COLORS[idx % RADAR_COLORS.length], borderTopWidth: '3px' }}
              >
                <button
                  onClick={() => onRemoveFromCompare(car)}
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[#a6adc8] hover:text-white hover:bg-white/20 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <div>
                  <div className="h-28 w-full rounded-xl overflow-hidden bg-black/50 mb-2 border border-white/5">
                    <img src={car.imageUrl} alt={car.model_name} className="h-full w-full object-cover" />
                  </div>
                  <h4 className="text-sm font-bold text-white truncate font-['Outfit']">{car.model_name}</h4>
                  <p className="text-[11px] text-[#a6adc8] font-mono">{car.generation_id.replace('BMW_', '')} ({car.production_start}{car.production_end ? `–${car.production_end}` : '–pres.'})</p>
                </div>

                <div className="mt-3 border-t border-[#313244] pt-2 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold" style={{ color: RADAR_COLORS[idx % RADAR_COLORS.length] }}>
                    {car.primaryVariant.horsepower_hp} hp
                  </span>
                  <button
                    onClick={() => onSelectModel(car)}
                    className="flex items-center gap-1 text-[11px] text-[#b4befe] hover:underline"
                  >
                    Specs <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {activeCompared.length > 0 && (
        <>
          {/* Radar Chart Overlay */}
          <div className="glass-card rounded-2xl p-5 border border-[#313244]">
            <div className="flex items-center justify-between border-b border-[#313244] pb-3 mb-4">
              <h4 className="text-sm font-bold text-white font-['Outfit']">
                Multi-Attribute Performance & Agility Radar
              </h4>
              <span className="text-xs text-[#94e2d5] font-mono">Radar Graph</span>
            </div>

            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#313244" />
                  <PolarAngleAxis dataKey="subject" stroke="#cdd6f4" fontSize={11} />
                  <PolarRadiusAxis stroke="#a6adc8" fontSize={9} angle={30} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
                  />
                  {activeCompared.map((car, idx) => (
                    <Radar
                      key={car.generation_id}
                      name={car.model_name}
                      dataKey={`car_${idx}`}
                      stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                      fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                      fillOpacity={0.25}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side-by-Side Spec Comparison Table */}
          <div className="glass-card rounded-2xl p-5 border border-[#313244] overflow-x-auto">
            <div className="flex items-center justify-between border-b border-[#313244] pb-3 mb-4">
              <h4 className="text-sm font-bold text-white font-['Outfit']">
                Comprehensive Technical Differentials
              </h4>
              <span className="text-xs text-[#a6adc8]">Color-coded pinnacle values</span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#313244] text-[#a6adc8]">
                  <th className="py-2.5 px-3 font-semibold">Technical Attribute</th>
                  {activeCompared.map((c, i) => (
                    <th key={c.generation_id} className="py-2.5 px-3 font-bold text-white font-mono">
                      {c.generation_id.replace('BMW_', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#313244]/60 font-mono">
                {/* Horsepower */}
                <tr>
                  <td className="py-2.5 px-3 text-[#a6adc8] font-sans font-medium">Horsepower</td>
                  {activeCompared.map((c) => {
                    const isWinner = c.primaryVariant.horsepower_hp === highestHp;
                    return (
                      <td key={c.generation_id} className={`py-2.5 px-3 ${isWinner ? 'text-[#f38ba8] font-black' : 'text-white'}`}>
                        {c.primaryVariant.horsepower_hp} hp {isWinner && '🏆'}
                      </td>
                    );
                  })}
                </tr>

                {/* 0-100 Acceleration */}
                <tr>
                  <td className="py-2.5 px-3 text-[#a6adc8] font-sans font-medium">0–100 km/h</td>
                  {activeCompared.map((c) => {
                    const acc = c.primaryVariant.acceleration_0_100_s;
                    const isWinner = acc === fastestAcc;
                    return (
                      <td key={c.generation_id} className={`py-2.5 px-3 ${isWinner ? 'text-[#89b4fa] font-black' : 'text-white'}`}>
                        {acc ? `${acc} s` : 'N/A'} {isWinner && '⚡'}
                      </td>
                    );
                  })}
                </tr>

                {/* Top Speed */}
                <tr>
                  <td className="py-2.5 px-3 text-[#a6adc8] font-sans font-medium">Top Speed</td>
                  {activeCompared.map((c) => (
                    <td key={c.generation_id} className="py-2.5 px-3 text-white">
                      {c.primaryVariant.top_speed_kmh} km/h
                    </td>
                  ))}
                </tr>

                {/* Torque */}
                <tr>
                  <td className="py-2.5 px-3 text-[#a6adc8] font-sans font-medium">Peak Torque</td>
                  {activeCompared.map((c) => (
                    <td key={c.generation_id} className="py-2.5 px-3 text-white">
                      {c.primaryVariant.torque_nm} Nm
                    </td>
                  ))}
                </tr>

                {/* Kerb Weight */}
                <tr>
                  <td className="py-2.5 px-3 text-[#a6adc8] font-sans font-medium">Kerb Weight</td>
                  {activeCompared.map((c) => {
                    const isWinner = c.primaryVariant.weight_kg === lightestWeight;
                    return (
                      <td key={c.generation_id} className={`py-2.5 px-3 ${isWinner ? 'text-[#a6e3a1] font-black' : 'text-white'}`}>
                        {c.primaryVariant.weight_kg} kg {isWinner && '🪶'}
                      </td>
                    );
                  })}
                </tr>

                {/* Engine & Layout */}
                <tr>
                  <td className="py-2.5 px-3 text-[#a6adc8] font-sans font-medium">Engine & Layout</td>
                  {activeCompared.map((c) => (
                    <td key={c.generation_id} className="py-2.5 px-3 text-white">
                      {c.primaryVariant.engine} ({c.primaryVariant.engine_type})
                    </td>
                  ))}
                </tr>

                {/* Drivetrain */}
                <tr>
                  <td className="py-2.5 px-3 text-[#a6adc8] font-sans font-medium">Drivetrain</td>
                  {activeCompared.map((c) => (
                    <td key={c.generation_id} className="py-2.5 px-3 text-white">
                      {c.primaryVariant.drivetrain}
                    </td>
                  ))}
                </tr>

                {/* Lifetime Sales */}
                <tr>
                  <td className="py-2.5 px-3 text-[#a6adc8] font-sans font-medium">Lifetime Sales</td>
                  {activeCompared.map((c) => {
                    const isWinner = c.totalSales === highestSales && c.totalSales > 0;
                    return (
                      <td key={c.generation_id} className={`py-2.5 px-3 ${isWinner ? 'text-[#f9e2af] font-black' : 'text-white'}`}>
                        {c.totalSales >= 1_000_000 ? `${(c.totalSales / 1_000_000).toFixed(2)}M units` : c.totalSales.toLocaleString()} {isWinner && '👑'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
