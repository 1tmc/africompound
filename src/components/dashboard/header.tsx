// src/components/dashboard/header.tsx
'use client'

import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

interface HeaderProps {
  subdomain: string;
}

export default function Header({ subdomain }: HeaderProps) {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(dateTime),
    [dateTime]
  );

  const formattedTime = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(dateTime),
    [dateTime]
  );

  return (
    <header className="fixed inset-x-0 sm:left-72 top-0 z-10 border-b border-border bg-background/95 shadow-sm backdrop-blur-sm">
      {/* Reduced height on mobile (h-16), returning to standard h-20 on desktop (sm:h-20) */}
      <div className="flex h-16 sm:h-20 w-full items-center justify-between gap-2 px-3 sm:px-8">
        
        {/* Left Side: Dynamic Workspace Text Branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src="/logo.png"
            alt="AfriCompound logo"
            className="h-8 w-8 rounded-xl border border-[#E03A1D] object-cover shadow-sm sm:hidden flex-shrink-0"
          />
          <div className="min-w-0">
            {/* truncate prevents text from wrapping or layout forcing items to overlap */}
            <p className="text-xs sm:text-sm font-semibold text-foreground capitalize truncate">
              {subdomain}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Workspace
            </p>
          </div>
        </div>

        {/* Right Side: Responsive Utility Layout Trackers */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="relative hidden md:block w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="search"
              placeholder="Search workspace..."
              className="w-full rounded-2xl border border-border bg-card py-2 pl-10 pr-4 text-xs text-foreground outline-none transition focus:border-[#E03A1D] focus:bg-card"
            />
          </div>

          {/* Clean Responsive Time/Date Badge Layer */}
          <div className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-medium text-foreground shadow-sm">
            <CalendarDays className="h-3.5 w-3.5 text-[#E03A1D]" />
            <span className="hidden sm:inline">{formattedDate}</span>
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <span>{formattedTime}</span>
          </div>

          {/* Theme toggle control */}
          <ThemeToggle />

          <button className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#E03A1D] text-white shadow-md shadow-[#E03A1D]/10 transition hover:brightness-110 flex-shrink-0">
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-white" />
          </button>
        </div>

      </div>
    </header>
  );
}