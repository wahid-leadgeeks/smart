import React from 'react';
import { Goal } from '@/lib/types';
import { StatusBadge, AccomplishmentBadge, GoalTypeBadge, CATEGORY_CONFIG } from '../ui/Badge';
import { Calendar, Target, ArrowRight, Layers } from 'lucide-react';
import clsx from 'clsx';

interface BoardViewProps {
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
}

export function BoardView({ goals, onSelectGoal }: BoardViewProps) {
  // Group goals by department function
  const grouped = goals.reduce((acc, goal) => {
    if (!acc[goal.function]) acc[goal.function] = [];
    acc[goal.function].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

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

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([fn, fnGoals]) => {
        const catConfig = CATEGORY_CONFIG[fn] || { label: fn, shortLabel: fn, icon: Layers };
        const IconComponent = catConfig.icon;
        const completedInCat = fnGoals.filter((g) => g.status === 'Completed').length;

        return (
          <section key={fn} className="space-y-4">
            {/* Section Header with SVG Icon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200/80 pb-2.5 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shrink-0">
                  <IconComponent className="w-4 h-4 text-stone-800" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-stone-900 tracking-tight">
                    {catConfig.label}
                  </h2>
                  <span className="text-xs text-stone-400 font-mono">
                    ({fnGoals.length})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                  {completedInCat} of {fnGoals.length} completed
                </span>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fnGoals.map((goal) => {
                const friendlyPurpose = getFriendlyPurpose(goal.specific_statement);
                const isBreakthrough = goal.goal_type === 'Breakthrough';

                return (
                  <div
                    key={goal.id}
                    onClick={() => onSelectGoal(goal)}
                    className={clsx(
                      'group relative flex flex-col justify-between p-5 rounded-xl bg-white border hover:border-stone-400 hover:shadow-elevated transition-all duration-150 cursor-pointer text-left',
                      isBreakthrough
                        ? 'border-stone-200 border-l-[3.5px] border-l-indigo-600 shadow-subtle'
                        : 'border-stone-200 shadow-subtle'
                    )}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <StatusBadge status={goal.status} />
                          <GoalTypeBadge type={goal.goal_type} />
                        </div>
                        {goal.accomplishment_status && (
                          <AccomplishmentBadge status={goal.accomplishment_status} />
                        )}
                      </div>

                      {/* Goal Title */}
                      <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-950 mb-2 leading-snug">
                        {goal.title}
                      </h3>

                      {/* Plain English Purpose / Why it matters */}
                      {friendlyPurpose && (
                        <p className="text-xs text-stone-600 line-clamp-2 mb-3 leading-relaxed">
                          {friendlyPurpose}
                        </p>
                      )}

                      {/* Target Outcome */}
                      {goal.target && (
                        <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 mb-3">
                          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-stone-600 mb-1">
                            <Target className="w-3 h-3 text-stone-500" />
                            Target Outcome
                          </div>
                          <p className="text-xs text-stone-700 line-clamp-2 font-medium">
                            {goal.target.replace(/^-\s*/, '')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-stone-100 space-y-2">
                      {/* Strategic Linkage */}
                      {goal.company_focus_ref && (
                        <div className="text-[11px] text-stone-500 truncate flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                          <span className="truncate">Supports: {goal.company_focus_ref}</span>
                        </div>
                      )}

                      {/* Meta Footer */}
                      <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                        <span className="flex items-center gap-1 text-[11px] font-mono">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {goal.start_date.slice(5)} → {goal.end_date.slice(5)}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-800 group-hover:text-stone-950 group-hover:translate-x-0.5 transition-transform">
                          Details
                          <ArrowRight className="w-3 h-3 text-stone-500" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
