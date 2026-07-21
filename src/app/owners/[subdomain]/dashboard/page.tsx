// src/app/owners/[subdomain]/dashboard/page.tsx
import { 
  Building2, 
  Users, 
  Receipt, 
  ArrowUpRight, 
  TrendingUp, 
  Activity,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Cache the dashboard page data per route for 30 seconds to make navigation instant
export const revalidate = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

interface CommunityMessage {
  id: string;
  sender_first_name?: string | null;
  message_content?: string | null;
  created_at: string;
  [key: string]: unknown;
}

export default async function DashboardPage({ params }: PageProps) {
  const { subdomain } = await params;
  const normalizedSubdomain = subdomain.trim().toLowerCase();

  // 1. Fetch User Session
  const { data: { user } } = await supabase.auth.getUser();
  const userRole: 'host' | 'tenant' = (user?.user_metadata?.role as 'host' | 'tenant') || 'host'; 
  const userId = user?.id;

  // 2. Execute primary queries in PARALLEL via Promise.all
  const [primaryPropertyRes, rawMessagesRes] = await Promise.all([
    userRole === 'host'
      ? supabase
          .from('properties')
          .select('host_id')
          .eq('subdomain_slug', normalizedSubdomain)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
  ]);

  const targetHostId = primaryPropertyRes.data?.host_id || userId;

  // 3. Execute count metrics in PARALLEL based on role
  let totalCompounds = 0;
  let totalTenants = 0;
  let totalPendingBills = 0;

  if (userRole === 'host') {
    const [propertyCountRes, tenantCountRes, unpaidCountRes] = await Promise.all([
      targetHostId
        ? supabase.from('properties').select('*', { count: 'exact', head: true }).eq('host_id', targetHostId)
        : Promise.resolve({ count: 0 }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tenant'),
      supabase.from('bills').select('*', { count: 'exact', head: true }).eq('status', 'unpaid')
    ]);

    totalCompounds = propertyCountRes.count || 0;
    totalTenants = tenantCountRes.count || 0;
    totalPendingBills = unpaidCountRes.count || 0;
  } else if (userId) {
    const { count } = await supabase
      .from('bills')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', userId)
      .eq('status', 'unpaid');
      
    totalPendingBills = count || 0;
  }

  // 4. Map metrics to UI
  const stats = userRole === 'host' ? [
    { name: 'Total Compounds', value: totalCompounds.toString(), change: 'Owned workspace entities', icon: Building2, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400' },
    { name: 'Registered Tenants', value: totalTenants.toString(), change: 'System profiles linked', icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400' },
    { name: 'Unpaid Invoices', value: totalPendingBills.toString(), change: 'Requires collection', icon: Receipt, color: 'text-[#E03A1D] bg-[#E03A1D]/5 dark:bg-[#E03A1D]/10 dark:text-[#E03A1D]' },
  ] : [
    { name: 'Pending Unpaid Bills', value: totalPendingBills.toString(), change: 'Check rent portal receipts', icon: Receipt, color: 'text-[#E03A1D] bg-[#E03A1D]/5 dark:bg-[#E03A1D]/10 dark:text-[#E03A1D]' },
  ];

  // 5. Format recent community messages
  const typedMessages = (rawMessagesRes.data as CommunityMessage[] | null) || [];
  const recentActivity = typedMessages.length > 0 
    ? typedMessages.map((msg: CommunityMessage) => ({
        id: msg.id,
        title: msg.sender_first_name ? `Message from ${msg.sender_first_name}` : 'Community Update',
        detail: msg.message_content || '',
        time: new Date(msg.created_at).toLocaleDateString()
      })) 
    : [
        { id: 'fallback', title: 'System Feed Connected', detail: 'No community messages logged to display on your timeline yet.', time: 'Just now' }
      ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner Row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back, {userRole === 'host' ? 'Landlord' : 'Resident'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Here is a snapshot overview of your workspace space at <span className="font-semibold capitalize text-zinc-700 dark:text-zinc-300">{subdomain.replace('-', ' ')}</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start rounded-xl bg-white p-1.5 shadow-sm border border-zinc-200/60 dark:bg-zinc-900 dark:border-zinc-800">
          <span className="text-xs font-semibold text-[#E03A1D] px-2.5 py-1 bg-[#E03A1D]/10 rounded-lg capitalize">
            {userRole} view
          </span>
        </div>
      </div>

      {/* Grid Matrix Metric Cards */}
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-${stats.length}`}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.name}</span>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{stat.value}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Layout Split Panels */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Feed Column */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm md:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#E03A1D]" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Recent Community Activity</h2>
            </div>
            <Link 
              href={`/owners/${subdomain}/dashboard/joint-system`} 
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#E03A1D] hover:underline"
            >
              Open Group Chat <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:border-zinc-700 dark:text-zinc-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 truncate dark:text-zinc-100">{item.title}</p>
                    <p className="text-xs text-zinc-500 line-clamp-1 dark:text-zinc-400">{item.detail}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-3">
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Shortcuts Column */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-3">Quick Actions</h3>
            <div className="grid gap-2">
              {userRole === 'host' ? (
                <>
                  <Link 
                    href={`/owners/${subdomain}/dashboard/tenants`}
                    className="w-full text-center rounded-xl bg-[#E03A1D] text-white py-2 text-xs font-semibold shadow-sm hover:bg-[#c22f15] transition-all"
                  >
                    + Invite New Tenant
                  </Link>
                  <Link 
                    href={`/owners/${subdomain}/dashboard/compounds`}
                    className="w-full text-center rounded-xl border border-zinc-200 bg-white text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 py-2 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all"
                  >
                    Add Compound Block
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href={`/owners/${subdomain}/dashboard/bills`}
                    className="w-full text-center rounded-xl bg-[#E03A1D] text-white py-2 text-xs font-semibold shadow-sm hover:bg-[#c22f15] transition-all"
                  >
                    Pay Outstanding Rent
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mini System Status Panel */}
          <div className="rounded-2xl border border-zinc-200/60 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-sm dark:border-zinc-800/80">
            <h4 className="text-xs font-bold text-[#E03A1D] tracking-wider uppercase">The Joint System</h4>
            <p className="text-sm font-semibold text-white mt-2 leading-snug">
              {userRole === 'host' ? 'Broadcasting notice portals active.' : 'Keep track of house rules & general compound chats.'}
            </p>
            <Link 
              href={`/owners/${subdomain}/dashboard/joint-system`} 
              className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white mt-4 font-medium transition-colors"
            >
              Open Messaging Hub &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}