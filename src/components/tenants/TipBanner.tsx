'use client'

import React from 'react';
import { Info } from 'lucide-react';

export default function TipBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-blue-500/5 border border-blue-500/10 p-4 text-slate-600 dark:text-zinc-300">
      <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Quick Management Tip</h4>
        <p className="text-xs mt-1 leading-relaxed">
          Did you know? You can simply **click on any tenant's payment status badge** below to quickly toggle their active statement balance states.
        </p>
      </div>
    </div>
  );
}
