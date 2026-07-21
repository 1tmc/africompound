// src/app/owners/[subdomain]/dashboard/reports/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Filter, ShieldAlert, Building, MessageSquare, X, Image as ImageIcon,
  CheckCircle2, AlertCircle, Send, UserCheck, UserX
} from 'lucide-react';

interface Report {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  property_id: string;
  room_id: string;
  title: string;
  description: string;
  urgency: string;
  status: 'pending' | 'in_progress' | 'resolved';
  media_urls: string[];
  sender_profile?: { first_name: string; last_name: string; role: string };
  property?: { title: string };
  room?: { room_number: string };
}

interface AppMessage {
  type: 'success' | 'error';
  text: string;
}

interface OwnerContextOption {
  room_id: string;
  tenant_id: string;
  rooms?: {
    room_number: string;
    property_id: string;
    properties?: {
      title: string;
    } | null;
  } | null;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface TenantContext {
  roomId: string;
  propertyId: string;
  hostId: string;
}

interface ReportInsertRecord {
  sender_id: string;
  receiver_id: string | null;
  property_id: string | null;
  room_id: string | null;
  title: string;
  description: string;
  urgency: string;
  status: string;
  media_urls: string[];
}

interface ContractQueryResult {
  room_id: string;
  tenant_id: string;
  rooms: {
    room_number: string;
    property_id: string;
    properties: {
      title: string;
    } | null;
  } | null;
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
}

interface SingleContractQueryResult {
  room_id: string;
  host_id: string;
  rooms: {
    property_id: string;
  } | null;
}

// Strongly-typed accessor for untyped Supabase tables
function reportsTable() {
  return supabase.from('reports' as unknown as 'contracts');
}

export default function ReportsPage() {
  const { currentUser, isInitialized } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  
  const [message, setMessage] = useState<AppMessage | null>(null);

  // Form State
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    urgency: 'medium',
    property_id: '',
    room_id: '',
    target_user_id: '', 
  });
  
  // Media State
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Metadata Context
  const [tenantContext, setTenantContext] = useState<TenantContext | null>(null);
  const [ownerContextOptions, setOwnerContextOptions] = useState<OwnerContextOption[]>([]);

  const isOwner = currentUser?.role === 'host' || currentUser?.role === 'owner' || currentUser?.role === 'admin';

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadContext = useCallback(async () => {
    if (!currentUser) return;
    try {
      if (isOwner) {
        const { data, error } = await supabase
          .from('contracts')
          .select(`
            room_id,
            tenant_id,
            rooms(room_number, property_id, properties(title)),
            profiles:profiles!tenant_id(first_name, last_name)
          `)
          .eq('status', 'active');
        
        if (error) throw error;
        
        const typedData = (data as unknown as ContractQueryResult[]) || [];
        setOwnerContextOptions(typedData);
      } else {
        const { data, error } = await supabase
          .from('contracts')
          .select(`
            room_id,
            host_id,
            rooms(property_id)
          `)
          .eq('tenant_id', currentUser.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error) throw error;

        const typedContract = data as unknown as SingleContractQueryResult | null;

        if (typedContract?.rooms) {
          setTenantContext({
            roomId: typedContract.room_id,
            propertyId: typedContract.rooms.property_id,
            hostId: typedContract.host_id,
          });
        }
      }
    } catch (err: unknown) {
      console.error('Failed to load operational context:', err);
    }
  }, [currentUser, isOwner]);

  const fetchReports = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await reportsTable()
        .select(`
          *,
          sender_profile:profiles!sender_id(first_name, last_name, role),
          property:properties(title),
          room:rooms(room_number)
        `)
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data as unknown as Report[]) || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setMessage({ type: 'error', text: `Could not sync reports: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    let isMounted = true;

    if (isInitialized) {
      if (currentUser) {
        Promise.resolve().then(() => {
          if (isMounted) {
            void fetchReports();
            void loadContext();
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
  }, [isInitialized, currentUser, fetchReports, loadContext]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingMedia(true);
    const files = Array.from(e.target.files);

    try {
      const urls: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `${currentUser?.id}/${Math.random()}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('user-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('user-assets')
          .getPublicUrl(filePath);

        urls.push(publicUrl);
      }
      setUploadedUrls(prev => [...prev, ...urls]);
      setMediaPreviews(prev => [...prev, ...urls]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setMessage({ type: 'error', text: `Media storage link failed: ${errorMessage}` });
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    setMessage(null);

    let resolvedReceiverId = '';
    let resolvedRoomId = '';
    let resolvedPropertyId = '';

    if (isOwner) {
      const targetOption = ownerContextOptions.find(o => o.tenant_id === formData.target_user_id);
      if (targetOption) {
        resolvedReceiverId = formData.target_user_id;
        resolvedRoomId = targetOption.room_id;
        resolvedPropertyId = targetOption.rooms?.property_id || '';
      }
    } else if (tenantContext) {
      resolvedReceiverId = tenantContext.hostId;
      resolvedRoomId = tenantContext.roomId;
      resolvedPropertyId = tenantContext.propertyId;
    }

    const payload: ReportInsertRecord = {
      sender_id: currentUser.id,
      receiver_id: resolvedReceiverId.trim() !== '' ? resolvedReceiverId : null,
      property_id: resolvedPropertyId.trim() !== '' ? resolvedPropertyId : null,
      room_id: resolvedRoomId.trim() !== '' ? resolvedRoomId : null,
      title: formData.title.trim(),
      description: formData.description.trim(),
      urgency: formData.urgency || 'medium',
      status: 'pending',
      media_urls: uploadedUrls || [],
    };

    if (!payload.receiver_id || !payload.property_id || !payload.room_id) {
      setMessage({ 
        type: 'error', 
        text: 'Missing architectural data links. Ensure an active lease contract or valid tenant target is selected.' 
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await reportsTable().insert(payload as unknown as never);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Well done, report statement dispatched successfully!' });
      setIsNewReportOpen(false);
      setFormData({ title: '', description: '', urgency: 'medium', property_id: '', room_id: '', target_user_id: '' });
      setUploadedUrls([]);
      setMediaPreviews([]);
      void fetchReports();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error(err);
      setMessage({ type: 'error', text: `Database Rejected Insert: ${errorMessage}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: 'pending' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await reportsTable()
        .update({ status: nextStatus } as unknown as never)
        .eq('id', id);

      if (error) throw error;
      setMessage({ type: 'success', text: `Report modified status to: ${nextStatus}` });
      void fetchReports();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setMessage({ type: 'error', text: `Failed to update status: ${errorMessage}` });
    }
  };

  // Filter based on status header select tab
  const baseFiltered = reports.filter(r => statusFilter === 'all' || r.status === statusFilter);

  // Split logic blocks for segmented UI
  const reportsCreatedByMe = baseFiltered.filter(r => r.sender_id === currentUser?.id);
  const reportsFromTenants = baseFiltered.filter(r => r.sender_id !== currentUser?.id);

  // Render individual report cards cleanly
  const renderReportCard = (report: Report) => (
    <div key={report.id} className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
            <ShieldAlert className="h-3 w-3" /> {report.urgency} priority
          </span>
          <h3 className="text-sm font-bold tracking-tight">{report.title}</h3>
        </div>

        <select 
          value={report.status}
          onChange={(e) => handleUpdateStatus(report.id, e.target.value as 'pending' | 'in_progress' | 'resolved')}
          disabled={!isOwner}
          className="text-[10px] font-extrabold uppercase rounded-lg px-2.5 py-1 outline-none bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white disabled:opacity-80"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{report.description}</p>

      {report.media_urls && report.media_urls.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {report.media_urls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
              <img src={url} alt="Attached asset proof" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800/60 text-[10px] text-slate-400 uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Building className="h-3 w-3 text-slate-400" />
          <span>{report.property?.title || 'Main Compound'} — Room {report.room?.room_number || 'N/A'}</span>
        </div>
        <div>By: {report.sender_profile?.first_name || 'System User'}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 text-slate-900 dark:text-zinc-100">
      
      {/* Structural Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-black">Issue & Reports Center</h1>
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            {isOwner ? "Review, track, and manage compound tenant complaints" : "File issues, track resolution, and view host notifications"}
          </p>
        </div>

        <button 
          onClick={() => setIsNewReportOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E03A1D] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95 self-start sm:self-center cursor-pointer"
        >
          <Send className="h-4 w-4" /> File New Report
        </button>
      </div>

      {/* Internal Custom App Message Banner */}
      {message && (
        <div className={`flex items-center justify-between gap-3 rounded-2xl p-4 text-sm font-semibold transition-all shadow-md border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/5' 
            : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 dark:bg-red-500/5'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            )}
            <p className="text-xs sm:text-sm">{message.text}</p>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800">
          {(['all', 'pending', 'in_progress', 'resolved'] as const).map((filter) => (
            <button 
              key={filter}
              onClick={() => setStatusFilter(filter)} 
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === filter 
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Stream Segmented Block */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Syncing database data...</div>
      ) : baseFiltered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 py-16 text-center text-slate-400 dark:text-zinc-600">
          <MessageSquare className="h-10 w-10 mx-auto opacity-40 mb-2" />
          <p className="text-xs">No reports statement logs found matching this criteria.</p>
        </div>
      ) : isOwner ? (
        /* Owner View Segmented Blocks */
        <div className="space-y-10">
          
          {/* Block 1: Reports Created By You */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-2">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Reports Created By You ({reportsCreatedByMe.length})</h2>
            </div>
            {reportsCreatedByMe.length === 0 ? (
              <p className="text-xs text-slate-400 italic pl-1">You have not issued any outward statements.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportsCreatedByMe.map(renderReportCard)}
              </div>
            )}
          </div>

          {/* Block 2: Reports From Tenants */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-2">
              <UserX className="h-4 w-4 text-[#E03A1D]" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Reports From Tenants ({reportsFromTenants.length})</h2>
            </div>
            {reportsFromTenants.length === 0 ? (
              <p className="text-xs text-slate-400 italic pl-1">No pending tenant complaints reported.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportsFromTenants.map(renderReportCard)}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Streamlined Tenant Standard Single Column Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {baseFiltered.map(renderReportCard)}
        </div>
      )}

      {/* Creation Slideout Overlay Form */}
      {isNewReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <button onClick={() => setIsNewReportOpen(false)} className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer">
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-lg font-bold">Submit Issue Statement</h2>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mb-5">Detail any operational concerns, including urgent asset details.</p>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              
              {isOwner && (
                <div>
                  <label className="block font-semibold mb-1">Target Tenant & Assignment Context</label>
                  <select 
                    required 
                    value={formData.target_user_id} 
                    onChange={(e) => setFormData({...formData, target_user_id: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 px-3 py-2.5 outline-none"
                  >
                    <option value="">Select Target...</option>
                    {ownerContextOptions.map(o => (
                      <option key={o.tenant_id} value={o.tenant_id}>
                        {o.profiles?.first_name} {o.profiles?.last_name} — (Room {o.rooms?.room_number} inside {o.rooms?.properties?.title})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Subject Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Broken master faucet pipe leaking" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 px-3 py-2.5 outline-none" 
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea 
                  rows={4} 
                  required 
                  placeholder="Detail operational parameters explicitly..." 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 px-3 py-2.5 outline-none resize-none" 
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Urgency Priority Indicator</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setFormData({...formData, urgency: lvl})}
                      className={`py-2 px-1 rounded-xl font-bold uppercase text-[9px] border transition-all cursor-pointer ${
                        formData.urgency === lvl
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500' 
                          : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Media File Upload Proof</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 px-4 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                    <span>{uploadingMedia ? "Uploading Media..." : "Attach File Assets"}</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/*" 
                      disabled={uploadingMedia} 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
                
                {mediaPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mediaPreviews.map((url, index) => (
                      <div key={index} className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800">
                        <img src={url} alt="Attached asset thumb preview" className="h-full w-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => {
                            setMediaPreviews(prev => prev.filter((_, i) => i !== index));
                            setUploadedUrls(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || uploadingMedia} 
                className="w-full rounded-xl bg-[#E03A1D] disabled:opacity-50 text-white font-bold text-xs py-3 mt-4 transition-all hover:brightness-105 cursor-pointer"
              >
                {isSubmitting ? "Processing Statement..." : "Complete & Dispatch Report"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}