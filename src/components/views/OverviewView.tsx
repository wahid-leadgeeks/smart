import React, { useMemo } from 'react';
import { Goal, ViewMode, DepartmentFunction } from '@/lib/types';
import {
  StatusBadge,
  GoalTypeBadge,
  CATEGORY_CONFIG,
} from '../ui/Badge';
import {
  TrendingUp,
  ArrowRight,
  Target,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldAlert,
  Flame,
  CheckSquare,
  Users,
  Compass,
  CalendarRange,
} from 'lucide-react';
import clsx from 'clsx';

interface OverviewViewProps {
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
  onNavigateView: (view: ViewMode) => void;
  onFilterDepartment?: (fn: DepartmentFunction) => void;
}

const DOMAIN_KEYS: DepartmentFunction[] = [
  'Website Management',
  'Infrastructure Management',
  'Cybersecurity',
  'Technology Optimization & Innovation',
  'Others',
];

export function OverviewView({
  goals,
  onSelectGoal,
  onNavigateView,
  onFilterDepartment,
}: OverviewViewProps) {
  // --- 1. TELEMETRY COMPUTATIONS ---
  const totalGoals = goals.length;
  const completedGoals = useMemo(() => goals.filter((g) => g.status === 'Completed'), [goals]);
  const inProgressGoals = useMemo(() => goals.filter((g) => g.status === 'In Progress'), [goals]);
  const notStartedGoals = useMemo(() => goals.filter((g) => g.status === 'Not started'), [goals]);

  const completedPct = totalGoals > 0 ? Math.round((completedGoals.length / totalGoals) * 100) : 0;
  const inProgressPct = totalGoals > 0 ? Math.round((inProgressGoals.length / totalGoals) * 100) : 0;
  const plannedPct = totalGoals > 0 ? Math.max(0, 100 - completedPct - inProgressPct) : 0;

  const breakthroughGoals = useMemo(() => goals.filter((g) => g.goal_type === 'Breakthrough'), [goals]);
  const improvementGoals = useMemo(() => goals.filter((g) => g.goal_type === 'Improvement'), [goals]);
  const highComplexityGoals = useMemo(
    () => goals.filter((g) => g.complexity?.toLowerCase().includes('high')),
    [goals]
  );

  const breakthroughPct = totalGoals > 0 ? Math.round((breakthroughGoals.length / totalGoals) * 100) : 0;

  // Active PICs across the portfolio
  const uniquePics = useMemo(() => {
    const pics = new Set<string>();
    goals.forEach((g) => {
      if (g.pic?.trim()) pics.add(g.pic.trim());
    });
    return Array.from(pics);
  }, [goals]);

  // --- 2. FUNCTIONAL DOMAIN HEALTH DATA ---
  const domainStats = useMemo(() => {
    return DOMAIN_KEYS.map((key) => {
      const config = CATEGORY_CONFIG[key] || {
        label: key,
        shortLabel: key,
        icon: Layers,
      };
      const domainGoals = goals.filter((g) => g.function === key);
      const total = domainGoals.length;
      const completed = domainGoals.filter((g) => g.status === 'Completed').length;
      const inFlight = domainGoals.filter((g) => g.status === 'In Progress').length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const leads = Array.from(new Set(domainGoals.map((g) => g.pic).filter(Boolean)));

      return {
        key,
        config,
        goals: domainGoals,
        total,
        completed,
        inFlight,
        pct,
        leads,
      };
    });
  }, [goals]);

  // --- 3. FRICTION & BOTTLENECK RADAR (Extracted from Monthly Logs) ---
  const frictionItems = useMemo(() => {
    const items: Array<{
      goal: Goal;
      monthNumber: number;
      monthName: string;
      challenge: string;
      homework: string;
      isOverdue: boolean;
      status: string;
    }> = [];

    goals.forEach((goal) => {
      goal.monthly_logs?.forEach((log) => {
        const hasChallenge =
          log.challenge &&
          log.challenge.trim() !== '' &&
          log.challenge.trim() !== '-' &&
          log.challenge.toLowerCase() !== 'none' &&
          log.challenge.toLowerCase() !== 'n/a' &&
          log.challenge.toLowerCase() !== 'nil';

        const hasHomework =
          log.homework &&
          log.homework.trim() !== '' &&
          log.homework.trim() !== '-' &&
          log.homework.toLowerCase() !== 'none' &&
          log.homework.toLowerCase() !== 'n/a' &&
          log.homework.toLowerCase() !== 'nil';

        const isOverdue = log.achievement_status === 'Overdue';

        if (hasChallenge || hasHomework || isOverdue) {
          items.push({
            goal,
            monthNumber: log.month_number,
            monthName: log.month_name || `M${log.month_number}`,
            challenge: hasChallenge ? log.challenge.trim() : '',
            homework: hasHomework ? log.homework.trim() : '',
            isOverdue,
            status: log.achievement_status,
          });
        }
      });
    });

    return items.sort((a, b) => b.monthNumber - a.monthNumber);
  }, [goals]);

  // Top prioritized in-flight items for single-view preview (capped at 3)
  const topInFlightPreview = useMemo(() => {
    const priority = inProgressGoals.length > 0 ? inProgressGoals : goals;
    return priority.slice(0, 3);
  }, [inProgressGoals, goals]);

  // Top friction items for single-view preview (capped at 2)
  const topFrictionPreview = useMemo(() => {
    return frictionItems.slice(0, 2);
  }, [frictionItems]);

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPACT EXECUTIVE COCKPIT HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-stone-900 tracking-tight font-serif">
                Executive Strategic Cockpit
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                Single View Overview
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              LeadGeeks IT 2026 · Real-time delivery pace, domain health, and redirection hub.
            </p>
          </div>
        </div>

        {/* View Redirection Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onNavigateView('board')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 shadow-2xs transition-all active:scale-[0.98]"
            title="Redirect to dedicated Goals Board"
          >
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>Goals Board</span>
          </button>
          <button
            onClick={() => onNavigateView('roadmap')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 shadow-2xs transition-all active:scale-[0.98]"
            title="Redirect to dedicated Timeline Gantt"
          >
            <CalendarRange className="w-3.5 h-3.5 text-stone-500" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => onNavigateView('cadence')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 shadow-2xs transition-all active:scale-[0.98]"
            title="Redirect to 12-Month Cadence Grid"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Cadence</span>
          </button>
          <button
            onClick={() => onNavigateView('strategic')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 shadow-2xs transition-all active:scale-[0.98]"
            title="Redirect to The BIG Six Objectives"
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>BIG Six</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EXECUTIVE TELEMETRY STRIP (COMPACT HORIZONTAL GRID)
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-subtle">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
          {/* Metric 1: Delivery Velocity */}
          <div className="px-2 py-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>Delivery Velocity</span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {completedPct}%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-stone-900">
              {completedGoals.length}
              <span className="text-xs font-normal text-stone-500 font-sans ml-1">/ {totalGoals} Done</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden flex">
              <div style={{ width: `${completedPct}%` }} className="bg-emerald-600" />
              <div style={{ width: `${inProgressPct}%` }} className="bg-amber-500" />
              <div style={{ width: `${plannedPct}%` }} className="bg-stone-300" />
            </div>
          </div>

          {/* Metric 2: Strategic Innovation Ratio */}
          <div className="px-2 py-1 space-y-1 pt-2 sm:pt-0">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>Breakthroughs</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                {breakthroughPct}%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-stone-900">
              {breakthroughGoals.length}
              <span className="text-xs font-normal text-stone-500 font-sans ml-1">Strategic</span>
            </div>
            <p className="text-[10px] text-stone-500 truncate">
              {improvementGoals.length} Continuous Optimizations
            </p>
          </div>

          {/* Metric 3: High-Complexity Workload */}
          <div className="px-2 py-1 space-y-1 pt-2 sm:pt-0">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>High-Risk Load</span>
              <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                {highComplexityGoals.length} Goals
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-stone-900">
              {highComplexityGoals.filter((g) => g.status === 'Completed').length}
              <span className="text-xs font-normal text-stone-500 font-sans ml-1">Delivered</span>
            </div>
            <p className="text-[10px] text-stone-500 truncate">
              {highComplexityGoals.filter((g) => g.status === 'In Progress').length} actively in flight
            </p>
          </div>

          {/* Metric 4: Bottleneck Radar Count */}
          <div className="px-2 py-1 space-y-1 pt-2 sm:pt-0">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>Friction Points</span>
              <span
                className={clsx(
                  'font-mono font-bold px-1.5 py-0.2 rounded border',
                  frictionItems.length > 0
                    ? 'text-amber-800 bg-amber-50 border-amber-300'
                    : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                )}
              >
                {frictionItems.length} Logged
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-stone-900">
              {uniquePics.length}
              <span className="text-xs font-normal text-stone-500 font-sans ml-1">Assigned Leads</span>
            </div>
            <p className="text-[10px] text-stone-500 truncate">
              Across 5 cross-functional domains
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. 5 FUNCTIONAL DOMAIN HEALTH TILES (COMPACT HORIZONTAL ROW)
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
            <Layers className="w-3.5 h-3.5 text-stone-600" />
            <span>Capability Domains (Select lane to redirect to dedicated board)</span>
          </div>
          <span className="text-[11px] text-stone-500 font-mono">5 IT Pillars</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {domainStats.map((domain) => {
            const Icon = domain.config.icon;
            return (
              <div
                key={domain.key}
                onClick={() => {
                  if (onFilterDepartment) {
                    onFilterDepartment(domain.key);
                  } else {
                    onNavigateView('board');
                  }
                }}
                className="group p-3 rounded-xl bg-white border border-stone-200 hover:border-stone-400 hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between space-y-2"
                title={`Redirect to ${domain.config.label} board`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-stone-900 group-hover:text-white transition-colors flex items-center justify-center text-stone-700 shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-stone-900 truncate">
                      {domain.config.shortLabel}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-stone-600 shrink-0">
                    {domain.pct}%
                  </span>
                </div>

                <div className="w-full h-1 rounded-full bg-stone-100 overflow-hidden flex">
                  <div style={{ width: `${domain.pct}%` }} className="bg-emerald-600" />
                  <div
                    style={{
                      width: `${domain.total > 0 ? (domain.inFlight / domain.total) * 100 : 0}%`,
                    }}
                    className="bg-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500">
                  <span className="truncate">{domain.total} Goals</span>
                  <span className="inline-flex items-center text-stone-700 group-hover:text-stone-900 font-semibold gap-0.5">
                    <span>Lane</span>
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. DUAL REDIRECTION DECKS (FLIGHT DECK & FRICTION RADAR)
             Capped at 3 items each to prevent vertical scrolling.
             Explicit action buttons redirect to full dedicated pages.
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        {/* Left: Active Flight Deck (Top 3 Priority In-Flight Items) */}
        <section className="bg-white rounded-xl border border-stone-200 p-4 shadow-subtle flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-bold text-stone-900 uppercase font-mono tracking-wider">
                  Active Flight Deck Highlights
                </h2>
              </div>
              <span className="text-[10px] font-mono text-stone-500">
                {inProgressGoals.length} In-Flight
              </span>
            </div>

            <div className="space-y-2">
              {topInFlightPreview.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => onSelectGoal(goal)}
                  className="group p-2.5 rounded-lg border border-stone-100 hover:border-stone-300 hover:bg-stone-50/50 transition-all cursor-pointer flex items-center justify-between gap-3"
                  title="Open dedicated goal workspace"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        {goal.function.split(' ')[0]}
                      </span>
                      {goal.goal_type === 'Breakthrough' && (
                        <span className="text-[9px] font-mono font-bold px-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Breakthrough
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-stone-400">
                        PIC: {goal.pic || 'Unassigned'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-stone-900 group-hover:text-stone-950 truncate">
                      {goal.title}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 group-hover:text-stone-900 shrink-0">
                    <span>Workspace</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Explicit Redirection Link to Full Board View */}
          <button
            onClick={() => onNavigateView('board')}
            className="w-full py-2 px-3 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.99]"
          >
            <span>View Full Goals Board ({totalGoals} Initiatives)</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-600" />
          </button>
        </section>

        {/* Right: Friction & Bottleneck Radar (Top 2 Active Impediments) */}
        <section className="bg-white rounded-xl border border-stone-200 p-4 shadow-subtle flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <h2 className="text-xs font-bold text-stone-900 uppercase font-mono tracking-wider">
                  Friction &amp; Execution Bottlenecks
                </h2>
              </div>
              <span className="text-[10px] font-mono text-stone-500">
                {frictionItems.length} Identified
              </span>
            </div>

            {topFrictionPreview.length === 0 ? (
              <div className="p-4 text-center rounded-lg bg-stone-50 text-xs text-stone-500 flex flex-col items-center justify-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-stone-800">Zero active execution friction recorded</span>
                <span className="text-[10px]">All initiatives in the active cadence cycle are on track.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {topFrictionPreview.map((item, idx) => (
                  <div
                    key={`${item.goal.id}-${item.monthNumber}-${idx}`}
                    onClick={() => onSelectGoal(item.goal)}
                    className="group p-2.5 rounded-lg border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/80 transition-all cursor-pointer space-y-1"
                    title="Open workspace to resolve blocker"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {item.monthName}
                        </span>
                        <span className="font-semibold text-stone-800 truncate max-w-[200px]">
                          {item.goal.title}
                        </span>
                      </div>
                      <span className="text-stone-500 font-mono">PIC: {item.goal.pic}</span>
                    </div>

                    {item.challenge && (
                      <p className="text-[11px] text-amber-950 font-medium line-clamp-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                        <span>{item.challenge}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Explicit Redirection Link to Full Cadence View */}
          <button
            onClick={() => onNavigateView('cadence')}
            className="w-full py-2 px-3 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.99]"
          >
            <span>Open 12-Month Cadence Grid &amp; Action Log</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-600" />
          </button>
        </section>
      </div>
    </div>
  );
}
