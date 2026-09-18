import React, { useState, useEffect } from 'react';
import { Goal, MonthlyLog, GoalStatus, AccomplishmentStatus, DepartmentFunction, GoalType } from '@/lib/types';
import { Button } from '../ui/Button';
import { StatusBadge, AccomplishmentBadge, GoalTypeBadge, CATEGORY_CONFIG } from '../ui/Badge';
import {
  X,
  Check,
  Save,
  Target,
  Shield,
  Calendar,
  FileText,
  CheckCircle2,
  Edit3,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';

interface GoalDrawerProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGoal: Goal) => Promise<boolean>;
  onUpdateMonthlyLog: (logId: number, data: Partial<MonthlyLog>) => Promise<boolean>;
}

type TabType = 'overview' | 'cadence' | 'technical';

export function GoalDrawer({
  goal,
  isOpen,
  onClose,
  onSave,
  onUpdateMonthlyLog,
}: GoalDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Goal>>({});
  const [monthlyLogs, setMonthlyLogs] = useState<MonthlyLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({ ...goal });
      setMonthlyLogs(goal.monthly_logs || []);
      setActiveTab('overview');
      setIsEditing(false);
    }
  }, [goal]);

  if (!isOpen || !goal) return null;

  const catConfig = CATEGORY_CONFIG[goal.function] || { label: goal.function, shortLabel: goal.function, icon: Layers };
  const IconComponent = catConfig.icon;

  const handleFieldChange = (field: keyof Goal, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMonthlyChange = (logId: number, field: keyof MonthlyLog, value: any) => {
    setMonthlyLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, [field]: value } : l))
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const updated = { ...goal, ...formData } as Goal;
    const success = await onSave(updated);

    for (const log of monthlyLogs) {
      if (log.id) {
        await onUpdateMonthlyLog(log.id, {
          achievement_status: log.achievement_status,
          result_link: log.result_link,
          result_url: log.result_url,
          challenge: log.challenge,
          homework: log.homework,
        });
      }
    }

    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // Helper to split target text into clean bullet points
  const formatBullets = (rawText?: string) => {
    if (!rawText) return [];
    return rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  };

  const targetBullets = formatBullets(formData.target ?? goal.target);
  const actionBullets = formatBullets(formData.action_plan ?? goal.action_plan);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-drawer flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-200 bg-stone-50/80">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white text-stone-800 border border-stone-200 shadow-2xs">
                  <IconComponent className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                  <span>{catConfig.label}</span>
                </span>
                <StatusBadge status={formData.status || goal.status} />
                <GoalTypeBadge type={formData.goal_type || goal.goal_type} />
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
              {formData.title || goal.title}
            </h2>

            {/* Strategic Alignment Reference */}
            {goal.company_focus_ref && (
              <p className="text-xs text-stone-600 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                <span>Supports Company Goal: <strong className="text-stone-800">{goal.company_focus_ref}</strong></span>
              </p>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between mt-4 border-b border-stone-200 -mb-5 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all',
                    activeTab === 'overview'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Executive Summary
                </button>

                <button
                  onClick={() => setActiveTab('cadence')}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all',
                    activeTab === 'cadence'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  )}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Monthly Updates ({monthlyLogs.length})
                </button>

                <button
                  onClick={() => setActiveTab('technical')}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all',
                    activeTab === 'technical'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  )}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Technical & SWOT
                </button>
              </div>

              {/* Edit Mode Toggle Button */}
              {activeTab === 'overview' && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors mb-1 shadow-2xs',
                    isEditing
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                  )}
                >
                  {isEditing ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      View Mode
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                      Edit Details
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {activeTab === 'overview' && (
              <>
                {/* 1. READ / EXECUTIVE PRESENTATION MODE */}
                {!isEditing ? (
                  <div className="space-y-6">
                    {/* Key Timing & Status Pill Box */}
                    <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold block mb-0.5">
                          Execution Timeline
                        </span>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-500" />
                          <span>{formData.start_date || goal.start_date}</span>
                          <span className="text-stone-400">→</span>
                          <span>{formData.end_date || goal.end_date}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold block mb-0.5">
                          Assigned Lead
                        </span>
                        <span className="text-xs font-semibold text-stone-800">
                          {formData.pic || goal.pic || 'IT Team'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold block mb-0.5">
                          Status
                        </span>
                        <StatusBadge status={formData.status || goal.status} />
                      </div>
                    </div>

                    {/* Purpose & Business Value */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-700">
                        Purpose & Business Value
                      </h3>
                      <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
                        <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                          {formData.specific_statement || goal.specific_statement}
                        </p>
                      </div>
                    </div>

                    {/* Target Outcome */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-stone-600" />
                        Expected Outcome & Target
                      </h3>
                      <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-200/70 space-y-2">
                        {targetBullets.length > 0 ? (
                          targetBullets.map((bullet, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-800 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{bullet.replace(/^-\s*/, '')}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-stone-700">
                            {formData.target || goal.target}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Plan */}
                    {actionBullets.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-700">
                          Action Plan & Execution Strategy
                        </h3>
                        <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                          {actionBullets.map((bullet, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-stone-700 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0 mt-2" />
                              <span>{bullet.replace(/^-\s*/, '')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 2. EDIT MODE (Spellcheck disabled, clean accessible fields) */
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <span className="text-xs font-semibold text-stone-700">
                        Editing Goal Attributes
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        Changes will persist to database
                      </span>
                    </div>

                    {/* Status & Timing Box */}
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            Current Status
                          </label>
                          <select
                            value={formData.status || goal.status}
                            onChange={(e) => handleFieldChange('status', e.target.value as GoalStatus)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-stone-900"
                          >
                            <option value="Not started">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Postponed">Postponed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={formData.start_date || goal.start_date}
                            onChange={(e) => handleFieldChange('start_date', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            Target Completion
                          </label>
                          <input
                            type="date"
                            value={formData.end_date || goal.end_date}
                            onChange={(e) => handleFieldChange('end_date', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Plain English Purpose Input (spellCheck=false) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-900 block">
                        Purpose & Business Value (Why we are doing this)
                      </label>
                      <textarea
                        rows={4}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        value={formData.specific_statement ?? goal.specific_statement}
                        onChange={(e) => handleFieldChange('specific_statement', e.target.value)}
                        className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:ring-2 focus:ring-stone-900 outline-none leading-relaxed shadow-2xs"
                      />
                    </div>

                    {/* Target Outcome Input (spellCheck=false) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-900 block">
                        Expected Outcome & Target
                      </label>
                      <textarea
                        rows={3}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        value={formData.target ?? goal.target}
                        onChange={(e) => handleFieldChange('target', e.target.value)}
                        className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:ring-2 focus:ring-stone-900 outline-none leading-relaxed shadow-2xs"
                      />
                    </div>

                    {/* Action Plan Input (spellCheck=false) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-900 block">
                        Action Plan (What will be done)
                      </label>
                      <textarea
                        rows={3}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        value={formData.action_plan ?? goal.action_plan}
                        onChange={(e) => handleFieldChange('action_plan', e.target.value)}
                        className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:ring-2 focus:ring-stone-900 outline-none leading-relaxed shadow-2xs"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'cadence' && (
              <div className="space-y-4">
                <p className="text-xs text-stone-600">
                  Track monthly results, deliverables, challenges, and homework for this specific initiative.
                </p>

                <div className="space-y-3">
                  {monthlyLogs.map((log) => (
                    <div
                      key={log.month_number}
                      className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">
                          {log.month_number}. {log.month_name} 2026
                        </span>

                        <select
                          value={log.achievement_status}
                          onChange={(e) =>
                            handleMonthlyChange(
                              log.id || 0,
                              'achievement_status',
                              e.target.value
                            )
                          }
                          className={clsx(
                            'px-2 py-1 rounded text-xs font-semibold border outline-none',
                            log.achievement_status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : log.achievement_status === 'In Progress'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-stone-50 text-stone-700 border-stone-200'
                          )}
                        >
                          <option value="Not started">Scheduled</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[10px] font-semibold text-stone-500">
                              Deliverable Link / Work Done
                            </label>
                            {(() => {
                              const targetUrl = log.result_url || (log.result_link?.match(/https?:\/\/[^\s\n\r]+/)?.[0] ?? (log.result_link?.startsWith('http') ? log.result_link : ''));
                              if (!targetUrl) return null;
                              return (
                                <a
                                  href={targetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  Open
                                </a>
                              );
                            })()}
                          </div>
                          <input
                            type="text"
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="off"
                            value={log.result_link || ''}
                            onChange={(e) =>
                              handleMonthlyChange(log.id || 0, 'result_link', e.target.value)
                            }
                            placeholder="Deliverable or document..."
                            className="w-full px-2 py-1 rounded border border-stone-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-stone-500 block mb-0.5">
                            Blockers Encountered
                          </label>
                          <input
                            type="text"
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="off"
                            value={log.challenge || ''}
                            onChange={(e) =>
                              handleMonthlyChange(log.id || 0, 'challenge', e.target.value)
                            }
                            placeholder="Challenges or blockers..."
                            className="w-full px-2 py-1 rounded border border-stone-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-stone-500 block mb-0.5">
                            Next Steps
                          </label>
                          <input
                            type="text"
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="off"
                            value={log.homework || ''}
                            onChange={(e) =>
                              handleMonthlyChange(log.id || 0, 'homework', e.target.value)
                            }
                            placeholder="Next milestones..."
                            className="w-full px-2 py-1 rounded border border-stone-200 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="space-y-5">
                <p className="text-xs text-stone-600">
                  Engineering specifications, SWOT risk assessment, and resource availability for IT team leads.
                </p>

                {/* SWOT Matrix with spellCheck=false */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
                    <label className="text-xs font-bold text-emerald-900 block mb-1">
                      Strengths
                    </label>
                    <textarea
                      rows={4}
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      value={formData.strengths ?? goal.strengths}
                      onChange={(e) => handleFieldChange('strengths', e.target.value)}
                      className="w-full p-2 rounded border border-emerald-300 bg-white text-stone-800 text-xs outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200">
                    <label className="text-xs font-bold text-amber-900 block mb-1">
                      Weaknesses
                    </label>
                    <textarea
                      rows={4}
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      value={formData.weaknesses ?? goal.weaknesses}
                      onChange={(e) => handleFieldChange('weaknesses', e.target.value)}
                      className="w-full p-2 rounded border border-amber-300 bg-white text-stone-800 text-xs outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200">
                    <label className="text-xs font-bold text-blue-900 block mb-1">
                      Opportunities
                    </label>
                    <textarea
                      rows={4}
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      value={formData.opportunities ?? goal.opportunities}
                      onChange={(e) => handleFieldChange('opportunities', e.target.value)}
                      className="w-full p-2 rounded border border-blue-300 bg-white text-stone-800 text-xs outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200">
                    <label className="text-xs font-bold text-rose-900 block mb-1">
                      Threats
                    </label>
                    <textarea
                      rows={4}
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      value={formData.threats ?? goal.threats}
                      onChange={(e) => handleFieldChange('threats', e.target.value)}
                      className="w-full p-2 rounded border border-rose-300 bg-white text-stone-800 text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Resource Checklist */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-stone-800">
                    Resource Readiness
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['budget', 'hr', 'time', 'tech'] as const).map((res) => {
                      const key = `${res}_available` as keyof Goal;
                      const val = (formData[key] || goal[key]) === 'YES';
                      return (
                        <button
                          key={res}
                          type="button"
                          onClick={() => handleFieldChange(key, val ? 'NO' : 'YES')}
                          className={clsx(
                            'p-2 rounded border text-center transition-all',
                            val
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                              : 'bg-white text-stone-500 border-stone-200'
                          )}
                        >
                          <span className="text-[10px] uppercase font-bold block">{res}</span>
                          <span className="text-xs">{val ? 'Available' : 'Needed'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  onClick={handleSaveAll}
                  className={clsx({
                    'bg-emerald-600 border-emerald-600 hover:bg-emerald-700': saveSuccess,
                  })}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                Edit Goal
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
