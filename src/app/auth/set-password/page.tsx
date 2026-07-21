// src/app/auth/set-password/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { KeyRound, Loader2 } from 'lucide-react';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Updates the password on the currently authenticated temporary session
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Password established successfully! Redirect them to the sign-in page
      router.push('/auth/signin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 dark:bg-zinc-950 transition-colors">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
        <div className="mb-6 text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-[#E03A1D]/10 flex items-center justify-center text-[#E03A1D] mb-3">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-black">Set Your Password</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Create a password to access your community chat space.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 text-xs font-semibold p-3 rounded-xl bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-zinc-300">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 focus:border-slate-300 dark:focus:border-zinc-700 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E03A1D] text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 hover:brightness-105 disabled:opacity-50 transition-all"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Password & Log In
          </button>
        </form>
      </div>
    </div>
  );
}