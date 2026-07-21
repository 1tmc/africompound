// src/components/landingpage/Footer.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 py-12 px-6 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="relative h-7 w-7 overflow-hidden rounded-lg">
              <Image src="/logo.png" alt="Africompound Logo" fill className="object-cover" />
            </div>
            <span className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase">
              Africompound
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Multi-unit property management ecosystem structured specifically for compound real estate and long-term tenancy blocks.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase text-zinc-900 dark:text-zinc-100 tracking-wider mb-3">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <li><a href="#about" className="hover:text-zinc-900 dark:hover:text-white">About Us</a></li>
            <li><a href="#features" className="hover:text-zinc-900 dark:hover:text-white">Core Modules</a></li>
            <li><a href="#pricing" className="hover:text-zinc-900 dark:hover:text-white">Subscription & Rates</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase text-zinc-900 dark:text-zinc-100 tracking-wider mb-3">
            Access Portals
          </h4>
          <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <li><Link href="/auth/sign-in" className="hover:text-zinc-900 dark:hover:text-white">Sign In</Link></li>
            <li><Link href="/auth/sign-up" className="hover:text-zinc-900 dark:hover:text-white">Sign Up</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase text-zinc-900 dark:text-zinc-100 tracking-wider mb-3">
            System Status
          </h4>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> All Systems Operational
          </p>
          <p className="text-[11px] text-zinc-400 mt-2">&copy; {new Date().getFullYear()} Africompound.com. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}