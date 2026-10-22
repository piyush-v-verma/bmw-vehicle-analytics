import React from 'react';
import { FilterState } from '../../types/bmw';
import { Filter, RotateCcw, ArrowUpDown, Gauge, Calendar, Zap } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  totalAll: number;
  onReset?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalMatches,
  totalAll,
  onReset
}) => {
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      era: 'All',
      series: 'All',
      status: 'All',
      fuelType: 'All',
      drivetrain: 'All',
      vehicleType: 'All',
      minHorsepower: 0,
      maxHorsepower: 1000,
      minYear: 1929,
      maxYear: 2026,
      sortBy: 'year',
      sortOrder: 'desc'
    });
    if (onReset) {
      onReset();
    }
  };

  // Helper for horsepower preset change
  const handleHorsepowerPreset = (val: string) => {
    if (val === 'all') {
      setFilters(prev => ({ ...prev, minHorsepower: 0, maxHorsepower: 1000 }));
    } else if (val === 'under150') {
      setFilters(prev => ({ ...prev, minHorsepower: 0, maxHorsepower: 150 }));
    } else if (val === '150-300') {
      setFilters(prev => ({ ...prev, minHorsepower: 150, maxHorsepower: 300 }));
    } else if (val === '300-500') {
      setFilters(prev => ({ ...prev, minHorsepower: 300, maxHorsepower: 500 }));
    } else if (val === 'over500') {
      setFilters(prev => ({ ...prev, minHorsepower: 500, maxHorsepower: 1000 }));
    }
  };

  // Helper for year range preset change
  const handleYearPreset = (val: string) => {
    if (val === 'all') {
      setFilters(prev => ({ ...prev, minYear: 1929, maxYear: 2026 }));
    } else if (val === '2020s') {
      setFilters(prev => ({ ...prev, minYear: 2020, maxYear: 2026 }));
    } else if (val === '2010s') {
      setFilters(prev => ({ ...prev, minYear: 2010, maxYear: 2019 }));
    } else if (val === '2000s') {
      setFilters(prev => ({ ...prev, minYear: 2000, maxYear: 2009 }));
    } else if (val === '1990s') {
      setFilters(prev => ({ ...prev, minYear: 1990, maxYear: 1999 }));
    } else if (val === 'classic') {
      setFilters(prev => ({ ...prev, minYear: 1929, maxYear: 1989 }));
    }
  };

  const currentHpPreset =
    filters.minHorsepower === 0 && filters.maxHorsepower === 1000
      ? 'all'
      : filters.minHorsepower === 0 && filters.maxHorsepower === 150
      ? 'under150'
      : filters.minHorsepower === 150 && filters.maxHorsepower === 300
      ? '150-300'
      : filters.minHorsepower === 300 && filters.maxHorsepower === 500
      ? '300-500'
      : filters.minHorsepower === 500
      ? 'over500'
      : 'custom';

  const currentYearPreset =
    filters.minYear === 1929 && filters.maxYear === 2026
      ? 'all'
      : filters.minYear === 2020 && filters.maxYear === 2026
      ? '2020s'
      : filters.minYear === 2010 && filters.maxYear === 2019
      ? '2010s'
      : filters.minYear === 2000 && filters.maxYear === 2009
      ? '2000s'
      : filters.minYear === 1990 && filters.maxYear === 1999
      ? '1990s'
      : filters.minYear === 1929 && filters.maxYear === 1989
      ? 'classic'
      : 'custom';

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#313244] pb-3.5">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#b4befe]" />
            <span className="text-sm font-bold text-white font-['Outfit']">Multi-Faceted Vehicle Filters</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-[#94e2d5] font-mono">
              Showing {totalMatches} of {totalAll}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-[#a6adc8]">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort:</span>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  const order = parts.pop() as FilterState['sortOrder'];
                  const by = parts.join('-') as FilterState['sortBy'];
                  setFilters(prev => ({ ...prev, sortBy: by, sortOrder: order }));
                }}
                className="rounded-lg glass-input py-1 px-2 text-xs text-white"
              >
                <option value="year-desc">Newest Year First</option>
                <option value="year-asc">Oldest Year First</option>
                <option value="power-desc">Highest Horsepower</option>
                <option value="power-asc">Lowest Horsepower</option>
                <option value="acceleration-asc">Fastest 0–100 km/h</option>
                <option value="weight_asc-asc">Lightest Kerb Weight</option>
                <option value="weight_desc-desc">Heaviest Kerb Weight</option>
                <option value="speed-desc">Highest Top Speed</option>
                <option value="sales-desc">Highest Sales Volume</option>
                <option value="name-asc">Model Name (A-Z)</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-lg bg-[#181825] px-2.5 py-1 text-xs text-[#a6adc8] hover:text-white border border-[#313244] hover:border-white/20 transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid - 6 columns on large screens */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-xs">
          {/* Era Filter */}
          <div>
            <label className="block text-[11px] font-medium text-[#a6adc8] mb-1">Historical Era</label>
            <select
              value={filters.era}
              onChange={(e) => setFilters(prev => ({ ...prev, era: e.target.value }))}
              className="w-full rounded-lg glass-input p-2 text-xs text-white"
            >
              <option value="All">All Eras (1929–2026)</option>
              <option value="Pre-War (1929-1941)">Pre-War (1929–1941)</option>
              <option value="Post-War Classic (1952-1965)">Post-War Classic (1952–1965)</option>
              <option value="Neue Klasse & 70s (1966-1989)">Neue Klasse & 70s (1966–1989)</option>
              <option value="Modern Era (1990-2015)">Modern Era (1990–2015)</option>
              <option value="NextGen & Electrified (2016-2026)">NextGen & EV (2016–2026)</option>
            </select>
          </div>

          {/* Series / Family Filter */}
          <div>
            <label className="block text-[11px] font-medium text-[#a6adc8] mb-1">Model Family / Series</label>
            <select
              value={filters.series}
              onChange={(e) => setFilters(prev => ({ ...prev, series: e.target.value }))}
              className="w-full rounded-lg glass-input p-2 text-xs text-white"
            >
              <option value="All">All Series</option>
              <option value="3 Series">3 Series</option>
              <option value="5 Series">5 Series</option>
              <option value="7 Series">7 Series</option>
              <option value="X Series">X Family (SAV / SAC)</option>
              <option value="1 Series">1 Series</option>
              <option value="2 Series">2 Series</option>
              <option value="4 Series">4 Series</option>
              <option value="6 Series">6 Series</option>
              <option value="8 Series">8 Series</option>
              <option value="Z Series">Z Roadsters</option>
              <option value="i Series">i-Series (Electrified)</option>
              <option value="Classic">Historical Pioneers</option>
            </select>
          </div>

          {/* Horsepower Filter */}
          <div>
            <label className="block text-[11px] font-medium text-[#a6adc8] mb-1">Horsepower (hp)</label>
            <select
              value={currentHpPreset}
              onChange={(e) => handleHorsepowerPreset(e.target.value)}
              className="w-full rounded-lg glass-input p-2 text-xs text-white"
            >
              <option value="all">All Power (0–1000 hp)</option>
              <option value="under150">&lt; 150 hp (Entry / Classic)</option>
              <option value="150-300">150 – 300 hp (Mid-Range)</option>
              <option value="300-500">300 – 500 hp (High Output)</option>
              <option value="over500">&gt; 500 hp (M Power / Supercar)</option>
            </select>
          </div>

          {/* Production Years Filter */}
          <div>
            <label className="block text-[11px] font-medium text-[#a6adc8] mb-1">Production Years</label>
            <select
              value={currentYearPreset}
              onChange={(e) => handleYearPreset(e.target.value)}
              className="w-full rounded-lg glass-input p-2 text-xs text-white"
            >
              <option value="all">All Years (1929–2026)</option>
              <option value="2020s">2020–2026 (Current Gen)</option>
              <option value="2010s">2010–2019 (Modern F-Gen)</option>
              <option value="2000s">2000–2009 (Bangle & E-Gen)</option>
              <option value="1990s">1990–1999 (90s Classics)</option>
              <option value="classic">1929–1989 (Vintage & Retro)</option>
            </select>
          </div>

          {/* Fuel / Powertrain Type */}
          <div>
            <label className="block text-[11px] font-medium text-[#a6adc8] mb-1">Powertrain / Fuel</label>
            <select
              value={filters.fuelType}
              onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
              className="w-full rounded-lg glass-input p-2 text-xs text-white"
            >
              <option value="All">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Mild-Hybrid</option>
              <option value="Plug-in Hybrid">Plug-in Hybrid (PHEV)</option>
              <option value="Electric">Pure Electric (BEV)</option>
            </select>
          </div>

          {/* Drivetrain */}
          <div>
            <label className="block text-[11px] font-medium text-[#a6adc8] mb-1">Drivetrain</label>
            <select
              value={filters.drivetrain}
              onChange={(e) => setFilters(prev => ({ ...prev, drivetrain: e.target.value }))}
              className="w-full rounded-lg glass-input p-2 text-xs text-white"
            >
              <option value="All">All Drivetrains</option>
              <option value="RWD">RWD (Rear-Wheel Drive)</option>
              <option value="AWD">AWD (xDrive All-Wheel)</option>
              <option value="FWD">FWD (Front-Wheel Drive)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};