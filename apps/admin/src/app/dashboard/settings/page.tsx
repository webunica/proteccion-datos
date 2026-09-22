import { createClient } from '@/lib/supabase/server';
import {
  Settings,
  Shield,
  Key,
  Globe,
  Sliders,
  Bell,
  Code2,
} from 'lucide-react';

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

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-7 h-7 text-gray-700" />
          Configuración del Sistema
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Parámetros de integración, credenciales y configuración operativa Ley 21.719.
        </p>
      </div>

      {/* Perfil del usuario actual */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Información de la Cuenta
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs font-medium text-gray-500 block">Correo Electrónico</label>
            <p className="text-gray-900 font-medium mt-0.5">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block">Rol en el Sistema</label>
            <p className="text-gray-900 font-medium mt-0.5 capitalize">
              {profile?.role === 'agency_admin' ? 'Administrador Agencia (Global)' : 'Operador de Tienda'}
            </p>
          </div>
        </div>
      </div>

      {/* Snippet de Integración Storefront */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-600" />
          Código de Instalación Universal
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Pega esta línea en el encabezado <code>&lt;head&gt;</code> de cualquier tienda online (Shopify <code>theme.liquid</code>, WooCommerce, etc.):
        </p>

        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-200 overflow-x-auto select-all">
          {`<script\n  src="${process.env.NEXT_PUBLIC_WIDGET_URL || 'https://privacy.tudominio.com'}/widget.js"\n  data-tenant="${currentTenant?.slug || 'SLUG-DE-TU-TIENDA'}"\n  data-color="#2563eb"\n  defer\n></script>`}
        </div>
      </div>

      {/* Parámetros Legales de Plazos */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-600" />
          Parámetros Normativos Configurados
        </h2>
        <ul className="divide-y divide-gray-100 text-sm">
          <li className="py-3 flex justify-between items-center">
            <span className="text-gray-700">Plazo legal de Acuse de Recibo ARSOP+</span>
            <span className="font-semibold text-gray-900">5 días hábiles</span>
          </li>
          <li className="py-3 flex justify-between items-center">
            <span className="text-gray-700">Plazo legal de Resolución Definitiva ARSOP+</span>
            <span className="font-semibold text-gray-900">30 días hábiles</span>
          </li>
          <li className="py-3 flex justify-between items-center">
            <span className="text-gray-700">Plazo legal de Notificación de Brechas a la APDP</span>
            <span className="font-semibold text-red-600">72 horas corridas</span>
          </li>
          <li className="py-3 flex justify-between items-center">
            <span className="text-gray-700">Duración del consentimiento de cookies (Cookie Lifetime)</span>
            <span className="font-semibold text-gray-900">365 días (1 año)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
