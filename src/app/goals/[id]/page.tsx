'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Goal,
  MonthlyLog,
  GoalStatus,
  AccomplishmentStatus,
  DepartmentFunction,
  GoalType,
} from '@/lib/types';
import {
  StatusBadge,
  AccomplishmentBadge,
  GoalTypeBadge,
  CATEGORY_CONFIG,
} from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import {
  ArrowLeft,
  Calendar,
  Target,
  Edit3,
  Save,
  Check,
  CheckCircle2,
  Clock,
  CalendarDays,
  ExternalLink,
  Layers,
  Users,
  Briefcase,
  Shield,
  Loader2,
  Sparkles,
  Building2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';

type DetailTab = 'overview' | 'cadence' | 'technical';

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params?.id ? String(params.id) : '';

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Goal>>({});
  const [monthlyLogs, setMonthlyLogs] = useState<MonthlyLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch goal data on load
  useEffect(() => {
    if (!goalId) return;

    setLoading(true);
    fetch(`/api/goals/${goalId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Goal not found');
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          setGoal(data.data);
          setFormData(data.data);
          setMonthlyLogs(data.data.monthly_logs || []);
        } else {
          setError(data.error || 'Failed to load initiative');
        }
      })
      .catch((err) => setError(err.message || 'Error loading goal'))
      .finally(() => setLoading(false));
  }, [goalId]);

  const handleFieldChange = (field: keyof Goal, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMonthlyChange = (logId: number, field: keyof MonthlyLog, value: any) => {
    setMonthlyLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, [field]: value } : l))
    );
  };

  const handleSave = async () => {
    if (!goal) return;
    try {
      setIsSaving(true);
      // Save goal core details
      const updatedGoalData = { ...goal, ...formData };
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGoalData),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update goal');
      }

      // Save monthly log changes
      for (const log of monthlyLogs) {
        if (log.id) {
          await fetch(`/api/monthly/${log.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              achievement_status: log.achievement_status,
              result_link: log.result_link,
              challenge: log.challenge,
              homework: log.homework,
            }),
          });
        }
      }

      setGoal(data.data);
      setFormData(data.data);
      setIsEditing(false);
      setToast({ message: 'Initiative updates saved successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Error saving changes', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-stone-700" />
        <span className="text-xs font-mono text-stone-500">Loading initiative specifications...</span>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] p-8 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-card max-w-md w-full space-y-4">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-stone-900">Initiative Not Found</h2>
          <p className="text-xs text-stone-600">{error || 'Could not find the requested initiative ID.'}</p>
          <Button variant="primary" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Goals Overview</span>
          </Button>
        </div>
      </div>
    );
  }

  const catConfig = CATEGORY_CONFIG[goal.function] || { label: goal.function, shortLabel: goal.function, icon: Layers };
  const CategoryIcon = catConfig.icon;

  const targetBullets = (goal.target || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col text-[#1C1917]">
      {/* Top Global Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Back Button & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-all shadow-2xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
              <span>Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-stone-200 shrink-0" />

            <nav className="flex items-center gap-1.5 text-xs text-stone-500 truncate font-medium">
              <span className="shrink-0 font-mono">LeadGeeks Inc.</span>
              <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="shrink-0 font-mono">IT 2026</span>
              <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="truncate text-stone-900 font-semibold">{goal.title}</span>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(goal);
                    setMonthlyLogs(goal.monthly_logs || []);
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                <span>Edit Initiative</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Executive Header Banner */}
        <section className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200 shadow-card space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                <CategoryIcon className="w-3.5 h-3.5 text-stone-600" />
                <span>{catConfig.label}</span>
              </span>
              <StatusBadge status={isEditing ? formData.status || goal.status : goal.status} />
              <GoalTypeBadge type={isEditing ? formData.goal_type || goal.goal_type : goal.goal_type} />
              {goal.accomplishment_status && (
                <AccomplishmentBadge status={goal.accomplishment_status} />
              )}
            </div>

            <div className="text-xs font-mono text-stone-500 self-start md:self-auto">
              Initiative #{goal.id} · Row {goal.row_number}
            </div>
          </div>

          {/* Title */}
          <div>
            {isEditing ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Initiative Title
                </label>
                <input
                  type="text"
                  value={formData.title ?? goal.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full text-xl font-bold text-stone-900 border border-stone-300 rounded-lg p-2.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            ) : (
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 tracking-tight leading-tight">
                {goal.title}
              </h1>
            )}

            {/* Strategic Alignment Note */}
            {goal.company_focus_ref && (
              <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-stone-700 bg-amber-50/70 px-3 py-1.5 rounded-lg border border-amber-200/80 w-fit">
                <Target className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong className="text-amber-900">Corporate Strategy Impact:</strong> {goal.company_focus_ref}
                </span>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">PIC Lead</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.pic ?? goal.pic}
                  onChange={(e) => handleFieldChange('pic', e.target.value)}
                  className="w-full mt-1 p-1 text-xs border rounded bg-stone-50"
                />
              ) : (
                <span className="font-bold font-mono text-stone-900">{goal.pic || '—'}</span>
              )}
            </div>

            <div>
              <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">Department Owner</span>
              <span className="font-medium text-stone-800">{goal.owner || '—'}</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">Execution Timeline</span>
              <span className="font-mono text-stone-800">
                {goal.start_date || '2026-01-01'} → {goal.end_date || '2026-12-31'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">Cadence Period</span>
              <span className="font-medium text-stone-800">{goal.period || 'Annual'}</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">Complexity</span>
              <span className="font-medium text-stone-800">{goal.complexity || 'Moderate'}</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">Execution Frequency</span>
              <span className="font-medium text-stone-800">{goal.frequency || 'Quarterly'}</span>
            </div>
          </div>
        </section>

        {/* View Mode Navigation Tabs (Spacious & Full-Width) */}
        <div className="flex items-center gap-1.5 border-b border-stone-200 pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={clsx(
              'px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2',
              activeTab === 'overview'
                ? 'border-stone-900 text-stone-900 bg-white/60 rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/50 rounded-t-lg'
            )}
          >
            <FileText className="w-4 h-4 text-stone-600" />
            <span>Overview &amp; Action Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('cadence')}
            className={clsx(
              'px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2',
              activeTab === 'cadence'
                ? 'border-stone-900 text-stone-900 bg-white/60 rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/50 rounded-t-lg'
            )}
          >
            <Calendar className="w-4 h-4 text-stone-600" />
            <span>12-Month Cadence Review ({monthlyLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('technical')}
            className={clsx(
              'px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2',
              activeTab === 'technical'
                ? 'border-stone-900 text-stone-900 bg-white/60 rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/50 rounded-t-lg'
            )}
          >
            <ShieldCheck className="w-4 h-4 text-stone-600" />
            <span>Engineering Specs &amp; SWOT Matrix</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ACTION PLAN */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Purpose & Deliverables */}
            <div className="lg:col-span-8 space-y-6">
              {/* Core Purpose & Specific Statement */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-card space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  1. Specific Objective &amp; Purpose
                </span>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={formData.specific_statement ?? goal.specific_statement}
                    onChange={(e) => handleFieldChange('specific_statement', e.target.value)}
                    className="w-full p-3 text-xs leading-relaxed border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                  />
                ) : (
                  <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
                    {goal.specific_statement || 'No specific statement documented.'}
                  </p>
                )}
              </div>

              {/* Expected Target Outcome */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-card space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  2. Measurable Target &amp; Outcome
                </span>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={formData.target ?? goal.target}
                    onChange={(e) => handleFieldChange('target', e.target.value)}
                    className="w-full p-3 text-xs leading-relaxed border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                  />
                ) : targetBullets.length > 0 ? (
                  <ul className="space-y-2">
                    {targetBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {goal.target || 'No target outcome documented.'}
                  </p>
                )}
              </div>

              {/* Action Plan */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-card space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  3. Action Plan (Execution Strategy)
                </span>
                {isEditing ? (
                  <textarea
                    rows={5}
                    value={formData.action_plan ?? goal.action_plan}
                    onChange={(e) => handleFieldChange('action_plan', e.target.value)}
                    className="w-full p-3 text-xs leading-relaxed border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                  />
                ) : (
                  <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                    {goal.action_plan || 'No execution action plan documented.'}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Operational Details & Collaboration */}
            <div className="lg:col-span-4 space-y-6">
              {/* Collaboration Card */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-card space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-stone-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    Cross-Department Collaboration
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[11px]">Collaborating Departments</span>
                    <span className="font-semibold text-stone-800">
                      {goal.collaborators || 'Internal IT Department Only'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px]">Collaboration Type</span>
                    <span className="font-medium text-stone-700">
                      {goal.collaboration_flag === 'Yes' ? 'Active Cross-Functional Effort' : 'Departmental Initiative'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operational Governance */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-card space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-stone-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    Governance &amp; Notes
                  </span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  {goal.notes || 'No administrative notes or mid-year adjustments recorded.'}
                </p>
                {goal.half_adjustment && (
                  <div className="pt-2 border-t border-stone-100 text-[11px]">
                    <span className="font-semibold text-stone-700">Half-Year Adjustment:</span> {goal.half_adjustment}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 12-MONTH CADENCE REVIEW (Spacious Full Width Grid, NO Cramped Box!) */}
        {activeTab === 'cadence' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <p className="text-stone-600">
                Track and record deliverables, work links, challenges, and next milestones for all 12 operational months of 2026.
              </p>
              <div className="flex items-center gap-3 font-mono text-stone-500 shrink-0">
                <span>Total Logs: {monthlyLogs.length}</span>
              </div>
            </div>

            {/* 12 Months Cards Grid */}
            <div className="space-y-3">
              {monthlyLogs.map((log) => {
                const isComplete = log.achievement_status === 'Completed';
                const isInProgress = log.achievement_status === 'In Progress';

                return (
                  <div
                    key={log.month_number}
                    className="p-5 rounded-2xl bg-white border border-stone-200 shadow-card space-y-3 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {log.month_number}
                        </span>
                        <h3 className="text-sm font-bold text-stone-900">
                          {log.month_name} 2026 Review
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {isEditing ? (
                          <select
                            value={log.achievement_status}
                            onChange={(e) =>
                              handleMonthlyChange(log.id || 0, 'achievement_status', e.target.value)
                            }
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-stone-300 bg-stone-50"
                          >
                            <option value="Not started">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Overdue">Overdue</option>
                          </select>
                        ) : (
                          <span
                            className={clsx(
                              'px-2.5 py-0.5 rounded-full text-xs font-bold',
                              isComplete
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : isInProgress
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-stone-100 text-stone-700 border border-stone-200'
                            )}
                          >
                            {log.achievement_status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3 Spacious Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                      {/* Deliverables / Work Link */}
                      <div className="space-y-1 bg-stone-50/60 p-3 rounded-xl border border-stone-150">
                        <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                          Deliverable / Result Link
                        </span>
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={log.result_link || ''}
                              onChange={(e) =>
                                handleMonthlyChange(log.id || 0, 'result_link', e.target.value)
                              }
                              placeholder="Deliverable title / description..."
                              className="w-full p-2 border rounded bg-white text-xs"
                            />
                            <input
                              type="text"
                              value={log.result_url || ''}
                              onChange={(e) =>
                                handleMonthlyChange(log.id || 0, 'result_url', e.target.value)
                              }
                              placeholder="Document URL (https://...)"
                              className="w-full p-2 border rounded bg-white text-xs font-mono"
                            />
                          </div>
                        ) : (() => {
                          const targetUrl = log.result_url || (log.result_link?.match(/https?:\/\/[^\s\n\r]+/)?.[0] ?? '');
                          const hasUrl = Boolean(targetUrl && targetUrl.startsWith('http'));
                          const cleanText = (log.result_link || '').replace(/https?:\/\/[^\s\n\r]+/g, '').trim();
                          const displayTitle = cleanText ? cleanText.replace(/^[-•*]\s*/, '') : 'Open Deliverable Document';

                          if (hasUrl) {
                            return (
                              <div className="space-y-2">
                                <a
                                  href={targetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/60 text-indigo-900 font-semibold transition-all shadow-2xs group w-full"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <FileText className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="truncate text-xs group-hover:underline">
                                    {displayTitle.split('\n')[0] || 'Open Deliverable Document'}
                                  </span>
                                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-700 shrink-0 ml-auto" />
                                </a>
                                {displayTitle.includes('\n') && (
                                  <p className="text-[11px] text-stone-600 leading-relaxed whitespace-pre-line pl-1">
                                    {displayTitle.split('\n').slice(1).join('\n')}
                                  </p>
                                )}
                              </div>
                            );
                          }

                          return (
                            <p className="text-stone-700 leading-relaxed whitespace-pre-line text-xs">
                              {log.result_link || 'N/A'}
                            </p>
                          );
                        })()}
                      </div>

                      {/* Challenges Encountered */}
                      <div className="space-y-1 bg-stone-50/60 p-3 rounded-xl border border-stone-150">
                        <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                          Challenges &amp; Blockers
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={log.challenge || ''}
                            onChange={(e) =>
                              handleMonthlyChange(log.id || 0, 'challenge', e.target.value)
                            }
                            placeholder="Document challenges..."
                            className="w-full p-2 border rounded bg-white text-xs"
                          />
                        ) : (
                          <p className="text-stone-700 leading-relaxed">{log.challenge || '—'}</p>
                        )}
                      </div>

                      {/* Next Steps & Homework */}
                      <div className="space-y-1 bg-stone-50/60 p-3 rounded-xl border border-stone-150">
                        <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                          Next Milestones &amp; Homework
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={log.homework || ''}
                            onChange={(e) =>
                              handleMonthlyChange(log.id || 0, 'homework', e.target.value)
                            }
                            placeholder="Next milestones..."
                            className="w-full p-2 border rounded bg-white text-xs"
                          />
                        ) : (
                          <p className="text-stone-700 leading-relaxed">{log.homework || '—'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ENGINEERING SPECS & SWOT ANALYSIS (Spacious 2x2 Grid, NO Cramped Scrollboxes!) */}
        {activeTab === 'technical' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-white border border-stone-200 text-xs text-stone-600">
              Complete engineering specifications, SWOT strategic risk assessment, and resource availability for IT team leads.
            </div>

            {/* SWOT 2x2 Grid with Full Heights & No Scrollboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Strengths */}
              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/90 shadow-card space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    Strengths
                  </span>
                </div>
                {isEditing ? (
                  <textarea
                    rows={6}
                    value={formData.strengths ?? goal.strengths}
                    onChange={(e) => handleFieldChange('strengths', e.target.value)}
                    className="w-full p-3 text-xs leading-relaxed border border-emerald-300 rounded-lg bg-white"
                  />
                ) : (
                  <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-line font-medium min-h-[100px]">
                    {goal.strengths || 'No documented strengths.'}
                  </p>
                )}
              </div>

              {/* Weaknesses */}
              <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/90 shadow-card space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    Weaknesses
                  </span>
                </div>
                {isEditing ? (
                  <textarea
                    rows={6}
                    value={formData.weaknesses ?? goal.weaknesses}
                    onChange={(e) => handleFieldChange('weaknesses', e.target.value)}
                    className="w-full p-3 text-xs leading-relaxed border border-amber-300 rounded-lg bg-white"
                  />
                ) : (
                  <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-line font-medium min-h-[100px]">
                    {goal.weaknesses || 'No documented weaknesses.'}
                  </p>
                )}
              </div>

              {/* Opportunities */}
              <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200/90 shadow-card space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-950">
                    Opportunities
                  </span>
                </div>
                {isEditing ? (
                  <textarea
                    rows={6}
                    value={formData.opportunities ?? goal.opportunities}
                    onChange={(e) => handleFieldChange('opportunities', e.target.value)}
                    className="w-full p-3 text-xs leading-relaxed border border-blue-300 rounded-lg bg-white"
                  />
                ) : (
                  <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-line font-medium min-h-[100px]">
                    {goal.opportunities || 'No documented opportunities.'}
                  </p>
                )}
              </div>

              {/* Threats */}
              <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/90 shadow-card space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-950">
                    Threats
                  </span>
                </div>
                {isEditing ? (
                  <textarea
                    rows={6}
                    value={formData.threats ?? goal.threats}
                    onChange={(e) => handleFieldChange('threats', e.target.value)}
                    className="w-full p-3 text-xs leading-relaxed border border-rose-300 rounded-lg bg-white"
                  />
                ) : (
                  <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-line font-medium min-h-[100px]">
                    {goal.threats || 'No documented threats.'}
                  </p>
                )}
              </div>
            </div>

            {/* Resource Readiness & Capacity */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-card space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900 block">
                Resource Readiness &amp; Availability
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Budget</span>
                  <span className="text-xs font-bold text-emerald-700 mt-1 block">
                    {goal.budget_available || 'Available'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">HR / Talent</span>
                  <span className="text-xs font-bold text-emerald-700 mt-1 block">
                    {goal.hr_available || 'Available'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Time Capacity</span>
                  <span className="text-xs font-bold text-emerald-700 mt-1 block">
                    {goal.time_available || 'Available'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Tech Stack</span>
                  <span className="text-xs font-bold text-emerald-700 mt-1 block">
                    {goal.tech_available || 'Available'}
                  </span>
                </div>
              </div>

              {goal.resource_plan && (
                <div className="pt-2 text-xs text-stone-600">
                  <strong className="text-stone-800">Resource Plan:</strong> {goal.resource_plan}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
