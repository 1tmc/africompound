'use client'

import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import type { AppMessage } from './types';

interface MessageBannerProps {
  message: AppMessage;
  onDismiss: () => void;
}

export default function MessageBanner({ message, onDismiss }: MessageBannerProps) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl p-4 text-sm font-semibold transition-all shadow-md border ${
      message.type === 'success'
        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/5'
        : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 dark:bg-red-500/5'
    }`}>
      <div className="flex items-center gap-3">
        {message.type === 'success' ? (
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
        ) : (
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
        )}
        <p className="text-xs sm:text-sm">{message.text}</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
