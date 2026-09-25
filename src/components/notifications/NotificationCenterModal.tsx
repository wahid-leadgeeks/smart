'use client';

import React, { useState, useEffect } from 'react';
import { Goal } from '@/lib/types';
import {
  Bell,
  BellRing,
  Send,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Users,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Flame,
  MessageSquare,
  Radio,
} from 'lucide-react';
import clsx from 'clsx';
import {
  getCurrentPushSubscription,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '@/lib/push-client';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  onSelectGoal?: (goal: Goal) => void;
}

interface AppNotificationItem {
  id: number;
  sender_email?: string;
  sender_name?: string;
  recipient_email: string;
  category?: string;
  title: string;
  message: string;
  target_url?: string;
  read_status?: boolean;
  created_at?: string;
}

const CATEGORIES = [
  { key: 'Update', label: 'Initiative Update', icon: Sparkles, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { key: 'Blocker', label: 'Blocker Alert', icon: ShieldAlert, color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { key: 'Milestone', label: 'Milestone Done', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'Action', label: 'Action Required', icon: Flame, color: 'text-amber-800 bg-amber-50 border-amber-200' },
];

export function NotificationCenterModal({
  isOpen,
  onClose,
  goals,
  onSelectGoal,
}: NotificationCenterModalProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'compose'>('feed');
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // Push Permission & Subscription State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);

  // Compose State
  const [recipient, setRecipient] = useState<string>('ALL');
  const [category, setCategory] = useState<string>('Update');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Extract unique team PICs
  const uniquePics = Array.from(
    new Set(goals.map((g) => g.pic?.trim()).filter(Boolean))
  ) as string[];

  // Fetch notifications and check subscription
  const fetchFeed = async () => {
    try {
      setLoadingFeed(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setSubscribersCount(data.data.subscribersCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeed(false);
    }
  };

  const checkSubscription = async () => {
    const sub = await getCurrentPushSubscription();
    setIsSubscribed(Boolean(sub));
  };

  useEffect(() => {
    if (isOpen) {
      fetchFeed();
      checkSubscription();
      setSendSuccess(null);
      setSendError(null);
    }
  }, [isOpen]);

  // Handle Push Permission Toggle
  const handleTogglePush = async () => {
    setSubscribing(true);
    setPushStatusMessage(null);

    if (isSubscribed) {
      const ok = await unsubscribeFromPushNotifications();
      if (ok) {
        setIsSubscribed(false);
        setPushStatusMessage('Push notifications disabled on this browser.');
        fetchFeed();
      }
    } else {
      const res = await subscribeToPushNotifications();
      if (res.success) {
        setIsSubscribed(true);
        setPushStatusMessage('Notifications enabled! Welcome alert sent to your device.');
        fetchFeed();
      } else {
        setPushStatusMessage(res.error || 'Failed to enable notifications.');
      }
    }
    setSubscribing(false);
  };

  // Handle Goal Select in Compose
  const handleGoalSelectChange = (goalIdStr: string) => {
    setSelectedGoalId(goalIdStr);
    if (!goalIdStr) return;
    const g = goals.find((item) => String(item.id) === goalIdStr);
    if (g) {
      if (!title) {
        setTitle(`Update: ${g.title}`);
      }
      if (g.pic && recipient === 'ALL') {
        setRecipient(g.pic);
      }
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setIsSending(true);
      setSendSuccess(null);
      setSendError(null);

      const targetUrl = selectedGoalId ? `/goals/${selectedGoalId}` : '/';

      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          recipient_email: recipient,
          category,
          target_url: targetUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSendSuccess(
          `Notification sent! Delivered to ${data.data.deliveredCount} active device(s).`
        );
        setTitle('');
        setMessage('');
        setSelectedGoalId('');
        fetchFeed();
        setTimeout(() => setActiveTab('feed'), 1500);
      } else {
        setSendError(data.error || 'Failed to send notification');
      }
    } catch (err: any) {
      setSendError(err.message || 'Network error sending notification');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between gap-3 bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-sm shadow-xs">
              <BellRing className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900">
                  Communications &amp; Push Notifications
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700 font-semibold">
                  PWA Ready
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Send alerts, milestones, and friction notices to team members with browser push notifications.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Push Status Banner */}
        <div className="px-5 py-3 bg-stone-100/70 border-b border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <Radio
              className={clsx(
                'w-3.5 h-3.5 shrink-0',
                isSubscribed ? 'text-emerald-600 animate-pulse' : 'text-stone-400'
              )}
            />
            <span className="font-semibold text-stone-800">
              {isSubscribed ? 'Push Notifications Active' : 'Push Notifications Inactive'}
            </span>
            <span className="text-stone-400 font-mono">·</span>
            <span className="text-[11px] text-stone-500 font-mono">
              {subscribersCount} device{subscribersCount === 1 ? '' : 's'} registered
            </span>
          </div>

          <button
            onClick={handleTogglePush}
            disabled={subscribing}
            className={clsx(
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-2xs border',
              isSubscribed
                ? 'bg-white hover:bg-stone-50 text-rose-700 border-stone-200 hover:border-rose-300'
                : 'bg-stone-900 hover:bg-stone-800 text-white border-stone-900'
            )}
          >
            {subscribing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Configuring...</span>
              </>
            ) : isSubscribed ? (
              <span>Disable on this device</span>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Push Alerts</span>
              </>
            )}
          </button>
        </div>

        {pushStatusMessage && (
          <div className="px-5 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{pushStatusMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-stone-200 px-5 pt-2 gap-2 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={clsx(
              'px-3.5 py-2 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-1.5',
              activeTab === 'feed'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Team Alerts &amp; Messages ({notifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('compose')}
            className={clsx(
              'px-3.5 py-2 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-1.5',
              activeTab === 'compose'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            )}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Message / Notify Team</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: FEED OF NOTIFICATIONS */}
          {activeTab === 'feed' && (
            <div className="space-y-3">
              {loadingFeed ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-500">
                  <Loader2 className="w-6 h-6 animate-spin text-stone-700" />
                  <span className="text-xs font-mono">Loading team communications...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center bg-stone-50 rounded-xl border border-stone-200/80 p-6 space-y-2">
                  <Bell className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs font-bold text-stone-800">No messages sent yet</p>
                  <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                    Click &quot;Send Message / Notify Team&quot; above to broadcast an update, blocker alert, or milestone to other users.
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const catConfig = CATEGORIES.find((c) => c.key === item.category) || CATEGORIES[0];
                  const Icon = catConfig.icon;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-white shadow-2xs space-y-2 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={clsx(
                              'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border',
                              catConfig.color
                            )}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{catConfig.label}</span>
                          </span>

                          <span className="text-xs font-bold text-stone-900">
                            {item.title}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-stone-400 shrink-0">
                          {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                        {item.message}
                      </p>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-700 font-mono">
                            From: {item.sender_name || 'Team Lead'}
                          </span>
                          <span className="text-stone-300">·</span>
                          <span className="font-mono text-stone-500">
                            To: {item.recipient_email === 'ALL' ? 'All Team Members' : item.recipient_email}
                          </span>
                        </div>

                        {item.target_url && item.target_url !== '/' && (
                          <a
                            href={item.target_url}
                            onClick={(e) => {
                              if (onSelectGoal && item.target_url?.includes('/goals/')) {
                                const idMatch = item.target_url.match(/\/goals\/(\d+)/);
                                if (idMatch) {
                                  e.preventDefault();
                                  const targetGoal = goals.find((g) => g.id === Number(idMatch[1]));
                                  if (targetGoal) {
                                    onSelectGoal(targetGoal);
                                    onClose();
                                    return;
                                  }
                                }
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 hover:text-indigo-900 hover:underline"
                          >
                            <span>Open Workspace</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: COMPOSE NEW MESSAGE & PUSH ALERT */}
          {activeTab === 'compose' && (
            <form onSubmit={handleSendMessage} className="space-y-3.5">
              {sendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{sendSuccess}</span>
                </div>
              )}

              {sendError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}

              {/* Category Pills */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Alert Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.key;
                    const Icon = cat.icon;
                    return (
                      <button
                        type="button"
                        key={cat.key}
                        onClick={() => setCategory(cat.key)}
                        className={clsx(
                          'p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all text-left',
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        )}
                      >
                        <Icon className={clsx('w-3.5 h-3.5 shrink-0', isSelected ? 'text-amber-400' : 'text-stone-500')} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient & Related Initiative */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Recipient */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Recipient Target
                  </label>
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-2 text-xs border border-stone-200 rounded-lg bg-stone-50 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="ALL">Broadcast to All Users ({subscribersCount} Subscribed)</option>
                    {uniquePics.map((pic) => (
                      <option key={pic} value={pic}>
                        Specific Lead: {pic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Related Initiative */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Link Initiative (Optional)
                  </label>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => handleGoalSelectChange(e.target.value)}
                    className="w-full p-2 text-xs border border-stone-200 rounded-lg bg-stone-50 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="">No linked initiative (General alert)</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        #{g.id} {g.title.slice(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Notification Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Cadence Deliverable Ready for Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 text-xs border border-stone-200 rounded-lg bg-stone-50 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Document results, active blockers, or next steps to notify the team..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 text-xs border border-stone-200 rounded-lg bg-stone-50 leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-mono">
                  Sends browser push notification to allowed devices
                </span>

                <button
                  type="submit"
                  disabled={isSending || !title.trim() || !message.trim()}
                  className={clsx(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'bg-stone-900 hover:bg-stone-800 text-white active:scale-[0.98]'
                  )}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Alert...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dispatch Team Push Notification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
