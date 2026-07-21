// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/landingpage/Header';
import Footer from '@/components/landingpage/Footer';
import ThemeToggle from '@/components/landingpage/ThemeToggle';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  Wrench, 
  Receipt, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  Globe2
} from 'lucide-react';

// Currency Rates relative to base $1 USD
const CURRENCY_RATES: Record<string, { rate: number; symbol: string; name: string }> = {
  USD: { rate: 1, symbol: '$', name: 'US Dollar' },
  GHS: { rate: 15.5, symbol: 'GH₵', name: 'Ghanaian Cedi' },
  NGN: { rate: 1500, symbol: '₦', name: 'Nigerian Naira' },
  EUR: { rate: 0.92, symbol: '€', name: 'Euro' },
  GBP: { rate: 0.78, symbol: '£', name: 'British Pound' },
};

export default function Home() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const basePrice = 1; // $1 USD / Month

  const currentCurrency = CURRENCY_RATES[selectedCurrency];
  const convertedAmount = (basePrice * currentCurrency.rate).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Floating Theme Widget */}
      <ThemeToggle />

      {/* Main Header */}
      <Header />

      <main className="pt-24 pb-16">
        
        {/* HERO SECTION */}
        <section className="px-6 max-w-7xl mx-auto py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4 text-[#E03A1D]" /> Engineered for Long-Term Multi-Room Tenancies
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
              Compound House Operations. <br />
              <span className="text-[#E03A1D]">Simplified & Automated.</span>
            </h1>

            <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Africompound.com solves real estate operational friction across multi-unit property structures, multi-year lease advances, utilities tracking, and resident communication channels.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                href="/auth/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E03A1D] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E03A1D]/20 hover:bg-[#c22f15] transition-all"
              >
                Register Workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/auth/sign-in"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-bold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-tr from-[#E03A1D]/20 to-zinc-100 dark:to-zinc-900 p-8 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
              <div className="relative h-28 w-28 mb-6">
                <Image src="/logo.png" alt="Africompound Logo" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Africompound Ecosystem</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Connecting property owners and occupants under a unified digital workflow.</p>
            </div>
          </div>
        </section>

        {/* ABOUT US & PROBLEM SOLVING PLAN SECTION */}
        <section id="about" className="py-20 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800 px-6">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-xs font-bold text-[#E03A1D] tracking-widest uppercase">About Us</h2>
              <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">Our Problem Solving Plan</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Unlike standard vacation rental software built for short stays, Africompound.com solves the structural hurdles of long-term tenancy blocks and compound properties prevalent across regional rental markets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 text-[#E03A1D] flex items-center justify-center font-bold">01</div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Multi-Year Advance Tracking</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Replaces manual notebook ledgers with digital graphical countdowns for 6-month, 1-year, and 2-year upfront rental advances.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">02</div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Data-Masked Communication</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Eliminates messy group chats by introducing room-based micro-forums -The Joint System- that protect personal phone numbers.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">03</div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Immutable Reviews</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Protects prospective tenants through historical remarks written exclusively by verified past tenants.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-[#E03A1D] tracking-widest uppercase">Ecosystem Modules</h2>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">Core Application Capabilities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4">
              <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Admin / Landlord Dashboard</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Multi-room inventory management engine, dynamic room pricing (Single Room, Chamber & Hall, Self-contained), and automated digital e-lease generation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4">
              <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Tenant / Occupant Dashboard</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Dedicated portal providing tenants with live countdown meters for remaining lease durations and utility balance allocations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4">
              <div className="p-3 w-fit rounded-xl bg-[#E03A1D]/10 text-[#E03A1D]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">The Joint Messaging Platform</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Isolated compound notice board utilizing data masking to allow open co-tenant discussion using room tags (e.g. Room 5).
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4">
              <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Problem Registration</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Private maintenance ticket desk routing resident repair requests and structural logs directly to the landlords dashboard.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4 lg:col-span-2">
              <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Financial Tracking & Bookkeeping</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Centralized financial ledgers tracking water tokens, prepaid power allocations, waste collection dues, and advance payment balances across entire compounds.
              </p>
            </div>

          </div>
        </section>

        {/* SUBSCRIPTION & CURRENCY CONVERTER SECTION */}
        <section id="pricing" className="py-20 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 px-6">
          <div className="max-w-4xl mx-auto space-y-10 text-center">
            
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-[#E03A1D] tracking-widest uppercase">Simple Pricing</h2>
              <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">Flat Monthly Subscription</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                One standard plan unlocks complete property, tenant, and financial tracking for your entire compound.
              </p>
            </div>

            {/* Pricing Card with Currency Selector */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-md mx-auto text-left space-y-6">
              
              {/* Currency Selector Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-[#E03A1D]" /> Select Preferred Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:border-[#E03A1D]"
                >
                  {Object.entries(CURRENCY_RATES).map(([code, details]) => (
                    <option key={code} value={code}>
                      {code} - {details.name} ({details.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Display ($1 USD Base) */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                    {currentCurrency.symbol}{convertedAmount}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">/ month per workspace</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Converted from base rate of $1.00 USD/month.</p>
              </div>

              {/* Plan Included Features */}
              <ul className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> Unlimited Compound Blocks & Rooms
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> Automated Digital E-Leases
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> Real-time Joint System Micro-Forum
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> Maintenance Desk & Financial Ledgers
                </li>
              </ul>

              <Link
                href="/auth/sign-up"
                className="block w-full text-center rounded-xl bg-[#E03A1D] text-white py-3 text-xs font-bold hover:bg-[#c22f15] transition-all shadow-md shadow-[#E03A1D]/20"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* Main Footer */}
      <Footer />

    </div>
  );
}