// src/components/billing/TenantBillingView.tsx
'use client';

import React from 'react';
import { Send } from 'lucide-react';
import { CurrencyCode, formatPrice } from '@/lib/utils/currency';
import { DatabaseBill, DatabaseRoom } from '@/types/billing';

interface TenantBillingViewProps {
  rooms: DatabaseRoom[];
  bills: DatabaseBill[];
  currency: CurrencyCode;
  onNotifyPayment: (payload: { id?: string; amount: number; type: string; roomId: string }) => Promise<void>;
}

export default function TenantBillingView({ rooms, bills, currency, onNotifyPayment }: TenantBillingViewProps) {
  return (
    <div className="space-y-6 text-slate-900 dark:text-zinc-100">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4">Base Lease Agreement</h2>
        {rooms.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">No active housing contract assigned to your profile.</p>
        ) : (
          rooms.map(room => (
            <div key={room.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{room.properties?.title || 'Active Compound Unit'}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Unit Ref: {room.room_number} • Standard Core Rent Pool</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-[#E03A1D]">
                  {formatPrice(room.price_per_month, currency)} 
                  <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">/mo</span>
                </span>
                <button 
                  onClick={() => onNotifyPayment({ amount: room.price_per_month, type: 'Base Rent', roomId: room.id })} 
                  className="bg-slate-950 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all"
                >
                  <Send className="h-3 w-3" /> Report Paid
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4">Additional Utility Statements</h2>
        {bills.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-zinc-500">No active statement or utility balance logs for your unit.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bills.map(bill => (
              <div key={bill.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between dark:border-zinc-800 dark:bg-zinc-900/40">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] dark:bg-zinc-800 dark:text-zinc-300">{bill.bill_type}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      bill.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{formatPrice(bill.amount, currency)}</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Term: {bill.is_recurring ? 'Monthly Recurring' : 'One-time Statement'}</div>
                </div>
                {bill.status === 'unpaid' && (
                  <button 
                    onClick={() => onNotifyPayment({ id: bill.id, amount: bill.amount, type: bill.bill_type, roomId: bill.room_id })} 
                    className="mt-4 w-full border border-slate-200 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1 hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all"
                  >
                    <Send className="h-3 w-3" /> Report Verification
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}