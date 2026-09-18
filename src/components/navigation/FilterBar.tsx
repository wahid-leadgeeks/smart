import React from 'react';
import { DepartmentFunction, GoalStatus, GoalType } from '@/lib/types';
import { CATEGORY_CONFIG } from '../ui/Badge';
import clsx from 'clsx';
import { Filter, X, Layers } from 'lucide-react';

interface FilterBarProps {
  selectedFunction: DepartmentFunction | 'All';
  onFunctionChange: (fn: DepartmentFunction | 'All') => void;
  selectedStatus: GoalStatus | 'All';
  onStatusChange: (st: GoalStatus | 'All') => void;
  selectedType: GoalType | 'All';
  onTypeChange: (t: GoalType | 'All') => void;
  functionCounts: Record<string, number>;
}

const CATEGORY_KEYS: (DepartmentFunction | 'All')[] = [
  'All',
  'Website Management',
  'Infrastructure Management',
  'Cybersecurity',
  'Technology Optimization & Innovation',
  'Others',
];

export function FilterBar({
  selectedFunction,
  onFunctionChange,
  selectedStatus,
  onStatusChange,
  functionCounts,
}: FilterBarProps) {
  const hasActiveFilter = selectedFunction !== 'All' || selectedStatus !== 'All';

  return (
    <div className="bg-white/80 border-b border-stone-200 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Category Filter Pills with SVG Icons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-stone-500 font-medium shrink-0 mr-1 flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3 text-stone-400" />
            Category:
          </span>

          {CATEGORY_KEYS.map((catKey) => {
            const count = catKey === 'All' ? functionCounts['All'] || 0 : functionCounts[catKey] || 0;
            const isSelected = selectedFunction === catKey;
            const meta = catKey === 'All'
              ? { label: 'All Categories', icon: Layers }
              : CATEGORY_CONFIG[catKey] || { label: catKey, icon: Layers };
            const IconComponent = meta.icon;

            return (
              <button
                key={catKey}
                onClick={() => onFunctionChange(catKey)}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border',
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                )}
              >
                <IconComponent className={clsx('w-3.5 h-3.5', isSelected ? 'text-stone-300' : 'text-stone-500')} />
                <span>{meta.label}</span>
                <span
                  className={clsx(
                    'text-[10px] ml-0.5 font-mono',
                    isSelected ? 'text-stone-300' : 'text-stone-400'
                  )}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            <button
              onClick={() => onStatusChange('All')}
              className={clsx(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                selectedStatus === 'All'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              )}
            >
              All Statuses
            </button>
            <button
              onClick={() => onStatusChange('In Progress')}
              className={clsx(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                selectedStatus === 'In Progress'
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              )}
            >
              In Progress
            </button>
            <button
              onClick={() => onStatusChange('Completed')}
              className={clsx(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                selectedStatus === 'Completed'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              )}
            >
              Completed
            </button>
            <button
              onClick={() => onStatusChange('Not started')}
              className={clsx(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                selectedStatus === 'Not started'
                  ? 'bg-stone-200 text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              )}
            >
              Upcoming
            </button>
          </div>

          {/* Reset button if filtered */}
          {hasActiveFilter && (
            <button
              onClick={() => {
                onFunctionChange('All');
                onStatusChange('All');
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-stone-500 hover:text-stone-800 text-[11px] font-medium"
              title="Reset all filters"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
