import React, { useEffect } from 'react';
import clsx from 'clsx';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-lg shadow-elevated border text-sm font-medium',
          {
            'bg-stone-900 text-stone-50 border-stone-800': type === 'success',
            'bg-rose-50 text-rose-900 border-rose-200': type === 'error',
            'bg-white text-stone-900 border-stone-200': type === 'info',
          }
        )}
      >
        {type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
        <span>{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors text-stone-400 hover:text-stone-200 ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
