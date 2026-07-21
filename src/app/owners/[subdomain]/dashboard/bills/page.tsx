// src/app/owners/[subdomain]/dashboard/bills/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { CurrencyCode, CURRENCY_CONFIGS } from '@/lib/utils/currency';
import PaymentAlertsBar from '@/components/billing/PaymentAlertsBar';
import OwnerBillingView from '@/components/billing/OwnerBillingView';
import TenantBillingView from '@/components/billing/TenantBillingView';
import { Coins } from 'lucide-react';
import { 
  DatabaseBill, 
  DatabaseRoom, 
  DatabaseNotification, 
  BillPayload, 
  DatabaseProperty 
} from '@/types/billing';

export interface BillInsertRecord {
  room_id: string;
  tenant_id: string;
  bill_type: string;
  amount: number;
  due_date: string;
  is_recurring: boolean;
  status: 'paid' | 'unpaid';
}

export interface PaymentNotificationInsertRecord {
  tenant_id: string | undefined;
  room_id: string;
  bill_id: string | null;
  amount: number;
  payment_type: string;
  status: 'pending' | 'acknowledged';
}

export default function UnifiedBillsMotherPage() {
  const { currentUser, isInitialized } = useAuthStore();
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');
  
  const [bills, setBills] = useState<DatabaseBill[]>([]);
  const [rooms, setRooms] = useState<DatabaseRoom[]>([]);
  const [properties, setProperties] = useState<DatabaseProperty[]>([]);
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isOwner = currentUser?.role === 'host' || currentUser?.role === 'owner' || currentUser?.role === 'admin';

  const loadDatabaseAssets = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      if (isOwner) {
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('id, title')
          .eq('host_id', currentUser.id);
        
        setProperties((propertiesData as DatabaseProperty[]) || []);

        const { data: roomsData } = await supabase
          .from('rooms')
          .select('id, room_number, price_per_month, properties(id, title), status, property_id');
        setRooms((roomsData as unknown as DatabaseRoom[]) || []);

        const { data: billsData } = await supabase
          .from('bills')
          .select('*, rooms(room_number), tenant_profile:profiles!tenant_id(first_name, last_name)');
        setBills((billsData as unknown as DatabaseBill[]) || []);

        const { data: alerts } = await supabase
          .from('payment_notifications')
          .select('*, rooms(room_number), tenant_profile:profiles!tenant_id(first_name, last_name)')
          .order('created_at', { ascending: false });
        setNotifications((alerts as unknown as DatabaseNotification[]) || []);
      } else {
        const { data: contract } = await supabase
          .from('contracts')
          .select('room_id, rooms(*)')
          .eq('tenant_id', currentUser.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (contract?.rooms) {
          setRooms([contract.rooms] as unknown as DatabaseRoom[]);
        }

        const { data: tenantBills } = await supabase
          .from('bills')
          .select('*, rooms(room_number)')
          .eq('tenant_id', currentUser.id);
          
        setBills((tenantBills as unknown as DatabaseBill[]) || []);
      }
    } catch (err) {
      console.error('Failed to load database items:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isOwner]);

  useEffect(() => {
    let isMounted = true;

    if (isInitialized) {
      if (currentUser) {
        Promise.resolve().then(() => {
          if (isMounted) {
            void loadDatabaseAssets();
          }
        });
      } else {
        Promise.resolve().then(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isInitialized, currentUser, loadDatabaseAssets]);

  const handlePostBills = async (payload: BillPayload) => {
    const inserts: BillInsertRecord[] = [];

    for (const roomId of payload.roomIds) {
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .select('tenant_id')
        .eq('room_id', roomId)
        .eq('status', 'active')
        .maybeSingle();

      if (contractError) {
        console.error(`Error looking up tenant for apartment ${roomId}:`, contractError);
      }

      if (!contract?.tenant_id) {
        const roomObj = rooms.find(r => r.id === roomId);
        const roomLabel = roomObj ? roomObj.room_number : 'Selected';
        throw new Error(`Apartment ${roomLabel} does not have an active tenant. You can only bill occupied apartments.`);
      }

      inserts.push({
        room_id: roomId,
        tenant_id: contract.tenant_id,
        bill_type: payload.billType,
        amount: payload.amountGHS,
        due_date: payload.dueDate,
        is_recurring: payload.isRecurring,
        status: 'unpaid'
      });
    }

    if (inserts.length === 0) {
      throw new Error("No apartments selected to bill.");
    }

    // Explicitly target bills via unknown type assertion to allow 'is_recurring' safely without 'any'
    const { error: insertError } = await (supabase.from('bills') as unknown as {
      insert: (values: BillInsertRecord[]) => Promise<{ error: { message: string } | null }>;
    }).insert(inserts);

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(insertError.message);
    }

    void loadDatabaseAssets();
  };

  const handleToggleStatus = async (id: string, current: 'paid' | 'unpaid') => {
    const next: 'paid' | 'unpaid' = current === 'paid' ? 'unpaid' : 'paid';
    const { error } = await supabase.from('bills').update({ status: next }).eq('id', id);
    if (error) {
      console.error(`Failed to update status: ${error.message}`);
    } else {
      void loadDatabaseAssets();
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) {
      console.error(`Failed to delete bill: ${error.message}`);
    } else {
      void loadDatabaseAssets();
    }
  };

  const handleRollover = async (bill: DatabaseBill) => {
    const nextDue = new Date();
    nextDue.setMonth(nextDue.getMonth() + 1);
    
    const rolloverRecord: BillInsertRecord = {
      room_id: bill.room_id,
      tenant_id: bill.tenant_id,
      bill_type: `${bill.bill_type} (Rollover)`,
      amount: bill.amount,
      due_date: nextDue.toISOString().split('T')[0],
      is_recurring: false,
      status: 'unpaid'
    };

    const { error } = await (supabase.from('bills') as unknown as {
      insert: (values: BillInsertRecord) => Promise<{ error: { message: string } | null }>;
    }).insert(rolloverRecord);

    if (error) {
      console.error(`Failed to copy bill to next month: ${error.message}`);
    } else {
      void loadDatabaseAssets();
    }
  };

  const handleNotifyPayment = async (payload: { id?: string; amount: number; type: string; roomId: string }) => {
    const notificationRecord: PaymentNotificationInsertRecord = {
      tenant_id: currentUser?.id,
      room_id: payload.roomId,
      bill_id: payload.id || null,
      amount: payload.amount,
      payment_type: payload.type,
      status: 'pending'
    };

    const { error } = await (supabase.from('payment_notifications') as unknown as {
      insert: (values: PaymentNotificationInsertRecord) => Promise<{ error: { message: string } | null }>;
    }).insert(notificationRecord);

    if (error) {
      console.error(`Error sending notice: ${error.message}`);
    } else {
      void loadDatabaseAssets();
    }
  };

  const handleAcknowledgeNotification = async (id: string) => {
    const { error } = await supabase.from('payment_notifications').update({ status: 'acknowledged' }).eq('id', id);
    if (error) {
      console.error(`Failed to update: ${error.message}`);
    } else {
      void loadDatabaseAssets();
    }
  };

  if (!isInitialized || loading) {
    return <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">Loading billing details...</div>;
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-zinc-100">
      <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 pb-5 gap-4 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{isOwner ? 'Billing Dashboard' : 'My Statements'}</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Track and manage bills, payments, and different currencies.</p>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Coins className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)} 
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {Object.entries(CURRENCY_CONFIGS).map(([code, conf]) => (
              <option key={code} value={code} className="dark:bg-zinc-900">{code} ({conf.symbol}) - {conf.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isOwner && <PaymentAlertsBar notifications={notifications} onAcknowledge={handleAcknowledgeNotification} />}

      {isOwner ? (
        <OwnerBillingView 
          bills={bills} 
          rooms={rooms} 
          properties={properties}
          currency={currency} 
          subdomain="bismark-house" 
          onPostBill={handlePostBills} 
          onToggleStatus={handleToggleStatus} 
          onDeleteBill={handleDeleteBill} 
          onRollover={handleRollover} 
        />
      ) : (
        <TenantBillingView 
          rooms={rooms} 
          bills={bills} 
          currency={currency} 
          onNotifyPayment={handleNotifyPayment} 
        />
      )}
    </div>
  );
}