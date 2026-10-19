import React, { useState, useMemo, useEffect } from 'react';
import { EnrichedGeneration, FilterState } from '../../types/bmw';
import { ModelCard } from './ModelCard';
import { FilterBar } from './FilterBar';
import { SearchX, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { ModelCardSkeleton } from '../common/ModelCardSkeleton';

interface ModelGridProps {
  generations: EnrichedGeneration[];
  onSelectModel: (model: EnrichedGeneration) => void;
  comparedModels: EnrichedGeneration[];
  onToggleCompare: (model: EnrichedGeneration) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading?: boolean;
}

const ITEMS_PER_PAGE = 12;

export const ModelGrid: React.FC<ModelGridProps> = ({
  generations,
  onSelectModel,
  comparedModels,
  onToggleCompare,
  searchQuery,
  setSearchQuery,
  loading
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
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

  // Combine top-level search query with filter state
  const effectiveQuery = searchQuery || filters.searchQuery;

  // Reset pagination to first page whenever search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveQuery, filters]);

  // Filter & Sort Logic
  const filteredGenerations = useMemo(() => {
    return generations.filter((g) => {
      // 1. Precision model, chassis, trim & engine search
      if (effectiveQuery.trim()) {
        const rawQuery = effectiveQuery.toLowerCase().trim();
        const tokens = rawQuery.split(/\s+/).filter(Boolean);

        const modelLower = g.model_name.toLowerCase();
        const cleanGid = g.generation_id.replace(/^BMW_/i, '').toLowerCase();
        const gidTokens = cleanGid.split(/[_\-]+/).filter(Boolean);

        const trimTokens: string[] = [];
        const engineTokens: string[] = [];
        for (const v of g.variants) {
          if (v.variant_id) {
            const vParts = v.variant_id.toLowerCase().split(/[_\-]+/).filter(Boolean);
            trimTokens.push(...vParts);
          }
          if (v.engine) {
            const cleanEng = v.engine.replace(/\s*\([^)]*\)/g, '').toLowerCase().trim();
            engineTokens.push(cleanEng);
            const prefix = cleanEng.match(/^([a-z]\d{2})/);
            if (prefix) engineTokens.push(prefix[1]);
          }
        }

        const vehicleTypeLower = g.vehicle_type.toLowerCase();

        const allTokensMatch = tokens.every(token => {
          // 4-digit year search (e.g. "1998", "2020")
          if (/^\d{4}$/.test(token)) {
            const yr = parseInt(token, 10);
            return g.production_start <= yr && (!g.production_end || g.production_end >= yr);
          }

          // Model name match (e.g. "3 Series", "507", "M1", "X5", "i4")
          if (modelLower.includes(token)) return true;

          // Chassis code match (e.g. "e46", "e30", "f30", "g20")
          if (gidTokens.some(t => t === token || (token.length >= 2 && t.startsWith(token)))) return true;
          if (cleanGid.replace(/_/g, '').includes(token)) return true;

          // Trim & variant name match (e.g. "m3", "m5", "330i", "m340i", "csl")
          if (trimTokens.some(t => t === token || (token.length >= 3 && t.startsWith(token)))) return true;

          // Engine code match (e.g. "b58", "s54", "s85", "s58")
          if (engineTokens.some(e => e === token || (token.length >= 3 && e.includes(token)))) return true;

          // Vehicle body style match (requires at least 4 chars e.g. "sedan", "coupe", "roadster", "wagon", "hatchback")
          if (token.length >= 4 && vehicleTypeLower.includes(token)) return true;

          return false;
        });

        if (!allTokensMatch) return false;
      }

      // 2. Era filter
      if (filters.era !== 'All' && g.era !== filters.era) return false;

      // 3. Status filter
      if (filters.status !== 'All' && g.status !== filters.status) return false;

      // 4. Series filter
      if (filters.series !== 'All') {
        const s = g.model_name.toLowerCase();
        const gid = g.generation_id.toLowerCase();
        if (filters.series === '3 Series' && !s.includes('3 series') && !gid.includes('bmw_3_')) return false;
        if (filters.series === '5 Series' && !s.includes('5 series') && !gid.includes('bmw_5_')) return false;
        if (filters.series === '7 Series' && !s.includes('7 series') && !gid.includes('bmw_7_')) return false;
        if (filters.series === 'X Series' && !s.includes('x1') && !s.includes('x2') && !s.includes('x3') && !s.includes('x4') && !s.includes('x5') && !s.includes('x6') && !s.includes('x7') && !s.includes('xm')) return false;
        if (filters.series === '1 Series' && !s.includes('1 series') && !gid.includes('bmw_1_')) return false;
        if (filters.series === '2 Series' && !s.includes('2 series') && !gid.includes('bmw_2_')) return false;
        if (filters.series === '4 Series' && !s.includes('4 series') && !gid.includes('bmw_4_')) return false;
        if (filters.series === '6 Series' && !s.includes('6 series') && !gid.includes('bmw_6_')) return false;
        if (filters.series === '8 Series' && !s.includes('8 series') && !gid.includes('bmw_8_')) return false;
        if (filters.series === 'Z Series' && !s.includes('z1') && !s.includes('z3') && !s.includes('z4') && !s.includes('z8') && !gid.includes('bmw_z')) return false;
        if (filters.series === 'i Series' && !s.startsWith('i') && !gid.includes('bmw_i')) return false;
        if (filters.series === 'Classic' && !['BMW_3-15', 'BMW_3-20', 'BMW_303', 'BMW_309', 'BMW_315', 'BMW_319', 'BMW_320', 'BMW_321', 'BMW_326', 'BMW_327', 'BMW_328', 'BMW_329', 'BMW_335', 'BMW_501', 'BMW_502', 'BMW_503', 'BMW_507', 'BMW_3200', 'BMW_ISETTA', 'BMW_600', 'BMW_700', 'BMW_NK', 'BMW_02', 'BMW_E3', 'BMW_E9', 'BMW_M1'].some(k => gid.includes(k.toLowerCase()))) return false;
      }

      // 5. Fuel Type filter
      if (filters.fuelType !== 'All') {
        const matchesFuel = g.variants.some(v => v.fuel_type === filters.fuelType);
        if (!matchesFuel) return false;
      }

      // 6. Drivetrain filter
      if (filters.drivetrain !== 'All') {
        const matchesDrive = g.variants.some(v => v.drivetrain === filters.drivetrain);
        if (!matchesDrive) return false;
      }

      return true;
    }).sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      if (filters.sortBy === 'name') {
        return a.model_name.localeCompare(b.model_name) * order;
      }
      if (filters.sortBy === 'year') {
        return (a.production_start - b.production_start) * order;
      }
      if (filters.sortBy === 'power') {
        return (a.primaryVariant.horsepower_hp - b.primaryVariant.horsepower_hp) * order;
      }
      if (filters.sortBy === 'speed') {
        return (a.primaryVariant.top_speed_kmh - b.primaryVariant.top_speed_kmh) * order;
      }
      if (filters.sortBy === 'sales') {
        return (a.totalSales - b.totalSales) * order;
      }
      if (filters.sortBy === 'acceleration') {
        return ((a.primaryVariant.acceleration_0_100_s || 99) - (b.primaryVariant.acceleration_0_100_s || 99)) * order;
      }
      return 0;
    });
  }, [generations, effectiveQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredGenerations.length / ITEMS_PER_PAGE) || 1;
  const paginatedGenerations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGenerations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGenerations, currentPage]);

  return (
    <div className="space-y-6">
      {/* Multi-Faceted Filters */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        totalMatches={filteredGenerations.length}
        totalAll={generations.length}
        onReset={() => {
          setSearchQuery('');
          setFilters(prev => ({
            ...prev,
            searchQuery: ''
          }));
        }}
      />

      {/* Active Search Results Banner */}
      {effectiveQuery.trim() && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#b4befe]/10 border border-[#b4befe]/30 p-3 sm:px-4 text-xs text-[#cdd6f4] animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#b4befe]/20 text-[#b4befe]">
              <Search className="h-3.5 w-3.5" />
            </span>
            <span>
              Search results for <span className="font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded">"{effectiveQuery}"</span>:
              {filteredGenerations.length > 0 ? (
                <span className="ml-1.5 text-[#a6e3a1] font-semibold">{filteredGenerations.length} {filteredGenerations.length === 1 ? 'model' : 'models'} found</span>
              ) : (
                <span className="ml-1.5 text-[#f38ba8] font-semibold">0 models found</span>
              )}
            </span>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setFilters(prev => ({ ...prev, searchQuery: '' }));
            }}
            className="flex items-center gap-1 rounded-lg bg-[#181825] px-2.5 py-1 text-xs text-[#a6adc8] hover:text-white border border-[#313244] hover:border-white/20 transition-all"
          >
            <X className="h-3 w-3" />
            Clear Search
          </button>
        </div>
      )}

      {/* Models Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, idx) => (
            <ModelCardSkeleton key={idx} />
          ))}
        </div>
      ) : paginatedGenerations.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedGenerations.map((model) => (
              <ModelCard
                key={model.generation_id}
                model={model}
                onSelect={onSelectModel}
                isCompared={comparedModels.some(c => c.generation_id === model.generation_id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#313244] pt-4 text-xs">
              <span className="text-[#a6adc8]">
                Page <strong className="text-white font-mono">{currentPage}</strong> of <strong className="text-white font-mono">{totalPages}</strong> ({filteredGenerations.length} total models)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg bg-[#181825] px-3 py-1.5 text-white disabled:opacity-30 border border-[#313244] hover:bg-[#313244] transition-all"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-lg bg-[#181825] px-3 py-1.5 text-white disabled:opacity-30 border border-[#313244] hover:bg-[#313244] transition-all"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-[#a6adc8] mb-4">
            <SearchX className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">No Matching BMW Vehicles Found</h3>
          <p className="mt-1 text-xs text-[#a6adc8] max-w-sm mx-auto">
            Try adjusting your search terms, changing the historical era, or clearing active filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
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
            }}
            className="mt-4 rounded-xl bg-[#b4befe] px-4 py-2 text-xs font-bold text-[#11111b] hover:bg-[#cba6f7] transition-all"
          >
            Reset All Filters & Search
          </button>
        </div>
      )}
    </div>
  );
};
