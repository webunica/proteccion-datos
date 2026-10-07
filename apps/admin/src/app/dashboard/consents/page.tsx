import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Tenant } from '@/types/shared';
import ConsentLedger from './consent-ledger';

export const revalidate = 0;

export default async function ConsentsDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  const isAgencyAdmin = profile?.role === 'agency_admin';

  let tenantsQuery = supabase.from('tenants').select('*').eq('is_active', true);
  if (!isAgencyAdmin && profile?.tenant_id) {
    tenantsQuery = tenantsQuery.eq('id', profile.tenant_id);
  }

  const { data: tenantsData } = await tenantsQuery.order('name');
  const tenants = (tenantsData || []) as Tenant[];

  // Fetch recent consents
  let consentsQuery = supabase
    .from('consents')
    .select('*, tenants(name, slug, platform)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (!isAgencyAdmin && profile?.tenant_id) {
    consentsQuery = consentsQuery.eq('tenant_id', profile.tenant_id);
  }

  const { data: consentsData } = await consentsQuery;
  const initialConsents = consentsData || [];

  return (
    <ConsentLedger
      initialConsents={initialConsents}
      tenants={tenants}
      isAgencyAdmin={isAgencyAdmin}
      userTenantId={profile?.tenant_id}
    />
  );
}
