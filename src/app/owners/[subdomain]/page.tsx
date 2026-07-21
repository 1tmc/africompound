// src/app/owners/[subdomain]/dashboard/layout.tsx
import Sidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const resolvedParams = await params;
  
  // 💡 TEMP MOCK: Toggle this string between 'host' and 'tenant' to view how the layout shifts roles!
  const userRole: 'host' | 'tenant' = 'host'; 

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* 1. Sidebar Left Matrix */}
      <Sidebar role={userRole} subdomain={resolvedParams.subdomain} />

      {/* 2. Header Top Utility Grid */}
      <Header subdomain={resolvedParams.subdomain} />

      {/* 3. Central Page Viewport Frame */}
      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}