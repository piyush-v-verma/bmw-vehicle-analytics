import React, { useState, useEffect, useRef } from 'react';
import { EnrichedGeneration, BmwSpecs } from '../../types/bmw';
import { 
  X, 
  Flame, 
  Gauge, 
  Layers, 
  TrendingUp, 
  ExternalLink, 
  AlertTriangle,
  FileText,
  BatteryCharging,
  Maximize2,
  Share2,
  Check,
  ShieldCheck
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
  const [copiedLink, setCopiedLink] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Sync selected variant when model changes
  useEffect(() => {
    setSelectedVariantId(model.primaryVariant.variant_id);
    setImgLoaded(false);
    setCopiedLink(false);
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

  const handleShare = () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}?model=${model.generation_id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const renderUnavailable = (customText = 'Spec unavailable') => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-sans italic text-[#a6adc8]/60 bg-white/5 border border-white/5">
      {customText}
    </span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        ref={bodyRef}
        className="relative w-full max-w-4xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-3xl glass-card border border-[#313244] shadow-2xl bg-[#181825]/95 p-0 text-left scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient blurred vehicle background layer */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-10"
          aria-hidden="true"
        >
          <img
            src={model.imageUrl}
            alt=""
            className="h-full w-full object-cover filter blur-3xl scale-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#181825]/30 via-[#181825]/85 to-[#181825]" />
        </div>

        {/* Sticky Top Navigation Bar (Pins Compare, Share, and Close actions at top) */}
        <div className="sticky top-0 z-40 w-full flex items-center justify-between p-4 pointer-events-none bg-gradient-to-b from-[#181825] to-[#181825]/0">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => onCompare(model)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-lg hover:scale-105 ${
                isCompared
                  ? 'bg-[#b4befe] text-[#11111b] shadow-glow-accent'
                  : 'bg-black/60 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md'
              }`}
            >
              {isCompared ? 'In Compare List' : '+ Add to Compare'}
            </button>

            {/* Direct Deep Link Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all shadow-lg hover:scale-105"
              title="Copy shareable URL link to this BMW model"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#a6e3a1]" />
                  <span className="text-[#a6e3a1]">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-[#b4befe]" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

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
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#b4befe]/20 px-2 py-0.5 font-mono text-xs font-bold text-[#b4befe] border border-[#b4befe]/30">
                  {model.generation_id}
                </span>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-[#a6adc8]">
                  {model.era}
                </span>
                <span className="rounded-md bg-[#a6e3a1]/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#a6e3a1] border border-[#a6e3a1]/30">
                  ✓ Verified 3/4 Front Exterior
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

        {/* Modal Body Content */}
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
                    {v.variant_id.replace(/_/g, ' ')} ({v.horsepower_hp && v.horsepower_hp > 0 ? `${v.horsepower_hp} hp` : 'Spec unavail.'})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications Datasheet with explicit indicators & provenance */}
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
                <div className="flex items-center justify-between text-xs font-bold text-[#b4befe] mb-3 pb-2 border-b border-[#313244]">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    <span>Engine & Powertrain</span>
                  </div>
                  <span title="Homologated Specification">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#a6e3a1]" />
                  </span>
                </div>
                <div className="space-y-2.5 text-xs flex-1">
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Engine Code</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.engine && currentVariant.engine !== 'N/A' ? currentVariant.engine : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Engine Layout</span>
                    <span className="text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.engine_type && currentVariant.engine_type !== 'Other' ? currentVariant.engine_type : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Fuel Type</span>
                    <span className="text-[#94e2d5] text-xs font-bold text-right break-words max-w-[65%]">{currentVariant.fuel_type}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Displacement</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.displacement_cc ? `${currentVariant.displacement_cc} cc` : currentVariant.fuel_type === 'Electric' ? <span className="text-[10px] text-[#94e2d5]">N/A (Pure Electric)</span> : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Cylinders</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.cylinders !== null && currentVariant.cylinders !== undefined ? currentVariant.cylinders : currentVariant.fuel_type === 'Electric' ? <span className="text-[10px] text-[#94e2d5]">N/A (Electric Motor)</span> : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Transmission</span>
                    <span className="text-white text-xs font-medium text-right break-words max-w-[65%]">
                      {currentVariant.transmission && currentVariant.transmission !== 'N/A' ? currentVariant.transmission : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 last:border-b-0">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Drivetrain</span>
                    <span className="text-[#89b4fa] text-xs font-bold text-right break-words max-w-[65%]">{currentVariant.drivetrain}</span>
                  </div>
                </div>
              </div>

              {/* 2. Performance */}
              <div className="rounded-2xl bg-[#11111b] p-5 border border-[#313244] flex flex-col">
                <div className="flex items-center justify-between text-xs font-bold text-[#f38ba8] mb-3 pb-2 border-b border-[#313244]">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    <span>Performance Metrics</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#a6adc8]">Verified</span>
                </div>
                <div className="space-y-2.5 text-xs flex-1">
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Horsepower</span>
                    <span className="font-mono text-[#f38ba8] text-xs font-extrabold text-right break-words max-w-[65%]">
                      {currentVariant.horsepower_hp && currentVariant.horsepower_hp > 0 ? `${currentVariant.horsepower_hp} hp` : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Peak Torque</span>
                    <span className="font-mono text-[#f9e2af] text-xs font-extrabold text-right break-words max-w-[65%]">
                      {currentVariant.torque_nm && currentVariant.torque_nm > 0 ? `${currentVariant.torque_nm} Nm` : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Top Speed</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.top_speed_kmh && currentVariant.top_speed_kmh > 0 ? `${currentVariant.top_speed_kmh} km/h` : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 last:border-b-0">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">0–100 km/h</span>
                    <span className="font-mono text-[#89b4fa] text-xs font-extrabold text-right break-words max-w-[65%]">
                      {currentVariant.acceleration_0_100_s ? `${currentVariant.acceleration_0_100_s} s` : renderUnavailable()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Dimensions & Weight */}
              <div className="rounded-2xl bg-[#11111b] p-5 border border-[#313244] flex flex-col">
                <div className="flex items-center justify-between text-xs font-bold text-[#94e2d5] mb-3 pb-2 border-b border-[#313244]">
                  <div className="flex items-center gap-2">
                    <Maximize2 className="h-4 w-4" />
                    <span>Dimensions & Mass</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#a6adc8]">DIN Standard</span>
                </div>
                <div className="space-y-2.5 text-xs flex-1">
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Kerb Weight</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.weight_kg && currentVariant.weight_kg > 0 ? `${currentVariant.weight_kg} kg` : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Length</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.length_mm && currentVariant.length_mm > 0 ? `${currentVariant.length_mm} mm` : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Width</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.width_mm && currentVariant.width_mm > 0 ? `${currentVariant.width_mm} mm` : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Height</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.height_mm && currentVariant.height_mm > 0 ? `${currentVariant.height_mm} mm` : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 last:border-b-0">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Wheelbase</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.wheelbase_mm && currentVariant.wheelbase_mm > 0 ? `${currentVariant.wheelbase_mm} mm` : renderUnavailable()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Efficiency & Battery */}
              <div className="rounded-2xl bg-[#11111b] p-5 border border-[#313244] flex flex-col">
                <div className="flex items-center justify-between text-xs font-bold text-[#a6e3a1] mb-3 pb-2 border-b border-[#313244]">
                  <div className="flex items-center gap-2">
                    <BatteryCharging className="h-4 w-4" />
                    <span>Efficiency & Electric</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#a6adc8]">WLTP / NEDC</span>
                </div>
                <div className="space-y-2.5 text-xs flex-1">
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Fuel Economy</span>
                    <span className="font-mono text-white text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.fuel_consumption ? `${currentVariant.fuel_consumption} L/100km` : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 border-b border-[#313244]/20">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Battery</span>
                    <span className="font-mono text-[#a6e3a1] text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.battery_kwh ? `${currentVariant.battery_kwh} kWh` : renderUnavailable()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 py-1 last:border-b-0">
                    <span className="text-[#a6adc8] text-[11px] uppercase tracking-wider font-semibold">Electric Range</span>
                    <span className="font-mono text-[#94e2d5] text-xs font-bold text-right break-words max-w-[65%]">
                      {currentVariant.electric_range_km ? `${currentVariant.electric_range_km} km` : renderUnavailable()}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 border-b border-[#313244] pb-2.5 gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#89b4fa]" />
                  <h4 className="text-sm font-bold text-white font-['Outfit']">
                    Generation Deliveries Timeline ({model.production_start}{model.production_end ? `–${model.production_end}` : '–pres.'})
                  </h4>
                </div>
                <div className="text-xs text-[#a6adc8]">
                  Total Lifecycle Volume: <strong className="text-white font-mono">{model.totalSales.toLocaleString()} units</strong>
                  {model.hasPartialSalesData && (
                    <span className="ml-2 text-[10px] text-[#f9e2af] font-medium">(includes 2024 partial YTD)</span>
                  )}
                </div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={model.yearlySales} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="genGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#89b4fa" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#89b4fa" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#313244" vertical={false} />
                    <XAxis dataKey="year" stroke="#a6adc8" fontSize={11} tickLine={false} />
                    <YAxis 
                      width={55}
                      stroke="#a6adc8" 
                      fontSize={11} 
                      tickFormatter={(v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : `${(v/1_000).toFixed(0)}k`} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      formatter={(v: any, name: any, item: any) => {
                        const valNum = Number(v || 0);
                        const inMillions = valNum >= 100_000 ? ` (${(valNum / 1_000_000).toFixed(2)}M)` : '';
                        const isComp = item?.payload?.isCompleteYear;
                        const cov = item?.payload?.coverageLabel || (isComp ? 'Audited Annual' : 'Partial');
                        return [`${valNum.toLocaleString()} units${inMillions} • ${cov}`, 'Deliveries'];
                      }}
                      labelFormatter={(label) => `Year ${label}`}
                      contentStyle={{ backgroundColor: '#181825', borderColor: '#313244', borderRadius: '10px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="units" 
                      stroke="#89b4fa" 
                      strokeWidth={2} 
                      fill="url(#genGradient)" 
                      dot={{ r: 4, fill: '#89b4fa', stroke: '#11111b', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#b4befe', stroke: '#11111b', strokeWidth: 2 }}
                    />
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
            <div className="flex items-center justify-between font-bold text-[#cdd6f4] mb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#94e2d5]" />
                <span>Provenance & Source Citations</span>
              </div>
              <span className="text-[10px] text-[#a6e3a1] font-mono">High Confidence</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {model.sources.history.concat(model.sources.specs).slice(0, 3).map((s, idx) => (
                <a
                  key={idx}
                  href={s.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-[#181825] px-2.5 py-1 text-[#b4befe] hover:underline border border-[#313244]"
                >
                  <ShieldCheck className="h-3 w-3 text-[#a6e3a1]" />
                  <span>{s.source_name}</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};