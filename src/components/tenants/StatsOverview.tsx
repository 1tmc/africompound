'use client'

import React from 'react';
import { Users, AlertCircle, Clock } from 'lucide-react';
import type { TenantDisplayModelExtended } from './types';

interface StatsOverviewProps {
  tenants: TenantDisplayModelExtended[];
}

export default function StatsOverview({ tenants }: StatsOverviewProps) {
  const overdueCount = tenants.filter(t => t.paymentStatus === 'overdue').length;
  const expiringCount = tenants.filter(t => t.paymentStatus === 'expiring').length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Active Renters</span>
          <Users className="h-5 w-5 text-[#E03A1D]" />
        </div>
        <p className="text-2xl font-black mt-2">{tenants.length}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Overdue Accounts</span>
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <p className="text-2xl font-black mt-2 text-red-600 dark:text-red-400">
          {overdueCount}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Expiring Soon</span>
          <Clock className="h-5 w-5 text-amber-500" />
        </div>
        <p className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400">
          {expiringCount}
        </p>
      </div>
    </div>
  );
}
