import Sidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
// Import a simple client component that boots up Zustand
import StoreInitializer from '@/components/dashboard/AuthInitializer'; 

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const resolvedParams = await params;
  const supabase = createServerClient();

  // 1. Server verifies Auth Session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  // 2. Server fetches User Profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single();

  const userProfile = profile 
    ? { id: user.id, ...profile } 
    : { id: user.id, role: 'tenant' };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 3. Pass the server data directly into Zustand once on the client side */}
      <StoreInitializer userProfile={userProfile} />

      <Header subdomain={resolvedParams.subdomain} />

      <main className="pt-20 pb-24 sm:pb-8 sm:pl-72 min-h-screen">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <Sidebar
        role={userProfile.role}
        subdomain={resolvedParams.subdomain}
        userProfile={profile}
      />
    </div>
  );
}