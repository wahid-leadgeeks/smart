import React, { useState } from 'react';
import { Goal, DepartmentFunction, GoalStatus } from '@/lib/types';
import {
  CheckCircle2,
  Clock,
  CalendarDays,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
} from 'lucide-react';
import clsx from 'clsx';

interface ExecutivePulseProps {
  goals: Goal[];
  activeStatus: GoalStatus | 'All';
  onFilterStatus: (status: GoalStatus | 'All') => void;
  selectedFunction: DepartmentFunction | 'All';
  onFunctionChange: (fn: DepartmentFunction | 'All') => void;
  functionCounts: Record<string, number>;
}

const CATEGORY_OPTIONS: { key: DepartmentFunction | 'All'; label: string }[] = [
  { key: 'All', label: 'All Categories' },
  { key: 'Website Management', label: 'Website & SEO' },
  { key: 'Infrastructure Management', label: 'Cloud & Systems' },
  { key: 'Cybersecurity', label: 'Security & Privacy' },
  { key: 'Technology Optimization & Innovation', label: 'Automation & Tools' },
  { key: 'Others', label: 'Team & Operations' },
];

export function ExecutivePulse({
  goals,
  activeStatus,
  onFilterStatus,
  selectedFunction,
  onFunctionChange,
  functionCounts,
}: ExecutivePulseProps) {
  const [showNote, setShowNote] = useState(false);

  const total = goals.length;
  const completed = goals.filter((g) => g.status === 'Completed').length;
  const inProgress = goals.filter((g) => g.status === 'In Progress').length;
  const notStarted = goals.filter((g) => g.status === 'Not started').length;
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const hasActiveFilter = activeStatus !== 'All' || selectedFunction !== 'All';

  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single Unified Progress & Filter Strip (Height: 44px) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2 gap-3 min-h-[44px]">
          {/* Left: Overall Pace & Interactive Status Chips */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Overall Metric Badge */}
            <div className="flex items-center gap-2 pr-3 border-r border-stone-200 shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-stone-900 font-mono">
                {completedPct}%
              </span>
              <span className="text-xs text-stone-500 font-mono hidden sm:inline">
                ({completed}/{total} Done)
              </span>
            </div>

            {/* Quick Filter Status Chips (Zero Redundancy) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* All */}
              <button
                onClick={() => onFilterStatus('All')}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border',
                  activeStatus === 'All'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-stone-100/80 text-stone-600 border-transparent hover:bg-stone-200/70'
                )}
              >
                All ({total})
              </button>

              {/* Delivered */}
              <button
                onClick={() => onFilterStatus(activeStatus === 'Completed' ? 'All' : 'Completed')}
                className={clsx(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border',
                  activeStatus === 'Completed'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70'
                )}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Delivered</span>
                <span className="text-[10px] font-mono opacity-80">({completed})</span>
              </button>

              {/* In Progress */}
              <button
                onClick={() => onFilterStatus(activeStatus === 'In Progress' ? 'All' : 'In Progress')}
                className={clsx(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border',
                  activeStatus === 'In Progress'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : 'bg-amber-50 text-amber-900 border-amber-200/80 hover:bg-amber-100/70'
                )}
              >
                <Clock className="w-3 h-3 text-amber-600" />
                <span>In Flight</span>
                <span className="text-[10px] font-mono opacity-80">({inProgress})</span>
              </button>

              {/* Upcoming */}
              <button
                onClick={() => onFilterStatus(activeStatus === 'Not started' ? 'All' : 'Not started')}
                className={clsx(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border',
                  activeStatus === 'Not started'
                    ? 'bg-stone-700 text-white border-stone-700 shadow-2xs'
                    : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200/70'
                )}
              >
                <CalendarDays className="w-3 h-3 text-stone-500" />
                <span>Planned</span>
                <span className="text-[10px] font-mono opacity-80">({notStarted})</span>
              </button>
            </div>
          </div>

          {/* Right: Category Selector & Executive Note Toggle */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <select
                value={selectedFunction}
                onChange={(e) => onFunctionChange(e.target.value as DepartmentFunction | 'All')}
                aria-label="Filter initiatives by department function category"
                className="text-xs bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer transition-colors"
              >
                {CATEGORY_OPTIONS.map((opt) => {
                  const count = opt.key === 'All' ? functionCounts['All'] || 0 : functionCounts[opt.key] || 0;
                  return (
                    <option key={opt.key} value={opt.key}>
                      {opt.label} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Reset Filters Pill (if filtered) */}
            {hasActiveFilter && (
              <button
                onClick={() => {
                  onFilterStatus('All');
                  onFunctionChange('All');
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="Reset filters"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <div className="h-4 w-px bg-stone-200 mx-1 hidden sm:block" />

            {/* Expandable Executive Note Button */}
            <button
              onClick={() => setShowNote(!showNote)}
              className={clsx(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                showNote
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              )}
              title="Click to view or hide the executive narrative update"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Executive Note</span>
              {showNote ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Collapsible Executive Narrative Note */}
        {showNote && (
          <div className="py-3 pt-1 pb-3.5 border-t border-stone-100 animate-in fade-in duration-200">
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs text-amber-950 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-900">Executive Snapshot:</span>
                <p className="text-stone-700 leading-relaxed">
                  Infrastructure audits and company domain migrations are complete. Active focus is deployed on website SEO, workflow automations, and cloud capabilities.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
