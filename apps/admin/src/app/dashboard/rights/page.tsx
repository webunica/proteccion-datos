import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Inbox } from 'lucide-react';
import type { RightsRequest } from '@/types/shared';
import { RightsManager } from './rights-manager';

export const revalidate = 0;

export default async function RightsDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  const isAgencyAdmin = profile?.role === 'agency_admin';

  // Obtener solicitudes ARSOP+
  let query = supabase
    .from('rights_requests')
    .select('*, tenants(name, slug)');

  if (!isAgencyAdmin && profile?.tenant_id) {
    query = query.eq('tenant_id', profile.tenant_id);
  }

  const { data: requestsData } = await query.order('received_at', { ascending: false });
  const requests = (requestsData || []) as (RightsRequest & { tenants?: { name: string; slug: string } })[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Inbox className="w-5 h-5" />
            </div>
            Gestión de Derechos ARSOP+
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Plazos legales Ley 21.719: Acuse de recibo en <strong>5 días hábiles</strong> y resolución definitiva en hasta <strong>30 días hábiles</strong>.
          </p>
        </div>
      </div>

      <RightsManager initialRequests={requests} />
    </div>
  );
}
