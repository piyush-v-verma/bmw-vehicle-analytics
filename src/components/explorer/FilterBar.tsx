import React from 'react';
import { FilterState } from '../../types/bmw';
import { Filter, RotateCcw, ArrowUpDown } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  totalAll: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalMatches,
  totalAll
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
  };

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

          <div className="flex items-center gap-2.5">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-[#a6adc8]">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort:</span>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-') as [FilterState['sortBy'], FilterState['sortOrder']];
                  setFilters(prev => ({ ...prev, sortBy: by, sortOrder: order }));
                }}
                className="rounded-lg glass-input py-1 px-2 text-xs text-white"
              >
                <option value="year-desc">Newest Year First</option>
                <option value="year-asc">Oldest Year First</option>
                <option value="power-desc">Highest Horsepower</option>
                <option value="power-asc">Lowest Horsepower</option>
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
              Reset
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 text-xs">
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
              <option value="Post-War Classic (1952-1965)">Post-War (1952–1965)</option>
              <option value="Neue Klasse & 70s (1966-1989)">Neue Klasse & Classic (1966–1989)</option>
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
              <option value="Classic">Historical Pioneers (3/15, 328, 507, etc.)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-[#a6adc8] mb-1">Lifecycle Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-lg glass-input p-2 text-xs text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active (Currently Produced)</option>
              <option value="Discontinued">Discontinued (Historical)</option>
            </select>
          </div>

          {/* Fuel Type */}
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
