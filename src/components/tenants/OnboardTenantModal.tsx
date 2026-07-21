'use client'

import React from 'react';
import { X, DollarSign } from 'lucide-react';
import type { DashboardRoomSummary } from '@/types/dashboard';
import type { NewTenantFormState, PropertySummary } from './types';

interface OnboardTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertySummary[];
  filteredRooms: DashboardRoomSummary[];
  selectedPropertyId: string;
  onSelectedPropertyIdChange: (propertyId: string) => void;
  newTenant: NewTenantFormState;
  onNewTenantChange: (updater: (prev: NewTenantFormState) => NewTenantFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export default function OnboardTenantModal({
  isOpen,
  onClose,
  properties,
  filteredRooms,
  selectedPropertyId,
  onSelectedPropertyIdChange,
  newTenant,
  onNewTenantChange,
  onSubmit,
  isSubmitting,
}: OnboardTenantModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-bold">Onboard New Tenant</h2>
        <p className="text-xs text-slate-400 dark:text-zinc-500 mb-5">Set up the profile, link their lease contract, and define base pricing details.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">First Name</label>
              <input
                type="text"
                required
                value={newTenant.firstName}
                onChange={(e) => onNewTenantChange(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Last Name</label>
              <input
                type="text"
                required
                value={newTenant.lastName}
                onChange={(e) => onNewTenantChange(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={newTenant.email}
                onChange={(e) => onNewTenantChange(prev => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={newTenant.phone}
                onChange={(e) => onNewTenantChange(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
              />
            </div>
          </div>

          {/* Two-Tier Cascade Selection */}
          <div className="grid grid-cols-2 gap-3">
            {/* Tier 1: Select Compound / Property */}
            <div>
              <label className="block text-xs font-semibold mb-1">Select Compound</label>
              <select
                required
                value={selectedPropertyId}
                onChange={(e) => {
                  onSelectedPropertyIdChange(e.target.value);
                  onNewTenantChange(prev => ({ ...prev, roomId: '' }));
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
              >
                <option value="">Choose Compound...</option>
                {properties.map(compound => (
                  <option key={compound.id} value={compound.id}>
                    {compound.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Tier 2: Select Room (Filtered by chosen compound) */}
            <div>
              <label className="block text-xs font-semibold mb-1">Select Apartment</label>
              <select
                required
                disabled={!selectedPropertyId}
                value={newTenant.roomId}
                onChange={(e) => onNewTenantChange(prev => ({ ...prev, roomId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D] disabled:opacity-50"
              >
                <option value="">
                  {!selectedPropertyId ? "Select compound first..." : "Choose Room..."}
                </option>
                {filteredRooms.map(r => (
                  <option key={r.id} value={r.id}>
                    Apt {r.room_number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Pricing / Currency Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Dynamic Currency Selector */}
            <div>
              <label className="block text-xs font-semibold mb-1">Currency</label>
              <select
                required
                value={newTenant.currency}
                onChange={(e) => onNewTenantChange(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
              >
                <option value="GHS">GHS (₵)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="NGN">NGN (₦)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Rent Amount (Monthly)
              </label>
              <input
                type="number"
                required
                placeholder="0.00"
                value={newTenant.rentPrice}
                onChange={(e) => onNewTenantChange(prev => ({ ...prev, rentPrice: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Start Lease</label>
              <input
                type="date"
                required
                value={newTenant.startDate}
                onChange={(e) => onNewTenantChange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">End Lease</label>
              <input
                type="date"
                required
                value={newTenant.endDate}
                onChange={(e) => onNewTenantChange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
              />
            </div>
          </div>

          {/* Setup Additional Initial Bill (Optional) */}
          <div className="border-t border-slate-200 pt-4 dark:border-zinc-800">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Optional Setup Bill ({newTenant.currency})</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Setup Fee Name</label>
                <input
                  type="text"
                  placeholder="e.g. Electricity Deposit"
                  value={newTenant.initialBillType}
                  onChange={(e) => onNewTenantChange(prev => ({ ...prev, initialBillType: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Setup Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newTenant.initialBillAmount}
                  onChange={(e) => onNewTenantChange(prev => ({ ...prev, initialBillAmount: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-[#E03A1D] disabled:opacity-50 text-white font-bold text-xs py-3 mt-4 transition-all hover:brightness-105">
            {isSubmitting ? 'Onboarding Account...' : 'Complete Onboarding'}
          </button>
        </form>
      </div>
    </div>
  );
}
