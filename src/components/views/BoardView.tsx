import React, { useState } from 'react';
import { Goal, DepartmentFunction } from '@/lib/types';
import { StatusBadge, AccomplishmentBadge, GoalTypeBadge, CATEGORY_CONFIG } from '../ui/Badge';
import { Calendar, Target, ArrowRight, Layers, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface BoardViewProps {
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
}

const ITEMS_PER_PAGE = 6;

const DEPARTMENTS: { key: DepartmentFunction | 'All'; label: string }[] = [
  { key: 'All', label: 'All Departments' },
  { key: 'Website Management', label: 'Website & SEO' },
  { key: 'Infrastructure Management', label: 'Cloud & Systems' },
  { key: 'Cybersecurity', label: 'Security & Privacy' },
  { key: 'Technology Optimization & Innovation', label: 'Automation & Tools' },
  { key: 'Others', label: 'Team & Talent' },
];

export function BoardView({ goals, onSelectGoal }: BoardViewProps) {
  const [selectedDept, setSelectedDept] = useState<DepartmentFunction | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const getFriendlyPurpose = (specific?: string) => {
    if (!specific) return '';
    const inOrderMatch = specific.match(/in order to\s+([^.]+)/i);
    if (inOrderMatch) {
      const purpose = inOrderMatch[1].trim();
      return `Purpose: ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}.`;
    }
    const lines = specific.split('\n').filter((l) => l.trim().length > 0);
    return lines[0] || specific;
  };

  // Filter goals by department
  const filteredGoals = selectedDept === 'All'
    ? goals
    : goals.filter((g) => g.function === selectedDept);

  // Pagination to guarantee single-view fit
  const totalPages = Math.max(1, Math.ceil(filteredGoals.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const visibleGoals = filteredGoals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDeptChange = (dept: DepartmentFunction | 'All') => {
    setSelectedDept(dept);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. SINGLE VIEW DEPARTMENT LANE SELECTOR (TABS)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        {/* Department Lane Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-stone-200/70 border border-stone-200 gap-1 overflow-x-auto scrollbar-none">
          {DEPARTMENTS.map((dept) => {
            const count = dept.key === 'All'
              ? goals.length
              : goals.filter((g) => g.function === dept.key).length;
            const isSelected = selectedDept === dept.key;

            return (
              <button
                key={dept.key}
                onClick={() => handleDeptChange(dept.key)}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                  isSelected
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                )}
              >
                <span>{dept.label}</span>
                <span
                  className={clsx(
                    'text-[10px] font-mono px-1 rounded-full',
                    isSelected ? 'bg-stone-100 text-stone-800 font-bold' : 'text-stone-400'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status / Page Indicator */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-stone-500 font-mono">
          <span>
            Showing {visibleGoals.length > 0 ? startIndex + 1 : 0}–
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredGoals.length)} of {filteredGoals.length}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. COMPACT SINGLE-VIEW CARDS GRID (Capped at 6 items per page)
          ───────────────────────────────────────────────────────────── */}
      {visibleGoals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-stone-200 shadow-card">
          <p className="text-sm font-semibold text-stone-800">No initiatives found in this lane.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {visibleGoals.map((goal) => {
            const friendlyPurpose = getFriendlyPurpose(goal.specific_statement);
            const isBreakthrough = goal.goal_type === 'Breakthrough';
            const catConfig = CATEGORY_CONFIG[goal.function] || {
              label: goal.function,
              shortLabel: goal.function,
              icon: Layers,
            };

            return (
              <div
                key={goal.id}
                onClick={() => onSelectGoal(goal)}
                className={clsx(
                  'group relative flex flex-col justify-between p-4 rounded-xl bg-white border hover:border-stone-400 hover:shadow-subtle transition-all duration-150 cursor-pointer text-left',
                  isBreakthrough
                    ? 'border-stone-200 border-l-[3.5px] border-l-indigo-600 shadow-2xs'
                    : 'border-stone-200 shadow-2xs'
                )}
                title="Click to redirect to full workspace"
              >
                <div className="space-y-2">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        {catConfig.shortLabel}
                      </span>
                      <StatusBadge status={goal.status} />
                    </div>
                    {goal.accomplishment_status && (
                      <AccomplishmentBadge status={goal.accomplishment_status} />
                    )}
                  </div>

                  {/* Goal Title */}
                  <h3 className="text-xs font-bold text-stone-900 group-hover:text-stone-950 line-clamp-2 leading-snug">
                    {goal.title}
                  </h3>

                  {/* Target / Purpose Snippet */}
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    {goal.target || friendlyPurpose}
                  </p>
                </div>

                {/* Card Footer with Redirect Affordance */}
                <div className="pt-2.5 mt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="text-[10px] font-mono">
                    PIC: {goal.pic || 'Unassigned'}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 group-hover:text-stone-950 transition-colors">
                    <span>Workspace</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. SINGLE VIEW PAGINATION CONTROLS
             Eliminates scrolling by paging when items exceed 6.
          ───────────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-stone-200/80">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous Page</span>
          </button>

          <span className="text-xs font-mono text-stone-500">
            Page <strong className="text-stone-800">{validPage}</strong> of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition shadow-2xs"
          >
            <span>Next Page</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
