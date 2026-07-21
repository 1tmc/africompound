// src/app/owners/[subdomain]/dashboard/compounds/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, ArrowRight, X, Upload, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import type { DashboardProperty } from '@/types/dashboard';

// Extend local TS type to support parent-child relationship fields safely
interface ExtendedProperty extends DashboardProperty {
  parent_property_id?: string | null;
}

export default function CompoundsDashboard({ params }: { params: Promise<{ subdomain: string }> }) {
  const unwrappedParams = React.use(params);
  const currentSubdomain = unwrappedParams.subdomain;

  const { currentUser, isInitialized } = useAuthStore();

  const [primaryCompound, setPrimaryCompound] = useState<ExtendedProperty | null>(null);
  const [compounds, setCompounds] = useState<ExtendedProperty[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  
  // Creation Form Input Elements Data
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [totalRooms, setTotalRooms] = useState(12);
  const [contractMode, setContractMode] = useState<'upload' | 'write'>('write');
  const [contractText, setContractText] = useState('');

  // Bypass strict Supabase generic type checking for schema extensions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Fetch both the primary compound AND its sister/child compounds
  const fetchScopedCompounds = useCallback(async () => {
    try {
      // 1. Fetch the unique primary compound for this subdomain
      const { data: primaryData, error: primaryErr } = await db
        .from('properties')
        .select('*')
        .eq('subdomain_slug', currentSubdomain)
        .maybeSingle();

      if (primaryErr) throw primaryErr;
      if (!primaryData) return;

      const typedPrimaryData = primaryData as ExtendedProperty;
      setPrimaryCompound(typedPrimaryData);

      // 2. Fetch any sister compounds linked to this primary compound's ID
      const { data: sisterData, error: sisterErr } = await db
        .from('properties')
        .select('*')
        .eq('parent_property_id', typedPrimaryData.id);

      if (sisterErr) throw sisterErr;

      // Group them together to render in the UI list
      const allAssociatedCompounds: ExtendedProperty[] = [
        typedPrimaryData,
        ...((sisterData as ExtendedProperty[]) || [])
      ];

      setCompounds(allAssociatedCompounds);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed loading compounds:", error.message || err);
    }
  }, [currentSubdomain, db]);

  useEffect(() => {
    let isMounted = true;
    
    const executeFetch = async () => {
      if (isMounted) {
        await fetchScopedCompounds();
      }
    };

    void executeFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchScopedCompounds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthErrorMsg(null);

    if (!currentUser) {
      setAuthErrorMsg("No active session found. Please try logging out and logging back in.");
      setLoading(false);
      return;
    }

    if (!primaryCompound) {
      setAuthErrorMsg("Primary portal configuration not found. Cannot attach additional compounds.");
      setLoading(false);
      return;
    }

    // Insert the new sister compound
    const { data: compoundData, error: insertError } = await db
      .from('properties')
      .insert({ 
        title, 
        location, 
        subdomain_slug: null, // Kept NULL to safely bypass the UNIQUE constraint
        parent_property_id: primaryCompound.id, // Linked to parent/primary workspace ID
        host_id: currentUser.id,
        rules: contractMode === 'write' ? contractText : 'File Attached' 
      })
      .select()
      .single();

    if (!insertError && compoundData) {
      const resolvedCompound = compoundData as ExtendedProperty;

      const roomPayload = Array.from({ length: totalRooms }, (_, i) => ({
        property_id: resolvedCompound.id,
        room_number: `Room ${i + 1}`,
        status: 'vacant',
        room_type: 'Single Room', 
        price_per_month: 0         
      }));

      const { error: roomInsertError } = await supabase.from('rooms').insert(roomPayload);
      
      if (roomInsertError) {
        console.error("Room Insertion Error: ", roomInsertError);
      }
      
      setIsModalOpen(false);
      setTitle('');
      setLocation('');
      setContractText('');
      void fetchScopedCompounds();
    } else if (insertError) {
      console.error("Compound Insertion Error: ", insertError);
      setAuthErrorMsg(insertError.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-24 text-slate-900 dark:text-zinc-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Compounds</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">View and manage properties, view occupancy configurations, or configure rental contracts.</p>
        </div>

        {/* Real-time Connection Indicator tied to Zustand store status */}
        <div className="flex items-center gap-2 self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
          <span className={`h-2 w-2 rounded-full ${currentUser ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          {!isInitialized ? (
            <span className="text-slate-500">Checking Session...</span>
          ) : currentUser ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> Securely Synced
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Disconnected</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {compounds.map((compound: ExtendedProperty) => (
          <Link 
            key={compound.id}
            href={`/owners/${currentSubdomain}/dashboard/compounds/${compound.id}`}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#E03A1D]/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E03A1D]/10 text-[#E03A1D]">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#E03A1D] transition-colors">
                {compound.title} {compound.id === primaryCompound?.id && <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-2 py-0.5 rounded-full ml-1 font-normal">Primary</span>}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500">
                <MapPin className="h-3 w-3" /> {compound.location || 'No Location Provided'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Click to view details</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#E03A1D]">
                View Rooms <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex min-h-[190px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/30 p-5 text-center hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/10 dark:hover:bg-zinc-900/20 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 group-hover:text-[#E03A1D] group-hover:border-[#E03A1D]/30 transition-all dark:border-zinc-800 dark:bg-zinc-950">
            <Plus className="h-5 w-5" />
          </div>
          <span className="mt-3 text-sm font-semibold text-slate-700 dark:text-zinc-300">Register New Compound</span>
          <span className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Set up new room lists & contract guidelines</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
              <h2 className="text-lg font-bold">Add Sister Compound</h2>
              <button onClick={() => { setIsModalOpen(false); setAuthErrorMsg(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {authErrorMsg && (
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-red-500/10 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{authErrorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-600 dark:text-zinc-400">Compound Name</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Bismark Heights" required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-900 focus:border-[#E03A1D]" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-600 dark:text-zinc-400">Address / Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Ablekuma, Accra" required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-900 focus:border-[#E03A1D]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-600 dark:text-zinc-400">Total Available Rooms</label>
                <input type="number" value={totalRooms} onChange={e => setTotalRooms(Number(e.target.value))} min={1} required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-900 focus:border-[#E03A1D]" />
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/30">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-zinc-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Tenancy Agreement Document</span>
                  <div className="flex rounded-lg bg-white p-0.5 border border-slate-200 dark:bg-zinc-950 dark:border-zinc-800">
                    <button type="button" onClick={() => setContractMode('write')} className={`rounded-md px-2 py-1 text-[10px] font-bold ${contractMode === 'write' ? 'bg-[#E03A1D] text-white' : 'text-slate-500'}`}>Write Text</button>
                    <button type="button" onClick={() => setContractMode('upload')} className={`rounded-md px-2 py-1 text-[10px] font-bold ${contractMode === 'upload' ? 'bg-[#E03A1D] text-white' : 'text-slate-500'}`}>Upload File</button>
                  </div>
                </div>

                <div className="mt-3">
                  {contractMode === 'write' ? (
                    <textarea rows={4} value={contractText} onChange={e => setContractText(e.target.value)} placeholder="Type the rental agreement or house rules that tenants will see..." className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-[#E03A1D] dark:border-zinc-800 dark:bg-zinc-900 resize-none text-slate-900 dark:text-zinc-100" />
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-4 text-center">
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-xs font-medium mt-1 text-slate-600 dark:text-zinc-400">Upload PDF or Word Document agreement</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !isInitialized || !currentUser || !primaryCompound} 
                className="w-full rounded-xl bg-[#E03A1D] py-3 text-xs font-bold text-white shadow-md hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Compound...' : !currentUser ? 'Waiting for Session...' : 'Create Compound'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}