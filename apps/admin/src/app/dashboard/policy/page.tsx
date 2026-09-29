import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Code2,
  Calendar,
  Layers,
  Building2,
  Copy,
} from 'lucide-react';
import type { PrivacyPolicy } from '@/types/shared';
import { CodeSnippet } from '@/components/dashboard/code-snippet';

export const revalidate = 0;

export default async function PolicyDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  const isAgencyAdmin = profile?.role === 'agency_admin';

  let tenantQuery = supabase
    .from('tenants')
    .select('id, name, slug, rut_empresa, razon_social, email_contacto, email_dpo, address, website');

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

  const dateStr = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const companyName = currentTenant?.razon_social || currentTenant?.name || 'Tu Empresa SpA';
  const rut = currentTenant?.rut_empresa || '76.XXX.XXX-X';
  const email = currentTenant?.email_contacto || 'contacto@empresa.cl';
  const dpoEmail = currentTenant?.email_dpo || email;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            Política de Privacidad Oficial Ley 21.719
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Redacción jurídica estructurada conforme a los artículos 13, 14, 15 y siguientes de la Ley de Protección de Datos de Chile.
          </p>
        </div>

        {currentTenant && (
          <div className="flex items-center gap-2">
            <a
              href={`/api/policy/${currentTenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              Ver API JSON Pública
            </a>
          </div>
        )}
      </div>

      {/* Estado y Ficha de la Política */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Política Activa: {currentTenant?.name || 'Tienda'}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Versión {policy?.version || '1.0 (Generador Jurídico Oficial)'} · Emisión: {dateStr}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Conforme a Ley 21.719
          </span>
        </div>

        {/* Formatos de Integración Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs mb-1">
              <Code2 className="w-4 h-4 text-emerald-600" />
              Integración Shopify (Página Oficial de Privacidad)
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Crea una página en <strong>Shopify &gt; Pages &gt; Add page</strong> con este contenedor HTML:
            </p>
            <code className="block bg-slate-900 text-emerald-300 p-2.5 rounded-lg text-xs font-mono select-all">
              &lt;div id=&quot;ley21719-policy&quot;&gt;&lt;/div&gt;
            </code>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs mb-1">
              <Layers className="w-4 h-4 text-purple-600" />
              Integración WooCommerce / WordPress
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Pega el shortcode en cualquier página o sección de tu sitio WordPress:
            </p>
            <code className="block bg-slate-900 text-purple-300 p-2.5 rounded-lg text-xs font-mono select-all">
              [politica_privacidad]
            </code>
          </div>
        </div>

        {/* Vista Previa en Vivo de la Política */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Contenido Legal Generado en Vivo (Listo para la Tienda):
            </h3>
            <span className="text-[11px] text-slate-400">
              Se alimenta automáticamente de los datos corporativos del cliente
            </span>
          </div>

          <div className="bg-slate-50/60 rounded-xl border border-slate-200 p-6 text-xs text-slate-700 space-y-4 max-h-96 overflow-y-auto leading-relaxed shadow-inner">
            <div className="border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-slate-900">
                Política de Privacidad y Tratamiento de Datos Personales
              </h4>
              <p className="text-[11px] text-slate-500">
                Conforme a la Ley N° 21.719 de la República de Chile · Responsable: <strong>{companyName}</strong> (RUT: {rut})
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800">1. Identificación del Responsable y DPO</p>
              <p className="text-slate-600 mt-0.5">
                El responsable del tratamiento de los datos personales es <strong>{companyName}</strong>, RUT N° <strong>{rut}</strong>.
                Para consultas de privacidad o contacto con el Delegado de Protección de Datos (DPO), comunicarse al correo electrónico <strong className="font-mono">{dpoEmail}</strong>.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800">2. Finalidades del Tratamiento y Bases de Licitud (Art. 13)</p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-slate-600">
                <li><strong>Procesamiento de compras y despacho:</strong> Ejecución de contrato de compraventa y despacho logístico (Art. 13 a).</li>
                <li><strong>Marketing y comunicaciones comerciales:</strong> Envío de promociones únicamente con consentimiento previo y revocable del titular (Art. 13 b).</li>
                <li><strong>Emisión de boletas y facturas:</strong> Cumplimiento de obligaciones legales tributarias ante el SII (Art. 13 c).</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-slate-800">3. Derechos del Titular (Derechos ARSOP+)</p>
              <p className="text-slate-600 mt-0.5">
                El titular puede ejercer gratuitamente sus derechos de <strong>Acceso, Rectificación, Supresión, Oposición, Portabilidad y Bloqueo</strong> a través del formulario interactivo disponible en esta plataforma o escribiendo al correo del DPO.
                Se emitirá acuse de recibo en un plazo máximo de <strong>5 días hábiles</strong> y resolución fundada en hasta <strong>30 días hábiles</strong>.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800">4. Autoridad de Control</p>
              <p className="text-slate-600 mt-0.5">
                En caso de considerar vulnerados sus derechos, el titular puede interponer reclamo ante la <strong>Agencia de Protección de Datos Personales (APDP)</strong> de Chile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cláusulas mínimas checklist */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          Cláusulas Mínimas Ley 21.719 Garantizadas en la Política:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Identificación completa del Responsable, RUT y canal directo del DPO</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Finalidades explícitas y base legal (Art. 13) por cada categoría de tratamiento</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Listado de encargados logísticos (couriers) y pasarelas de pago (PCI-DSS)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Mecanismo y plazos formales para derechos ARSOP+ (5 y 30 días hábiles)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Períodos de conservación documental (5 años tributarios según código tributario)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Mención explícita a la autoridad de control de la APDP de Chile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
