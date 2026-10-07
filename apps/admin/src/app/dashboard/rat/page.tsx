import { createClient } from '@/lib/supabase/server';
import {
  ClipboardList,
  ShieldCheck,
  AlertTriangle,
  FileDown,
  Plus,
  Layers,
  Clock,
  ExternalLink,
} from 'lucide-react';
import type { RatTreatment, LegalBasis, RiskLevel } from '@/types/shared';
import { LEGAL_BASIS_LABELS, RISK_LEVEL_LABELS } from '@/types/shared';
import { RatExportButtons } from './rat-export-buttons';
import { RatSeedButton } from './rat-seed-button';
import { RatTreatmentsList } from './rat-treatments-list';

export const revalidate = 0;

export default async function RatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, tenant_id')
    .eq('id', user?.id || '')
    .maybeSingle();

  const isAgencyAdmin = profile?.role === 'agency_admin';

  // Obtener tratamientos
  let query = supabase.from('rat_treatments').select('*, tenants(name, slug)');

  if (!isAgencyAdmin && profile?.tenant_id) {
    query = query.eq('tenant_id', profile.tenant_id);
  }

  const { data: treatmentsData } = await query.order('order_index', { ascending: true });
  const treatments = (treatmentsData || []) as (RatTreatment & { tenants?: { name: string; slug: string } })[];

  // Tratamientos plantillas si no hay aún asignados
  const { data: templates } = await supabase.from('rat_templates').select('*').order('order_index');

  const total = treatments.length;
  const confirmed = treatments.filter((t) => t.is_active).length;
  const drafts = treatments.filter((t) => !t.is_active).length;
  const highRisk = treatments.filter((t) => t.risk_level === 'high' || t.risk_level === 'very_high').length;
  const requiresEipd = treatments.filter((t) => t.requires_eipd).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-indigo-600" />
            Registro de Actividades de Tratamiento (RAT)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Inventario obligatorio de operaciones de tratamiento de datos personales conforme al artículo 13 y siguientes de la Ley 21.719.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {total < 5 && <RatSeedButton tenantId={profile?.tenant_id} />}
          <RatExportButtons treatments={treatments} />
        </div>
      </div>

      {/* Aviso de Principio de Responsabilidad Proactiva */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3 text-xs text-slate-600 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800 text-xs">
            Responsabilidad Proactiva y Licitud (Art. 21 y 24 Ley N° 21.719)
          </p>
          <p className="leading-relaxed text-[11px] text-slate-500">
            Las plantillas precargadas constituyen una propuesta técnica estándar para e-commerce (Shopify/WooCommerce),
            pero no representan una certificación legal automática. Cada tienda debe revisar y confirmar qué datos recopilan
            sus aplicaciones reales, qué bases legales corresponden a cada finalidad y sus plazos efectivos de retención.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total RAT</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
          <span className="text-[11px] text-slate-500 font-medium">Mínimo legal sugerido: 5</span>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Confirmados</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{confirmed}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Validados por la tienda</span>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Borradores</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-800 mt-1">{drafts}</p>
          <span className="text-[11px] text-amber-600 font-medium">Pendientes de revisión</span>
        </div>

        <div className="bg-white rounded-xl border border-purple-200 bg-purple-50/20 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Alto Riesgo</span>
            <AlertTriangle className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-800 mt-1">{highRisk}</p>
          <span className="text-[11px] text-purple-600 font-medium">{requiresEipd} requieren EIPD</span>
        </div>
      </div>

      {/* Lista de tratamientos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-base">Inventario de Tratamientos Activos</h2>
          <span className="text-xs text-gray-500">{treatments.length} operaciones registradas</span>
        </div>

        {treatments.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">No se han registrado tratamientos para esta tienda todavía</p>
            <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
              Puedes inicializar automáticamente los 8 tratamientos estándar para Shopify y WooCommerce preparados según las directrices de la Ley 21.719.
            </p>

            <div className="mt-4">
              <RatSeedButton tenantId={profile?.tenant_id} label="⚡ Inicializar 8 Tratamientos Estándar de E-Commerce" />
            </div>

            {templates && templates.length > 0 && (
              <div className="mt-6">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">
                  8 Tratamientos preconfigurados disponibles en catálogo:
                </span>
                <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {templates.map((tpl) => (
                    <span
                      key={tpl.id}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {tpl.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <RatTreatmentsList treatments={treatments} />
        )}
      </div>
    </div>
  );
}
