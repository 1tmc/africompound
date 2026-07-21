// src/app/joint-system/page.tsx
'use client';
import React from 'react';
import UnifiedChatContainer from '@/components/chat/UnifiedChatContainer';
import { MessageSquare } from 'lucide-react';

export default function JointSystemPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-900 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Top Header Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#E03A1D]/10 p-2 text-[#E03A1D] dark:bg-[#E03A1D]/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Compound Messaging Hub
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Drop your concerns, structural issues, or general notices directly to your community wall.
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Message Orchestration Panel */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/40 backdrop-blur-sm">
          <UnifiedChatContainer />
        </div>

      </div>
    </div>
  );
}