import React, { useState } from 'react';
import { Goal, MonthlyLog } from '@/lib/types';
import { Button } from '../ui/Button';
import { StatusBadge, CATEGORY_CONFIG } from '../ui/Badge';
import { ExternalLink, Check, Save, Layers } from 'lucide-react';
import clsx from 'clsx';

interface CadenceViewProps {
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
  onUpdateMonthlyLog: (logId: number, data: Partial<MonthlyLog>) => Promise<boolean>;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CadenceView({ goals, onSelectGoal, onUpdateMonthlyLog }: CadenceViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [editedLogs, setEditedLogs] = useState<Record<number, Partial<MonthlyLog>>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  const monthName = MONTHS[selectedMonth - 1];

  const goalLogs = goals.map((goal) => {
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
    return { goal, log };
  });

  const handleFieldChange = (logId: number, field: keyof MonthlyLog, value: string) => {
    setEditedLogs((prev) => ({
      ...prev,
      [logId]: {
        ...prev[logId],
        [field]: value,
      },
    }));
  };

  const handleSaveRow = async (logId: number, originalLog: MonthlyLog) => {
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
    <div className="space-y-5">
      {/* Month Picker Pills */}
      <div className="bg-white rounded-xl border border-stone-200 p-2 shadow-subtle overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {MONTHS.map((m, idx) => {
            const mNum = idx + 1;
            const isSelected = selectedMonth === mNum;
            const isCurrent = mNum === 9; // September 2026

            const completedCount = goals.filter((g) => {
              const l = g.monthly_logs?.find((log) => log.month_number === mNum);
              return l?.achievement_status === 'Completed';
            }).length;

            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(mNum)}
                className={clsx(
                  'flex flex-col items-center px-4 py-2 rounded-lg text-xs font-medium transition-all border',
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50/60 text-stone-700 border-stone-200 hover:bg-stone-100'
                )}
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  {m.slice(0, 3)}
                  {isCurrent && (
                    <span className={clsx('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-amber-400' : 'bg-amber-500')} />
                  )}
                </span>
                <span className={clsx('text-[10px] font-mono mt-0.5', isSelected ? 'text-stone-300' : 'text-stone-400')}>
                  {completedCount} done
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Briefing Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 font-mono">
              Monthly Progress Review
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900">
              {monthName} 2026
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Check deliverables, review active blockers, and assign next steps for each initiative.
          </p>
        </div>
      </div>

      {/* Cadence Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-stone-200">
            <thead className="bg-stone-50 text-stone-600 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 w-72">Initiative & Category</th>
                <th className="py-3 px-3 w-36">Status</th>
                <th className="py-3 px-3 w-64">Deliverable / Work Done</th>
                <th className="py-3 px-3 w-60">Blockers & Challenges</th>
                <th className="py-3 px-3 w-60">Next Steps</th>
                <th className="py-3 px-3 w-24 text-center">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {goalLogs.map(({ goal, log }) => {
                const catConfig = CATEGORY_CONFIG[goal.function] || { label: goal.function, shortLabel: goal.function, icon: Layers };
                const IconComponent = catConfig.icon;
                const currentEdits = editedLogs[log.id || 0] || {};
                const currentStatus = currentEdits.achievement_status ?? log.achievement_status;
                const currentLink = currentEdits.result_link ?? log.result_link;
                const currentChallenge = currentEdits.challenge ?? log.challenge;
                const currentHomework = currentEdits.homework ?? log.homework;

                const isDirty = (log.id && editedLogs[log.id]) !== undefined;
                const isSaving = savingId === log.id;
                const isSaved = savedId === log.id;
                const hasBlocker = currentChallenge && currentChallenge.trim() !== '-' && currentChallenge.trim() !== '';

                return (
                  <tr key={goal.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Goal Title */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-600 font-medium">
                          <IconComponent className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          <span>{catConfig.label}</span>
                        </span>
                        <button
                          onClick={() => onSelectGoal(goal)}
                          className="block text-xs font-bold text-stone-900 hover:text-stone-700 text-left line-clamp-2 transition-colors"
                        >
                          {goal.title}
                        </button>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-3 align-top">
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
                          'w-full px-2 py-1.5 rounded-lg text-xs font-semibold border outline-none focus:ring-2 focus:ring-stone-900',
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

                    {/* Deliverable / Result */}
                    <td className="py-3 px-3 align-top">
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
                        const targetUrl = log.result_url || (currentLink?.match(/https?:\/\/[^\s\n\r]+/)?.[0] ?? (currentLink?.startsWith('http') ? currentLink : ''));
                        if (!targetUrl) return null;
                        return (
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 hover:underline mt-1.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open Document
                          </a>
                        );
                      })()}
                    </td>

                    {/* Blockers */}
                    <td className="py-3 px-3 align-top">
                      <textarea
                        rows={2}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        value={currentChallenge}
                        onChange={(e) =>
                          handleFieldChange(log.id || 0, 'challenge', e.target.value)
                        }
                        placeholder="Any blockers or delays..."
                        className={clsx(
                          'w-full px-2 py-1 text-xs rounded border outline-none resize-none transition-all',
                          hasBlocker
                            ? 'border-amber-300 bg-amber-50/40 text-amber-900'
                            : 'border-stone-200 text-stone-700'
                        )}
                      />
                    </td>

                    {/* Next Steps */}
                    <td className="py-3 px-3 align-top">
                      <textarea
                        rows={2}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        value={currentHomework}
                        onChange={(e) =>
                          handleFieldChange(log.id || 0, 'homework', e.target.value)
                        }
                        placeholder="Actionable next step..."
                        className="w-full px-2 py-1 text-xs rounded border border-stone-200 focus:border-stone-400 focus:ring-1 focus:ring-stone-800 outline-none resize-none transition-all"
                      />
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-3 align-top text-center">
                      <Button
                        size="sm"
                        variant={isDirty ? 'primary' : 'outline'}
                        disabled={!isDirty}
                        isLoading={isSaving}
                        onClick={() => log.id && handleSaveRow(log.id, log)}
                        className={clsx('w-full', {
                          'bg-emerald-600 text-white border-emerald-600': isSaved,
                        })}
                      >
                        {isSaved ? <Check className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
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
    </div>
  );
}
