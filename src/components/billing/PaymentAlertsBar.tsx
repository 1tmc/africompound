// src/components/billing/PaymentAlertsBar.tsx
'use client';

import React from 'react';
import { Bell, Check } from 'lucide-react';
import { DatabaseNotification } from '@/types/billing';

interface PaymentAlertsBarProps {
  notifications: DatabaseNotification[];
  onAcknowledge: (id: string) => Promise<void>;
}

export default function PaymentAlertsBar({ notifications, onAcknowledge }: PaymentAlertsBarProps) {
  const activeAlerts = notifications.filter(n => n.status === 'pending');
  if (activeAlerts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
      <div className="flex items-center gap-2 text-amber-600 mb-2">
        <Bell className="h-4 w-4 animate-pulse" />
        <h3 className="text-xs font-black uppercase tracking-wider">Tenant Payment Action Required</h3>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {activeAlerts.map((notif) => (
          <div key={notif.id} className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-slate-200 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
            <div className="text-slate-800 dark:text-zinc-200">
              <span className="font-bold">{notif.tenant_profile?.first_name || 'Resident'}</span> (Unit {notif.rooms?.room_number || 'N/A'}) 
              reported payment of <strong className="font-black text-emerald-600">₵{notif.amount}</strong> for <span className="underline">{notif.payment_type}</span>.
            </div>
            <button
              onClick={() => onAcknowledge(notif.id)}
              className="rounded-lg bg-amber-600 px-2.5 py-1 text-[10px] text-white font-bold hover:bg-amber-700 transition-all flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> Acknowledge Match
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}