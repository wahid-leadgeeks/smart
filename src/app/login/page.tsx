'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Building2,
  ShieldCheck,
  FileSpreadsheet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
      />
    </svg>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const errorParam = searchParams?.get('error') || searchParams?.get('auth_error');
  const statusParam = searchParams?.get('status') || searchParams?.get('auth_status');
  const redirectParam = searchParams?.get('redirect') || '/';

  // Check if user already has an active session
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          const safeDestination =
            redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
              ? redirectParam
              : '/';
          router.replace(safeDestination);
        } else {
          setCheckingSession(false);
        }
      })
      .catch(() => {
        setCheckingSession(false);
      });
  }, [redirectParam, router]);

  const handleSignIn = () => {
    setIsLoading(true);
    const loginUrl = new URL('/api/auth/login', window.location.origin);
    if (redirectParam && redirectParam !== '/') {
      loginUrl.searchParams.set('redirect', redirectParam);
    }
    window.location.href = loginUrl.toString();
  };

  const getErrorMessage = (code: string | null) => {
    if (!code) return null;
    switch (code) {
      case 'oauth_unconfigured':
        return 'Google OAuth credentials are not configured on this environment. Please configure Google Client ID and Secret in your deployment settings.';
      case 'access_denied':
        return 'Google sign-in was cancelled or access was denied. Please authenticate with your authorized Google account.';
      case 'token_exchange_failed':
        return 'Failed to exchange authorization tokens with Google. Please retry.';
      case 'profile_fetch_failed':
        return 'Could not retrieve user profile from Google. Please ensure you have accepted profile access.';
      case 'state_mismatch':
        return 'Authentication security state expired or was invalid. Please try signing in again.';
      case 'missing_code_or_state':
        return 'Authentication parameters were missing from the callback.';
      default:
        return `Authentication failed: ${code}`;
    }
  };

  const errorMessage = getErrorMessage(errorParam);

  if (checkingSession) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-stone-700" />
        <span className="text-xs font-mono text-stone-500">Checking credentials...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Status Notice if Logged Out */}
      {statusParam === 'logged_out' && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Signed Out:</span>
            <p className="text-emerald-800 mt-0.5">
              You have been safely disconnected from your LeadGeeks IT session.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-2.5 animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Authentication Issue:</span>
            <p className="text-rose-800 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Primary Authentication Card */}
      <div className="p-7 sm:p-8 rounded-2xl bg-white border border-stone-200 shadow-card space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <Lock className="w-3 h-3 text-stone-500" />
            <span>Corporate Access Control</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 font-serif tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Authentication is required to access the LeadGeeks IT SMART Goals strategic cockpit, timeline, and monthly execution cadence.
          </p>
        </div>

        {/* 7-State Google SSO Button */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleSignIn}
            disabled={isLoading}
            className={clsx(
              'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2',
              isLoading
                ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-white hover:bg-stone-50/80 active:scale-[0.98] border-stone-300 hover:border-stone-400 text-stone-900 shadow-xs'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                <span>Redirecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Continue with Google Workspace</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-stone-400 leading-normal">
            Sign in with your authorized corporate Google account.
          </p>
        </div>

        {/* Security & Access Scope Pill */}
        <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-500 space-y-2">
          <div className="flex items-center gap-2 text-stone-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted OAuth 2.0 Session</span>
          </div>
          <p className="text-stone-400 text-[10px] leading-relaxed">
            Session credentials are encrypted with AES-256-GCM in HTTP-only, secure cookies. Live synchronization accesses authorized Google Sheets exclusively.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9]">
      {/* Top Subtle Brand Bar */}
      <header className="border-b border-stone-200/80 bg-white/70 backdrop-blur-xs py-3.5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <Building2 className="w-4 h-4 text-stone-200" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900 font-mono">
                LeadGeeks Inc.
              </span>
              <span className="text-[11px] font-medium text-stone-500 font-mono">
                · IT 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-50 text-amber-900 border border-amber-200/80">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Strategic Cockpit
            </span>
          </div>
        </div>
      </header>

      {/* Main Split / Hero Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Strategic Context & System Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-stone-900 text-stone-100 shadow-2xs">
                <span>Annual Strategic Execution</span>
                <span>·</span>
                <span className="text-amber-400">Master Cockpit</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight">
                LeadGeeks IT SMART Goals 2026
              </h1>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
                The authoritative execution platform connecting corporate priorities, functional capability lanes, monthly delivery cadences, and real-time spreadsheet synchronization.
              </p>
            </div>

            {/* 3 Core System Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h2 className="text-xs font-bold text-stone-900">Google Drive Sync</h2>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Seamless live synchronization with official Google Spreadsheets.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center border border-amber-200">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <h2 className="text-xs font-bold text-stone-900">Executive Pace</h2>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Real-time telemetry across 5 functional IT domain capabilities.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center border border-indigo-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <h2 className="text-xs font-bold text-stone-900">Cadence Control</h2>
                <p className="text-[11px] text-stone-500 leading-tight">
                  12-month friction radar, monthly homework, and BIG Six alignment.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-5 flex justify-center">
            <Suspense
              fallback={
                <div className="w-full max-w-md h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-stone-700" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 py-4 text-center text-xs text-stone-400 font-mono">
        LeadGeeks Inc. Internal Enterprise Portal · Confidential &amp; Proprietary · Authorized Access Only
      </footer>
    </div>
  );
}
