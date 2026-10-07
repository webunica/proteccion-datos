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

  const widgetUrl = process.env.NEXT_PUBLIC_WIDGET_URL || 'https://proteccion-datos-admin.vercel.app';
  const snippetCode = `<script\n  src="${widgetUrl}/widget.js"\n  data-tenant="${currentTenant?.slug || 'SLUG-DE-TU-TIENDA'}"\n  data-api="${widgetUrl}"\n  data-color="#2563eb"\n  defer\n></script>`;

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

      {/* Planes Webúnica & Retención de Evidencia HMAC */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Planes Oficiales Webúnica Ley N° 21.719</h2>
            <p className="text-xs text-slate-500">Tarifa plana en Pesos Chilenos (CLP) sin recargos por visitas en Cyber</p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            ★ Clientes Webúnica: 30% OFF de por vida
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Starter (Hasta Dic.)</span>
            <p className="text-lg font-black text-slate-900">$9.950 CLP<span className="text-xs font-normal text-slate-500">/mes + IVA</span></p>
            <ul className="text-slate-600 space-y-1 text-[11px] list-disc pl-3">
              <li>1 Tienda / Dominio (Shopify / Woo)</li>
              <li>Prueba HMAC-SHA256 (Retención 12 meses)</li>
              <li>Canal ARSOP+ con OTP y Sello Web</li>
              <li>Google Consent Mode v2 Activo</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border-2 border-purple-500 bg-purple-50/20 space-y-2 relative">
            <span className="absolute -top-2.5 right-3 bg-purple-600 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-full">Más Popular</span>
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Pro (15% OFF)</span>
            <p className="text-lg font-black text-slate-900">$50.991 CLP<span className="text-xs font-normal text-slate-500">/mes + IVA</span></p>
            <ul className="text-slate-600 space-y-1 text-[11px] list-disc pl-3">
              <li>Hasta 3 Tiendas / Dominios</li>
              <li>Prueba HMAC (Retención 3 años)</li>
              <li>Exportador CSV APDP + RAT + EIPD</li>
              <li>Gestor de Brechas 72h y DPAs Chile</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Enterprise</span>
            <p className="text-lg font-black text-slate-900">$127.491 CLP<span className="text-xs font-normal text-slate-500">/mes + IVA</span></p>
            <ul className="text-slate-600 space-y-1 text-[11px] list-disc pl-3">
              <li>Tiendas y Dominios Ilimitados</li>
              <li>Marca Blanca Total</li>
              <li>Multi-usuario con roles para equipos</li>
              <li>Auditoría técnica anual y SLA 24/7</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Declaración de Confianza Footer */}
      <div className="p-5 rounded-2xl bg-slate-900 text-slate-300 text-xs leading-relaxed space-y-1">
        <p className="font-bold text-white">Declaración de Rol Webúnica:</p>
        <p>
          &quot;No somos un estudio de abogados que cobra honorarios por hora: somos la plataforma de software e infraestructura creada por expertos en desarrollo web para que tu tienda y sitio web cumplan automáticamente las exigencias técnicas de la Ley 21.719.&quot;
        </p>
      </div>
    </div>
  );
}
