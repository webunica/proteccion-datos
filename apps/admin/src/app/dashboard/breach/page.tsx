import { createClient } from '@/lib/supabase/server';
import type { BreachIncident, Tenant } from '@/types/shared';
import BreachManager from './breach-manager';

export const revalidate = 0;

export default async function BreachDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, tenant_id')
    .eq('id', user?.id || '')
    .maybeSingle();

  const isAgencyAdmin = profile?.role === 'agency_admin';

  let query = supabase.from('breach_incidents').select('*, tenants(name, slug, rut_empresa, razon_social, email_dpo, email_contacto)');

  if (!isAgencyAdmin && profile?.tenant_id) {
    query = query.eq('tenant_id', profile.tenant_id);
  }

  const { data: incidentsData } = await query.order('detected_at', { ascending: false });
  const incidents = (incidentsData || []) as (BreachIncident & {
    tenants?: {
      name: string;
      slug: string;
      rut_empresa?: string;
      razon_social?: string;
      email_dpo?: string;
      email_contacto?: string;
    };
  })[];

  // Obtener lista de tenants para el selector de reportes
  let tenantsQuery = supabase.from('tenants').select('*').eq('is_active', true);
  if (!isAgencyAdmin && profile?.tenant_id) {
    tenantsQuery = tenantsQuery.eq('id', profile.tenant_id);
  }
  const { data: tenantsData } = await tenantsQuery.order('name');
  const tenants = (tenantsData || []) as Tenant[];

  return (
    <BreachManager
      initialIncidents={incidents}
      tenants={tenants}
      isAgencyAdmin={isAgencyAdmin}
      userTenantId={profile?.tenant_id}
    />
  );
}
