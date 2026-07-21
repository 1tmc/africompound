'use client'

import React from 'react';
import { Plus } from 'lucide-react';

interface TenantsPageHeaderProps {
  onAddTenantClick: () => void;
}

export default function TenantsPageHeader({ onAddTenantClick }: TenantsPageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center dark:border-zinc-800">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Tenant Directory</h1>
        <p className="text-xs text-slate-400 dark:text-zinc-500">Manage contracts, renter logs, and profile setups.</p>
      </div>

      <button
        onClick={onAddTenantClick}
        className="inline-flex items-center gap-2 rounded-xl bg-[#E03A1D] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
      >
        <Plus className="h-4 w-4" /> Add Tenant
      </button>
    </div>
  );
}
