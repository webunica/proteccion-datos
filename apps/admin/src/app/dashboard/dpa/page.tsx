import { createClient } from '@/lib/supabase/server';
import type { Tenant } from '@/types/shared';
import DpaManager from './dpa-manager';

export const revalidate = 0;

export default async function DpaDashboardPage() {
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

  let tenantsQuery = supabase.from('tenants').select('*').eq('is_active', true);
  if (!isAgencyAdmin && profile?.tenant_id) {
    tenantsQuery = tenantsQuery.eq('id', profile.tenant_id);
  }

  const { data: tenantsData } = await tenantsQuery.order('name');
  const tenants = (tenantsData || []) as Tenant[];

  return (
    <DpaManager
      tenants={tenants}
      isAgencyAdmin={isAgencyAdmin}
      userTenantId={profile?.tenant_id}
    />
  );
}
