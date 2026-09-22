import { createClient } from '@/lib/supabase/server';
import {
  Settings,
  Shield,
  Key,
  Globe,
  Sliders,
  Bell,
  Code2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { CodeSnippet } from '@/components/dashboard/code-snippet';

export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name, tenant_id')
    .eq('id', user?.id || '')
    .maybeSingle();

  const isAgencyAdmin = profile?.role === 'agency_admin';

  let currentTenant = null;
  if (!isAgencyAdmin && profile?.tenant_id) {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', profile.tenant_id)
      .maybeSingle();
    currentTenant = data;
  }

  const snippetCode = `<script\n  src="${process.env.NEXT_PUBLIC_WIDGET_URL || 'https://privacy.tudominio.com'}/widget.js"\n  data-tenant="${currentTenant?.slug || 'SLUG-DE-TU-TIENDA'}"\n  data-color="#2563eb"\n  defer\n></script>`;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Settings className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Configuración del Sistema
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Parámetros de integración, credenciales y configuración operativa Ley 21.719.
            </p>
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Información de la Cuenta</h2>
              <p className="text-xs text-slate-500">Credenciales del operador activo</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Autenticado
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Correo Electrónico
            </label>
            <p className="text-sm font-medium text-slate-900 font-mono bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-lg inline-block w-full">
              {user?.email}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Nivel de Privilegios
            </label>
            <div className="bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">
                {profile?.role === 'agency_admin' ? 'Administrador de Agencia' : 'Operador de Tienda'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-blue-100 text-blue-800">
                {profile?.role || 'agency_admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Snippet Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Código de Instalación Universal</h2>
            <p className="text-xs text-slate-500">
              Pega este snippet en el encabezado <code>&lt;head&gt;</code> de Shopify (<code>theme.liquid</code>) o WooCommerce
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <CodeSnippet code={snippetCode} title="Storefront Script Tag" />
          <p className="text-xs text-slate-500 leading-relaxed">
            💡 Este script inyecta de forma ultra-rápida (&lt;15 KB) el banner de consentimiento de cookies, el widget de revocación y el formulario para derechos ARSOP+.
          </p>
        </div>
      </div>

      {/* Regulatory Parameters Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Parámetros Normativos y SLAs</h2>
            <p className="text-xs text-slate-500">Tiempos de respuesta fijados por la Ley 21.719</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Plazo Legal de Acuse de Recibo ARSOP+</p>
              <p className="text-xs text-slate-500">Notificación formal al titular tras enviar una solicitud</p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              5 días hábiles
            </span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Plazo Legal de Resolución Definitiva</p>
              <p className="text-xs text-slate-500">Tiempo máximo para ejecutar acceso, rectificación o eliminación</p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              30 días hábiles
            </span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Notificación de Brechas de Seguridad a la APDP</p>
              <p className="text-xs text-slate-500">Plazo improrrogable ante incidentes de ciberseguridad o fuga de datos</p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              72 horas corridas
            </span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Vigencia del Consentimiento de Cookies</p>
              <p className="text-xs text-slate-500">Expiración tras la cual se solicita renovación de preferencias</p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              365 días (1 año)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
