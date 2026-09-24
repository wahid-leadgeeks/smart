import React, { useState, useRef, useEffect } from 'react';
import { ViewMode } from '@/lib/types';
import type { SessionResponse } from '@/lib/auth/types';
import { Button } from '../ui/Button';
import {
  CalendarRange,
  LayoutGrid,
  LayoutDashboard,
  CalendarCheck,
  Target,
  Download,
  RefreshCw,
  Search,
  X,
  Building2,
  ExternalLink,
  CheckCircle2,
  LogOut,
  FileSpreadsheet,
} from 'lucide-react';
import clsx from 'clsx';

interface TopHeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSync: () => void;
  onExport: () => void;
  onOpenGoogleModal?: () => void;
  isSyncing: boolean;
  isExporting: boolean;
  totalGoals: number;
  completedCount: number;
  session?: SessionResponse | null;
  onLogout?: () => void;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
    </svg>
  );
}

export function TopHeader({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onSync,
  onExport,
  onOpenGoogleModal,
  isSyncing,
  isExporting,
  totalGoals,
  session,
  onLogout,
}: TopHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const spreadsheetUrl =
    session?.spreadsheetUrl ||
    'https://docs.google.com/spreadsheets/d/1vWFuIU_LxCqyQ7Bn5N2K4gBDcIcnmogYA_ALiucWxbo';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-2.5 lg:h-14 gap-2.5">
          {/* Brand & Left Navigation Anchor */}
          <div className="flex items-center justify-between lg:justify-start gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                <Building2 className="w-4 h-4 text-stone-200" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900 font-mono">
                  LeadGeeks
                </span>
                <span className="text-[11px] font-medium text-stone-500 font-mono">
                  · IT 2026
                </span>
              </div>
            </div>

            {/* Mobile Actions (Visible on small screens) */}
            <div className="flex lg:hidden items-center gap-1.5">
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Google Sheet"
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              </a>
              <button
                onClick={onSync}
                disabled={isSyncing}
                title="Refresh Spreadsheet"
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', { 'animate-spin': isSyncing })} />
              </button>
              <button
                onClick={onExport}
                disabled={isExporting}
                title="Download Report"
                className="p-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary View Navigation Tabs (Center on desktop) */}
          <nav className="inline-flex p-1 rounded-xl bg-stone-200/70 border border-stone-200/80 gap-1 overflow-x-auto scrollbar-none shrink-0 self-start lg:self-center">
            <button
              onClick={() => onViewChange('overview')}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                currentView === 'overview'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              )}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-stone-500" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => onViewChange('board')}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                currentView === 'board'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-stone-500" />
              <span>Goals</span>
              <span
                className={clsx(
                  'text-[10px] font-mono px-1 rounded-full',
                  currentView === 'board' ? 'bg-stone-100 text-stone-700 font-bold' : 'text-stone-400'
                )}
              >
                {totalGoals}
              </span>
            </button>

            <button
              onClick={() => onViewChange('roadmap')}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                currentView === 'roadmap'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              )}
            >
              <CalendarRange className="w-3.5 h-3.5 text-stone-500" />
              <span>Timeline</span>
            </button>

            <button
              onClick={() => onViewChange('cadence')}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                currentView === 'cadence'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              )}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-stone-500" />
              <span>Monthly</span>
            </button>

            <button
              onClick={() => onViewChange('strategic')}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                currentView === 'strategic'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50'
              )}
            >
              <Target
                className={clsx(
                  'w-3.5 h-3.5',
                  currentView === 'strategic' ? 'text-amber-400' : 'text-amber-600'
                )}
              />
              <span>The BIG Six</span>
              <span
                className={clsx(
                  'text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full transition-colors',
                  currentView === 'strategic'
                    ? 'bg-amber-400/20 text-amber-200'
                    : 'bg-amber-100 text-amber-900'
                )}
              >
                35
              </span>
            </button>
          </nav>

          {/* Search & Global Actions (Right side on desktop) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Box */}
            <div className="relative w-full sm:w-44 lg:w-48">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search initiatives..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-7 py-1 text-xs bg-white rounded-lg border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all shadow-subtle"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Google Sheets Status & Direct Link */}
            <div className="hidden sm:flex items-center gap-1.5" ref={profileRef}>
              <div className="inline-flex items-center rounded-lg border border-stone-200 bg-white shadow-subtle overflow-hidden">
                <button
                  type="button"
                  onClick={onOpenGoogleModal}
                  title="Google Sheets & Drive Integration (Import or switch spreadsheet)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs font-medium transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-mono font-medium">Google Sheet</span>
                </button>
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open active Google Sheet in new tab"
                  className="px-1.5 py-1 border-l border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition flex items-center"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {session?.authenticated && session.user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition shadow-subtle"
                    title={`Google Account: ${session.user.name} (${session.user.email})`}
                  >
                    {session.user.picture ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={session.user.picture}
                        alt={session.user.name}
                        className="w-5 h-5 rounded-full border border-stone-200"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                        {session.user.name[0] || 'U'}
                      </div>
                    )}
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-stone-200 bg-white p-3 shadow-lg z-50 text-xs animate-in fade-in-50">
                      <div className="flex items-center gap-2.5 pb-2.5 border-b border-stone-100">
                        {session.user.picture ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={session.user.picture}
                            alt={session.user.name}
                            className="w-8 h-8 rounded-full border border-stone-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            {session.user.name[0] || 'U'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 truncate">
                            {session.user.name}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">{session.user.email}</p>
                        </div>
                      </div>

                      <div className="py-2 text-[11px] text-stone-600 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Google Sheets Sync Active</span>
                        </div>
                        <p className="text-stone-400 truncate font-mono text-[10px]">
                          ID: {session.spreadsheetId || '1vWFuIU_LxCqy...'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 space-y-1.5">
                        {onOpenGoogleModal && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              onOpenGoogleModal();
                            }}
                            className="w-full text-left py-1 text-stone-700 hover:text-stone-900 font-medium flex items-center justify-between"
                          >
                            <span>Drive & Sheets Manager</span>
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-stone-50">
                          <a
                            href={spreadsheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1"
                          >
                            <span>Open Sheet</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {onLogout && (
                            <button
                              type="button"
                              onClick={() => {
                                setProfileOpen(false);
                                onLogout();
                              }}
                              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Sign out</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="/api/auth/login"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-medium transition shadow-subtle"
                  title="Sign in with Google to enable live cloud sync from the Google Spreadsheet"
                >
                  <GoogleIcon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Connect</span>
                </a>
              )}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                isLoading={isSyncing}
                title={
                  session?.authenticated
                    ? 'Sync live from connected Google Spreadsheet'
                    : 'Sync data from local master spreadsheet (Connect Google for live cloud sync)'
                }
              >
                <RefreshCw className={clsx('w-3 h-3', { 'animate-spin': isSyncing })} />
                <span className="text-xs">
                  {session?.authenticated ? 'Live Sync' : 'Sync'}
                </span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={onExport}
                isLoading={isExporting}
                title="Download report as an Excel (.xlsx) file"
              >
                <Download className="w-3 h-3" />
                <span className="text-xs">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
