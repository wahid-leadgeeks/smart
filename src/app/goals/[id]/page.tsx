'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Goal,
  MonthlyLog,
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
  ExternalLink,
  Layers,
  Users,
  Briefcase,
  Loader2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';
import { DEFAULT_SPREADSHEET_URL } from '@/lib/sheets/client';

type DetailTab = 'overview' | 'cadence' | 'technical';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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
  const [selectedMonthNum, setSelectedMonthNum] = useState<number>(9); // Default Sept
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || DEFAULT_SPREADSHEET_URL
  );

  // Fetch session to obtain active spreadsheet URL dynamically
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data?.spreadsheetUrl) {
          setSpreadsheetUrl(data.spreadsheetUrl);
        }
      })
      .catch(() => {});

    // Check query params for tab selection (e.g. ?tab=cadence)
    if (typeof window !== 'undefined') {
      const qTab = new URLSearchParams(window.location.search).get('tab');
      if (qTab === 'overview' || qTab === 'cadence' || qTab === 'technical') {
        setActiveTab(qTab);
      }
      const qMonth = parseInt(new URLSearchParams(window.location.search).get('month') || '', 10);
      if (qMonth >= 1 && qMonth <= 12) {
        setSelectedMonthNum(qMonth);
      }
    }
  }, []);

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
            <span>Return to Dashboard</span>
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

  // Active month log for single-view cadence
  const activeLog = monthlyLogs.find((l) => l.month_number === selectedMonthNum) || {
    id: 0,
    goal_id: goal.id,
    month_number: selectedMonthNum,
    month_name: MONTH_NAMES[selectedMonthNum - 1],
    achievement_status: 'Not started',
    result_link: '',
    result_url: '',
    challenge: '-',
    homework: '-',
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col text-[#1C1917]">
      {/* Top Global Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
          {/* Back Button & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-all shadow-2xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
              <span>Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-stone-200 shrink-0" />

            <nav className="flex items-center gap-1.5 text-xs text-stone-500 truncate font-medium">
              <span className="shrink-0 font-mono">LeadGeeks IT 2026</span>
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

      {/* Main Single View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3.5">
        {/* Executive Header Banner (Compact Single View) */}
        <section className="p-4 sm:p-4.5 rounded-xl bg-white border border-stone-200 shadow-card space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                <CategoryIcon className="w-3 h-3 text-stone-600" />
                <span>{catConfig.shortLabel}</span>
              </span>
              <StatusBadge status={isEditing ? formData.status || goal.status : goal.status} />
              <GoalTypeBadge type={isEditing ? formData.goal_type || goal.goal_type : goal.goal_type} />
              {goal.accomplishment_status && (
                <AccomplishmentBadge status={goal.accomplishment_status} />
              )}
            </div>

            <div className="text-[11px] font-mono text-stone-500 self-start sm:self-auto">
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View in Google Sheets"
                className="inline-flex items-center gap-1 hover:text-stone-800 transition-colors"
              >
                <span>Initiative #{goal.id} · Row {goal.row_number}</span>
                <ExternalLink className="w-3 h-3 text-emerald-600" />
              </a>
            </div>
          </div>

          {/* Title */}
          <div>
            {isEditing ? (
              <input
                type="text"
                value={formData.title ?? goal.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full text-base sm:text-lg font-bold text-stone-900 border border-stone-300 rounded-lg p-2 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            ) : (
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-stone-900 tracking-tight leading-snug">
                {goal.title}
              </h1>
            )}
          </div>

          {/* Strategic Context Bar */}
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-500 font-mono text-[11px]">PIC:</span>
              <span className="font-bold text-stone-900">{goal.pic || 'Unassigned'}</span>
              <span className="text-stone-300">·</span>
              <span className="font-semibold text-stone-500 font-mono text-[11px]">Timeline:</span>
              <span className="font-mono text-stone-800 text-[11px]">
                {goal.start_date || '2026-01-01'} → {goal.end_date || '2026-12-31'}
              </span>
            </div>

            {goal.company_focus_ref && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Target className="w-3 h-3 text-amber-700 shrink-0" />
                <span className="truncate max-w-md">{goal.company_focus_ref}</span>
              </div>
            )}
          </div>
        </section>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-stone-200 pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={clsx(
              'px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-1.5',
              activeTab === 'overview'
                ? 'border-stone-900 text-stone-900 bg-white/70 rounded-t-lg shadow-2xs'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/50 rounded-t-lg'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Overview &amp; Action Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('cadence')}
            className={clsx(
              'px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-1.5',
              activeTab === 'cadence'
                ? 'border-stone-900 text-stone-900 bg-white/70 rounded-t-lg shadow-2xs'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/50 rounded-t-lg'
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Cadence Review ({monthlyLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('technical')}
            className={clsx(
              'px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-1.5',
              activeTab === 'technical'
                ? 'border-stone-900 text-stone-900 bg-white/70 rounded-t-lg shadow-2xs'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/50 rounded-t-lg'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SWOT Strategic Matrix &amp; Resources</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: OVERVIEW & ACTION PLAN (Single View Containment)
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Left Column: Purpose, Target & Action Plan (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              {/* Core Purpose & Specific Statement */}
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-card space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  1. Specific Objective &amp; Purpose
                </span>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formData.specific_statement ?? goal.specific_statement}
                    onChange={(e) => handleFieldChange('specific_statement', e.target.value)}
                    className="w-full p-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                  />
                ) : (
                  <p className="text-xs text-stone-800 leading-relaxed font-medium">
                    {goal.specific_statement || 'No specific statement documented.'}
                  </p>
                )}
              </div>

              {/* Measurable Target & Outcome */}
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-card space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  2. Measurable Target &amp; Outcome
                </span>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formData.target ?? goal.target}
                    onChange={(e) => handleFieldChange('target', e.target.value)}
                    className="w-full p-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                  />
                ) : targetBullets.length > 0 ? (
                  <ul className="space-y-1">
                    {targetBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-600">
                    {goal.target || 'No target outcome documented.'}
                  </p>
                )}
              </div>

              {/* Action Plan */}
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-card space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  3. Execution Action Plan
                </span>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={formData.action_plan ?? goal.action_plan}
                    onChange={(e) => handleFieldChange('action_plan', e.target.value)}
                    className="w-full p-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white"
                  />
                ) : (
                  <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                    {goal.action_plan || 'No execution action plan documented.'}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Governance, Collaborators & Specs (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Collaboration Card */}
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-card space-y-2">
                <div className="flex items-center gap-1.5 pb-1 border-b border-stone-100">
                  <Users className="w-3.5 h-3.5 text-stone-700" />
                  <span className="text-xs font-bold text-stone-900">
                    Cross-Department Collaboration
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-stone-500 text-[10px] block">Partner Departments</span>
                    <span className="font-semibold text-stone-800">
                      {goal.collaborators || 'Internal IT Department Only'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">Collaboration Status</span>
                    <span className="font-medium text-stone-700">
                      {goal.collaboration_flag === 'Yes' ? 'Active Cross-Functional Effort' : 'Departmental Initiative'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Governance & Notes */}
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-card space-y-2 text-xs">
                <div className="flex items-center gap-1.5 pb-1 border-b border-stone-100">
                  <Briefcase className="w-3.5 h-3.5 text-stone-700" />
                  <span className="text-xs font-bold text-stone-900">
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

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: MONTHLY CADENCE REVIEW (Single Month Focused Inspector)
            Eliminates 12-month vertical dumping
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'cadence' && (
          <div className="space-y-3">
            {/* Month Selector Strip */}
            <div className="bg-white rounded-xl border border-stone-200 p-1.5 shadow-subtle overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1 min-w-max">
                {MONTH_NAMES.map((m, idx) => {
                  const mNum = idx + 1;
                  const isSelected = selectedMonthNum === mNum;
                  const logForMonth = monthlyLogs.find((l) => l.month_number === mNum);
                  const isDone = logForMonth?.achievement_status === 'Completed';

                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedMonthNum(mNum)}
                      className={clsx(
                        'px-3 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5',
                        isSelected
                          ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                          : 'bg-stone-50/70 text-stone-700 border-stone-200 hover:bg-stone-100'
                      )}
                    >
                      <span>{m.slice(0, 3)}</span>
                      {isDone && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Single-Month Focused Editor Card */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-card space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {activeLog.month_number}
                  </span>
                  <h3 className="text-sm font-bold text-stone-900">
                    {activeLog.month_name} 2026 Monthly Log
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Dropdown */}
                  {isEditing ? (
                    <select
                      value={activeLog.achievement_status}
                      onChange={(e) =>
                        handleMonthlyChange(activeLog.id || 0, 'achievement_status', e.target.value)
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
                        activeLog.achievement_status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : activeLog.achievement_status === 'In Progress'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      )}
                    >
                      {activeLog.achievement_status}
                    </span>
                  )}

                  {/* Previous / Next Month quick navigation */}
                  <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
                    <button
                      onClick={() => setSelectedMonthNum((m) => Math.max(1, m - 1))}
                      disabled={selectedMonthNum <= 1}
                      className="p-1 rounded hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4 text-stone-600" />
                    </button>
                    <button
                      onClick={() => setSelectedMonthNum((m) => Math.min(12, m + 1))}
                      disabled={selectedMonthNum >= 12}
                      className="p-1 rounded hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4 text-stone-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Columns: Deliverable, Challenges, Next Steps */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 text-xs">
                {/* Deliverables / Work Link */}
                <div className="space-y-1.5 bg-stone-50/70 p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                    Deliverable / Work Done
                  </span>
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={activeLog.result_link || ''}
                        onChange={(e) =>
                          handleMonthlyChange(activeLog.id || 0, 'result_link', e.target.value)
                        }
                        placeholder="Deliverable title / description..."
                        className="w-full p-2 border rounded bg-white text-xs"
                      />
                      <input
                        type="text"
                        value={activeLog.result_url || ''}
                        onChange={(e) =>
                          handleMonthlyChange(activeLog.id || 0, 'result_url', e.target.value)
                        }
                        placeholder="Document URL (https://...)"
                        className="w-full p-2 border rounded bg-white text-xs font-mono"
                      />
                    </div>
                  ) : (() => {
                    const targetUrl =
                      activeLog.result_url ||
                      (activeLog.result_link?.match(/https?:\/\/[^\s\n\r]+/)?.[0] ?? '');
                    const hasUrl = Boolean(targetUrl && targetUrl.startsWith('http'));
                    const cleanText = (activeLog.result_link || '').replace(/https?:\/\/[^\s\n\r]+/g, '').trim();
                    const displayTitle = cleanText ? cleanText.replace(/^[-•*]\s*/, '') : 'Open Deliverable Document';

                    if (hasUrl) {
                      return (
                        <div className="space-y-2">
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 p-2 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/60 text-indigo-900 font-semibold transition-all shadow-2xs group w-full"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="truncate text-xs group-hover:underline">
                              {displayTitle.split('\n')[0] || 'Open Deliverable'}
                            </span>
                            <ExternalLink className="w-3 h-3 text-indigo-400 ml-auto" />
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
                        {activeLog.result_link || 'N/A'}
                      </p>
                    );
                  })()}
                </div>

                {/* Challenges & Blockers */}
                <div className="space-y-1.5 bg-stone-50/70 p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                    Challenges &amp; Blockers
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={activeLog.challenge || ''}
                      onChange={(e) =>
                        handleMonthlyChange(activeLog.id || 0, 'challenge', e.target.value)
                      }
                      placeholder="Document challenges..."
                      className="w-full p-2 border rounded bg-white text-xs"
                    />
                  ) : (
                    <p className="text-stone-700 leading-relaxed">{activeLog.challenge || '—'}</p>
                  )}
                </div>

                {/* Next Steps */}
                <div className="space-y-1.5 bg-stone-50/70 p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                    Next Milestones &amp; Homework
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={activeLog.homework || ''}
                      onChange={(e) =>
                        handleMonthlyChange(activeLog.id || 0, 'homework', e.target.value)
                      }
                      placeholder="Next milestones..."
                      className="w-full p-2 border rounded bg-white text-xs"
                    />
                  ) : (
                    <p className="text-stone-700 leading-relaxed">{activeLog.homework || '—'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: ENGINEERING SPECS & SWOT ANALYSIS (Zero Scroll Side-by-Side)
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'technical' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            {/* Left Column: SWOT Matrix (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-3.5 shadow-card space-y-2.5">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                SWOT Strategic Analysis
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Strengths */}
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 block">
                    Strengths
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.strengths ?? goal.strengths}
                      onChange={(e) => handleFieldChange('strengths', e.target.value)}
                      className="w-full p-1.5 text-xs border rounded bg-white"
                    />
                  ) : (
                    <p className="text-xs text-stone-800 leading-snug line-clamp-4">
                      {goal.strengths || 'No documented strengths.'}
                    </p>
                  )}
                </div>

                {/* Weaknesses */}
                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-950 block">
                    Weaknesses
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.weaknesses ?? goal.weaknesses}
                      onChange={(e) => handleFieldChange('weaknesses', e.target.value)}
                      className="w-full p-1.5 text-xs border rounded bg-white"
                    />
                  ) : (
                    <p className="text-xs text-stone-800 leading-snug line-clamp-4">
                      {goal.weaknesses || 'No documented weaknesses.'}
                    </p>
                  )}
                </div>

                {/* Opportunities */}
                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-950 block">
                    Opportunities
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.opportunities ?? goal.opportunities}
                      onChange={(e) => handleFieldChange('opportunities', e.target.value)}
                      className="w-full p-1.5 text-xs border rounded bg-white"
                    />
                  ) : (
                    <p className="text-xs text-stone-800 leading-snug line-clamp-4">
                      {goal.opportunities || 'No documented opportunities.'}
                    </p>
                  )}
                </div>

                {/* Threats */}
                <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-950 block">
                    Threats
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.threats ?? goal.threats}
                      onChange={(e) => handleFieldChange('threats', e.target.value)}
                      className="w-full p-1.5 text-xs border rounded bg-white"
                    />
                  ) : (
                    <p className="text-xs text-stone-800 leading-snug line-clamp-4">
                      {goal.threats || 'No documented threats.'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Resource Readiness & Tech Capacity (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-3.5 shadow-card space-y-2.5">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Resource Readiness &amp; Availability
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-center">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Budget</span>
                  <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                    {goal.budget_available || 'Available'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-center">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">HR / Talent</span>
                  <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                    {goal.hr_available || 'Available'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-center">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Time Capacity</span>
                  <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                    {goal.time_available || 'Available'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-center">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Tech Stack</span>
                  <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                    {goal.tech_available || 'Available'}
                  </span>
                </div>
              </div>

              {goal.resource_plan && (
                <div className="pt-2 text-xs text-stone-600 border-t border-stone-100">
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
