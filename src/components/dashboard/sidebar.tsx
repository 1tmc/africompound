// src/components/dashboard/sidebar.tsx
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Receipt, 
  MessageSquareCode, 
  Wrench, 
  UserCircle,
  Settings,
  ClipboardList
} from 'lucide-react';

interface SidebarProps {
  role: 'host' | 'tenant';
  subdomain: string;
  userProfile?: {
    first_name: string;
    last_name: string;
  } | null;
}

export default function Sidebar({ role, subdomain, userProfile }: SidebarProps) {
  const pathname = usePathname();

  const displayName = userProfile?.first_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'User Session';

  // 1. Host Links: Includes Reports and custom workspace Settings
  const hostLinks = [
    { name: 'Dashboard', href: `/owners/${subdomain}/dashboard`, icon: LayoutDashboard },
    { name: 'My Compounds', href: `/owners/${subdomain}/dashboard/compounds`, icon: Building2 },
    { name: 'Tenants', href: `/owners/${subdomain}/dashboard/tenants`, icon: Users },
    { name: 'Billing & Rent', href: `/owners/${subdomain}/dashboard/bills`, icon: Receipt },
    { name: 'Reports', href: `/owners/${subdomain}/dashboard/reports`, icon: ClipboardList },
    { name: 'Group Chat', href: `/owners/${subdomain}/dashboard/joint-system`, icon: MessageSquareCode },
    { name: 'Settings', href: `/owners/${subdomain}/dashboard/settings`, icon: Settings },
  ];

  // 2. Tenant Links: Includes Maintenance and Tenant Incident Reporting
  const tenantLinks = [
    { name: 'My Portal', href: `/owners/${subdomain}/dashboard`, icon: LayoutDashboard },
    { name: 'Rent Receipts', href: `/owners/${subdomain}/dashboard/bills`, icon: Receipt },
    { name: 'Maintenance', href: `/owners/${subdomain}/dashboard/maintenance`, icon: Wrench },
    { name: 'Reports', href: `/owners/${subdomain}/dashboard/reports`, icon: ClipboardList },
    { name: 'The Joint System', href: `/owners/${subdomain}/dashboard/joint-system`, icon: MessageSquareCode },
  ];

  const activeLinks = role === 'host' ? hostLinks : tenantLinks;

  return (
    <>
      {/* Desktop Sidebar Panel */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground px-0 py-5 sm:flex dark:border-zinc-800 dark:bg-zinc-950">
        
        {/* Brand Header Identity Block */}
        <div className="flex flex-col sm:flex-row items-center justify-start gap-3 p-1 w-full border-b border-sidebar-border bg-sidebar dark:border-zinc-800 dark:bg-zinc-950 px-6">
          <div className="flex-shrink-0">
            {/* Light Mode Logo */}
            <img 
              src="/logo.png" 
              alt="AfriCompound Logo" 
              className="h-13 w-auto object-contain dark:hidden"
            />
            {/* Dark Mode Logo */}
            <img 
              src="/logo-white.png" 
              alt="AfriCompound Logo White" 
              className="h-13 w-auto object-contain hidden dark:block"
            />
          </div>
          {/* Slogan Container placed next to logo on large screens */}
          <div className="hidden sm:block pl-3 border-l border-sidebar-border dark:border-zinc-800">
            <p className="text-[9px] font-semibold text-[#E03A1D] tracking-wider uppercase leading-tight">
              Your property,<br />Your way!
            </p>
          </div>
          {/* Fallback for smaller portrait scopes within desktop break-points */}
          <p className="block sm:hidden text-[9px] font-semibold text-[#E03A1D] tracking-wider mt-1.5 uppercase text-center">
            Your property, Your way!
          </p>
        </div>

        {/* Navigation Core Matrix */}
        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto no-scrollbar py-4">
          {activeLinks.map((link) => {
            const Icon = link.icon;
            
            // Check if the link is the base dashboard route to prevent false-positives,
            // otherwise check if the current path starts with this link's path segment.
            const isActive = link.href.endsWith('/dashboard')
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E03A1D] text-white shadow-md shadow-[#E03A1D]/10'
                    : 'text-sidebar-foreground hover:bg-[#E03A1D]/10 hover:text-[#E03A1D] dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#E03A1D]'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Identity Session Block */}
        <div className="mt-4 rounded-2xl border border-sidebar-border bg-card p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#E03A1D]/10 text-[#E03A1D]">
              <UserCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate dark:text-zinc-200">{displayName}</p>
              <p className="text-[11px] text-muted-foreground font-medium capitalize mt-0.5">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Bar */}
      <aside className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-sidebar shadow-[0_-1px_20px_rgba(15,23,42,0.05)] sm:hidden dark:border-zinc-800 dark:bg-zinc-950">
        <div className="no-scrollbar flex w-full items-center gap-1 overflow-x-auto px-2 py-2">
          {activeLinks.map((link) => {
            const Icon = link.icon;
            
            // Apply the same path matching logic for mobile navigation
            const isActive = link.href.endsWith('/dashboard')
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex min-w-[68px] flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 px-1 text-[10px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#E03A1D] text-white font-semibold'
                    : 'text-muted-foreground dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#E03A1D]'}`} />
                <span className="truncate tracking-tight">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}