// src/app/auth/sign-in/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ThemeToggle from '@/components/landingpage/ThemeToggle';
import { processSignIn } from '../action';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const result = await processSignIn(formData);

    if (result.error) {
      setLoading(false);
      setMessage({ type: 'error', text: result.error });
    } else if (result.redirectUrl) {
      // Force a clean browser redirect to the absolute subdomain URL
      window.location.replace(result.redirectUrl);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16 bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Floating Theme Toggle */}
      <ThemeToggle />

      <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-8 shadow-xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="relative h-12 w-12 mb-3 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Image src="/logo.png" alt="Africompound Logo" fill className="object-cover" priority />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            Africompound<span className="text-[#E03A1D]">.com</span>
          </h1>
          <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Enter your credentials to continue.
          </p>
        </div>

        {message && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-xs font-semibold ${
            message.type === 'error' 
              ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
          }`}>
            {message.text}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="name@example.com"
              className="rounded-xl border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:border-[#E03A1D] focus:ring-[#E03A1D]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="••••••••"
              className="rounded-xl border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:border-[#E03A1D] focus:ring-[#E03A1D]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full rounded-xl bg-[#E03A1D] text-white hover:bg-[#c22f15] font-bold text-xs py-3 shadow-md shadow-[#E03A1D]/20 transition-all mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs font-medium text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="text-[#E03A1D] font-bold hover:underline">
            Register Workspace
          </Link>
        </div>

      </div>
    </main>
  );
}