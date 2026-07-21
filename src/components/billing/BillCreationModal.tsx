// src/components/billing/BillCreationModal.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Layers, Home, CheckCircle2, AlertCircle, Building2, CheckSquare, Square } from 'lucide-react';
import { CurrencyCode, CURRENCY_CONFIGS } from '@/lib/utils/currency';
import { DatabaseRoom, DatabaseProperty, BillPayload } from '@/types/billing';

interface BillCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: DatabaseRoom[];
  properties: DatabaseProperty[];
  subdomain: string;
  currency: CurrencyCode;
  onSubmit: (payload: BillPayload) => Promise<void>;
}

interface AppMessage {
  type: 'success' | 'error';
  text: string;
}

export default function BillCreationModal({ 
  isOpen, 
  onClose, 
  rooms = [], 
  properties = [], 
  currency, 
  onSubmit 
}: BillCreationModalProps) {
  const [targetScope, setTargetScope] = useState<'compound' | 'selective'>('selective');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  
  const [billType, setBillType] = useState('Electricity');
  const [customBillName, setCustomBillName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<AppMessage | null>(null);

  const occupiedRooms = useMemo(() => {
    return rooms.filter(room => room.status === 'occupied');
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    if (!selectedPropertyId) return [];
    return occupiedRooms.filter(room => String(room.property_id) === String(selectedPropertyId));
  }, [occupiedRooms, selectedPropertyId]);

  const isCurrentCompoundFullySelected = useMemo(() => {
    if (filteredRooms.length === 0) return false;
    return filteredRooms.every(room => selectedRooms.includes(room.id));
  }, [filteredRooms, selectedRooms]);

  // Handle scope change directly without synchronous setState in useEffect
  const handleScopeChange = (scope: 'compound' | 'selective') => {
    setTargetScope(scope);
    setSelectedRooms([]);
    setSelectedPropertyId('');
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isOpen) return null;

  const toggleRoomSelection = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  const toggleAllRoomsInCurrentCompound = () => {
    const activeRoomIds = filteredRooms.map(r => r.id);
    
    if (isCurrentCompoundFullySelected) {
      setSelectedRooms(prev => prev.filter(id => !activeRoomIds.includes(id)));
    } else {
      setSelectedRooms(prev => Array.from(new Set([...prev, ...activeRoomIds])));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const rawAmount = parseFloat(amountInput);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid bill amount.' });
      setIsSubmitting(false);
      return;
    }

    const amountInGHS = rawAmount / CURRENCY_CONFIGS[currency].rateToGHS;
    const targetRoomIds = targetScope === 'compound' ? occupiedRooms.map(r => r.id) : selectedRooms;

    if (targetRoomIds.length === 0) {
      setMessage({ 
        type: 'error', 
        text: targetScope === 'compound' 
          ? 'There are no active/occupied apartments across the complex to bill.' 
          : 'Please select at least one active apartment to bill.' 
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit({
        roomIds: targetRoomIds,
        billType: billType === 'Custom' ? customBillName : billType,
        amountGHS: amountInGHS,
        dueDate,
        isRecurring,
      });

      setMessage({ type: 'success', text: 'Welldone, it was saved.' });
      setSelectedRooms([]);
      setAmountInput('');
      setDueDate('');
      setSelectedPropertyId('');
      
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 2000);

    } catch (error) {
      const err = error as Error;
      console.error("Billing Save caught inside modal:", err);
      setMessage({ type: 'error', text: err?.message || 'Failed to save billing record.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
        
        <button onClick={onClose} className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:text-zinc-500 dark:hover:bg-zinc-800 transition-colors">
          <X className="h-4 w-4" />
        </button>
        
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Add New Bill</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">Create a bill for occupied apartments only.</p>

        {message && (
          <div className={`mb-4 flex items-center justify-between gap-3 rounded-2xl p-4 text-sm font-semibold border ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
              : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              )}
              <p className="text-xs leading-relaxed">{message.text}</p>
            </div>
            <button type="button" onClick={() => setMessage(null)} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-zinc-300">Bill Who?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleScopeChange('compound')}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  targetScope === 'compound' 
                    ? 'bg-[#E03A1D] border-[#E03A1D] text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300'
                }`}
              >
                <Layers className="h-3.5 w-3.5" /> Entire Complex
              </button>
              <button
                type="button"
                onClick={() => handleScopeChange('selective')}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  targetScope === 'selective' 
                    ? 'bg-[#E03A1D] border-[#E03A1D] text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300'
                }`}
              >
                <Home className="h-3.5 w-3.5" /> Select Apartments
              </button>
            </div>
          </div>

          {targetScope === 'selective' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-zinc-300">Choose Compound</label>
                <div className="relative">
                  <select 
                    value={selectedPropertyId} 
                    required
                    onChange={(e) => setSelectedPropertyId(e.target.value)} 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none text-slate-900 appearance-none pr-8 font-semibold dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    <option value="" disabled className="dark:bg-zinc-950">Select a compound...</option>
                    {properties.map(prop => (
                      <option key={prop.id} value={prop.id} className="dark:bg-zinc-950">{prop.title || 'Untitled Compound'}</option>
                    ))}
                  </select>
                  <Building2 className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {selectedPropertyId && filteredRooms.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAllRoomsInCurrentCompound}
                  className="flex items-center gap-2 w-full p-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800/60 transition-all text-left"
                >
                  {isCurrentCompoundFullySelected ? (
                    <CheckSquare className="h-4 w-4 text-[#E03A1D]" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  )}
                  <span className="text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    {isCurrentCompoundFullySelected ? 'Deselect All Rooms in this Compound' : 'Select All Rooms in this Compound'}
                  </span>
                </button>
              )}

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Select Apartments ({selectedRooms.length} selected overall)
                </label>
                <div className="grid grid-cols-3 gap-2 p-2 border border-slate-200 rounded-xl bg-slate-50 max-h-32 overflow-y-auto dark:border-zinc-800 dark:bg-zinc-950">
                  {!selectedPropertyId ? (
                    <p className="col-span-3 text-center text-[11px] text-slate-400 dark:text-zinc-500 py-4 font-medium">
                      Please select a compound above to view active rooms.
                    </p>
                  ) : filteredRooms.length === 0 ? (
                    <p className="col-span-3 text-center text-[11px] text-slate-400 dark:text-zinc-500 py-4 font-medium">
                      No occupied apartments found under this compound.
                    </p>
                  ) : (
                    filteredRooms.map(room => (
                      <button
                        type="button"
                        key={room.id}
                        onClick={() => toggleRoomSelection(room.id)}
                        className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all truncate ${
                          selectedRooms.includes(room.id) 
                            ? 'bg-slate-900 border-slate-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {room.room_number}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-zinc-300">Bill Type</label>
              <select 
                value={billType} 
                onChange={(e) => setBillType(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none font-semibold dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="Electricity" className="dark:bg-zinc-950">Electricity</option>
                <option value="Water" className="dark:bg-zinc-950">Water</option>
                <option value="Internet" className="dark:bg-zinc-950">Internet</option>
                <option value="Maintenance" className="dark:bg-zinc-950">Maintenance</option>
                <option value="Custom" className="dark:bg-zinc-950">Custom Bill Name</option>
              </select>
            </div>
            {billType === 'Custom' && (
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-zinc-300">Custom Bill Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Security fee"
                  value={customBillName} 
                  onChange={(e) => setCustomBillName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-zinc-300">Amount ({CURRENCY_CONFIGS[currency].symbol})</label>
              <input 
                type="number" 
                step="0.01" 
                required 
                value={amountInput} 
                onChange={(e) => setAmountInput(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-zinc-300">Due Date</label>
              <input 
                type="date" 
                required 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none text-slate-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" 
              />
            </div>
            <div className="pt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="recurringField"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded-sm accent-[#E03A1D] dark:bg-zinc-950 dark:border-zinc-800"
              />
              <label htmlFor="recurringField" className="text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
                Repeat Every Month
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || (targetScope === 'selective' && selectedRooms.length === 0)} 
            className="w-full rounded-xl bg-[#E03A1D] text-white font-bold text-xs py-3 mt-2 transition-all hover:brightness-105 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Add Bill'}
          </button>
        </form>
      </div>
    </div>
  );
}