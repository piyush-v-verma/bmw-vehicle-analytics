import React, { useState, useEffect, useRef } from 'react';
import { EnrichedGeneration } from '../../types/bmw';
import { 
  Zap, 
  Flame, 
  Gauge, 
  Weight, 
  Layers, 
  GitCompare, 
  Calendar,
  Fuel,
  ExternalLink
} from 'lucide-react';

interface ModelCardProps {
  model: EnrichedGeneration;
  onSelect: (model: EnrichedGeneration) => void;
  isCompared: boolean;
  onToggleCompare: (model: EnrichedGeneration) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onSelect,
  isCompared,
  onToggleCompare
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const p = model.primaryVariant;

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImgLoaded(true);
    }
  }, [model.imageUrl]);

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-[#313244] hover:border-[#b4befe]/40 transition-all duration-300 group">
      {/* Top Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-[#181825] border-b border-[#313244]/50">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-[#313244]/50 animate-pulse flex items-center justify-center text-xs text-[#a6adc8] font-mono">
            Loading...
          </div>
        )}
        <img
          ref={imgRef}
          src={model.imageUrl}
          alt={`${model.model_name} ${model.generation_id}`}
          className={`h-full w-full object-cover group-hover:scale-105 transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            setImgLoaded(true);
            // High-res fallback
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#181825] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Status Badge */}
          {model.status === 'Active' ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[#a6e3a1]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#a6e3a1] backdrop-blur-md border border-[#a6e3a1]/30 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
              Active 2026
            </span>
          ) : (
            <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-[#a6adc8] backdrop-blur-md border border-white/10">
              Discontinued ({model.production_start}–{model.production_end})
            </span>
          )}

          {/* Compare Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(model);
            }}
            className={`pointer-events-auto flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium backdrop-blur-md transition-all ${
              isCompared
                ? 'bg-[#b4befe] text-[#11111b] font-bold shadow-glow-accent'
                : 'bg-black/60 text-[#a6adc8] hover:text-white border border-white/10 hover:border-white/30'
            }`}
          >
            <GitCompare className="h-3 w-3" />
            {isCompared ? 'Comparing' : 'Compare'}
          </button>
        </div>

        {/* Bottom Era & Body Style Tags */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px]">
          <span className="rounded bg-black/70 px-2 py-0.5 font-mono text-[#b4befe] border border-[#b4befe]/20 backdrop-blur-sm">
            {model.generation_id.replace('BMW_', '')}
          </span>
          <span className="text-[#cdd6f4] font-medium drop-shadow">
            {model.vehicle_type.split('/')[0]}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Title */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-[#b4befe] transition-colors font-['Outfit']">
                {model.model_name}
              </h3>
              <p className="text-xs text-[#a6adc8] font-mono mt-0.5">
                {p.variant_id.replace(/_/g, ' ')}
              </p>
            </div>
            {model.variants.length > 1 && (
              <span className="flex items-center gap-1 rounded-md bg-[#181825] px-2 py-0.5 text-[10px] font-semibold text-[#94e2d5] border border-[#313244]">
                <Layers className="h-2.5 w-2.5" />
                {model.variants.length} Trims
              </span>
            )}
          </div>

          {/* Quick Specs Grid */}
          <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
            {/* Horsepower */}
            <div className="flex items-center gap-2 rounded-xl bg-[#181825]/90 p-2 border border-[#313244]/60">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f38ba8]/15 text-[#f38ba8]">
                <Flame className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-[#a6adc8]">Power</div>
                <div className="font-mono font-bold text-white">
                  {p.horsepower_hp ? `${p.horsepower_hp} hp` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Acceleration 0-100 */}
            <div className="flex items-center gap-2 rounded-xl bg-[#181825]/90 p-2 border border-[#313244]/60">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#89b4fa]/15 text-[#89b4fa]">
                <Gauge className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-[#a6adc8]">0–100 km/h</div>
                <div className="font-mono font-bold text-white">
                  {p.acceleration_0_100_s ? `${p.acceleration_0_100_s}s` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Top Speed */}
            <div className="flex items-center gap-2 rounded-xl bg-[#181825]/90 p-2 border border-[#313244]/60">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f9e2af]/15 text-[#f9e2af]">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-[#a6adc8]">Top Speed</div>
                <div className="font-mono font-bold text-white">
                  {p.top_speed_kmh ? `${p.top_speed_kmh} km/h` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Fuel / Drivetrain */}
            <div className="flex items-center gap-2 rounded-xl bg-[#181825]/90 p-2 border border-[#313244]/60">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#94e2d5]/15 text-[#94e2d5]">
                <Fuel className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-[#a6adc8]">Drivetrain</div>
                <div className="font-mono font-bold text-white truncate max-w-[80px]">
                  {p.drivetrain} • {p.fuel_type === 'Plug-in Hybrid' ? 'PHEV' : p.fuel_type}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Sales Footer */}
        <div className="mt-4 border-t border-[#313244] pt-3 flex items-center justify-between">
          <div className="text-[11px] text-[#a6adc8]">
            {model.totalSales > 0 ? (
              <span>
                Sales: <strong className="text-white font-mono">{model.totalSales >= 1_000_000 ? `${(model.totalSales / 1_000_000).toFixed(2)}M` : model.totalSales.toLocaleString()}</strong>
              </span>
            ) : (
              <span className="text-[#a6adc8]/60">Annual data</span>
            )}
          </div>

          <button
            onClick={() => onSelect(model)}
            className="flex items-center gap-1.5 rounded-xl bg-[#b4befe]/15 px-3 py-1.5 text-xs font-semibold text-[#b4befe] hover:bg-[#b4befe] hover:text-[#11111b] transition-all"
          >
            <span>Inspect Specs</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
