import React, { useRef, useEffect } from 'react';
import { 
  Car, 
  BarChart3, 
  Search, 
  GitCompare, 
  History, 
  Activity, 
  Layers,
  Sparkles,
  X
} from 'lucide-react';

interface HeaderProps {
  activeView: 'dashboard' | 'explorer' | 'sales' | 'evolution' | 'comparison';
  setActiveView: (view: 'dashboard' | 'explorer' | 'sales' | 'evolution' | 'comparison') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalGenerations: number;
  activeCount: number;
  totalVariants: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  totalGenerations,
  activeCount,
  totalVariants
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Divert to Model Explorer view when user clicks or focuses the search bar
  const divertToExplorer = () => {
    if (activeView !== 'explorer') {
      setActiveView('explorer');
    }
  };

  // Keyboard shortcut to focus search and divert to explorer: '/' or Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        divertToExplorer();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        if (searchQuery) {
          setSearchQuery('');
        } else {
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, searchQuery]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#313244] bg-[#11111b]/90 backdrop-blur-md">
      {/* Top BMW M-Stripe Gradient Bar */}
      <div className="h-1 w-full m-stripe-gradient" />

      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1c69d4] to-[#11111b] p-2 shadow-glow-accent border border-white/10">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-['Outfit']">
                BMW <span className="text-[#b4befe]">Analytics</span>
              </h1>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-[#94e2d5] border border-white/10">
                1929 – 2026
              </span>
            </div>
            <p className="text-xs text-[#a6adc8]">
              Automotive Intelligence & Historical Lineage Archive
            </p>
          </div>
        </div>

        {/* Global Live Search Bar */}
        <div 
          className="relative flex-1 max-w-md group cursor-text"
          onClick={() => {
            searchInputRef.current?.focus();
            divertToExplorer();
          }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a6adc8] group-focus-within:text-[#b4befe] transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search chassis, engines, models (e.g. E46, B58, M3, 507, i4)..."
            value={searchQuery}
            onFocus={divertToExplorer}
            onClick={divertToExplorer}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              divertToExplorer();
            }}
            className="w-full rounded-xl glass-input py-2 pl-9 pr-14 text-xs placeholder:text-[#a6adc8]/60 focus:bg-[#181825] focus:border-[#b4befe]/50 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="rounded-md p-1 text-[#a6adc8] hover:text-white hover:bg-white/10 transition-colors"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none hidden sm:inline-flex items-center rounded border border-[#313244] bg-[#181825] px-1.5 py-0.5 text-[10px] font-mono text-[#a6adc8]/70">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Quick KPI Badge Ribbon */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="rounded-lg bg-[#181825] px-2.5 py-1 border border-[#313244] text-[#cdd6f4]">
            <span className="text-[#a6adc8]">Generations:</span> <span className="font-semibold text-[#b4befe]">{totalGenerations}</span>
          </div>
          <div className="rounded-lg bg-[#181825] px-2.5 py-1 border border-[#313244] text-[#cdd6f4]">
            <span className="text-[#a6adc8]">Active:</span> <span className="font-semibold text-[#a6e3a1]">{activeCount}</span>
          </div>
          <div className="rounded-lg bg-[#181825] px-2.5 py-1 border border-[#313244] text-[#cdd6f4]">
            <span className="text-[#a6adc8]">Variants:</span> <span className="font-semibold text-[#94e2d5]">{totalVariants}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6 scrollbar-none border-t border-[#313244]/50">
        <nav className="flex space-x-1 py-1.5" aria-label="Tabs">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeView === 'dashboard'
                ? 'bg-[#b4befe]/15 text-[#b4befe] border border-[#b4befe]/30 shadow-sm'
                : 'text-[#a6adc8] hover:bg-[#181825] hover:text-[#cdd6f4]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Overview Dashboard
          </button>

          <button
            onClick={() => setActiveView('explorer')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeView === 'explorer'
                ? 'bg-[#b4befe]/15 text-[#b4befe] border border-[#b4befe]/30 shadow-sm'
                : 'text-[#a6adc8] hover:bg-[#181825] hover:text-[#cdd6f4]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Model Explorer ({totalGenerations})
          </button>

          <button
            onClick={() => setActiveView('sales')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeView === 'sales'
                ? 'bg-[#b4befe]/15 text-[#b4befe] border border-[#b4befe]/30 shadow-sm'
                : 'text-[#a6adc8] hover:bg-[#181825] hover:text-[#cdd6f4]'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Sales Analytics
          </button>

          <button
            onClick={() => setActiveView('evolution')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeView === 'evolution'
                ? 'bg-[#b4befe]/15 text-[#b4befe] border border-[#b4befe]/30 shadow-sm'
                : 'text-[#a6adc8] hover:bg-[#181825] hover:text-[#cdd6f4]'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            Heritage & Evolution
          </button>

          <button
            onClick={() => setActiveView('comparison')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeView === 'comparison'
                ? 'bg-[#b4befe]/15 text-[#b4befe] border border-[#b4befe]/30 shadow-sm'
                : 'text-[#a6adc8] hover:bg-[#181825] hover:text-[#cdd6f4]'
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            Model Comparator
          </button>
        </nav>
      </div>
    </header>
  );
};
