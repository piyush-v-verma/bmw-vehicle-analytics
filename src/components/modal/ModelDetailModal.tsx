import React, { useState, useEffect, useRef } from 'react';
import { EnrichedGeneration, BmwSpecs } from '../../types/bmw';
import { 
  X, 
  Flame, 
  Gauge, 
  Zap, 
  Weight, 
  Fuel, 
  Layers, 
  Calendar, 
  TrendingUp, 
  ExternalLink, 
  AlertTriangle,
  FileText,
  BatteryCharging,
  Maximize2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

import { Skeleton } from '../common/Skeleton';
import { ChartSkeleton } from '../common/ChartSkeleton';

interface ModelDetailModalProps {
  model: EnrichedGeneration | null;
  onClose: () => void;
  onCompare: (model: EnrichedGeneration) => void;
  isCompared: boolean;
  specsLoading?: boolean;
  salesLoading?: boolean;
}

export const ModelDetailModal: React.FC<ModelDetailModalProps> = ({
  model,
  onClose,
  onCompare,
  isCompared,
  specsLoading,
  salesLoading
}) => {
  if (!model) return null;

  // Selected variant state
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    model.primaryVariant.variant_id
  );

  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Sync selected variant when model changes
  useEffect(() => {
    setSelectedVariantId(model.primaryVariant.variant_id);
    setImgLoaded(false);
  }, [model.generation_id]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImgLoaded(true);
    }
  }, [model.imageUrl]);

  // Reset scroll position to top when model changes
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [model.generation_id]);

  const currentVariant: BmwSpecs =
    model.variants.find((v) => v.variant_id === selectedVariantId) ||
    model.primaryVariant;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        ref={bodyRef}
        className="relative w-full max-w-4xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-3xl glass-card border border-[#313244] shadow-2xl bg-[#181825]/95 p-0 text-left scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Navigation Bar (Pins Compare and Close actions at top) */}
        <div className="sticky top-0 z-40 w-full flex items-center justify-between p-4 pointer-events-none bg-gradient-to-b from-[#181825] to-[#181825]/0">
          <button
            onClick={() => onCompare(model)}
            className={`pointer-events-auto rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-lg hover:scale-105 ${
              isCompared
                ? 'bg-[#b4befe] text-[#11111b] shadow-glow-accent'
                : 'bg-black/60 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md'
            }`}
          >
            {isCompared ? 'In Compare List' : '+ Add to Compare'}
          </button>

          <button
            onClick={onClose}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 hover:bg-white/30 transition-all shadow-lg hover:scale-105"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top Hero Banner with Vehicle Image (Scrolls naturally) */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#181825] -mt-[68px]">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-[#313244]/50 animate-pulse flex items-center justify-center text-xs text-[#a6adc8] font-mono">
              Loading Image...
            </div>
          )}
          <img
            ref={imgRef}
            src={model.imageUrl}
            alt={model.model_name}
            className={`h-full w-full object-cover object-center transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              setImgLoaded(true);
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80';
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181825]/95 via-[#181825]/50 to-black/60" />

          {/* Hero Meta Information */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#b4befe]/20 px-2 py-0.5 font-mono text-xs font-bold text-[#b4befe] border border-[#b4befe]/30">
                  {model.generation_id}
                </span>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-[#a6adc8]">
                  {model.era}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mt-1">
                {model.model_name}
              </h2>
              <p className="text-xs sm:text-sm text-[#a6adc8]">
                {model.vehicle_type} • Production: {model.production_start}{model.production_end ? `–${model.production_end}` : '–Present'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body Content (Scrolls as part of card container) */}
        <div className="p-6 space-y-6 pb-16">
          {/* Variant Switcher Tabs (if multiple trims exist) */}
          {specsLoading ? (
            <div className="rounded-2xl bg-[#11111b] p-3 border border-[#313244] space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20 !rounded-xl" />
                <Skeleton className="h-7 w-24 !rounded-xl" />
              </div>
            </div>
          ) : model.variants.length > 1 && (
            <div className="rounded-2xl bg-[#11111b] p-3 border border-[#313244]">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#a6adc8]">
                <Layers className="h-3.5 w-3.5 text-[#94e2d5]" />
                <span>Select Powertrain / Trim Variant ({model.variants.length} Available):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {model.variants.map((v) => (
                  <button
                    key={v.variant_id}
                    onClick={() => setSelectedVariantId(v.variant_id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedVariantId === v.variant_id
                        ? 'bg-[#b4befe] text-[#11111b] font-bold shadow-sm'
                        : 'bg-[#181825] text-[#a6adc8] hover:text-white border border-[#313244]'
                    }`}
                  >
                    {v.variant_id.replace(/_/g, ' ')} ({v.horsepower_hp} hp)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Complete Specifications Datasheet */}
          {specsLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="rounded-2xl bg-[#11111b] p-4 border border-[#313244] space-y-3 flex flex-col">
                  <div className="flex items-center gap-2 border-b border-[#313244] pb-2">
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3.5 w-1/2" />
                    <Skeleton className="h-3.5 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {/* 1. Powertrain & Engine */}
              <div className="rounded-2xl bg-[#11111b] p-5 border border-[#313244] flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold text-[#b4befe] mb-3 pb-2 border-b border-[#313244]">
                  <Flame className="h-4 w-4" />
                  <span>Engine & Powertrain</span>
                </div>
                <div className="space-y-2.5 text-xs flex-1">
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Engine Code</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">{currentVariant.engine}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Engine Layout</span>
                    <span className="text-white text-xs font-bold text-right break-words max-w-[65%]">{currentVariant.engine_type}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Fuel Type</span>
                    <span className="text-[#94e2d5] text-xs font-bold text-right break-words max-w-[65%]">{currentVariant.fuel_type}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Displacement</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.displacement_cc ? `${currentVariant.displacement_cc} cc` : 'N/A (EV)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Cylinders</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">{currentVariant.cylinders ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Transmission</span>
                    <span className="text-white text-xs font-medium text-right break-words max-w-[65%]">{currentVariant.transmission}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 last:border-b-0">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Drivetrain</span>
                    <span className="text-[#89b4fa] text-xs font-bold text-right break-words max-w-[65%]">{currentVariant.drivetrain}</span>
                  </div>
                </div>
              </div>

              {/* 2. Performance */}
              <div className="rounded-2xl bg-[#11111b] p-5 border border-[#313244] flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f38ba8] mb-3 pb-2 border-b border-[#313244]">
                  <Gauge className="h-4 w-4" />
                  <span>Performance Metrics</span>
                </div>
                <div className="space-y-2.5 text-xs flex-1">
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Horsepower</span>
                    <span className="font-mono text-[#f38ba8] text-xs font-extrabold text-right break-words max-w-[65%]">
                      {currentVariant.horsepower_hp ? `${currentVariant.horsepower_hp} hp` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Peak Torque</span>
                    <span className="font-mono text-[#f9e2af] text-xs font-extrabold text-right break-words max-w-[65%]">
                      {currentVariant.torque_nm ? `${currentVariant.torque_nm} Nm` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Top Speed</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.top_speed_kmh ? `${currentVariant.top_speed_kmh} km/h` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 last:border-b-0">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">0–100 km/h</span>
                    <span className="font-mono text-[#89b4fa] text-xs font-extrabold text-right break-words max-w-[65%]">
                      {currentVariant.acceleration_0_100_s ? `${currentVariant.acceleration_0_100_s} s` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Dimensions & Weight */}
              <div className="rounded-2xl bg-[#11111b] p-5 border border-[#313244] flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold text-[#94e2d5] mb-3 pb-2 border-b border-[#313244]">
                  <Maximize2 className="h-4 w-4" />
                  <span>Dimensions & Mass</span>
                </div>
                <div className="space-y-2.5 text-xs flex-1">
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Kerb Weight</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.weight_kg ? `${currentVariant.weight_kg} kg` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Length</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.length_mm ? `${currentVariant.length_mm} mm` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Width</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.width_mm ? `${currentVariant.width_mm} mm` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Height</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.height_mm ? `${currentVariant.height_mm} mm` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 last:border-b-0">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Wheelbase</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.wheelbase_mm ? `${currentVariant.wheelbase_mm} mm` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Efficiency & Battery */}
              <div className="rounded-2xl bg-[#11111b] p-5 border border-[#313244] flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold text-[#a6e3a1] mb-3 pb-2 border-b border-[#313244]">
                  <BatteryCharging className="h-4 w-4" />
                  <span>Efficiency & Electric</span>
                </div>
                <div className="space-y-2.5 text-xs flex-1">
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Fuel Economy</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.fuel_consumption ? `${currentVariant.fuel_consumption} L/100km` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Battery</span>
                    <span className="font-mono text-[#a6e3a1] text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.battery_kwh ? `${currentVariant.battery_kwh} kWh` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 last:border-b-0">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Electric Range</span>
                    <span className="font-mono text-[#94e2d5] text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.electric_range_km ? `${currentVariant.electric_range_km} km` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales History for this generation (if sales records exist) */}
          {salesLoading ? (
            <div className="rounded-2xl bg-[#11111b] p-5 border border-[#313244] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#313244]">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <ChartSkeleton heightClass="h-48" />
            </div>
          ) : model.yearlySales.length > 0 && (
            <div className="rounded-2xl bg-[#11111b] p-5 border border-[#313244]">
              <div className="flex items-center justify-between mb-3 border-b border-[#313244] pb-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#89b4fa]" />
                  <h4 className="text-sm font-bold text-white font-['Outfit']">
                    Generation Deliveries Timeline ({model.production_start}{model.production_end ? `–${model.production_end}` : '–pres.'})
                  </h4>
                </div>
                <div className="text-xs text-[#a6adc8]">
                  Total Lifecycle Volume: <strong className="text-white font-mono">{model.totalSales.toLocaleString()} units</strong>
                </div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={model.yearlySales}>
                    <defs>
                      <linearGradient id="genGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#89b4fa" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#89b4fa" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#313244" vertical={false} />
                    <XAxis dataKey="year" stroke="#a6adc8" fontSize={11} />
                    <YAxis 
                      stroke="#a6adc8" 
                      fontSize={11} 
                      tickFormatter={(v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : `${(v/1_000).toFixed(0)}k`} 
                    />
                    <Tooltip 
                      formatter={(v: any) => [`${Number(v).toLocaleString()} units`, 'Deliveries']}
                      contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
                    />
                    <Area type="monotone" dataKey="units" stroke="#89b4fa" strokeWidth={2} fill="url(#genGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Documented Conflicts / Engineering Discrepancies */}
          {model.conflicts.length > 0 && (
            <div className="rounded-2xl bg-[#f9e2af]/10 p-4 border border-[#f9e2af]/30">
              <div className="flex items-center gap-2 text-xs font-bold text-[#f9e2af] mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Documented Engineering / Homologation Discrepancies</span>
              </div>
              <div className="space-y-2 text-xs">
                {model.conflicts.map((c, idx) => (
                  <div key={idx} className="rounded-xl bg-[#181825] p-3 border border-[#313244]">
                    <div className="font-semibold text-white">
                      Field: <span className="text-[#f9e2af]">{c.field_name}</span> | Selected: <span className="text-[#a6e3a1]">{c.selected_value}</span>
                    </div>
                    <p className="mt-1 text-[#a6adc8] text-[11px]">{c.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Provenance References */}
          <div className="rounded-2xl bg-[#11111b] p-4 border border-[#313244] text-xs">
            <div className="flex items-center gap-2 font-bold text-[#cdd6f4] mb-2">
              <FileText className="h-4 w-4 text-[#94e2d5]" />
              <span>Provenance & Source Citations</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {model.sources.history.slice(0, 2).map((s, idx) => (
                <a
                  key={idx}
                  href={s.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-[#181825] px-2.5 py-1 text-[#b4befe] hover:underline border border-[#313244]"
                >
                  <span>{s.source_name}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
