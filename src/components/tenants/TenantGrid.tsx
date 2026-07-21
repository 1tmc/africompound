'use client'

import React from 'react';
import TenantCard from './TenantCard';
import type { TenantDisplayModelExtended } from './types';

interface TenantGridProps {
  loading: boolean;
  tenants: TenantDisplayModelExtended[];
  onToggleStatus: (tenant: TenantDisplayModelExtended) => void;
  onDelete: (tenant: TenantDisplayModelExtended) => void;
}

export default function TenantGrid({ loading, tenants, onToggleStatus, onDelete }: TenantGridProps) {
  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 dark:text-zinc-500">
        Syncing records with the database...
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 py-16 text-center text-slate-400 dark:border-zinc-800 dark:text-zinc-600">
        <p className="text-xs mt-1">No tenant entries matched your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tenants.map((tenant) => (
        <TenantCard
          key={tenant.id}
          tenant={tenant}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
