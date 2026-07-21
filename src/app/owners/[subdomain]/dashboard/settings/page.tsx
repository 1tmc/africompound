// src/app/owners/[subdomain]/dashboard/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Shield, User, Globe, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface SettingsPageProps {
  params: Promise<{ subdomain: string }> | { subdomain: string };
}

// Helper to clean up the text for the web link (URL slug)
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/[^\w\-]+/g, '')     // Remove special characters
    .replace(/\-\-+/g, '-');      // Remove double dashes

export default function SettingsPage({ params }: SettingsPageProps) {
  const { currentUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [, setCurrentSubdomain] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    async function loadSettings() {
      const resolvedParams = 'then' in params ? await params : params;
      setCurrentSubdomain(resolvedParams.subdomain);
      setCustomSlug(resolvedParams.subdomain);

      // 1. Get company details using the current web link link
      const { data: propertyData } = await supabase
        .from('properties')
        .select('title, subdomain_slug')
        .eq('subdomain_slug', resolvedParams.subdomain)
        .maybeSingle();

      if (propertyData) {
        setCompanyName(propertyData.title || '');
      }

      // 2. Get the user's personal profile info
      if (currentUser?.id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (profileData) {
          setFirstName(profileData.first_name || '');
          setLastName(profileData.last_name || '');
        }
      }
    }
    void loadSettings();
  }, [params, currentUser]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const resolvedParams = 'then' in params ? await params : params;
    const cleanSlug = slugify(customSlug);

    try {
      // 1. Save personal profile info
      if (currentUser?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          })
          .eq('id', currentUser.id);

        if (profileError) throw profileError;
      }

      // 2. Save company name and web link slug
      const { error: propertyError } = await supabase
        .from('properties')
        .update({
          title: companyName.trim(),
          subdomain_slug: cleanSlug,
        })
        .eq('subdomain_slug', resolvedParams.subdomain);

      if (propertyError) throw propertyError;

      setMessage({ type: 'success', text: 'Settings saved successfully!' });

      // 3. If the web link slug changed, send the user to the new page automatically
      if (cleanSlug !== resolvedParams.subdomain) {
        setTimeout(() => {
          window.location.href = `/owners/${cleanSlug}/dashboard/settings`;
        }, 1500);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setMessage({ type: 'error', text: `Failed to save changes: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 text-slate-900 dark:text-zinc-100">
      
      {/* Alert Banner for Messages */}
      {message && (
        <div className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' 
            : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
          <p>{message.text}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <h1 className="text-2xl font-black tracking-tight">Account & System Settings</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Manage your global organization name, personal profile, and your dashboard web link.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Main Form Fields */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Section 1: Company & URL Web Link Info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="mb-4 flex items-center gap-2 font-bold border-b border-slate-100 pb-3 dark:border-zinc-800/60">
              <Globe className="h-4 w-4 text-[#E03A1D]" />
              <h2>Company Details & Links</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                  Company / Organization Name
                </label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. AfriCompound Group"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#E03A1D] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-[#E03A1D]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                  Custom Link Extension (URL Slug)
                </label>
                <div className="flex items-center w-full rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden focus-within:border-[#E03A1D] dark:focus-within:border-[#E03A1D] transition">
                  <span className="bg-slate-100 dark:bg-zinc-900 px-3 py-2.5 text-slate-400 font-medium select-none border-r border-slate-200 dark:border-zinc-800">
                    /owners/
                  </span>
                  <input 
                    type="text" 
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="company-link"
                    className="w-full bg-transparent px-3 py-2.5 text-xs text-slate-900 outline-none dark:text-zinc-100"
                    required
                  />
                  <span className="bg-slate-100 dark:bg-zinc-900 px-3 py-2.5 text-slate-400 font-medium select-none border-l border-slate-200 dark:border-zinc-800">
                    /dashboard
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1.5 pl-1">
                  ⚠️ Note: Changing this link modifies the address you use to open your dashboard. The page will reload and update your browser link automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Profile Info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="mb-4 flex items-center gap-2 font-bold border-b border-slate-100 pb-3 dark:border-zinc-800/60">
              <User className="h-4 w-4 text-[#E03A1D]" />
              <h2>Profile Details</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                  First Name
                </label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-[#E03A1D] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-[#E03A1D]"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                  Last Name
                </label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-[#E03A1D] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-[#E03A1D]"
                  required
                />
              </div>
            </div>
          </div>

        </div>

        {/* Info Box & Save Action Button */}
        <div className="space-y-6">
          
          {/* Simple Information Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold border-b border-slate-100 pb-2 dark:border-zinc-800/60">
              <Shield className="h-4 w-4 text-amber-500" />
              <h2>Looking for Compound Settings?</h2>
            </div>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
              To edit details for an individual compound, head over to your specific property management setup under the <span className="font-bold text-[#E03A1D]">Compounds</span> dashboard menu.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E03A1D] py-3 text-xs font-bold text-white shadow-md shadow-[#E03A1D]/20 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving adjustments...' : 'Save Changes'}
          </button>

        </div>
      </form>
    </div>
  );
}