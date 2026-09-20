'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Goal, MonthlyLog, ViewMode, DepartmentFunction, GoalStatus, GoalType } from '@/lib/types';
import type { SessionResponse } from '@/lib/auth/types';
import { TopHeader } from '@/components/navigation/TopHeader';
import { ExecutivePulse } from '@/components/navigation/ExecutivePulse';
import { RoadmapView } from '@/components/views/RoadmapView';
import { BoardView } from '@/components/views/BoardView';
import { CadenceView } from '@/components/views/CadenceView';
import { StrategicMapView } from '@/components/views/StrategicMapView';
import { Toast } from '@/components/ui/Toast';
import { GoogleSpreadsheetModal } from '@/components/modals/GoogleSpreadsheetModal';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { Loader2 } from 'lucide-react';

export default function SmartGoalsDashboard() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  // Default to board (Goals Overview) for immediate, non-technical readability
  const [currentView, setCurrentView] = useState<ViewMode>('board');
  const [session, setSession] = useState<SessionResponse | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFunction, setSelectedFunction] = useState<DepartmentFunction | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<GoalStatus | 'All'>('All');
  const [selectedType, setSelectedType] = useState<GoalType | 'All'>('All');

  // Sync / Export / Modal states
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/goals');
      const data = await res.json();
      if (data.success) {
        setGoals(data.data);
      } else {
        setToast({ message: data.error || 'Failed to fetch goals', type: 'error' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error fetching goals';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = (await res.json()) as SessionResponse;
      setSession(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchSession();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v === 'strategic' || v === 'board' || v === 'roadmap' || v === 'cadence') {
        setCurrentView(v as ViewMode);
      }

      const authStatus = params.get('auth_status');
      const authError = params.get('auth_error');

      if (authStatus === 'connected') {
        setToast({ message: 'Connected to Google Sheets successfully!', type: 'success' });
        params.delete('auth_status');
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.replaceState({}, '', newUrl);
      } else if (authStatus === 'logged_out') {
        setToast({ message: 'Signed out from Google Sheets.', type: 'info' });
        params.delete('auth_status');
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.replaceState({}, '', newUrl);
      } else if (authError) {
        setToast({ message: `Google connection failed: ${authError}`, type: 'error' });
        params.delete('auth_error');
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      // Function filter
      if (selectedFunction !== 'All' && g.function !== selectedFunction) return false;

      // Status filter
      if (selectedStatus !== 'All' && g.status !== selectedStatus) return false;

      // Type filter
      if (selectedType !== 'All' && g.goal_type !== selectedType) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = g.title.toLowerCase().includes(query);
        const matchesSpecific = g.specific_statement?.toLowerCase().includes(query) || false;
        const matchesTarget = g.target?.toLowerCase().includes(query) || false;
        const matchesPIC = g.pic?.toLowerCase().includes(query) || false;
        const matchesCategory = g.function.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSpecific && !matchesTarget && !matchesPIC && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [goals, selectedFunction, selectedStatus, selectedType, searchQuery]);

  // Counts for filter pills
  const functionCounts = useMemo(() => {
    const counts: Record<string, number> = { All: goals.length };
    for (const g of goals) {
      counts[g.function] = (counts[g.function] || 0) + 1;
    }
    return counts;
  }, [goals]);

  const completedCount = useMemo(() => {
    return goals.filter((g) => g.status === 'Completed').length;
  }, [goals]);

  // Initiative select -> navigate directly to dedicated full-page workspace
  const handleSelectGoal = (goal: Goal) => {
    router.push(`/goals/${goal.id}`);
  };

  // Update single monthly log entry
  const handleUpdateMonthlyLog = async (
    logId: number,
    data: Partial<MonthlyLog>
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/monthly/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setGoals((prev) =>
          prev.map((g) => {
            if (!g.monthly_logs) return g;
            return {
              ...g,
              monthly_logs: g.monthly_logs.map((l) =>
                l.id === logId ? { ...l, ...result.data } : l
              ),
            };
          })
        );
        setToast({ message: 'Monthly review note saved', type: 'success' });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession({ authenticated: false, user: null });
      setToast({ message: 'Signed out from Google Sheets.', type: 'info' });
    } catch {
      setToast({ message: 'Failed to sign out', type: 'error' });
    }
  };

  // Core sync runner
  const executeSync = async (source: 'google' | 'local') => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      });
      const data = await res.json();
      if (data.success) {
        const sourceLabel =
          data.source === 'google_sheets' ? 'live Google Sheet' : 'master spreadsheet';
        setToast({
          message: `Successfully refreshed ${data.data.goalsCount} goals from ${sourceLabel}!`,
          type: 'success',
        });
        await fetchGoals();
      } else {
        setToast({ message: data.error || 'Sync failed', type: 'error' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error syncing from spreadsheet';
      setToast({ message, type: 'error' });
    } finally {
      setIsSyncing(false);
      setConfirmDialog(null);
    }
  };

  // Sync with Google Sheets / source Excel file
  const handleSyncExcel = () => {
    const isGoogleLive = Boolean(session?.authenticated);
    const confirmTitle = isGoogleLive ? 'Sync with Live Google Sheet' : 'Refresh from Master Spreadsheet';
    const confirmMessage = isGoogleLive
      ? 'Sync data from live Google Spreadsheet? This will refresh all goals, monthly logs, and strategic priorities in the PostgreSQL database with the latest values from Google Sheets.'
      : 'Refresh data from the master spreadsheet template? (Tip: Connect Google Sheet in the header to sync live with cloud).';

    setConfirmDialog({
      isOpen: true,
      title: confirmTitle,
      message: confirmMessage,
      onConfirm: () => executeSync(isGoogleLive ? 'google' : 'local'),
    });
  };

  // Export current live database to .xlsx
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LeadGeeks-IT-SMART-Goals-2026-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setToast({ message: 'Report downloaded as Excel workbook!', type: 'success' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error generating report';
      setToast({ message, type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9]">
      {/* Top Header */}
      <TopHeader
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSync={handleSyncExcel}
        onExport={handleExportExcel}
        onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
        isSyncing={isSyncing}
        isExporting={isExporting}
        totalGoals={goals.length}
        completedCount={completedCount}
        session={session}
        onLogout={handleLogout}
      />

      {/* Unified Executive Progress & Filter Strip (Active in Goals and Timeline views) */}
      {(currentView === 'roadmap' || currentView === 'board') && (
        <ExecutivePulse
          goals={goals}
          activeStatus={selectedStatus}
          onFilterStatus={(st) => setSelectedStatus(st as GoalStatus | 'All')}
          selectedFunction={selectedFunction}
          onFunctionChange={setSelectedFunction}
          functionCounts={functionCounts}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-stone-700" />
            <span className="text-xs font-mono text-stone-500">
              Loading IT goals...
            </span>
          </div>
        ) : filteredGoals.length === 0 && goals.length > 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-stone-200 shadow-card">
            <p className="text-sm font-semibold text-stone-800">No initiatives found for this filter.</p>
            <p className="text-xs text-stone-500 mt-1">Try clicking &quot;All Categories&quot; or clearing the search box.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFunction('All');
                setSelectedStatus('All');
                setSelectedType('All');
              }}
              className="mt-4 px-3.5 py-2 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {currentView === 'board' && (
              <BoardView goals={filteredGoals} onSelectGoal={handleSelectGoal} />
            )}

            {currentView === 'roadmap' && (
              <RoadmapView goals={filteredGoals} onSelectGoal={handleSelectGoal} />
            )}

            {currentView === 'cadence' && (
              <CadenceView
                goals={goals}
                onSelectGoal={handleSelectGoal}
                onUpdateMonthlyLog={handleUpdateMonthlyLog}
              />
            )}

            {currentView === 'strategic' && (
              <StrategicMapView goals={goals} onSelectGoal={handleSelectGoal} />
            )}
          </>
        )}
      </main>

      {/* Google Sheets & Drive Manager Modal */}
      <GoogleSpreadsheetModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        session={session}
        onSyncSuccess={() => {
          fetchGoals();
          fetchSession();
        }}
      />

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel="Sync Data"
          isLoading={isSyncing}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

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
