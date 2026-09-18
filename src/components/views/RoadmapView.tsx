import React from 'react';
import { Goal } from '@/lib/types';
import { StatusBadge, AccomplishmentBadge, CATEGORY_CONFIG } from '../ui/Badge';
import clsx from 'clsx';
import { ChevronRight, Calendar, Layers } from 'lucide-react';

interface RoadmapViewProps {
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
}

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
    return Math.max(0, Math.min(12, (m - 1) + (d / 31)));
  }
  return 1;
}

export function RoadmapView({ goals, onSelectGoal }: RoadmapViewProps) {
  // Group goals by department function
  const grouped = goals.reduce((acc, goal) => {
    if (!acc[goal.function]) acc[goal.function] = [];
    acc[goal.function].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // Current month marker: September 2026 (index 8.45)
  const currentMonthPosition = 8.45;

  return (
    <div className="space-y-4">
      {/* Friendly Timeline Guide */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white border border-stone-200 shadow-subtle text-xs gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-stone-600" />
          <span className="font-semibold text-stone-900">2026 Execution Horizon:</span>
          <span className="text-stone-600">Showing when each IT initiative starts, runs, and wraps up.</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            Upcoming
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        {/* Calendar Quarters Header */}
        <div className="border-b border-stone-200 bg-stone-50/90 sticky top-0 z-20">
          <div className="grid grid-cols-12 text-center text-xs divide-x divide-stone-200 border-b border-stone-200">
            <div className="col-span-3 py-2 bg-stone-100/70 font-bold text-stone-800">
              Q1 (Jan - Mar) <span className="block text-[10px] font-normal text-stone-500">Foundations & Assessments</span>
            </div>
            <div className="col-span-3 py-2 bg-stone-100/70 font-bold text-stone-800">
              Q2 (Apr - Jun) <span className="block text-[10px] font-normal text-stone-500">Migrations & Rollouts</span>
            </div>
            <div className="col-span-3 py-2 bg-stone-100/70 font-bold text-stone-800">
              Q3 (Jul - Sep) <span className="block text-[10px] font-normal text-stone-500">Enhancements & Security</span>
            </div>
            <div className="col-span-3 py-2 bg-stone-100/70 font-bold text-stone-800">
              Q4 (Oct - Dec) <span className="block text-[10px] font-normal text-stone-500">Optimization & Review</span>
            </div>
          </div>

          <div className="grid grid-cols-12 text-center text-[11px] font-mono divide-x divide-stone-200">
            {MONTHS.map((m) => (
              <div
                key={m.num}
                className={clsx(
                  'py-1.5 transition-colors',
                  m.num === 9 ? 'bg-amber-100/80 font-bold text-amber-950' : 'text-stone-600'
                )}
              >
                {m.name}
                {m.num === 9 && (
                  <span className="block text-[9px] font-sans font-semibold text-amber-700">
                    Now
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap Swimlanes */}
        <div className="divide-y divide-stone-200">
          {Object.entries(grouped).map(([fn, fnGoals]) => {
            const catConfig = CATEGORY_CONFIG[fn] || { label: fn, shortLabel: fn, icon: Layers };
            const IconComponent = catConfig.icon;

            return (
              <div key={fn} className="p-4 bg-white hover:bg-stone-50/30 transition-colors">
                {/* Category Header with SVG */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded bg-stone-100 flex items-center justify-center text-stone-700">
                    <IconComponent className="w-3.5 h-3.5 text-stone-700" />
                  </div>
                  <h3 className="text-xs font-bold text-stone-900 tracking-tight">
                    {catConfig.label}
                  </h3>
                  <span className="text-xs text-stone-400 font-mono">
                    ({fnGoals.length} goals)
                  </span>
                </div>

                {/* Timeline Items */}
                <div className="space-y-2.5 relative">
                  {/* Today Marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 pointer-events-none"
                    style={{ left: `${(currentMonthPosition / 12) * 100}%` }}
                  />

                  {fnGoals.map((goal) => {
                    const startPos = calculateMonthPosition(goal.start_date);
                    const endPos = Math.max(startPos + 0.5, calculateMonthPosition(goal.end_date));
                    const leftPercent = (startPos / 12) * 100;
                    const widthPercent = Math.min(100 - leftPercent, ((endPos - startPos) / 12) * 100);

                    let barColor = 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200';
                    if (goal.status === 'Completed') {
                      barColor = 'bg-emerald-100/90 text-emerald-950 border-emerald-300 hover:bg-emerald-200/80';
                    } else if (goal.status === 'In Progress') {
                      barColor = 'bg-amber-100/90 text-amber-950 border-amber-300 hover:bg-amber-200/80';
                    }

                    return (
                      <div
                        key={goal.id}
                        onClick={() => onSelectGoal(goal)}
                        className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-2 rounded-lg border border-stone-200/80 bg-white hover:border-stone-400 hover:shadow-subtle cursor-pointer transition-all"
                      >
                        {/* Title & Metadata */}
                        <div className="w-full md:w-5/12 pr-3 mb-2 md:mb-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <StatusBadge status={goal.status} />
                            {goal.accomplishment_status && (
                              <AccomplishmentBadge status={goal.accomplishment_status} />
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-stone-900 group-hover:text-stone-950 transition-colors line-clamp-1">
                            {goal.title}
                          </h4>
                          <div className="text-[11px] text-stone-500 mt-0.5 font-mono">
                            {goal.start_date.slice(5)} → {goal.end_date.slice(5)}
                          </div>
                        </div>

                        {/* Interactive Timeline Bar */}
                        <div className="w-full md:w-7/12 relative h-9 bg-stone-50 rounded-md border border-stone-200/70 overflow-hidden flex items-center">
                          {/* Background Grid */}
                          <div className="absolute inset-0 grid grid-cols-12 divide-x divide-stone-200/40 pointer-events-none" />

                          {/* Span Bar */}
                          <div
                            className={clsx(
                              'absolute h-7 rounded px-2.5 flex items-center justify-between text-xs font-medium border shadow-2xs transition-all',
                              barColor
                            )}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${Math.max(widthPercent, 6)}%`,
                            }}
                          >
                            <span className="truncate text-[11px] font-semibold">
                              {goal.title}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity ml-1" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
