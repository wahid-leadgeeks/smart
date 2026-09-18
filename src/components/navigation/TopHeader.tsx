import React from 'react';
import { ViewMode } from '@/lib/types';
import { Button } from '../ui/Button';
import {
  CalendarRange,
  LayoutGrid,
  CalendarCheck,
  Target,
  Download,
  RefreshCw,
  Search,
  X,
  Building2,
} from 'lucide-react';
import clsx from 'clsx';

interface TopHeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSync: () => void;
  onExport: () => void;
  isSyncing: boolean;
  isExporting: boolean;
  totalGoals: number;
  completedCount: number;
}

export function TopHeader({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onSync,
  onExport,
  isSyncing,
  isExporting,
  totalGoals,
}: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-2.5 lg:h-14 gap-2.5">
          {/* Brand & Left Navigation Anchor */}
          <div className="flex items-center justify-between lg:justify-start gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                <Building2 className="w-4 h-4 text-stone-200" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900 font-mono">
                  LeadGeeks
                </span>
                <span className="text-[11px] font-medium text-stone-500 font-mono">
                  · IT 2026
                </span>
              </div>
            </div>

            {/* Mobile Actions (Visible on small screens) */}
            <div className="flex lg:hidden items-center gap-1.5">
              <button
                onClick={onSync}
                disabled={isSyncing}
                title="Refresh Spreadsheet"
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', { 'animate-spin': isSyncing })} />
              </button>
              <button
                onClick={onExport}
                disabled={isExporting}
                title="Download Report"
                className="p-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary View Navigation Tabs (Center on desktop) */}
          <nav className="inline-flex p-1 rounded-xl bg-stone-200/70 border border-stone-200/80 gap-1 overflow-x-auto scrollbar-none shrink-0 self-start lg:self-center">
            <button
              onClick={() => onViewChange('board')}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                currentView === 'board'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-stone-500" />
              <span>Goals</span>
              <span className={clsx(
                'text-[10px] font-mono px-1 rounded-full',
                currentView === 'board' ? 'bg-stone-100 text-stone-700 font-bold' : 'text-stone-400'
              )}>
                {totalGoals}
              </span>
            </button>

            <button
              onClick={() => onViewChange('roadmap')}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                currentView === 'roadmap'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              )}
            >
              <CalendarRange className="w-3.5 h-3.5 text-stone-500" />
              <span>Timeline</span>
            </button>

            <button
              onClick={() => onViewChange('cadence')}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                currentView === 'cadence'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              )}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-stone-500" />
              <span>Monthly</span>
            </button>

            <button
              onClick={() => onViewChange('strategic')}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                currentView === 'strategic'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50'
              )}
            >
              <Target className={clsx('w-3.5 h-3.5', currentView === 'strategic' ? 'text-amber-400' : 'text-amber-600')} />
              <span>The BIG Six</span>
              <span className={clsx(
                'text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full transition-colors',
                currentView === 'strategic'
                  ? 'bg-amber-400/20 text-amber-200'
                  : 'bg-amber-100 text-amber-900'
              )}>
                35
              </span>
            </button>
          </nav>

          {/* Search & Global Actions (Right side on desktop) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Box */}
            <div className="relative w-full sm:w-48 lg:w-56">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search initiatives..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-7 py-1 text-xs bg-white rounded-lg border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all shadow-subtle"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                isLoading={isSyncing}
                title="Refresh and sync data directly from the original spreadsheet"
              >
                <RefreshCw className={clsx('w-3 h-3', { 'animate-spin': isSyncing })} />
                <span className="text-xs">Sync</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={onExport}
                isLoading={isExporting}
                title="Download report as an Excel (.xlsx) file"
              >
                <Download className="w-3 h-3" />
                <span className="text-xs">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
