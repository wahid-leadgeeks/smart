'use client';

import React, { useState, useEffect } from 'react';
import type { SessionResponse } from '@/lib/auth/types';
import type { GoogleDriveFile } from '@/lib/sheets/client';
import {
  extractGoogleFileId,
  buildGoogleSpreadsheetUrl,
  DEFAULT_SPREADSHEET_ID,
  DEFAULT_SPREADSHEET_URL,
} from '@/lib/sheets/client';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';
import clsx from 'clsx';

interface GoogleSpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionResponse | null;
  onSyncSuccess?: () => void;
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

export function GoogleSpreadsheetModal({
  isOpen,
  onClose,
  session,
  onSyncSuccess,
}: GoogleSpreadsheetModalProps) {
  const [activeTab, setActiveTab] = useState<'drive' | 'custom'>('drive');
  const [customInput, setCustomInput] = useState('');
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileSearch, setFileSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importingFileId, setImportingFileId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
  } | null>(null);

  const activeSpreadsheetId =
    session?.spreadsheetId ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID ||
    DEFAULT_SPREADSHEET_ID;
  const activeSpreadsheetUrl =
    session?.spreadsheetUrl ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL ||
    buildGoogleSpreadsheetUrl(activeSpreadsheetId);

  // Fetch Google Drive spreadsheets when modal opens and user is logged in
  useEffect(() => {
    if (isOpen && session?.authenticated) {
      loadDriveFiles();
    }
  }, [isOpen, session?.authenticated]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const loadDriveFiles = async () => {
    setLoadingFiles(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/google/files');
      const data = await res.json();
      if (data.success) {
        setDriveFiles(data.files || []);
      } else if (data.error) {
        setFeedback({ type: 'info', message: data.error });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Could not load Google Drive files. Please check network connection.',
      });
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleImport = async (targetId: string, label?: string) => {
    const cleanId = extractGoogleFileId(targetId);
    if (!cleanId) {
      setFeedback({ type: 'error', message: 'Please enter a valid Google Spreadsheet URL or File ID.' });
      return;
    }

    setIsImporting(true);
    setImportingFileId(cleanId);
    setFeedback(null);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'google',
          spreadsheetId: cleanId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const stats = data.data;
        setFeedback({
          type: 'success',
          message: `Successfully imported "${label || data.fileName || 'Google Spreadsheet'}"!`,
          details: `Imported ${stats.goalsCount} goals, ${stats.monthlyLogsCount} monthly execution logs, and ${stats.bigSixCount} strategic priorities into PostgreSQL.`,
        });
        if (onSyncSuccess) {
          onSyncSuccess();
        }
      } else {
        setFeedback({
          type: 'error',
          message: 'Import failed from Google',
          details: data.error || 'Check that the spreadsheet contains an "ITE" or "Goals" sheet and you have permission.',
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error during import';
      setFeedback({
        type: 'error',
        message: 'Import failed',
        details: message,
      });
    } finally {
      setIsImporting(false);
      setImportingFileId(null);
    }
  };

  if (!isOpen) return null;

  const filteredFiles = driveFiles.filter((f) =>
    f.name.toLowerCase().includes(fileSearch.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in-50 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[#FBFBF9] border border-stone-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Google Sheets & Drive Integration
              </h2>
              <p className="text-xs text-stone-500">
                Open live master sheets or import initiatives directly from Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Spreadsheet Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                    Active Sync Source
                  </span>
                  {session?.authenticated && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Google Connected
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-semibold text-stone-900 truncate">
                  [IT SMART Goals] - LeadGeeks Inc. 2026 Goals, Objectives and Plans
                </h3>
                <p className="text-[11px] font-mono text-stone-400 truncate">
                  ID: {activeSpreadsheetId}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeSpreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-medium transition shadow-subtle"
                >
                  <span>Open in Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </a>

                <button
                  onClick={() => handleImport(activeSpreadsheetId, 'Active Master Google Sheet')}
                  disabled={isImporting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 text-xs font-medium transition shadow-subtle"
                >
                  <RefreshCw className={clsx('w-3.5 h-3.5', { 'animate-spin': isImporting && importingFileId === activeSpreadsheetId })} />
                  <span>Sync Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback banner if present */}
          {feedback && (
            <div
              className={clsx(
                'p-3.5 rounded-xl border text-xs space-y-1 animate-in fade-in-50',
                feedback.type === 'success' && 'bg-emerald-50 border-emerald-200 text-emerald-900',
                feedback.type === 'error' && 'bg-red-50 border-red-200 text-red-900',
                feedback.type === 'info' && 'bg-stone-100 border-stone-200 text-stone-800'
              )}
            >
              <div className="flex items-center gap-2 font-semibold">
                {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {feedback.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                {feedback.type === 'info' && <AlertCircle className="w-4 h-4 text-stone-500 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
              {feedback.details && (
                <p className="text-[11px] opacity-90 pl-6 leading-relaxed">
                  {feedback.details}
                </p>
              )}
            </div>
          )}

          {/* Tabs: Drive Picker vs Custom Link */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('drive')}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5',
                    activeTab === 'drive'
                      ? 'bg-stone-200 text-stone-900'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Google Drive Files</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5',
                    activeTab === 'custom'
                      ? 'bg-stone-200 text-stone-900'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Paste Sheet URL or ID</span>
                </button>
              </div>

              {session?.authenticated ? (
                <span className="text-[11px] font-mono text-stone-400">
                  {session.user?.email}
                </span>
              ) : (
                <a
                  href="/api/auth/login"
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                >
                  <GoogleIcon className="w-3.5 h-3.5" />
                  <span>Sign in to unlock Drive</span>
                </a>
              )}
            </div>

            {/* TAB 1: Google Drive Files */}
            {activeTab === 'drive' && (
              <div className="space-y-3">
                {!session?.authenticated ? (
                  <div className="p-8 text-center bg-stone-100/70 border border-dashed border-stone-200 rounded-xl space-y-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center">
                      <Lock className="w-5 h-5 text-stone-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-stone-800">Google Authentication Required</h4>
                      <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                        Sign in with your Google account to automatically browse and import spreadsheets and Excel files directly from your Google Drive.
                      </p>
                    </div>
                    <a
                      href="/api/auth/login"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold transition shadow-sm"
                    >
                      <GoogleIcon className="w-4 h-4" />
                      <span>Connect with Google Account</span>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search Drive files..."
                          value={fileSearch}
                          onChange={(e) => setFileSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                      </div>
                      <button
                        onClick={loadDriveFiles}
                        disabled={loadingFiles}
                        title="Refresh Drive files"
                        className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition"
                      >
                        <RefreshCw className={clsx('w-3.5 h-3.5', { 'animate-spin': loadingFiles })} />
                      </button>
                    </div>

                    {loadingFiles ? (
                      <div className="p-8 text-center text-stone-400 space-y-2">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-stone-500" />
                        <p className="text-xs">Scanning Google Drive for spreadsheets & Excel files...</p>
                      </div>
                    ) : filteredFiles.length === 0 ? (
                      <div className="p-8 text-center bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                        <p className="text-xs font-semibold text-stone-700">No spreadsheets found in Drive</p>
                        <p className="text-[11px] text-stone-400">
                          {fileSearch ? 'No files match your search query.' : 'No Google Sheets or .xlsx files were detected in this account.'}
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                        {filteredFiles.map((file) => {
                          const isCurrentActive = file.id === activeSpreadsheetId;
                          const isThisImporting = isImporting && importingFileId === file.id;

                          return (
                            <div
                              key={file.id}
                              className={clsx(
                                'flex items-center justify-between p-2.5 rounded-xl border bg-white transition hover:border-stone-300',
                                isCurrentActive ? 'border-emerald-300 bg-emerald-50/20' : 'border-stone-200'
                              )}
                            >
                              <div className="min-w-0 pr-3 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="text-xs font-medium text-stone-900 truncate">
                                    {file.name}
                                  </span>
                                  {isCurrentActive && (
                                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 font-bold px-1.5 rounded">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                                  <span>ID: {file.id.slice(0, 12)}...</span>
                                  {file.modifiedTime && (
                                    <span>
                                      · {new Date(file.modifiedTime).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {file.webViewLink && (
                                  <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open file in Google Drive"
                                    className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                <button
                                  type="button"
                                  disabled={isImporting}
                                  onClick={() => handleImport(file.id, file.name)}
                                  className={clsx(
                                    'px-2.5 py-1 rounded-lg text-xs font-medium transition shadow-2xs flex items-center gap-1',
                                    isCurrentActive
                                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      : 'bg-stone-900 text-white hover:bg-stone-800'
                                  )}
                                >
                                  {isThisImporting ? (
                                    <>
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                      <span>Importing...</span>
                                    </>
                                  ) : (
                                    <span>{isCurrentActive ? 'Re-sync' : 'Import'}</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Custom Sheet Link / ID */}
            {activeTab === 'custom' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-stone-700">
                    Google Spreadsheet URL or File ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://docs.google.com/spreadsheets/d/... or File ID"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white rounded-lg border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                    {customInput.trim() && (
                      <a
                        href={buildGoogleSpreadsheetUrl(customInput)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1"
                        title="Open typed URL in new tab"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400">
                    You can paste any full Google Sheets share link, Google Drive file link, or raw ID. The sheet must contain the standard LeadGeeks format (<code className="font-mono text-stone-600">ITE</code> sheet with goal definitions).
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomInput('')}
                    disabled={!customInput || isImporting}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium transition"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    disabled={!customInput.trim() || isImporting}
                    onClick={() => handleImport(customInput, 'Custom Google Sheet')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 text-xs font-semibold transition shadow-sm"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Downloading & Importing...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5" />
                        <span>Import into Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>PostgreSQL Remote DB connected</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
