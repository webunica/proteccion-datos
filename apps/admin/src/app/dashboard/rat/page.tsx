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
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
          >
            <FileDown className="w-4 h-4 text-gray-500" />
            Exportar RAT en PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tratamientos Declarados</span>
            <Layers className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{total}</p>
          <span className="text-xs text-green-600 font-medium">Requisito Ley: Mínimo 5 para e-commerce</span>
        </div>

        <div className="bg-white rounded-xl border border-yellow-200 bg-yellow-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">Tratamientos Alto Riesgo</span>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-800 mt-2">{highRisk}</p>
          <span className="text-xs text-yellow-600 font-medium">Ej: Retargeting, scoring</span>
        </div>

        <div className="bg-white rounded-xl border border-purple-200 bg-purple-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">EIPD Requeridas</span>
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-800 mt-2">{requiresEipd}</p>
          <span className="text-xs text-purple-600 font-medium">Evaluaciones de impacto</span>
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
          <div className="divide-y divide-gray-100">
            {treatments.map((t, index) => (
              <div key={t.id} className="p-6 hover:bg-gray-50/70 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold font-mono">
                        {index + 1}
                      </span>
                      <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>
                      {t.tenants && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {t.tenants.name}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 pl-9">{t.purpose}</p>

                    <div className="pl-9 flex flex-wrap items-center gap-3 pt-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <span className="font-semibold text-gray-500">Base legal:</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          {LEGAL_BASIS_LABELS[t.legal_basis as LegalBasis] || t.legal_basis}
                        </span>
                      </div>

                      {t.retention_period && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Retención: {t.retention_period}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${
                            t.risk_level === 'high' || t.risk_level === 'very_high'
                              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}
                        >
                          Riesgo {RISK_LEVEL_LABELS[t.risk_level as RiskLevel] || t.risk_level}
                        </span>
                      </div>
                    </div>

                    {/* Categorías y destinatarios */}
                    <div className="pl-9 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>
                        <strong className="text-gray-700">Datos tratados:</strong>{' '}
                        {t.data_categories?.join(', ') || 'Sin especificar'}
                      </div>
                      <div>
                        <strong className="text-gray-700">Encargados / Destinatarios:</strong>{' '}
                        {t.recipients?.join(', ') || 'Solo uso interno'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
