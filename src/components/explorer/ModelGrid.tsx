import React, { useState, useMemo } from 'react';
import { EnrichedGeneration, FilterState } from '../../types/bmw';
import { ModelCard } from './ModelCard';
import { FilterBar } from './FilterBar';
import { SearchX, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Filter & Sort Logic
  const filteredGenerations = useMemo(() => {
    return generations.filter((g) => {
      // 1. Search text match
      if (effectiveQuery.trim()) {
        const q = effectiveQuery.toLowerCase().trim();
        const matchesName = g.model_name.toLowerCase().includes(q);
        const matchesGid = g.generation_id.toLowerCase().includes(q);
        const matchesVariant = g.variants.some(v => 
          v.variant_id.toLowerCase().includes(q) || 
          v.engine.toLowerCase().includes(q) ||
          v.generation.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesGid && !matchesVariant) return false;
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
      />

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
              setFilters(prev => ({
                ...prev,
                searchQuery: '',
                era: 'All',
                series: 'All',
                status: 'All',
                fuelType: 'All',
                drivetrain: 'All'
              }));
            }}
            className="mt-4 rounded-xl bg-[#b4befe] px-4 py-2 text-xs font-bold text-[#11111b] hover:bg-[#cba6f7] transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
