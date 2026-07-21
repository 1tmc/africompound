// src/components/billing/OwnerBillingView.tsx
'use client';

import React, { useState } from 'react';
import { Plus, Search, Trash2, Repeat } from 'lucide-react';
import { CurrencyCode, formatPrice } from '@/lib/utils/currency';
import BillCreationModal from './BillCreationModal';
import { DatabaseBill, DatabaseRoom, DatabaseProperty, BillPayload } from '@/types/billing';

interface OwnerBillingViewProps {
  bills: DatabaseBill[];
  rooms: DatabaseRoom[];
  properties: DatabaseProperty[];
  currency: CurrencyCode;
  subdomain: string;
  onPostBill: (payload: BillPayload) => Promise<void>;
  onToggleStatus: (id: string, current: 'paid' | 'unpaid') => Promise<void>;
  onDeleteBill: (id: string) => Promise<void>;
  onRollover: (bill: DatabaseBill) => Promise<void>;
}

export default function OwnerBillingView({
  bills,
  rooms,
  properties = [],
  currency,
  subdomain,
  onPostBill,
  onToggleStatus,
  onDeleteBill,
  onRollover
}: OwnerBillingViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'recurring'>('all');

  const processedBills = bills.filter(b => {
    const tenantName = `${b.tenant_profile?.first_name || ''} ${b.tenant_profile?.last_name || ''}`.toLowerCase();
    const unitNo = (b.rooms?.room_number || '').toLowerCase();
    const category = (b.bill_type || '').toLowerCase();
    
    const matchesSearch = tenantName.includes(search.toLowerCase()) ||
                          unitNo.includes(search.toLowerCase()) ||
                          category.includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                          (filter === 'paid' && b.status === 'paid') ||
                          (filter === 'unpaid' && b.status === 'unpaid') ||
                          (filter === 'recurring' && b.is_recurring);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-zinc-100">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search by tenant, apartment number, or bill type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs outline-none text-slate-800 shadow-sm focus:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800">
            {(['all', 'paid', 'unpaid', 'recurring'] as const).map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)} 
                className={`px-3 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                  filter === f 
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-zinc-800 dark:text-white' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[#E03A1D] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 hover:bg-[#c93218] transition-all"
          >
            <Plus className="h-4 w-4" /> Add New Bill
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/40">
        {processedBills.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
            No bills found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                <th className="px-6 py-4">Apartment & Tenant</th>
                <th className="px-6 py-4">Bill Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Billing Cycle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800 dark:divide-zinc-800 dark:text-zinc-300">
              {processedBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {bill.tenant_profile?.first_name || 'Guest'} {bill.tenant_profile?.last_name || ''}
                    </span>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400">Apartment {bill.rooms?.room_number || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-bold text-slate-700 text-[10px] uppercase dark:bg-zinc-800 dark:text-zinc-300">
                      {bill.bill_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                    {formatPrice(bill.amount, currency)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">
                    {bill.is_recurring ? '🔁 Monthly' : '⚡️ One-Time'}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onToggleStatus(bill.id, bill.status)} 
                      className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full transition-all ${
                        bill.status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}
                    >
                      {bill.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => onRollover(bill)} 
                      className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-all" 
                      title="Copy this bill to next month"
                    >
                      <Repeat className="h-4 w-4 inline" />
                    </button>
                    <button 
                      onClick={() => onDeleteBill(bill.id)} 
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-all"
                      title="Delete bill"
                    >
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <BillCreationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        rooms={rooms} 
        properties={properties} 
        currency={currency} 
        subdomain={subdomain} 
        onSubmit={onPostBill} 
      />
    </div>
  );
}