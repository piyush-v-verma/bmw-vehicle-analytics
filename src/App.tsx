import React, { useState, useEffect, useMemo } from 'react';
import { loadBmwHistoryData, loadBmwSpecsData, loadBmwSalesData } from './services/dataLoader';
import { getBmwImage } from './services/imageMapper';
import { BmwHistory, BmwSpecs, BmwSales, BmwSource, BmwConflict, EnrichedGeneration } from './types/bmw';
import { Header } from './components/layout/Header';
import { KpiRibbon } from './components/dashboard/KpiRibbon';
import { SalesLineChart } from './components/dashboard/SalesLineChart';
import { SeriesBarChart } from './components/dashboard/SeriesBarChart';
import { FuelDonutChart } from './components/dashboard/FuelDonutChart';
import { TopPerformers } from './components/dashboard/TopPerformers';
import { ModelGrid } from './components/explorer/ModelGrid';
import { SalesAnalyticsView } from './components/sales/SalesAnalyticsView';
import { EvolutionTimeline } from './components/evolution/EvolutionTimeline';
import { ModelComparisonView } from './components/comparison/ModelComparisonView';
import { ModelDetailModal } from './components/modal/ModelDetailModal';
import { Database, ShieldCheck } from 'lucide-react';

function categorizeEra(startYear: number): EnrichedGeneration['era'] {
  if (startYear <= 1945) return 'Pre-War (1929-1941)';
  if (startYear <= 1965) return 'Post-War Classic (1952-1965)';
  if (startYear <= 1989) return 'Neue Klasse & 70s (1966-1989)';
  if (startYear <= 2015) return 'Modern Era (1990-2015)';
  return 'NextGen & Electrified (2016-2026)';
}

export function App() {
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [historyData, setHistoryData] = useState<BmwHistory[]>([]);
  const [specsData, setSpecsData] = useState<BmwSpecs[]>([]);
  const [salesData, setSalesData] = useState<BmwSales[]>([]);
  const [sources, setSources] = useState<{
    history: BmwSource[];
    specs: BmwSource[];
    sales: BmwSource[];
  }>({ history: [], specs: [], sales: [] });
  const [conflicts, setConflicts] = useState<BmwConflict[]>([]);

  // Loading states
  const [historyLoading, setHistoryLoading] = useState(false);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);

  // Loaded cache flags
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [specsLoaded, setSpecsLoaded] = useState(false);
  const [salesLoaded, setSalesLoaded] = useState(false);

  // Navigation & Search State
  const [activeView, setActiveView] = useState<'dashboard' | 'explorer' | 'sales' | 'evolution' | 'comparison'>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Modal
  const [selectedModel, setSelectedModel] = useState<EnrichedGeneration | null>(null);

  // Compared Models List
  const [comparedModels, setComparedModels] = useState<EnrichedGeneration[]>([]);

  // Asynchronous on-demand loading functions
  const ensureHistoryLoaded = async () => {
    if (historyLoaded || historyLoading) return;
    setHistoryLoading(true);
    try {
      const data = await loadBmwHistoryData();
      setHistoryData(data.history);
      setSources(prev => ({ ...prev, history: data.sources }));
      setHistoryLoaded(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load vehicle history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const ensureSpecsLoaded = async () => {
    if (specsLoaded || specsLoading) return;
    setSpecsLoading(true);
    try {
      const data = await loadBmwSpecsData();
      setSpecsData(data.specs);
      setConflicts(data.conflicts);
      setSources(prev => ({ ...prev, specs: data.sources }));
      setSpecsLoaded(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load technical specifications');
    } finally {
      setSpecsLoading(false);
    }
  };

  const ensureSalesLoaded = async () => {
    if (salesLoaded || salesLoading) return;
    setSalesLoading(true);
    try {
      const data = await loadBmwSalesData();
      setSalesData(data.sales);
      setSources(prev => ({ ...prev, sales: data.sources }));
      setSalesLoaded(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load sales analytics');
    } finally {
      setSalesLoading(false);
    }
  };

  // Trigger load depending on activeView
  useEffect(() => {
    if (activeView === 'dashboard') {
      ensureHistoryLoaded();
      ensureSpecsLoaded();
      ensureSalesLoaded();
    } else if (activeView === 'explorer') {
      ensureHistoryLoaded();
      ensureSpecsLoaded();
    } else if (activeView === 'sales') {
      ensureHistoryLoaded();
      ensureSalesLoaded();
    } else if (activeView === 'evolution') {
      ensureHistoryLoaded();
    } else if (activeView === 'comparison') {
      ensureHistoryLoaded();
      ensureSpecsLoaded();
    }
  }, [activeView]);

  // Handle selected model specs/sales lazy loading when details modal is opened
  useEffect(() => {
    if (selectedModel) {
      ensureSpecsLoaded();
      ensureSalesLoaded();
    }
  }, [selectedModel]);

  // Compute EnrichedGenerations dynamically based on loaded parts
  const generations = useMemo(() => {
    if (historyData.length === 0) return [];

    const specsMap = new Map<string, BmwSpecs[]>();
    for (const s of specsData) {
      const list = specsMap.get(s.generation_id) || [];
      list.push(s);
      specsMap.set(s.generation_id, list);
    }

    const salesMap = new Map<string, BmwSales[]>();
    for (const s of salesData) {
      const list = salesMap.get(s.generation_id) || [];
      list.push(s);
      salesMap.set(s.generation_id, list);
    }

    return historyData.map((h) => {
      const variants = specsMap.get(h.generation_id) || [];
      const sales = salesMap.get(h.generation_id) || [];

      // Sort variants by horsepower descending
      const sortedVariants = [...variants].sort((a, b) => b.horsepower_hp - a.horsepower_hp);
      
      // Stand-in primary variant if specsData is not yet loaded
      const primaryVariant = sortedVariants[0] || {
        generation_id: h.generation_id,
        generation: h.model_name,
        series: h.model_name,
        variant_id: 'default',
        engine: 'N/A',
        engine_type: 'Other',
        fuel_type: 'Petrol',
        displacement_cc: null,
        cylinders: null,
        horsepower_hp: 0,
        torque_nm: 0,
        transmission: 'Manual',
        drivetrain: 'RWD',
        acceleration_0_100_s: null,
        top_speed_kmh: 0,
        weight_kg: 0,
        length_mm: 0,
        width_mm: 0,
        height_mm: 0,
        wheelbase_mm: 0,
        fuel_consumption: null,
        battery_kwh: null,
        electric_range_km: null
      };

      const yearlyMap = new Map<number, number>();
      let totalSales = 0;
      for (const s of sales) {
        yearlyMap.set(s.year, (yearlyMap.get(s.year) || 0) + s.units_sold);
        totalSales += s.units_sold;
      }

      const yearlySales = Array.from(yearlyMap.entries())
        .map(([year, units]) => ({ year, units }))
        .sort((a, b) => a.year - b.year);

      return {
        ...h,
        era: categorizeEra(h.production_start),
        variants: sortedVariants,
        primaryVariant,
        sales,
        totalSales,
        yearlySales,
        sources: {
          history: sources.history.filter(s => s.generation_id === h.generation_id),
          specs: sources.specs.filter(s => s.generation_id === h.generation_id),
          sales: sources.sales.filter(s => s.generation_id === h.generation_id)
        },
        conflicts: conflicts.filter(c => c.generation_id === h.generation_id),
        imageUrl: getBmwImage(h.generation_id, h.model_name)
      };
    });
  }, [historyData, specsData, salesData, sources, conflicts]);

  // Synchronize selected model object state in modal if generations list is enriched
  const selectedModelEnriched = useMemo(() => {
    if (!selectedModel) return null;
    return generations.find(g => g.generation_id === selectedModel.generation_id) || selectedModel;
  }, [selectedModel, generations]);

  const handleToggleCompare = (model: EnrichedGeneration) => {
    setComparedModels((prev) => {
      const exists = prev.some((c) => c.generation_id === model.generation_id);
      if (exists) {
        return prev.filter((c) => c.generation_id !== model.generation_id);
      } else {
        if (prev.length >= 4) {
          alert('You can compare up to 4 BMW models at a time.');
          return prev;
        }
        return [...prev, model];
      }
    });
  };

  const handleRemoveCompare = (model: EnrichedGeneration) => {
    setComparedModels((prev) => prev.filter((c) => c.generation_id !== model.generation_id));
  };

  const handleAddCompare = (model: EnrichedGeneration) => {
    setComparedModels((prev) => {
      if (prev.length >= 4) return prev;
      if (prev.some((c) => c.generation_id === model.generation_id)) return prev;
      return [...prev, model];
    });
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1e1e2e] text-white p-6">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center border border-[#f38ba8]/30">
          <h2 className="text-xl font-bold text-[#f38ba8] font-['Outfit']">Data Loading Error</h2>
          <p className="mt-2 text-xs text-[#a6adc8]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-[#b4befe] px-4 py-2 text-xs font-bold text-[#11111b]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeCount = historyData.filter((g) => g.status === 'Active').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#1e1e2e] text-[#cdd6f4] selection:bg-[#b4befe] selection:text-[#11111b]">
      {/* Global Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalGenerations={historyLoaded ? historyData.length : 0}
        activeCount={historyLoaded ? activeCount : 0}
        totalVariants={specsLoaded ? specsData.length : 0}
      />

      {/* Main View Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {/* OVERVIEW DASHBOARD VIEW */}
        {activeView === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Ribbon */}
            <KpiRibbon
              generations={generations}
              onSelectModel={(model) => setSelectedModel(model)}
              loading={historyLoading || specsLoading || salesLoading || !historyLoaded || !specsLoaded || !salesLoaded}
            />

            {/* Graphs Grid 1: Line Graph & Bar Graph */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Global Annual Deliveries Line Graph */}
              <SalesLineChart
                generations={generations}
                loading={salesLoading || !salesLoaded}
              />

              {/* Series Performance Bar Graph */}
              <SeriesBarChart
                generations={generations}
                loading={historyLoading || salesLoading || !historyLoaded || !salesLoaded}
              />
            </div>

            {/* Graphs Grid 2: Circular Donut Graph & Top Performers */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Powertrain Distribution Circular / Donut Graph */}
              <FuelDonutChart
                allSpecs={specsData}
                generations={generations}
                loading={specsLoading || !specsLoaded}
              />

              {/* Top Performers Hall of Fame */}
              <TopPerformers
                generations={generations}
                onSelectModel={(model) => setSelectedModel(model)}
                loading={historyLoading || specsLoading || !historyLoaded || !specsLoaded}
              />
            </div>
          </div>
        )}

        {/* MODEL EXPLORER VIEW */}
        {activeView === 'explorer' && (
          <div className="animate-fade-in">
            <ModelGrid
              generations={generations}
              onSelectModel={(model) => setSelectedModel(model)}
              comparedModels={comparedModels}
              onToggleCompare={handleToggleCompare}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              loading={historyLoading || specsLoading || !historyLoaded || !specsLoaded}
            />
          </div>
        )}

        {/* SALES ANALYTICS VIEW */}
        {activeView === 'sales' && (
          <div className="animate-fade-in">
            <SalesAnalyticsView
              generations={generations}
              allSales={salesData}
              onSelectModel={(model) => setSelectedModel(model)}
              loading={historyLoading || salesLoading || !historyLoaded || !salesLoaded}
            />
          </div>
        )}

        {/* EVOLUTION TIMELINE VIEW */}
        {activeView === 'evolution' && (
          <div className="animate-fade-in">
            <EvolutionTimeline
              generations={generations}
              onSelectModel={(model) => setSelectedModel(model)}
              loading={historyLoading || !historyLoaded}
            />
          </div>
        )}

        {/* COMPARISON VIEW */}
        {activeView === 'comparison' && (
          <div className="animate-fade-in">
            <ModelComparisonView
              generations={generations}
              comparedModels={comparedModels}
              onRemoveFromCompare={handleRemoveCompare}
              onAddCompare={handleAddCompare}
              onSelectModel={(model) => setSelectedModel(model)}
              loading={historyLoading || specsLoading || !historyLoaded || !specsLoaded}
            />
          </div>
        )}
      </main>

      {/* Model Detail Modal */}
      <ModelDetailModal
        model={selectedModelEnriched}
        onClose={() => setSelectedModel(null)}
        onCompare={handleToggleCompare}
        isCompared={selectedModel ? comparedModels.some(c => c.generation_id === selectedModel.generation_id) : false}
        specsLoading={specsLoading || !specsLoaded}
        salesLoading={salesLoading || !salesLoaded}
      />

      {/* Modern Footer */}
      <footer className="border-t border-[#313244] bg-[#11111b] py-6 text-xs text-[#a6adc8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#a6e3a1]" />
            <span>BMW Analytics Platform • 101 Generations • 165 Variants • 706 Sales Records</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3 text-[#94e2d5]" />
              Data: BMW Group Classic & Investor Relations
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-[#b4befe]" />
              100% Referential Parity
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
