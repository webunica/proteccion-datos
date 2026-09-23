import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import type { Tenant } from '@/types/shared';
import { ClientEditForm } from './client-edit-form';

export const revalidate = 0;

interface ClientEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientEditPage({ params }: ClientEditPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: tenantData, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !tenantData) {
    notFound();
  }

  const tenant = tenantData as Tenant;

  return <ClientEditForm initialTenant={tenant} />;
}
