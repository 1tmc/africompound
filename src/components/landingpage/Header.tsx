// src/components/Header.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Subscription', href: '#pricing' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 dark:bg-zinc-950/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Image 
              src="/logo.png" 
              alt="Africompound Logo" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase">
            Africompound<span className="text-[#E03A1D]">.com</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Auth CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/sign-in"
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#E03A1D] text-white rounded-xl px-4 py-2 hover:bg-[#c22f15] transition-all shadow-sm shadow-[#E03A1D]/20"
          >
            Sign Up <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-600 dark:text-zinc-300"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-4 text-sm font-semibold">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-600 dark:text-zinc-300"
              >
                {link.name}
              </a>
            ))}
            <hr className="border-zinc-100 dark:border-zinc-800" />
            <Link href="/auth/sign-in" className="text-zinc-600 dark:text-zinc-300">Sign In</Link>
            <Link href="/auth/sign-up" className="text-[#E03A1D] font-bold">Sign Up</Link>
          </div>
        </div>
      )}
    </header>
  );
}