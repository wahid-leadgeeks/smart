import React, { useState, useMemo } from 'react';
import { Goal, MonthlyLog, DepartmentFunction } from '@/lib/types';
import { Button } from '../ui/Button';
import { CATEGORY_CONFIG } from '../ui/Badge';
import { ExternalLink, Check, Save, Layers, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface CadenceViewProps {
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
  onUpdateMonthlyLog: (logId: number, data: Partial<MonthlyLog>) => Promise<boolean>;
}

const ITEMS_PER_PAGE = 4;

const DEPARTMENTS: { key: DepartmentFunction | 'All'; label: string }[] = [
  { key: 'All', label: 'All Departments' },
  { key: 'Website Management', label: 'Website & SEO' },
  { key: 'Infrastructure Management', label: 'Cloud & Systems' },
  { key: 'Cybersecurity', label: 'Security & Privacy' },
  { key: 'Technology Optimization & Innovation', label: 'Automation & Tools' },
  { key: 'Others', label: 'Team & Talent' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CadenceView({ goals, onSelectGoal, onUpdateMonthlyLog }: CadenceViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [selectedDept, setSelectedDept] = useState<DepartmentFunction | 'All'>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editedLogs, setEditedLogs] = useState<Record<number, Partial<MonthlyLog>>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  const monthName = MONTHS[selectedMonth - 1];

  // Filter goals by department
  const filteredGoals = useMemo(() => {
    return selectedDept === 'All'
      ? goals
      : goals.filter((g) => g.function === selectedDept);
  }, [goals, selectedDept]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredGoals.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const visibleGoals = filteredGoals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDeptChange = (dept: DepartmentFunction | 'All') => {
    setSelectedDept(dept);
    setCurrentPage(1);
  };

  const handleFieldChange = (logId: number, field: keyof MonthlyLog, value: string) => {
    setEditedLogs((prev) => ({
      ...prev,
      [logId]: {
        ...prev[logId],
        [field]: value,
      },
    }));
  };

  const handleSaveRow = async (logId: number) => {
    const changes = editedLogs[logId];
    if (!changes) return;

    setSavingId(logId);
    const success = await onUpdateMonthlyLog(logId, changes);
    setSavingId(null);

    if (success) {
      setSavedId(logId);
      setTimeout(() => setSavedId(null), 2000);
      setEditedLogs((prev) => {
        const next = { ...prev };
        delete next[logId];
        return next;
      });
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in-50 duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. MONTH PICKER & DEPARTMENT LANES (Single View Controls)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Month Selector Pills */}
        <div className="bg-white rounded-xl border border-stone-200 p-1.5 shadow-subtle overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 min-w-max">
            {MONTHS.map((m, idx) => {
              const mNum = idx + 1;
              const isSelected = selectedMonth === mNum;
              const isCurrent = mNum === 9; // September 2026

              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(mNum)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1',
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-stone-50/70 text-stone-700 border-stone-200/80 hover:bg-stone-100'
                  )}
                >
                  <span>{m.slice(0, 3)}</span>
                  {isCurrent && (
                    <span
                      className={clsx(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-amber-400' : 'bg-amber-500'
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Department Lane Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-stone-200/70 border border-stone-200 gap-1 overflow-x-auto scrollbar-none self-start xl:self-auto">
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
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CADENCE TABLE (Max 4 items per page to prevent page scroll)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        <div className="px-4 py-2.5 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              {monthName} 2026 Monthly Cadence
            </span>
            <span className="text-stone-400 font-mono">·</span>
            <span className="text-stone-600 font-mono">
              Reviewing {visibleGoals.length} initiatives
            </span>
          </div>
          <span className="text-[11px] text-stone-500 font-mono">
            Directly edits PostgreSQL database &amp; syncs to Excel
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-stone-200">
            <thead className="bg-stone-100/70 text-stone-700 text-[10px] uppercase tracking-wider font-bold">
              <tr>
                <th className="py-2.5 px-3.5 w-64">Initiative &amp; Function</th>
                <th className="py-2.5 px-2.5 w-32">Status</th>
                <th className="py-2.5 px-2.5 w-56">Deliverable / Work Done</th>
                <th className="py-2.5 px-2.5 w-52">Active Blockers</th>
                <th className="py-2.5 px-2.5 w-52">Next Step</th>
                <th className="py-2.5 px-2.5 w-24 text-center">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {visibleGoals.map((goal) => {
                const log = goal.monthly_logs?.find((l) => l.month_number === selectedMonth) || {
                  id: 0,
                  goal_id: goal.id,
                  month_number: selectedMonth,
                  month_name: monthName,
                  achievement_status: 'Not started',
                  result_link: '',
                  result_url: '',
                  challenge: '-',
                  homework: '-',
                };

                const catConfig = CATEGORY_CONFIG[goal.function] || {
                  label: goal.function,
                  shortLabel: goal.function,
                  icon: Layers,
                };
                const IconComponent = catConfig.icon;

                const currentEdits = editedLogs[log.id || 0] || {};
                const currentStatus = currentEdits.achievement_status ?? log.achievement_status;
                const currentLink = currentEdits.result_link ?? log.result_link;
                const currentChallenge = currentEdits.challenge ?? log.challenge;
                const currentHomework = currentEdits.homework ?? log.homework;

                const isDirty = (log.id && editedLogs[log.id]) !== undefined;
                const isSaving = savingId === log.id;
                const isSaved = savedId === log.id;
                const hasBlocker =
                  currentChallenge &&
                  currentChallenge.trim() !== '-' &&
                  currentChallenge.trim() !== '';

                return (
                  <tr key={goal.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Goal Title & Redirect Button */}
                    <td className="py-2.5 px-3.5 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-medium">
                          <IconComponent className="w-3 h-3 text-stone-500 shrink-0" />
                          <span>{catConfig.shortLabel}</span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                          {goal.title}
                        </h4>
                        <button
                          onClick={() => onSelectGoal(goal)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-700 hover:text-stone-950 transition-colors pt-0.5"
                        >
                          <span>Open Workspace</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-2.5 px-2.5 align-top">
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          handleFieldChange(
                            log.id || 0,
                            'achievement_status',
                            e.target.value as any
                          )
                        }
                        className={clsx(
                          'w-full px-2 py-1 rounded-lg text-xs font-semibold border outline-none focus:ring-1 focus:ring-stone-900',
                          currentStatus === 'Completed'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : currentStatus === 'In Progress'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-white text-stone-700 border-stone-200'
                        )}
                      >
                        <option value="Not started">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>

                    {/* Deliverable / Work Done */}
                    <td className="py-2.5 px-2.5 align-top">
                      <textarea
                        rows={2}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        value={currentLink}
                        onChange={(e) =>
                          handleFieldChange(log.id || 0, 'result_link', e.target.value)
                        }
                        placeholder="Deliverable details..."
                        className="w-full px-2 py-1 text-xs rounded border border-stone-200 focus:border-stone-400 focus:ring-1 focus:ring-stone-800 outline-none resize-none transition-all"
                      />
                      {(() => {
                        const targetUrl =
                          log.result_url ||
                          (currentLink?.match(/https?:\/\/[^\s\n\r]+/)?.[0] ??
                            (currentLink?.startsWith('http') ? currentLink : ''));
                        if (!targetUrl) return null;
                        return (
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 hover:underline mt-0.5"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Document</span>
                          </a>
                        );
                      })()}
                    </td>

                    {/* Challenges / Blockers */}
                    <td className="py-2.5 px-2.5 align-top">
                      <textarea
                        rows={2}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        value={currentChallenge}
                        onChange={(e) =>
                          handleFieldChange(log.id || 0, 'challenge', e.target.value)
                        }
                        placeholder="Blockers or delays..."
                        className={clsx(
                          'w-full px-2 py-1 text-xs rounded border outline-none resize-none transition-all',
                          hasBlocker
                            ? 'border-amber-300 bg-amber-50/50 text-amber-950 font-medium'
                            : 'border-stone-200 text-stone-700'
                        )}
                      />
                    </td>

                    {/* Next Steps */}
                    <td className="py-2.5 px-2.5 align-top">
                      <textarea
                        rows={2}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        value={currentHomework}
                        onChange={(e) =>
                          handleFieldChange(log.id || 0, 'homework', e.target.value)
                        }
                        placeholder="Actionable milestone..."
                        className="w-full px-2 py-1 text-xs rounded border border-stone-200 focus:border-stone-400 focus:ring-1 focus:ring-stone-800 outline-none resize-none transition-all"
                      />
                    </td>

                    {/* Save Action Button */}
                    <td className="py-2.5 px-2.5 align-top text-center">
                      <Button
                        size="sm"
                        variant={isDirty ? 'primary' : 'outline'}
                        disabled={!isDirty}
                        isLoading={isSaving}
                        onClick={() => log.id && handleSaveRow(log.id)}
                        className={clsx('w-full', {
                          'bg-emerald-600 text-white border-emerald-600': isSaved,
                        })}
                      >
                        {isSaved ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[11px]">{isSaved ? 'Saved' : 'Save'}</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
