// src/app/owners/[subdomain]/dashboard/compounds/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Layers, Settings, Users, Trash2, Calendar, PlusCircle, X, ArrowLeft, Home, MapPin, Sparkles } from 'lucide-react';

interface PageProps {
  params: Promise<{
    subdomain: string;
    id: string;
  }>;
}

interface Room {
  id: string;
  property_id: string;
  room_number: string;
  status: 'vacant' | 'occupied' | string;
  room_type?: string;
  price_per_month?: number;
}

interface ContractProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface ActiveContract {
  id: string;
  start_date: string | null;
  end_date: string | null;
  profiles: ContractProfile | null;
}

interface PropertyRecord {
  id: string;
  title: string | null;
  rules: string | null;
  location: string | null;
  general_amenities: string[] | null;
}

interface ContractQueryResult {
  id: string;
  start_date: string | null;
  end_date: string | null;
  profiles: ContractProfile | ContractProfile[] | null;
}

export default function CompoundWorkspaceDetails({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const compoundId = resolvedParams?.id;
  const subdomainSlug = resolvedParams?.subdomain;

  const [activeTab, setActiveTab] = useState<'matrix' | 'settings'>('matrix');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeContract, setActiveContract] = useState<ActiveContract | null>(null);
  
  const [resolvedPropertyId, setResolvedPropertyId] = useState<string>('');
  const [compoundTitle, setCompoundTitle] = useState<string>('');
  const [, setDbRules] = useState<string | null>(null);
  
  // Controlled forms (Compound Profile)
  const [editTitle, setEditTitle] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');
  const [editRules, setEditRules] = useState<string>('');
  
  // Amenities state (managed as individual tags)
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState<string>('');

  const [additionalRooms, setAdditionalRooms] = useState<number>(0);
  const [isUpdatingRooms, setIsUpdatingRooms] = useState<boolean>(false);
  const [isSavingOptions, setIsSavingOptions] = useState<boolean>(false);
  const [uiFeedback, setUiFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Helper utility to sort rooms numerically
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const numA = parseInt(a.room_number.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.room_number.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [rooms]);

  const fetchRoomData = useCallback(async () => {
    if (!compoundId) return;
    
    try {
      let propertyData: PropertyRecord | null = null;

      // 1. Fetch property details (including location and amenities)
      const { data: idMatch, error: idError } = await supabase
        .from('properties')
        .select('id, title, rules, location, general_amenities')
        .eq('id', compoundId)
        .maybeSingle();

      if (idError) throw idError;
      if (idMatch) propertyData = idMatch as PropertyRecord;

      // 2. Fallback check: Fetch by subdomain slug if ID lookup fails
      if (!propertyData && subdomainSlug) {
        const { data: slugMatch, error: slugError } = await supabase
          .from('properties')
          .select('id, title, rules, location, general_amenities')
          .eq('subdomain_slug', subdomainSlug)
          .maybeSingle();
        
        if (slugError) throw slugError;
        if (slugMatch) propertyData = slugMatch as PropertyRecord;
      }

      // 3. Mount recovered entity properties into React state
      if (propertyData) {
        setResolvedPropertyId(propertyData.id);
        setCompoundTitle(propertyData.title || 'Unnamed Compound');
        setEditTitle(propertyData.title || '');
        setEditLocation(propertyData.location || '');
        setDbRules(propertyData.rules);
        setEditRules(propertyData.rules || '');
        setAmenities(propertyData.general_amenities || []);

        // 4. Load child room inventory structures
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('property_id', propertyData.id);
        
        if (roomError) throw roomError;
        
        setRooms((roomData as Room[]) || []);
      } else {
        setUiFeedback({ 
          type: 'error', 
          msg: `Property was not found.` 
        });
      }
    } catch (err: unknown) {
      console.error("Fetch Error: ", err);
      const errorMessage = err instanceof Error ? err.message : 'Error occurred retrieving data.';
      setUiFeedback({ type: 'error', msg: errorMessage });
    }
  }, [compoundId, subdomainSlug]);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      if (isMounted) {
        void fetchRoomData();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fetchRoomData]);

  const handleRoomClick = async (room: Room) => {
    setSelectedRoom(room);
    setActiveContract(null);

    if (room.status === 'occupied') {
      const { data: contractData } = await supabase
        .from('contracts')
        .select(`
          id, 
          start_date, 
          end_date, 
          profiles (
            first_name, 
            last_name, 
            email
          )
        `)
        .eq('room_id', room.id)
        .eq('status', 'active')
        .maybeSingle();

      if (contractData) {
        const rawContract = contractData as unknown as ContractQueryResult;
        const profileObj = Array.isArray(rawContract.profiles)
          ? rawContract.profiles[0] || null
          : rawContract.profiles;

        setActiveContract({
          id: rawContract.id,
          start_date: rawContract.start_date,
          end_date: rawContract.end_date,
          profiles: profileObj,
        });
      }
    }
  };

  const handleEvict = async (roomId: string) => {
    try {
      await supabase.from('rooms').update({ status: 'vacant' }).eq('id', roomId);
      await supabase.from('contracts').update({ status: 'terminated' }).eq('room_id', roomId).eq('status', 'active');
      setSelectedRoom(null);
      await fetchRoomData();
      
      setUiFeedback({ type: 'success', msg: 'Tenant occupancy successfully ended.' });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end occupancy.';
      setUiFeedback({ type: 'error', msg: `Failed to end occupancy: ${errorMessage}` });
    }
  };

  // Save changes to Database
  const handleSaveCompoundOptions = async () => {
    const targetId = resolvedPropertyId || compoundId;
    if (!targetId) return;

    setIsSavingOptions(true);
    setUiFeedback(null);

    const { error } = await supabase
      .from('properties')
      .update({
        title: editTitle,
        location: editLocation.trim() || undefined,
        rules: editRules.trim() || undefined,
        general_amenities: amenities
      })
      .eq('id', targetId);

    if (error) {
      setUiFeedback({ type: 'error', msg: `Save Failed: ${error.message}` });
    } else {
      setUiFeedback({ type: 'success', msg: 'Compound settings updated successfully.' });
      await fetchRoomData();
    }
    setIsSavingOptions(false);
  };

  // Manage Amenity Tags locally before saving
  const addAmenityTag = () => {
    if (!newAmenity.trim()) return;
    if (!amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
    }
    setNewAmenity('');
  };

  const removeAmenityTag = (indexToRemove: number) => {
    setAmenities(amenities.filter((_, index) => index !== indexToRemove));
  };

  const handleAddRooms = async () => {
    const targetId = resolvedPropertyId || compoundId;
    if (additionalRooms <= 0 || !targetId) return;
    
    setIsUpdatingRooms(true);
    setUiFeedback(null);

    const currentTotal = rooms.length;
    const roomPayload = Array.from({ length: additionalRooms }, (_, i) => ({
      property_id: targetId,
      room_number: `Apartment ${currentTotal + i + 1}`,
      status: 'vacant',
      room_type: 'Single Room',
      price_per_month: 0
    }));

    const { error } = await supabase
      .from('rooms')
      .insert(roomPayload);
    
    if (error) {
      setUiFeedback({ type: 'error', msg: `Failed to add new apartments: ${error.message}` });
    } else {
      setAdditionalRooms(0);
      setUiFeedback({ type: 'success', msg: `Successfully added ${additionalRooms} new apartments.` });
      await fetchRoomData();
    }
    setIsUpdatingRooms(false);
  };

  const getDisplayRoomNumber = (numStr: string) => {
    return numStr.replace(/Room/g, 'Apartment').replace(/Apartment\s*/g, 'Apartment ');
  };

  return (
    <div className="space-y-6 pb-24 text-slate-900 dark:text-zinc-100">
      
      {/* Back Button */}
      <div className="pt-2">
        <button 
          onClick={() => router.push(`/owners/${subdomainSlug}/dashboard/compounds`)}
          className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition-transform group-hover:-translate-x-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          Back to Compounds
        </button>
      </div>

      {/* Header Tabs Navigation */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{compoundTitle || 'Loading Compound...'}</h1>
          <p className="text-xs text-slate-400 dark:text-zinc-500">Manage rooms, location details, and tenant guidelines.</p>
        </div>

        <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 dark:bg-zinc-900/60 dark:border-zinc-800">
          <button onClick={() => { setActiveTab('matrix'); setUiFeedback(null); }} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white' : 'text-slate-500'}`}>
            <Layers className="h-3.5 w-3.5 text-[#E03A1D]" /> Apartment Grid Map
          </button>
          <button onClick={() => { setActiveTab('settings'); setUiFeedback(null); }} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white' : 'text-slate-500'}`}>
            <Settings className="h-3.5 w-3.5 text-slate-500" /> Edit Compound Details
          </button>
        </div>
      </div>

      {/* Alerts */}
      {uiFeedback && (
        <div className={`flex items-center justify-between p-4 text-xs rounded-2xl border transition-all ${
          uiFeedback.type === 'error' 
            ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30' 
            : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
        }`}>
          <span>{uiFeedback.msg}</span>
          <button onClick={() => setUiFeedback(null)} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'matrix' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Main Grid View */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <h2 className="text-sm font-bold border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">Apartments Overview</h2>
            
            {sortedRooms.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
                No apartments added yet. Click on the &quot;Edit Compound Details&quot; tab to add apartments.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
                {sortedRooms.map((room) => {
                  const isOccupied = room.status === 'occupied';
                  const isCurrent = selectedRoom?.id === room.id;

                  return (
                    <button
                      key={room.id}
                      onClick={() => handleRoomClick(room)}
                      className={`group relative flex flex-col items-center justify-center rounded-2xl border p-3.5 transition-all aspect-square cursor-pointer ${
                        isOccupied 
                          ? 'border-red-100 bg-red-50/40 text-red-600 dark:border-red-950/30 dark:bg-red-950/10 dark:text-red-400 hover:bg-red-50/70' 
                          : 'border-emerald-100 bg-emerald-50/40 text-emerald-600 dark:border-emerald-950/30 dark:bg-emerald-950/10 dark:text-emerald-400 hover:bg-emerald-50/70'
                      } ${isCurrent ? 'ring-2 ring-[#E03A1D] scale-95 border-transparent bg-white shadow-sm dark:bg-zinc-900' : ''}`}
                    >
                      <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full">
                        <Home className="h-5 w-5 stroke-[2]" />
                      </div>
                      <span className="text-[11px] font-bold tracking-tight font-mono">
                        {getDisplayRoomNumber(room.room_number).replace('Apartment', 'Apt.')}
                      </span>
                      <span className="text-[8px] uppercase font-bold tracking-wider mt-0.5 opacity-85">
                        {room.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Side Drawer Info Card */}
          <div className="space-y-4">
            {selectedRoom ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <h3 className="text-sm font-bold">{getDisplayRoomNumber(selectedRoom.room_number)}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${selectedRoom.status === 'occupied' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'}`}>{selectedRoom.status}</span>
                </div>

                {selectedRoom.status === 'occupied' && activeContract ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50/50 border border-slate-100 p-3.5 dark:bg-zinc-950/40 dark:border-zinc-800/80">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Current Tenant</span>
                      <p className="text-sm font-bold mt-1">
                        {activeContract.profiles?.first_name || ''} {activeContract.profiles?.last_name || ''}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{activeContract.profiles?.email || ''}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400">
                      <Calendar className="h-4 w-4 text-[#E03A1D]" />
                      <div>
                        <p>Move In: <span className="font-semibold">{activeContract.start_date ? new Date(activeContract.start_date).toLocaleDateString() : 'N/A'}</span></p>
                        <p className="mt-0.5">Move Out: <span className="font-semibold">{activeContract.end_date ? new Date(activeContract.end_date).toLocaleDateString() : 'N/A'}</span></p>
                      </div>
                    </div>

                    <button onClick={() => handleEvict(selectedRoom.id)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-xs font-bold text-red-600 hover:bg-red-500/20 transition-all dark:bg-red-950/30 dark:text-red-400 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" /> Remove Tenant (Evict)
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 text-center py-6 text-xs text-slate-400 dark:text-zinc-500">
                    <Users className="h-6 w-6 mx-auto text-slate-300 dark:text-zinc-700 mb-2" />
                    This apartment is completely empty.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-zinc-800 dark:text-zinc-600">
                Click on any apartment grid item to see tenant profiles and lease details.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Settings Forms Tab Panel */
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm max-w-2xl dark:border-zinc-800 dark:bg-zinc-900/40 space-y-6">
          
          <div>
            <h2 className="text-sm font-bold border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">Compound Information</h2>
            <div className="space-y-4 text-xs">
              
              {/* Compound Title input */}
              <div>
                <label className="block font-semibold mb-1.5 text-slate-600 dark:text-zinc-400">Compound Name</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Sunrise Estate Compound B"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]" 
                />
              </div>

              {/* Compound Location input */}
              <div>
                <label className="block font-semibold mb-1.5 text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#E03A1D]" /> Compound Location / Address
                </label>
                <input 
                  type="text" 
                  value={editLocation} 
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. 12 Parkview Avenue, Lagos, Nigeria"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]" 
                />
              </div>

              {/* General Amenities tags list input */}
              <div>
                <label className="block font-semibold mb-1.5 text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> General Amenities & Perks
                </label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addAmenityTag(); } }}
                    placeholder="e.g. 24/7 Power, Swimming Pool, High Speed WiFi"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]"
                  />
                  <button 
                    type="button"
                    onClick={addAmenityTag}
                    className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold dark:border-zinc-800 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Display Amenity Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {amenities.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No community amenities listed yet.</span>
                  ) : (
                    amenities.map((amenity, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 px-2.5 py-1 rounded-full font-medium text-[11px]">
                        {amenity}
                        <button type="button" onClick={() => removeAmenityTag(idx)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Tenancy / House Rules Guidelines Text Box */}
              <div>
                <label className="block font-semibold mb-1.5 text-slate-600 dark:text-zinc-400">House Rules & Tenancy Agreement text</label>
                <textarea 
                  rows={6}
                  value={editRules} 
                  onChange={(e) => setEditRules(e.target.value)}
                  placeholder="Type any specific operational guidelines or resident restrictions here..."
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 p-3 outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-[#E03A1D]" 
                />
              </div>

              <button 
                onClick={handleSaveCompoundOptions}
                disabled={isSavingOptions || !editTitle}
                className="rounded-xl bg-[#E03A1D] disabled:opacity-50 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:brightness-105 cursor-pointer"
              >
                {isSavingOptions ? "Saving Details..." : "Save Compound Settings"}
              </button>
            </div>
          </div>

          {/* Scale Compound Room Inventory */}
          <div className="border-t border-slate-100 pt-6 dark:border-zinc-800">
            <h3 className="text-sm font-bold mb-1">Add New Apartments</h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mb-4">
              Currently Registered: <span className="font-bold text-slate-700 dark:text-zinc-300">{rooms.length} Apartments</span>
            </p>
            
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/20 flex flex-col sm:flex-row sm:items-end gap-3 max-w-md">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">How many extra apartments?</label>
                <input 
                  type="number" 
                  min={0} 
                  value={additionalRooms === 0 ? '' : additionalRooms} 
                  placeholder="e.g. 5"
                  onChange={(e) => setAdditionalRooms(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#E03A1D] dark:border-zinc-800 dark:bg-zinc-900" 
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddRooms}
                disabled={isUpdatingRooms || additionalRooms <= 0}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#E03A1D] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 text-xs font-bold transition-all whitespace-nowrap shadow-sm h-[34px] cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                {isUpdatingRooms ? "Adding..." : "Add to Grid"}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}