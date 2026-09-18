import React, { useEffect, useState, useMemo } from 'react';
import { Goal, BigSixObjective } from '@/lib/types';
import { StatusBadge, CATEGORY_CONFIG } from '../ui/Badge';
import {
  Target,
  ArrowRight,
  Layers,
  Info,
  Building2,
  TrendingUp,
  Cpu,
  Users,
  ShieldCheck,
  Briefcase,
  Globe,
  ChevronDown,
  ChevronUp,
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
    color: 'emerald',
  },
  {
    key: 'Company Profitability - Business Development',
    title: 'Business Development & Market Expansion',
    priority: 'Company Profitability',
    desc: 'Penetrate new markets, expand service offerings, and diversify revenue channels.',
    icon: TrendingUp,
    color: 'blue',
  },
  {
    key: 'Company Profitability - Customer Acquisition',
    title: 'Customer Acquisition & Sales Growth',
    priority: 'Company Profitability',
    desc: 'Commission sales programs, referral systems, brand awareness campaigns, and trade outreach.',
    icon: Target,
    color: 'indigo',
  },
  {
    key: 'Company Profitability - Strong Financial and Risk Management',
    title: 'Financial Stewardship & Risk Management',
    priority: 'Company Profitability',
    desc: 'Emergency funds, transparent financial systems, rigorous controlling, and cost efficiency.',
    icon: ShieldCheck,
    color: 'amber',
  },
  {
    key: 'Company Establishment - Technology Innovation',
    title: 'Technology Optimization & Innovation',
    priority: 'Company Establishment',
    desc: 'Cloud architecture, Workspace modernization, App Script automations, central IT infrastructure, and security controls.',
    icon: Cpu,
    color: 'cyan',
  },
  {
    key: 'Company Establishment - Talent & Culture',
    title: 'Talent, Leadership & Culture',
    priority: 'Company Establishment',
    desc: 'Leadership succession, IT recruitment, performance management (PMS), and cultural empowerment.',
    icon: Users,
    color: 'purple',
  },
  {
    key: 'Company Establishment - Organizational Structure',
    title: 'Organizational Structure & Governance',
    priority: 'Company Establishment',
    desc: 'Growth department restructuring, legal centralization, and scalable change governance.',
    icon: Briefcase,
    color: 'stone',
  },
  {
    key: 'Company Establishment - Branding, Communication & Experience',
    title: 'Branding & Industry Positioning',
    priority: 'Company Establishment',
    desc: 'Brand voice, industry trend monitoring, and positioning LeadGeeks as an authoritative niche agency.',
    icon: Globe,
    color: 'rose',
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
  const [showSourceInfo, setShowSourceInfo] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Strategic Vision & Alignment Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Target className="w-3.5 h-3.5 text-amber-700" />
                Enterprise Alignment
              </span>
              <span className="text-xs text-stone-500 font-mono">
                LeadGeeks Inc. 2026 Goals, Objectives and Plans
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
              Corporate Strategy &amp; The BIG Six
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every IT deliverable directly enables LeadGeeks Inc.’s 2026 enterprise roadmap. Explore the 6 corporate priorities, 35 company-wide focus initiatives, and how IT empowers each department.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 shrink-0">
            <div className="text-center px-2">
              <span className="block text-xl font-bold font-mono text-stone-900 leading-none">6</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Priorities</span>
            </div>
            <div className="h-6 w-px bg-stone-200" />
            <div className="text-center px-2">
              <span className="block text-xl font-bold font-mono text-stone-900 leading-none">35</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Company Focus</span>
            </div>
            <div className="h-6 w-px bg-stone-200" />
            <div className="text-center px-2">
              <span className="block text-xl font-bold font-mono text-stone-900 leading-none">{goals.length}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">IT Deliverables</span>
            </div>
          </div>
        </div>

        {/* Source Data Transparency Accordion */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <button
            onClick={() => setShowSourceInfo(!showSourceInfo)}
            className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-stone-400" />
            <span>Excel Spreadsheet Source Transparency &amp; Data Lineage</span>
            {showSourceInfo ? <ChevronUp className="w-3.5 h-3.5 text-stone-400" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {showSourceInfo && (
            <div className="mt-3 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Sheet: &quot;The BIG Six&quot;
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Fully active (35 rows). Defines the 6 core corporate priorities, status quo challenges, 2026 targets, and cross-department PICs.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Sheet: &quot;Drop Down&quot; Taxonomy
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Defines the official 8 Company Focus areas and 2 Priorities. IT Sheet (&quot;ITE&quot;) links each IT goal to these in Column W.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Sheet: &quot;Company Focus (2026)&quot;
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Contains column headers only in the master Excel workbook. All operative data is unified directly into The BIG Six and Taxonomy views.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Perspective Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-100/80 p-1.5 rounded-xl border border-stone-200">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActivePerspective('big_six')}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2',
              activePerspective === 'big_six'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            )}
          >
            <Target className="w-3.5 h-3.5 text-stone-600" />
            <span>The BIG Six Corporate Priorities (6 Priorities)</span>
          </button>

          <button
            onClick={() => setActivePerspective('company_focus')}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2',
              activePerspective === 'company_focus'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            )}
          >
            <Building2 className="w-3.5 h-3.5 text-stone-600" />
            <span>Company Focus Dimensions (8 Strategic Pillars)</span>
          </button>
        </div>

        {activePerspective === 'big_six' && (
          <span className="text-[11px] text-stone-500 font-medium px-2 py-1">
            Showing Priority {selectedPriorityNumber} of 6
          </span>
        )}
      </div>

      {/* VIEW PERSPECTIVE 1: THE BIG SIX CORPORATE PRIORITIES (ZERO-SCROLL EXECUTIVE COMMAND CENTER) */}
      {activePerspective === 'big_six' && (
        <div className="space-y-4">
          {/* Priority Selector Strip (6 Segmented Interactive Cards) */}
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
                    'p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer select-none',
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-stone-900/10'
                      : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50 shadow-2xs'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span
                        className={clsx(
                          'text-[10px] font-bold font-mono px-1.5 py-0.5 rounded',
                          isSelected ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-600'
                        )}
                      >
                        Priority {obj.number}
                      </span>
                      <span
                        className={clsx(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full border',
                          isSelected
                            ? 'bg-indigo-950/80 text-indigo-200 border-indigo-800'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        )}
                      >
                        {matching.length} {matching.length === 1 ? 'IT Goal' : 'IT Goals'}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs leading-snug line-clamp-1 mb-0.5">
                      {meta.short}
                    </h4>
                    <p
                      className={clsx(
                        'text-[10px] truncate',
                        isSelected ? 'text-stone-400' : 'text-stone-500'
                      )}
                    >
                      {meta.subtitle}
                    </p>
                  </div>

                  <div
                    className={clsx(
                      'text-[10px] font-mono mt-2 pt-1.5 border-t flex items-center justify-between',
                      isSelected ? 'border-stone-800 text-stone-400' : 'border-stone-100 text-stone-500'
                    )}
                  >
                    <span>{obj.focusAreas.length} Initiatives</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Priority Executive Briefing Bar (Status Quo & Strategic Target Side-by-Side) */}
          {activeObjective && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-card items-start">
              {/* Status Quo & Challenge (7 cols) */}
              <div className="lg:col-span-7 bg-stone-50/80 p-3 rounded-xl border border-stone-200/70">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    <span className="w-2 h-2 rounded-full bg-stone-400" />
                    <span>Status Quo &amp; Challenge</span>
                  </div>
                  {activeObjective.statusQuo && activeObjective.statusQuo.split('\n').length > 4 && (
                    <span className="text-[10px] font-mono text-stone-400 bg-white px-1.5 py-0.2 rounded border border-stone-200">
                      Scroll to view all ({activeObjective.statusQuo.split('\n').length} lines)
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-700 leading-relaxed max-h-[110px] overflow-y-auto pr-2 whitespace-pre-line">
                  {activeObjective.statusQuo || 'No current challenge documented.'}
                </div>
              </div>

              {/* 2026 Strategic Target (5 cols) */}
              <div className="lg:col-span-5 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  <Target className="w-3.5 h-3.5 text-amber-700" />
                  <span>2026 Strategic Target</span>
                </div>
                <p className="text-xs font-semibold text-amber-950 leading-relaxed max-h-[110px] overflow-y-auto pr-1">
                  {activeObjective.strategicObjective || 'No corporate target documented.'}
                </p>
              </div>
            </div>
          )}

          {/* Dual-Pane Balanced Workspace (Company Focus Initiatives vs. Supporting IT Deliverables) */}
          {activeObjective && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Pane: Company Focus Initiatives (6 cols) */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 shadow-card p-4 sm:p-5 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-stone-700" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Company Focus Initiatives ({activeObjective.focusAreas.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">From The BIG Six Sheet</span>
                </div>

                {/* Scrollable container with fixed max height so the page never expands */}
                <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1.5">
                  {activeObjective.focusAreas.map((fa, idx) => (
                    <div
                      key={fa.id || idx}
                      className="p-3 rounded-xl bg-stone-50/60 border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 transition-colors space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-stone-900 leading-snug whitespace-pre-line">
                          {fa.focus_area}
                        </p>
                        {fa.pic && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-white text-stone-700 border border-stone-200 shrink-0">
                            PIC: {fa.pic}
                          </span>
                        )}
                      </div>
                      {fa.company_focus && (
                        <span className="inline-block text-[10px] font-mono text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                          {fa.company_focus}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Pane: Directly Linked IT Goals (6 cols) */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 shadow-card p-4 sm:p-5 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-700" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Supporting IT Deliverables ({activeMatchingGoals.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-stone-500">Click goal to inspect</span>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1.5">
                  {activeMatchingGoals.length === 0 ? (
                    <div className="p-8 rounded-xl bg-stone-50 border border-dashed border-stone-200 text-center flex flex-col items-center justify-center my-auto min-h-[220px]">
                      <div className="w-10 h-10 rounded-full bg-stone-200/70 text-stone-600 flex items-center justify-center mb-2.5">
                        <ShieldCheck className="w-5 h-5 text-stone-600" />
                      </div>
                      <p className="text-xs font-bold text-stone-800">Non-IT Direct Initiative</p>
                      <p className="text-[11px] text-stone-500 mt-1 max-w-xs leading-relaxed">
                        This corporate priority is driven primarily by Operations, Growth, or Finance, with IT providing underlying platform reliability.
                      </p>
                    </div>
                  ) : (
                    activeMatchingGoals.map((g) => {
                      const catConfig = CATEGORY_CONFIG[g.function] || { label: g.function, shortLabel: g.function, icon: Layers };
                      const IconComponent = catConfig.icon;

                      return (
                        <div
                          key={g.id}
                          onClick={() => onSelectGoal(g)}
                          className="group p-3.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50/70 cursor-pointer transition-all shadow-2xs flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-medium text-stone-600 flex items-center gap-1.5">
                                <IconComponent className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                <span>{catConfig.shortLabel}</span>
                              </span>
                              <StatusBadge status={g.status} />
                              {g.pic && (
                                <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                                  PIC: {g.pic}
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-indigo-950 group-hover:underline line-clamp-2">
                              {g.title}
                            </h4>
                            {g.target && (
                              <p className="text-[11px] text-stone-600 line-clamp-2">
                                <span className="font-semibold text-stone-700">Target:</span> {g.target}
                              </p>
                            )}
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-stone-900 group-hover:text-white flex items-center justify-center text-stone-500 transition-colors shrink-0">
                            <ArrowRight className="w-4 h-4" />
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

      {/* VIEW PERSPECTIVE 2: BY COMPANY FOCUS DIMENSIONS (TAXONOMY) */}
      {activePerspective === 'company_focus' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FOCUS_TAXONOMY.map((dimension) => {
            const Icon = dimension.icon;

            // Matching company initiatives from Big Six
            const matchingFocusAreas = bigSixList.filter((b) =>
              (b.company_focus || '').toLowerCase().includes(dimension.key.toLowerCase()) ||
              (b.focus_category || '').toLowerCase().includes(dimension.priority.toLowerCase())
            );

            // Matching IT goals
            const matchingITGoals = goals.filter((g) =>
              (g.company_focus_ref || '').toLowerCase().includes(dimension.key.toLowerCase()) ||
              (dimension.key.includes('Technology Innovation') && g.company_focus_ref?.includes('Technology'))
            );

            return (
              <div
                key={dimension.key}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-card space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
                        <Icon className="w-4 h-4 text-stone-700" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-stone-500">
                          {dimension.priority}
                        </span>
                        <h3 className="text-sm font-bold text-stone-900">
                          {dimension.title}
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {matchingITGoals.length} IT Deliverables
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                    {dimension.desc}
                  </p>

                  {/* IT Goals in this dimension */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                      Active IT Initiatives
                    </span>
                    {matchingITGoals.length === 0 ? (
                      <div className="p-3 rounded-lg bg-stone-50 text-[11px] text-stone-500">
                        No direct IT deliverables assigned. Driven by business operations.
                      </div>
                    ) : (
                      matchingITGoals.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => onSelectGoal(g)}
                          className="p-2.5 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50/50 hover:bg-white cursor-pointer transition-all flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <StatusBadge status={g.status} />
                              <span className="text-[10px] font-mono text-stone-500">
                                {g.function}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-stone-900 truncate mt-1">
                              {g.title}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>Excel Source Taxonomy</span>
                  <span className="font-mono font-semibold">{matchingFocusAreas.length} Total Company Items</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
