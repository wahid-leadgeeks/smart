import React from 'react';
import clsx from 'clsx';
import { GoalStatus, AccomplishmentStatus, GoalType } from '@/lib/types';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Globe,
  Cloud,
  ShieldCheck,
  Cpu,
  Users,
  Star,
  Layers,
} from 'lucide-react';

export function StatusBadge({ status }: { status: GoalStatus | string }) {
  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        Completed
      </span>
    );
  }

  if (status === 'In Progress') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        In Progress
      </span>
    );
  }

  if (status === 'Not started') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
        <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        Scheduled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
      {status}
    </span>
  );
}

export function AccomplishmentBadge({ status }: { status?: AccomplishmentStatus | string }) {
  if (!status || status === 'Not Started') return null;

  if (status.includes('Early')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        Ahead of Schedule
      </span>
    );
  }

  if (status.includes('On Time')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-teal-50 text-teal-800 border border-teal-200">
        On Schedule
      </span>
    );
  }

  if (status.includes('Late') || status.includes('Overdue')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
        Completed with Delay
      </span>
    );
  }

  return null;
}

export function GoalTypeBadge({ type }: { type: GoalType | string }) {
  const isBreakthrough = type === 'Breakthrough';
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wider',
        isBreakthrough
          ? 'bg-indigo-50 text-indigo-800 border-indigo-200 font-semibold'
          : 'bg-stone-100 text-stone-700 border-stone-200'
      )}
    >
      {isBreakthrough && <Star className="w-3 h-3 text-indigo-600 fill-indigo-600 shrink-0" />}
      {isBreakthrough ? 'Strategic Priority' : 'Optimization'}
    </span>
  );
}

export interface CategoryMeta {
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORY_CONFIG: Record<string, CategoryMeta> = {
  'Website Management': {
    label: 'Website & SEO',
    shortLabel: 'Website',
    icon: Globe,
  },
  'Infrastructure Management': {
    label: 'Cloud & Systems',
    shortLabel: 'Cloud',
    icon: Cloud,
  },
  'Cybersecurity': {
    label: 'Security & Privacy',
    shortLabel: 'Security',
    icon: ShieldCheck,
  },
  'Technology Optimization & Innovation': {
    label: 'Automation & Tools',
    shortLabel: 'Automation',
    icon: Cpu,
  },
  'Others': {
    label: 'Team & Talent',
    shortLabel: 'Team',
    icon: Users,
  },
};

export function FunctionBadge({ fn }: { fn: string }) {
  const config = CATEGORY_CONFIG[fn] || {
    label: fn,
    shortLabel: fn,
    icon: Layers,
  };
  const IconComponent = config.icon;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-white text-stone-800 border border-stone-200 shadow-2xs">
      <IconComponent className="w-3.5 h-3.5 text-stone-600 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
