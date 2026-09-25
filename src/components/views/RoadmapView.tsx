import React, { useState, useMemo } from 'react';
import { Goal, DepartmentFunction } from '@/lib/types';
import { StatusBadge, AccomplishmentBadge, CATEGORY_CONFIG } from '../ui/Badge';
import clsx from 'clsx';
import { ChevronRight, ChevronLeft, Calendar, Layers, ArrowRight } from 'lucide-react';

interface RoadmapViewProps {
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
}

const ITEMS_PER_PAGE = 5;

const DEPARTMENTS: { key: DepartmentFunction | 'All'; label: string }[] = [
  { key: 'All', label: 'All Departments' },
  { key: 'Website Management', label: 'Website & SEO' },
  { key: 'Infrastructure Management', label: 'Cloud & Systems' },
  { key: 'Cybersecurity', label: 'Security & Privacy' },
  { key: 'Technology Optimization & Innovation', label: 'Automation & Tools' },
  { key: 'Others', label: 'Team & Talent' },
];

const QUARTERS = [
  { key: 'All', label: 'Full Year 2026', range: [1, 12] },
  { key: 'Q1', label: 'Q1 (Jan – Mar)', range: [1, 3] },
  { key: 'Q2', label: 'Q2 (Apr – Jun)', range: [4, 6] },
  { key: 'Q3', label: 'Q3 (Jul – Sep)', range: [7, 9] },
  { key: 'Q4', label: 'Q4 (Oct – Dec)', range: [10, 12] },
];

const MONTHS = [
  { name: 'Jan', num: 1, quarter: 'Q1' },
  { name: 'Feb', num: 2, quarter: 'Q1' },
  { name: 'Mar', num: 3, quarter: 'Q1' },
  { name: 'Apr', num: 4, quarter: 'Q2' },
  { name: 'May', num: 5, quarter: 'Q2' },
  { name: 'Jun', num: 6, quarter: 'Q2' },
  { name: 'Jul', num: 7, quarter: 'Q3' },
  { name: 'Aug', num: 8, quarter: 'Q3' },
  { name: 'Sep', num: 9, quarter: 'Q3' },
  { name: 'Oct', num: 10, quarter: 'Q4' },
  { name: 'Nov', num: 11, quarter: 'Q4' },
  { name: 'Dec', num: 12, quarter: 'Q4' },
];

function calculateMonthPosition(dateStr: string): number {
  if (!dateStr) return 1;
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const m = parseInt(parts[1], 10);
    const d = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
    return Math.max(0, Math.min(12, m - 1 + d / 31));
  }
  return 1;
}

function getGoalMonthRange(goal: Goal): [number, number] {
  const start = calculateMonthPosition(goal.start_date);
  const end = Math.max(start + 0.5, calculateMonthPosition(goal.end_date));
  return [start + 1, end];
}

export function RoadmapView({ goals, onSelectGoal }: RoadmapViewProps) {
  const [selectedDept, setSelectedDept] = useState<DepartmentFunction | 'All'>('All');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter goals by department and quarterly horizon
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      if (selectedDept !== 'All' && g.function !== selectedDept) return false;

      if (selectedQuarter !== 'All') {
        const qConfig = QUARTERS.find((q) => q.key === selectedQuarter);
        if (qConfig) {
          const [startM, endM] = getGoalMonthRange(g);
          const [qStart, qEnd] = qConfig.range;
          // Does the goal overlap with this quarter?
          const overlaps = startM <= qEnd && endM >= qStart;
          if (!overlaps) return false;
        }
      }
      return true;
    });
  }, [goals, selectedDept, selectedQuarter]);

  // Reset page when filter changes
  const handleDeptChange = (dept: DepartmentFunction | 'All') => {
    setSelectedDept(dept);
    setCurrentPage(1);
  };

  const handleQuarterChange = (qKey: string) => {
    setSelectedQuarter(qKey);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredGoals.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const visibleGoals = filteredGoals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // September 2026 marker position
  const currentMonthPosition = 8.45;

  return (
    <div className="space-y-3.5 animate-in fade-in-50 duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. SINGLE VIEW FILTER & HORIZON BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-2.5 border-b border-stone-200">
        {/* Department Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-stone-200/70 border border-stone-200 gap-1 overflow-x-auto scrollbar-none">
          {DEPARTMENTS.map((dept) => {
            const count =
              dept.key === 'All'
                ? goals.length
                : goals.filter((g) => g.function === dept.key).length;
            const isSelected = selectedDept === dept.key;

            return (
              <button
                key={dept.key}
                onClick={() => handleDeptChange(dept.key)}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
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

        {/* Horizon Tabs (Quarters) */}
        <div className="flex items-center gap-1.5 self-end lg:self-auto">
          <div className="inline-flex p-0.5 rounded-lg bg-stone-100 border border-stone-200 text-xs">
            {QUARTERS.map((q) => (
              <button
                key={q.key}
                onClick={() => handleQuarterChange(q.key)}
                className={clsx(
                  'px-2.5 py-1 rounded-md font-semibold transition-all text-[11px]',
                  selectedQuarter === q.key
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                )}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. GANTT TIMELINE MATRIX (Single Viewport Containment)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        {/* Calendar Header */}
        <div className="border-b border-stone-200 bg-stone-50/95 sticky top-0 z-20">
          <div className="grid grid-cols-12 text-center text-xs divide-x divide-stone-200 border-b border-stone-200">
            <div className="col-span-3 py-1.5 bg-stone-100/70 font-bold text-stone-800 text-[11px]">
              Q1 (Jan - Mar)
            </div>
            <div className="col-span-3 py-1.5 bg-stone-100/70 font-bold text-stone-800 text-[11px]">
              Q2 (Apr - Jun)
            </div>
            <div className="col-span-3 py-1.5 bg-stone-100/70 font-bold text-stone-800 text-[11px]">
              Q3 (Jul - Sep)
            </div>
            <div className="col-span-3 py-1.5 bg-stone-100/70 font-bold text-stone-800 text-[11px]">
              Q4 (Oct - Dec)
            </div>
          </div>

          <div className="grid grid-cols-12 text-center text-[10px] font-mono divide-x divide-stone-200">
            {MONTHS.map((m) => (
              <div
                key={m.num}
                className={clsx(
                  'py-1 transition-colors',
                  m.num === 9 ? 'bg-amber-100/80 font-bold text-amber-950' : 'text-stone-600'
                )}
              >
                {m.name}
                {m.num === 9 && (
                  <span className="inline-block ml-1 text-[8px] font-sans font-bold text-amber-800">
                    Now
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Initiatives List (Paging guarantees 5 rows max) */}
        {visibleGoals.length === 0 ? (
          <div className="p-10 text-center text-stone-500 text-xs">
            No initiatives match the selected department and quarter horizon.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {visibleGoals.map((goal) => {
              const startPos = calculateMonthPosition(goal.start_date);
              const endPos = Math.max(startPos + 0.5, calculateMonthPosition(goal.end_date));
              const leftPercent = (startPos / 12) * 100;
              const widthPercent = Math.min(100 - leftPercent, ((endPos - startPos) / 12) * 100);

              const catConfig = CATEGORY_CONFIG[goal.function] || {
                label: goal.function,
                shortLabel: goal.function,
                icon: Layers,
              };

              let barColor = 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200';
              if (goal.status === 'Completed') {
                barColor = 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200';
              } else if (goal.status === 'In Progress') {
                barColor = 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200';
              }

              return (
                <div
                  key={goal.id}
                  onClick={() => onSelectGoal(goal)}
                  className="group flex flex-col md:flex-row items-stretch md:items-center justify-between p-3 bg-white hover:bg-stone-50/60 cursor-pointer transition-colors"
                  title="Click to redirect to initiative workspace"
                >
                  {/* Left Column: Metadata & Title (40%) */}
                  <div className="w-full md:w-5/12 pr-4 mb-2 md:mb-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        {catConfig.shortLabel}
                      </span>
                      <StatusBadge status={goal.status} />
                      {goal.accomplishment_status && (
                        <AccomplishmentBadge status={goal.accomplishment_status} />
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-stone-950 truncate transition-colors">
                      {goal.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                      <span>
                        {goal.start_date.slice(5)} → {goal.end_date.slice(5)}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        PIC: {goal.pic || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Timeline Bar on 12-Month Grid (60%) */}
                  <div className="w-full md:w-7/12 relative h-9 bg-stone-50/80 rounded-lg border border-stone-200/70 overflow-hidden flex items-center">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-12 divide-x divide-stone-200/40 pointer-events-none" />

                    {/* Today Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400/90 z-10 pointer-events-none"
                      style={{ left: `${(currentMonthPosition / 12) * 100}%` }}
                    />

                    {/* Active Span Bar */}
                    <div
                      className={clsx(
                        'absolute h-7 rounded px-2.5 flex items-center justify-between text-xs font-medium border shadow-2xs transition-all group-hover:shadow-xs',
                        barColor
                      )}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(widthPercent, 7)}%`,
                      }}
                    >
                      <span className="truncate text-[11px] font-semibold">{goal.title}</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold shrink-0 ml-1 text-stone-600">
                        <span>Workspace</span>
                        <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SINGLE VIEW PAGINATION CONTROLS
          ───────────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1 border-t border-stone-200">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-stone-500">
            Initiatives{' '}
            <strong className="text-stone-800">
              {filteredGoals.length > 0 ? startIndex + 1 : 0}–
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredGoals.length)}
            </strong>{' '}
            of {filteredGoals.length} (Page {validPage} of {totalPages})
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition shadow-2xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
