'use client'

import React from 'react';
import { Search } from 'lucide-react';
import type { StatusFilter } from './types';

interface FilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
}

const FILTERS: StatusFilter[] = ['all', 'paid', 'overdue', 'expiring'];

export default function FilterBar({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by tenant name or apartment..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs outline-none focus:border-[#E03A1D] dark:border-zinc-800 dark:bg-zinc-900"
        />
      </div>

      <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 dark:bg-zinc-900/60 dark:border-zinc-800">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => onStatusFilterChange(filter)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${statusFilter === filter ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white' : 'text-slate-500'}`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
