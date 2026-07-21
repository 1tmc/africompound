'use client'

import React from 'react';
import { Mail, Phone, Calendar, Building, Trash2 } from 'lucide-react';
import type { TenantDisplayModelExtended } from './types';

interface TenantCardProps {
  tenant: TenantDisplayModelExtended;
  onToggleStatus: (tenant: TenantDisplayModelExtended) => void;
  onDelete: (tenant: TenantDisplayModelExtended) => void;
}

export default function TenantCard({ tenant, onToggleStatus, onDelete }: TenantCardProps) {
  return (
    <div className="group relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E03A1D]/10 to-[#E03A1D]/5 text-[#E03A1D] font-extrabold text-sm uppercase">
            {tenant.firstName[0]}{tenant.lastName[0]}
          </div>
          <div>
            <h3 className="text-sm font-bold group-hover:text-[#E03A1D] transition-colors">
              {tenant.firstName} {tenant.lastName}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <Building className="h-3 w-3" />
              <span>{tenant.propertyName} — Apt {tenant.roomNumber}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleStatus(tenant)}
            title="Click to toggle payment status"
            className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase transition-transform active:scale-95 cursor-pointer hover:brightness-95 ${
              tenant.paymentStatus === 'paid'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                : tenant.paymentStatus === 'overdue'
                ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
            }`}
          >
            {tenant.paymentStatus}
          </button>

          {/* Complete Delete Flow Trigger */}
          <button
            onClick={() => onDelete(tenant)}
            title="Remove tenant & vacate room"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-90"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <a href={`mailto:${tenant.email}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white">
          <Mail className="h-3.5 w-3.5 text-slate-400" /> {tenant.email}
        </a>
        <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white">
          <Phone className="h-3.5 w-3.5 text-slate-400" /> {tenant.phone}
        </a>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Lease End: {tenant.endDate ? new Date(tenant.endDate).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
