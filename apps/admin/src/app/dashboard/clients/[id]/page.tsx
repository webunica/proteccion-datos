import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Shield,
  Sliders,
  Inbox,
  ClipboardList,
  FileText,
  ExternalLink,
  Code2,
  CheckCircle2,
  Clock,
  Pencil,
} from 'lucide-react';
import type { Tenant } from '@/types/shared';

export const revalidate = 0;

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
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

  // Obtener conteo de solicitudes ARSOP+ de este tenant
  const { count: rightsCount } = await supabase
    .from('rights_requests')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id);

  // Obtener conteo de tratamientos RAT declarados
  const { count: ratCount } = await supabase
    .from('rat_treatments')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id);

  // Obtener conteo de consentimientos de cookies guardados
  const { count: consentCount } = await supabase
    .from('consents')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id);

  const platformBadge = {
    shopify: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    woocommerce: 'bg-purple-50 text-purple-700 border-purple-200',
    other: 'bg-slate-100 text-slate-700 border-slate-200',
  }[tenant.platform] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Clientes
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{tenant.name}</h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${platformBadge}`}
            >
              {tenant.platform}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tenant.is_active
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  tenant.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {tenant.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">ID: {tenant.id} · Slug: {tenant.slug}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/clients/${tenant.id}/edit`}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200/80 transition-all shadow-sm"
          >
            <Pencil className="w-4 h-4 text-slate-500" />
            Editar datos
          </Link>
          <Link
            href={`/dashboard/clients/${tenant.id}/widget`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-500/25"
          >
            <Code2 className="w-4 h-4" />
            Configurar Widget
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Consentimientos Guardados
            </span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{consentCount ?? 0}</p>
          <span className="text-xs text-slate-500">Registros de cookies</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Solicitudes ARSOP+
            </span>
            <Inbox className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{rightsCount ?? 0}</p>
          <span className="text-xs text-slate-500">Derechos tramitados</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tratamientos RAT
            </span>
            <ClipboardList className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{ratCount ?? 0}</p>
          <span className="text-xs text-slate-500">Operaciones documentadas</span>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          Ficha de la Empresa
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="text-xs font-semibold text-slate-500 block">Razón Social</label>
            <p className="text-slate-900 font-medium mt-0.5">{tenant.razon_social || 'No especificada'}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block">RUT Empresa</label>
            <p className="text-slate-900 font-medium mt-0.5 font-mono">{tenant.rut_empresa || 'No especificado'}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block">Correo de Contacto</label>
            <p className="text-slate-900 font-medium mt-0.5 font-mono">{tenant.email_contacto}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block">Email DPO / Encargado</label>
            <p className="text-slate-900 font-medium mt-0.5 font-mono">{tenant.email_dpo || 'No asignado'}</p>
          </div>
          {tenant.shop_domain && (
            <div>
              <label className="text-xs font-semibold text-slate-500 block">Dominio Shopify</label>
              <p className="text-slate-900 font-medium mt-0.5 font-mono">{tenant.shop_domain}</p>
            </div>
          )}
          {tenant.website && (
            <div>
              <label className="text-xs font-semibold text-slate-500 block">Sitio Web</label>
              <a
                href={tenant.website.startsWith('http') ? tenant.website : `https://${tenant.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium mt-0.5 inline-flex items-center gap-1"
              >
                {tenant.website}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-500 block">Plan de Servicio</label>
            <p className="text-slate-900 font-medium mt-0.5 capitalize">{tenant.plan}</p>
          </div>
        </div>
      </div>

      {/* Public Endpoints Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          Endpoints Públicos de esta Tienda
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="text-xs font-semibold text-slate-800">Endpoint de Política de Privacidad</p>
              <p className="text-xs text-slate-500 font-mono">/api/policy/{tenant.slug}</p>
            </div>
            <a
              href={`/api/policy/${tenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
