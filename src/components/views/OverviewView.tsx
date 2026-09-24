import React, { useState, useMemo } from 'react';
import { Goal, ViewMode, DepartmentFunction, GoalType } from '@/lib/types';
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
  Clock,
  Calendar,
  Layers,
  ShieldAlert,
  ArrowUpRight,
  Filter,
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
  // Flight Deck Filter Tab state
  const [flightFilter, setFlightFilter] = useState<'in_flight' | 'breakthrough' | 'high_complexity' | 'all'>('in_flight');

  // Friction Radar Month filter
  const [frictionMonth, setFrictionMonth] = useState<number | 'all'>('all');

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

      // Unique leads for this domain
      const leads = Array.from(new Set(domainGoals.map((g) => g.pic).filter(Boolean)));

      // Top active or upcoming deliverable
      const highlightGoal =
        domainGoals.find((g) => g.status === 'In Progress') ||
        domainGoals.find((g) => g.goal_type === 'Breakthrough') ||
        domainGoals[0];

      return {
        key,
        config,
        goals: domainGoals,
        total,
        completed,
        inFlight,
        pct,
        leads,
        highlightGoal,
      };
    });
  }, [goals]);

  // --- 3. FLIGHT DECK FILTERED LIST ---
  const flightDeckGoals = useMemo(() => {
    switch (flightFilter) {
      case 'in_flight':
        return inProgressGoals;
      case 'breakthrough':
        return breakthroughGoals;
      case 'high_complexity':
        return highComplexityGoals;
      case 'all':
      default:
        return goals;
    }
  }, [flightFilter, inProgressGoals, breakthroughGoals, highComplexityGoals, goals]);

  // --- 4. FRICTION & BOTTLENECK RADAR (Extracted from Monthly Logs) ---
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
            monthName: log.month_name || `Month ${log.month_number}`,
            challenge: hasChallenge ? log.challenge.trim() : '',
            homework: hasHomework ? log.homework.trim() : '',
            isOverdue,
            status: log.achievement_status,
          });
        }
      });
    });

    // Sort descending by month number (latest execution cycle first)
    return items.sort((a, b) => b.monthNumber - a.monthNumber);
  }, [goals]);

  // Filtered friction items by selected month
  const filteredFrictionItems = useMemo(() => {
    if (frictionMonth === 'all') return frictionItems;
    return frictionItems.filter((item) => item.monthNumber === frictionMonth);
  }, [frictionItems, frictionMonth]);

  // Available months in friction logs
  const frictionAvailableMonths = useMemo(() => {
    const months = new Set<number>();
    frictionItems.forEach((i) => months.add(i.monthNumber));
    return Array.from(months).sort((a, b) => b - a);
  }, [frictionItems]);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* ─────────────────────────────────────────────────────────────
          EXECUTIVE HERO & IDENTITY BANNER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-stone-900 text-stone-100 shadow-2xs">
              <Compass className="w-3 h-3 text-amber-400" />
              Strategic Cockpit
            </span>
            <span className="text-xs font-mono text-stone-500">
              LeadGeeks Inc. · IT SMART Goals 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
            Executive Overview & Portfolio Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
            Real-time delivery velocity, cross-functional domain health, in-flight initiatives, and operational friction radar across all IT capabilities.
          </p>
        </div>

        {/* Quick View Switches for Leadership */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateView('board')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 shadow-2xs transition-all active:scale-[0.98]"
            title="Browse all initiatives in the detailed Board view"
          >
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>All Goals</span>
          </button>
          <button
            onClick={() => onNavigateView('cadence')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 shadow-2xs transition-all active:scale-[0.98]"
            title="Review monthly cadence achievements and homework"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Monthly Cadence</span>
          </button>
          <button
            onClick={() => onNavigateView('strategic')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 shadow-2xs transition-all active:scale-[0.98]"
            title="Inspect alignment to LeadGeeks BIG Six company objectives"
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>The BIG Six</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODULE 1: EXECUTIVE TELEMETRY & VELOCITY STRIP
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-stone-900" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-mono">
              Portfolio Telemetry & Delivery Pace
            </h2>
          </div>
          <span className="text-[11px] font-mono text-stone-500">
            {totalGoals} Total Strategic Commitments
          </span>
        </div>

        {/* 4 Interconnected Core Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Overall Delivery Velocity */}
          <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-600">Delivery Velocity</span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200/80">
                {completedPct}% Completed
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              {completedGoals.length}
              <span className="text-sm font-normal text-stone-500 font-sans ml-1.5">
                / {totalGoals} Delivered
              </span>
            </div>
            {/* Segmented Micro Progress Bar */}
            <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden flex">
              <div
                style={{ width: `${completedPct}%` }}
                className="bg-emerald-600 transition-all duration-500"
                title={`${completedPct}% Completed`}
              />
              <div
                style={{ width: `${inProgressPct}%` }}
                className="bg-amber-500 transition-all duration-500"
                title={`${inProgressPct}% In Progress`}
              />
              <div
                style={{ width: `${plannedPct}%` }}
                className="bg-stone-300 transition-all duration-500"
                title={`${plannedPct}% Planned`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-0.5">
              <span className="text-emerald-700 font-semibold">{completedGoals.length} Done</span>
              <span className="text-amber-800 font-semibold">{inProgressGoals.length} In Flight</span>
              <span className="text-stone-500">{notStartedGoals.length} Planned</span>
            </div>
          </div>

          {/* 2. Strategic Innovation Profile */}
          <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-600">Breakthrough Ratio</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-200/80">
                {breakthroughPct}% Strategic
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              {breakthroughGoals.length}
              <span className="text-sm font-normal text-stone-500 font-sans ml-1.5">
                Breakthroughs
              </span>
            </div>
            <div className="text-xs text-stone-600 flex items-center justify-between pt-1 border-t border-stone-200/60">
              <span className="text-[11px] text-stone-500">Continuous Optimization:</span>
              <span className="font-mono font-semibold text-stone-800">
                {improvementGoals.length} goals
              </span>
            </div>
            <div className="text-[10px] text-stone-500 leading-tight">
              High-impact innovation balanced with reliable baseline operations.
            </div>
          </div>

          {/* 3. High-Complexity Focus */}
          <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-600">High Complexity Load</span>
              <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200/80">
                {highComplexityGoals.length} Initiatives
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              {highComplexityGoals.filter((g) => g.status === 'Completed').length}
              <span className="text-sm font-normal text-stone-500 font-sans ml-1.5">
                / {highComplexityGoals.length} High-Risk Done
              </span>
            </div>
            <div className="text-xs text-stone-600 flex items-center justify-between pt-1 border-t border-stone-200/60">
              <span className="text-[11px] text-stone-500">Currently in execution:</span>
              <span className="font-mono font-semibold text-amber-800">
                {highComplexityGoals.filter((g) => g.status === 'In Progress').length} in flight
              </span>
            </div>
            <div className="text-[10px] text-stone-500 leading-tight">
              Major architectural overhauls &amp; multi-stakeholder deployments.
            </div>
          </div>

          {/* 4. Active Leadership & Friction Signal */}
          <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-600">Execution Friction Radar</span>
              <span
                className={clsx(
                  'font-mono font-bold px-2 py-0.5 rounded text-[11px] border',
                  frictionItems.length > 0
                    ? 'text-amber-800 bg-amber-50 border-amber-300'
                    : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                )}
              >
                {frictionItems.length} Logged Items
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              {uniquePics.length}
              <span className="text-sm font-normal text-stone-500 font-sans ml-1.5">
                Designated Leads
              </span>
            </div>
            <div className="text-xs text-stone-600 flex items-center justify-between pt-1 border-t border-stone-200/60">
              <span className="text-[11px] text-stone-500">Active Bottlenecks:</span>
              <span className="font-mono font-semibold text-amber-700">
                {frictionItems.filter((i) => i.challenge).length} flagged
              </span>
            </div>
            <div className="text-[10px] text-stone-500 leading-tight">
              Accountability distributed across key domain specialists.
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MODULE 2: FUNCTIONAL DOMAIN HEALTH (5 IT LANES)
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-xs">
              5
            </div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              Functional Domain Health &amp; Capability Lanes
            </h2>
          </div>
          <span className="text-xs text-stone-500">
            Click any domain lane to drill into detailed execution
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainStats.map((domain) => {
            const Icon = domain.config.icon;
            return (
              <div
                key={domain.key}
                onClick={() => {
                  if (onFilterDepartment) {
                    onFilterDepartment(domain.key);
                  }
                  onNavigateView('board');
                }}
                className="group p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 hover:shadow-card transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Header: Icon, Title, and Completion Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-950 transition-colors">
                          {domain.config.label}
                        </h3>
                        <p className="text-[11px] font-mono text-stone-500">
                          {domain.total} Initiatives Assigned
                        </p>
                      </div>
                    </div>

                    <span
                      className={clsx(
                        'text-xs font-mono font-bold px-2 py-0.5 rounded-full border shrink-0',
                        domain.pct === 100
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : domain.pct > 0
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      )}
                    >
                      {domain.pct}% Done
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden flex">
                      <div
                        style={{ width: `${domain.pct}%` }}
                        className="bg-emerald-600 transition-all duration-500"
                      />
                      <div
                        style={{
                          width: `${
                            domain.total > 0
                              ? Math.round((domain.inFlight / domain.total) * 100)
                              : 0
                          }%`,
                        }}
                        className="bg-amber-500 transition-all duration-500"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                      <span>
                        <strong className="text-stone-800">{domain.completed}</strong> Completed
                      </span>
                      <span>
                        <strong className="text-amber-800">{domain.inFlight}</strong> In Flight
                      </span>
                    </div>
                  </div>

                  {/* Highlight Deliverable Preview */}
                  {domain.highlightGoal && (
                    <div className="mt-3.5 p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-stone-500 tracking-wider">
                        Key Deliverable
                      </span>
                      <p className="font-medium text-stone-800 line-clamp-1 group-hover:text-stone-900">
                        {domain.highlightGoal.title}
                      </p>
                      <p className="text-[11px] text-stone-500 line-clamp-1">
                        {domain.highlightGoal.target || domain.highlightGoal.specific_statement}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer: Domain PICs and Direct Drilldown */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-[11px] font-mono truncate max-w-[150px]">
                      {domain.leads.length > 0 ? domain.leads.join(', ') : 'Unassigned'}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 group-hover:text-stone-950 transition-colors">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MODULE 3: ACTIVE FLIGHT DECK (HIGH-IMPACT INITIATIVES)
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              Active Flight Deck &amp; Priority Deployments
            </h2>
          </div>

          {/* Segmented Filter Pills */}
          <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200/80 gap-1 overflow-x-auto self-start sm:self-auto">
            <button
              onClick={() => setFlightFilter('in_flight')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                flightFilter === 'in_flight'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              )}
            >
              In Flight ({inProgressGoals.length})
            </button>
            <button
              onClick={() => setFlightFilter('breakthrough')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                flightFilter === 'breakthrough'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              )}
            >
              Strategic Breakthroughs ({breakthroughGoals.length})
            </button>
            <button
              onClick={() => setFlightFilter('high_complexity')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                flightFilter === 'high_complexity'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              )}
            >
              High Complexity ({highComplexityGoals.length})
            </button>
            <button
              onClick={() => setFlightFilter('all')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                flightFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              )}
            >
              All ({goals.length})
            </button>
          </div>
        </div>

        {/* Flight Deck Cards Grid */}
        {flightDeckGoals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
            No initiatives match this flight filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flightDeckGoals.map((goal) => {
              const catConfig = CATEGORY_CONFIG[goal.function] || {
                label: goal.function,
                shortLabel: goal.function,
                icon: Layers,
              };
              const CatIcon = catConfig.icon;

              return (
                <div
                  key={goal.id}
                  onClick={() => onSelectGoal(goal)}
                  className="group p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 hover:shadow-card transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3.5 relative"
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Category Pill, Period, and Status */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                          <CatIcon className="w-3 h-3 text-stone-600" />
                          <span>{catConfig.shortLabel}</span>
                        </span>
                        {goal.goal_type === 'Breakthrough' && (
                          <GoalTypeBadge type={goal.goal_type} />
                        )}
                        {goal.complexity && (
                          <span
                            className={clsx(
                              'text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border',
                              goal.complexity.toLowerCase().includes('high')
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-stone-50 text-stone-600 border-stone-200'
                            )}
                          >
                            {goal.complexity}
                          </span>
                        )}
                      </div>

                      <StatusBadge status={goal.status} />
                    </div>

                    {/* Initiative Title */}
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-950 transition-colors leading-snug">
                      {goal.title}
                    </h3>

                    {/* Specific Statement / Target Excerpt */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {goal.target || goal.specific_statement}
                    </p>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-stone-500 font-mono text-[11px]">
                      {goal.pic && (
                        <span className="inline-flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-[9px]">
                            {goal.pic.charAt(0)}
                          </span>
                          <span className="text-stone-700 font-sans font-medium">{goal.pic}</span>
                        </span>
                      )}
                      {goal.execution_period && (
                        <span className="hidden sm:inline">
                          · {goal.execution_period}
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 group-hover:text-stone-950 group-hover:translate-x-0.5 transition-all">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MODULE 4: FRICTION & BOTTLENECK RADAR (MONTHLY CHALLENGES)
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              Friction &amp; Execution Bottleneck Radar
            </h2>
            <span className="text-xs font-mono text-stone-500">
              ({filteredFrictionItems.length} Identified)
            </span>
          </div>

          {/* Month selector for friction logs */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-mono">Cadence Cycle:</span>
            <select
              value={frictionMonth}
              onChange={(e) =>
                setFrictionMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              aria-label="Filter friction logs by monthly cadence cycle"
              className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer shadow-2xs"
            >
              <option value="all">All Execution Months</option>
              {frictionAvailableMonths.map((m) => (
                <option key={m} value={m}>
                  Month {m} Logged Items
                </option>
              ))}
            </select>
            <button
              onClick={() => onNavigateView('cadence')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 transition-colors shadow-2xs"
              title="Open full Cadence View"
            >
              <span>Cadence Grid</span>
              <ArrowUpRight className="w-3 h-3 text-stone-400" />
            </button>
          </div>
        </div>

        {filteredFrictionItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="text-xs font-semibold text-stone-800">
              Zero execution blockers recorded for this cycle.
            </p>
            <p className="text-[11px] text-stone-500">
              All active initiatives in this cadence window are executing without reported impediments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFrictionItems.map((item, idx) => (
              <div
                key={`${item.goal.id}-${item.monthNumber}-${idx}`}
                className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3"
              >
                {/* Header: Month badge, Goal title, and PIC */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        {item.monthName}
                      </span>
                      {item.isOverdue && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          Overdue
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-stone-500">
                        PIC: {item.goal.pic || 'Unassigned'}
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectGoal(item.goal)}
                      className="text-xs font-bold text-stone-900 hover:text-amber-800 text-left transition-colors line-clamp-1"
                    >
                      {item.goal.title}
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectGoal(item.goal)}
                    className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded transition-colors shrink-0"
                    title="Open workspace for this initiative"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Challenge description */}
                {item.challenge && (
                  <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/70 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Reported Challenge / Block</span>
                    </div>
                    <p className="text-stone-800 text-[11px] leading-relaxed">
                      {item.challenge}
                    </p>
                  </div>
                )}

                {/* Homework / Unblocking Action */}
                {item.homework && (
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-stone-800 font-bold text-[11px]">
                      <CheckSquare className="w-3 h-3 text-stone-500 shrink-0" />
                      <span>Action Item / Homework Required</span>
                    </div>
                    <p className="text-stone-700 text-[11px] leading-relaxed">
                      {item.homework}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
