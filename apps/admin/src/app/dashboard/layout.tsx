import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SidebarNav from '@/components/dashboard/sidebar-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, role, tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  const displayName = profile?.full_name ?? user.email ?? 'Usuario';
  const role = profile?.role ?? 'client';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarNav
        userEmail={user.email ?? ''}
        displayName={displayName}
        role={role}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
