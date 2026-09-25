import React, { useEffect, useState, useMemo } from 'react';
import { Goal, BigSixObjective } from '@/lib/types';
import { StatusBadge, CATEGORY_CONFIG } from '../ui/Badge';
import {
  Target,
  ArrowRight,
  Layers,
  Building2,
  TrendingUp,
  Cpu,
  Users,
  ShieldCheck,
  Briefcase,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

interface StrategicMapViewProps {
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
}

type StrategicPerspective = 'big_six' | 'company_focus';

const FOCUS_TAXONOMY = [
  {
    key: 'Company Profitability - Customer Retention',
    title: 'Customer Retention & Loyalty',
    priority: 'Company Profitability',
    desc: 'Strengthen service delivery quality, retain existing high-value clients, and drive upsells/cross-sells.',
    icon: Users,
  },
  {
    key: 'Company Profitability - Business Development',
    title: 'Business Development & Market Expansion',
    priority: 'Company Profitability',
    desc: 'Penetrate new markets, expand service offerings, and diversify revenue channels.',
    icon: TrendingUp,
  },
  {
    key: 'Company Profitability - Customer Acquisition',
    title: 'Customer Acquisition & Sales Growth',
    priority: 'Company Profitability',
    desc: 'Commission sales programs, referral systems, brand awareness campaigns, and trade outreach.',
    icon: Target,
  },
  {
    key: 'Company Profitability - Strong Financial and Risk Management',
    title: 'Financial Stewardship & Risk Management',
    priority: 'Company Profitability',
    desc: 'Emergency funds, transparent financial systems, rigorous controlling, and cost efficiency.',
    icon: ShieldCheck,
  },
  {
    key: 'Company Establishment - Technology Innovation',
    title: 'Technology Optimization & Innovation',
    priority: 'Company Establishment',
    desc: 'Cloud architecture, Workspace modernization, App Script automations, central IT infrastructure, and security controls.',
    icon: Cpu,
  },
  {
    key: 'Company Establishment - Talent & Culture',
    title: 'Talent, Leadership & Culture',
    priority: 'Company Establishment',
    desc: 'Leadership succession, IT recruitment, performance management (PMS), and cultural empowerment.',
    icon: Users,
  },
  {
    key: 'Company Establishment - Organizational Structure',
    title: 'Organizational Structure & Governance',
    priority: 'Company Establishment',
    desc: 'Growth department restructuring, legal centralization, and scalable change governance.',
    icon: Briefcase,
  },
  {
    key: 'Company Establishment - Branding, Communication & Experience',
    title: 'Branding & Industry Positioning',
    priority: 'Company Establishment',
    desc: 'Brand voice, industry trend monitoring, and positioning LeadGeeks as an authoritative niche agency.',
    icon: Globe,
  },
];

const PRIORITY_META: Record<number, { short: string; subtitle: string }> = {
  1: { short: 'Income Dependency', subtitle: 'Revenue Diversification' },
  2: { short: 'Business Development', subtitle: 'Market Penetration' },
  3: { short: 'Scalability', subtitle: 'IT & Infrastructure' },
  4: { short: 'FBA Ecosystem', subtitle: 'Service Delivery' },
  5: { short: 'Brand Awareness', subtitle: 'Marketing & Outreach' },
  6: { short: 'Shared Goals', subtitle: 'Parent Company Alignment' },
};

export function StrategicMapView({ goals, onSelectGoal }: StrategicMapViewProps) {
  const [bigSixList, setBigSixList] = useState<BigSixObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePerspective, setActivePerspective] = useState<StrategicPerspective>('big_six');
  const [selectedPriorityNumber, setSelectedPriorityNumber] = useState<number>(1);
  const [selectedDimensionKey, setSelectedDimensionKey] = useState<string>(FOCUS_TAXONOMY[0].key);

  useEffect(() => {
    fetch('/api/bigsix')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBigSixList(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = parseInt(params.get('priority') || '', 10);
      if (p >= 1 && p <= 6) {
        setSelectedPriorityNumber(p);
      }
    }
  }, []);

  // Group Big Six into 6 distinct objectives
  const groupedObjectives = useMemo(() => {
    return bigSixList.reduce((acc, item) => {
      if (!acc[item.title]) {
        acc[item.title] = {
          number: item.objective_number,
          title: item.title,
          statusQuo: item.status_quo,
          strategicObjective: item.strategic_objective,
          category: item.focus_category || item.company_priority || 'Company Strategic Priority',
          focusAreas: [],
        };
      }
      acc[item.title].focusAreas.push(item);
      return acc;
    }, {} as Record<string, {
      number: number;
      title: string;
      statusQuo: string;
      strategicObjective: string;
      category: string;
      focusAreas: BigSixObjective[];
    }>);
  }, [bigSixList]);

  const objectivesList = useMemo(() => {
    return Object.values(groupedObjectives).sort((a, b) => a.number - b.number);
  }, [groupedObjectives]);

  const getMatchingGoals = (objNumber: number, objTitle: string, focusAreas: BigSixObjective[]) => {
    const objTitleLower = objTitle.toLowerCase();
    return goals.filter((g) => {
      const ref = (g.company_focus_ref || '').toLowerCase();
      if (ref.includes(objTitleLower)) return true;
      if (objNumber === 3 && (ref.includes('scalability') || ref.includes('technology innovation'))) return true;
      if (objNumber === 2 && ref.includes('business development')) return true;
      if (objNumber === 6 && (ref.includes('talent') || ref.includes('shared goals') || ref.includes('culture'))) return true;
      if (objNumber === 1 && (ref.includes('retention') || ref.includes('customer acquisition'))) return true;
      return focusAreas.some((fa) => {
        if (fa.company_focus && ref.includes(fa.company_focus.toLowerCase())) return true;
        if (fa.focus_area && ref.includes(fa.focus_area.toLowerCase())) return true;
        return false;
      });
    });
  };

  const activeObjective = objectivesList.find((o) => o.number === selectedPriorityNumber) || objectivesList[0];
  const activeMatchingGoals = activeObjective
    ? getMatchingGoals(activeObjective.number, activeObjective.title, activeObjective.focusAreas)
    : [];

  // Active taxonomy dimension
  const activeDimension = FOCUS_TAXONOMY.find((d) => d.key === selectedDimensionKey) || FOCUS_TAXONOMY[0];
  const dimensionFocusAreas = bigSixList.filter(
    (b) =>
      (b.company_focus || '').toLowerCase().includes(activeDimension.key.toLowerCase()) ||
      (b.focus_category || '').toLowerCase().includes(activeDimension.priority.toLowerCase())
  );
  const dimensionITGoals = goals.filter(
    (g) =>
      (g.company_focus_ref || '').toLowerCase().includes(activeDimension.key.toLowerCase()) ||
      (activeDimension.key.includes('Technology Innovation') && g.company_focus_ref?.includes('Technology'))
  );

  return (
    <div className="space-y-3.5 animate-in fade-in-50 duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. PERSPECTIVE TOGGLE BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActivePerspective('big_six')}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border',
              activePerspective === 'big_six'
                ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            )}
          >
            <Target className="w-3.5 h-3.5" />
            <span>The BIG Six Corporate Priorities (6 Pillars)</span>
          </button>

          <button
            onClick={() => setActivePerspective('company_focus')}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border',
              activePerspective === 'company_focus'
                ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Focus Dimensions (8 Strategic Areas)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
          <span>Excel Sync Lineage:</span>
          <span className="font-semibold text-stone-800">35 Focus Items · 19 IT Goals</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. VIEW PERSPECTIVE 1: THE BIG SIX CORPORATE PRIORITIES
          ───────────────────────────────────────────────────────────── */}
      {activePerspective === 'big_six' && (
        <div className="space-y-3">
          {/* Priority Selector Tabs (6 horizontal cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {objectivesList.map((obj) => {
              const isSelected = obj.number === selectedPriorityNumber;
              const matching = getMatchingGoals(obj.number, obj.title, obj.focusAreas);
              const meta = PRIORITY_META[obj.number] || {
                short: obj.title.replace(/^\d+\.\s*/, ''),
                subtitle: 'Corporate Objective',
              };

              return (
                <button
                  key={obj.number}
                  type="button"
                  onClick={() => setSelectedPriorityNumber(obj.number)}
                  className={clsx(
                    'p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer select-none',
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-1 ring-stone-900'
                      : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50 shadow-2xs'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={clsx(
                          'text-[9px] font-bold font-mono px-1.5 py-0.2 rounded',
                          isSelected ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-600'
                        )}
                      >
                        P{obj.number}
                      </span>
                      <span
                        className={clsx(
                          'text-[9px] font-semibold px-1 rounded-full border',
                          isSelected
                            ? 'bg-indigo-950 text-indigo-200 border-indigo-800'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        )}
                      >
                        {matching.length} IT
                      </span>
                    </div>
                    <h4 className="font-bold text-[11px] leading-snug line-clamp-1">
                      {meta.short}
                    </h4>
                  </div>

                  <span
                    className={clsx(
                      'text-[9px] font-mono mt-1.5 pt-1 border-t truncate block',
                      isSelected ? 'border-stone-800 text-stone-400' : 'border-stone-100 text-stone-500'
                    )}
                  >
                    {obj.focusAreas.length} Initiatives
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Priority Briefing Strip */}
          {activeObjective && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 bg-white p-3 rounded-xl border border-stone-200 shadow-card items-start">
              {/* Status Quo (7 cols) */}
              <div className="lg:col-span-7 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-0.5">
                  Status Quo &amp; Challenge
                </span>
                <p className="text-xs text-stone-700 leading-snug line-clamp-3">
                  {activeObjective.statusQuo || 'No current challenge documented.'}
                </p>
              </div>

              {/* 2026 Strategic Target (5 cols) */}
              <div className="lg:col-span-5 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80">
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  <Target className="w-3 h-3 text-amber-700" />
                  <span>2026 Corporate Strategic Target</span>
                </div>
                <p className="text-xs font-semibold text-amber-950 leading-snug line-clamp-3">
                  {activeObjective.strategicObjective || 'No corporate target documented.'}
                </p>
              </div>
            </div>
          )}

          {/* Dual-Pane Viewport Grid (Single Screen Containment) */}
          {activeObjective && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
              {/* Left Pane: Company Focus Initiatives */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-stone-200 shadow-card p-3.5 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-stone-700" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Company Focus Initiatives ({activeObjective.focusAreas.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">The BIG Six Sheet</span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {activeObjective.focusAreas.map((fa, idx) => (
                    <div
                      key={fa.id || idx}
                      className="p-2.5 rounded-lg bg-stone-50/80 border border-stone-200/80 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-stone-900 leading-snug line-clamp-2">
                          {fa.focus_area}
                        </p>
                        {fa.pic && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-white text-stone-700 border border-stone-200 shrink-0">
                            {fa.pic}
                          </span>
                        )}
                      </div>
                      {fa.company_focus && (
                        <span className="inline-block text-[9px] font-mono text-stone-500 bg-white px-1.5 py-0.2 rounded border border-stone-200">
                          {fa.company_focus}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Pane: Directly Linked IT Goals */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-stone-200 shadow-card p-3.5 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-700" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Supporting IT Deliverables ({activeMatchingGoals.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">Redirect to Workspace</span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {activeMatchingGoals.length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 rounded-lg border border-dashed border-stone-200 text-stone-500 text-xs">
                      Non-IT direct priority (driven by Operations/Finance).
                    </div>
                  ) : (
                    activeMatchingGoals.map((g) => {
                      const catConfig = CATEGORY_CONFIG[g.function] || {
                        label: g.function,
                        shortLabel: g.function,
                        icon: Layers,
                      };
                      const IconComponent = catConfig.icon;

                      return (
                        <div
                          key={g.id}
                          onClick={() => onSelectGoal(g)}
                          className="group p-2.5 rounded-lg border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50/70 cursor-pointer transition-all flex items-center justify-between gap-2.5 shadow-2xs"
                          title="Click to redirect to goal workspace"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-medium text-stone-600 flex items-center gap-1">
                                <IconComponent className="w-3 h-3 text-stone-500 shrink-0" />
                                <span>{catConfig.shortLabel}</span>
                              </span>
                              <StatusBadge status={g.status} />
                              <span className="text-[9px] font-mono text-stone-400">
                                PIC: {g.pic}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-stone-900 group-hover:text-indigo-950 truncate">
                              {g.title}
                            </h4>
                          </div>

                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-600 group-hover:text-stone-950 shrink-0">
                            <span>Workspace</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. VIEW PERSPECTIVE 2: BY COMPANY FOCUS DIMENSIONS (TAXONOMY)
             Single-view tabbed dimension inspector
          ───────────────────────────────────────────────────────────── */}
      {activePerspective === 'company_focus' && (
        <div className="space-y-3">
          {/* Dimension Selector Tabs (8 horizontal pills) */}
          <div className="inline-flex p-1 rounded-xl bg-stone-200/70 border border-stone-200 gap-1 overflow-x-auto scrollbar-none w-full">
            {FOCUS_TAXONOMY.map((dim) => {
              const isSelected = selectedDimensionKey === dim.key;
              const matchingCount = goals.filter(
                (g) =>
                  (g.company_focus_ref || '').toLowerCase().includes(dim.key.toLowerCase()) ||
                  (dim.key.includes('Technology Innovation') && g.company_focus_ref?.includes('Technology'))
              ).length;

              return (
                <button
                  key={dim.key}
                  onClick={() => setSelectedDimensionKey(dim.key)}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                    isSelected
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                  )}
                >
                  <span>{dim.title.split('&')[0].trim()}</span>
                  <span
                    className={clsx(
                      'text-[10px] font-mono px-1 rounded-full',
                      isSelected ? 'bg-stone-100 text-stone-800 font-bold' : 'text-stone-400'
                    )}
                  >
                    {matchingCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Dimension Single View Container */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-stone-500">
                  {activeDimension.priority}
                </span>
                <h3 className="text-base font-bold text-stone-900">
                  {activeDimension.title}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  {activeDimension.desc}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-stone-500 shrink-0">
                <span>{dimensionFocusAreas.length} Company Items</span>
                <span>·</span>
                <span className="font-bold text-stone-900">
                  {dimensionITGoals.length} IT Deliverables
                </span>
              </div>
            </div>

            {/* Active IT Initiatives inside this dimension */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                Active IT Initiatives Supporting This Dimension
              </span>

              {dimensionITGoals.length === 0 ? (
                <div className="p-6 text-center bg-stone-50 rounded-lg border border-dashed border-stone-200 text-stone-500 text-xs">
                  No direct IT deliverables assigned. Driven primarily by business operations.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {dimensionITGoals.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => onSelectGoal(g)}
                      className="p-3 rounded-lg border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 cursor-pointer transition-all flex items-center justify-between gap-2 shadow-2xs"
                      title="Click to redirect to goal workspace"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={g.status} />
                          <span className="text-[10px] font-mono text-stone-500">
                            {g.function}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {g.title}
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-600 hover:text-stone-950 shrink-0">
                        <span>Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
