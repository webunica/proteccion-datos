import { createClient } from '@/lib/supabase/server';
import {
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Code2,
  Calendar,
  Layers,
} from 'lucide-react';
import type { PrivacyPolicy } from '@sist-protec-datos/shared';

export const revalidate = 0;

export default async function PolicyDashboardPage() {
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

  let tenantQuery = supabase.from('tenants').select('id, name, slug, rut_empresa, email_contacto');
  if (!isAgencyAdmin && profile?.tenant_id) {
    tenantQuery = tenantQuery.eq('id', profile.tenant_id);
  }

  const { data: tenants } = await tenantQuery.limit(10);
  const currentTenant = tenants && tenants.length > 0 ? tenants[0] : null;

  // Buscar política del tenant seleccionado
  let policy: PrivacyPolicy | null = null;
  if (currentTenant) {
    const { data } = await supabase
      .from('privacy_policies')
      .select('*')
      .eq('tenant_id', currentTenant.id)
      .eq('is_active', true)
      .maybeSingle();
    policy = data as PrivacyPolicy | null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Política de Privacidad Ley 21.719
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Redacción estructurada con finalidades, bases legales, plazos de conservación y mecanismos ARSOP+ obligatorios.
          </p>
        </div>

        {currentTenant && (
          <a
            href={`/api/policy/${currentTenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-gray-500" />
            Ver JSON / Endpoint Público
          </a>
        )}
      </div>

      {/* Estado de la política */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Política Activa: {currentTenant?.name || 'Tienda'}
              </h2>
              <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Versión {policy?.version || '1.0 (Generador automático activo)'}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="w-4 h-4" />
            Conforme a Ley 21.719
          </span>
        </div>

        {/* Formato de integración */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm mb-1">
              <Code2 className="w-4 h-4 text-blue-600" />
              Integración Shopify (Enlace o Página)
            </div>
            <p className="text-xs text-gray-600 mb-2">
              Agrega una página en Shopify con el identificador del contenedor:
            </p>
            <code className="block bg-gray-900 text-gray-100 p-2.5 rounded text-xs font-mono select-all">
              &lt;div id=&quot;ley21719-policy&quot;&gt;&lt;/div&gt;
            </code>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm mb-1">
              <Layers className="w-4 h-4 text-purple-600" />
              Integración WooCommerce (Shortcode)
            </div>
            <p className="text-xs text-gray-600 mb-2">
              Usa el shortcode del plugin oficial en cualquier página o entrada de WordPress:
            </p>
            <code className="block bg-gray-900 text-gray-100 p-2.5 rounded text-xs font-mono select-all">
              [politica_privacidad]
            </code>
          </div>
        </div>
      </div>

      {/* Cláusulas obligatorias cubiertas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Cláusulas Mínimas Ley 21.719 Incluidas Automáticamente
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>Identificación completa del Responsable y RUT de la empresa</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>Finalidades explícitas y base legal por cada tipo de tratamiento</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>Listado de encargados y transferencias internacionales de datos</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>Procedimiento y plazos para derechos ARSOP+ (5 y 30 días)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>Plazos de conservación y retención tributaria/contractual</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>Mención a la potestad fiscalizadora de la APDP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
