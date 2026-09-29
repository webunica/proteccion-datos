import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  ShieldCheck,
  ExternalLink,
  Copy,
  Printer,
  QrCode,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import type { Tenant } from '@/types/shared';
import { CertificateViewer } from './certificate-viewer';

export const revalidate = 0;

export default async function CertificateDashboardPage() {
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

  let tenants: Tenant[] = [];

  if (profile?.role === 'agency_admin') {
    const { data } = await supabase.from('tenants').select('*').order('name');
    tenants = (data as Tenant[]) || [];
  } else if (profile?.tenant_id) {
    const { data } = await supabase.from('tenants').select('*').eq('id', profile.tenant_id);
    tenants = (data as Tenant[]) || [];
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Sello & Certificado de Cumplimiento
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Acredita que tu tienda cumple con la Ley N° 21.719 de Protección de Datos Personales.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CertificateViewer tenants={tenants} />
    </div>
  );
}
