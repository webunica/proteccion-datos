import { createClient } from '@/lib/supabase/server';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileText,
  AlertOctagon,
  BellRing,
} from 'lucide-react';
import type { BreachIncident, BreachRisk, BreachStatus } from '@/types/shared';
import { BREACH_RISK_LABELS, BREACH_STATUS_LABELS } from '@/types/shared';

export const revalidate = 0;

export default async function BreachDashboardPage() {
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

  let query = supabase.from('breach_incidents').select('*, tenants(name, slug)');

  if (!isAgencyAdmin && profile?.tenant_id) {
    query = query.eq('tenant_id', profile.tenant_id);
  }

  const { data: incidentsData } = await query.order('detected_at', { ascending: false });
  const incidents = (incidentsData || []) as (BreachIncident & { tenants?: { name: string; slug: string } })[];

  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length;
  const notifiedApdp = incidents.filter((i) => i.notified_apdp).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-red-600" />
            Gestión de Brechas e Incidentes de Seguridad
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Obligación Ley 21.719: Notificación a la Agencia de Protección de Datos Personales (APDP) dentro de <strong>72 horas</strong> desde que se tome conocimiento.
          </p>
        </div>
      </div>

      {/* Regla de Oro 72 Horas Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
        <AlertOctagon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <h3 className="font-semibold text-red-900">Protocolo de Notificación Legal (72 Horas)</h3>
          <p className="text-red-700 mt-1">
            Ante cualquier filtración, acceso no autorizado, pérdida o destrucción de datos de clientes, el responsable debe comunicar a la APDP la naturaleza del incidente, categorías y número aproximado de titulares afectados, y las medidas de mitigación adoptadas.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Incidentes Totales</span>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{incidents.length}</p>
          <span className="text-xs text-gray-500">Histórico de eventos</span>
        </div>

        <div className="bg-white rounded-xl border border-red-200 bg-red-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Brechas Activas</span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-800 mt-2">{openIncidents}</p>
          <span className="text-xs text-red-600 font-medium">En investigación o contención</span>
        </div>

        <div className="bg-white rounded-xl border border-blue-200 bg-blue-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Notificadas a APDP</span>
            <BellRing className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-800 mt-2">{notifiedApdp}</p>
          <span className="text-xs text-blue-600 font-medium">Cumplimiento en plazo 72h</span>
        </div>
      </div>

      {/* Tabla de incidentes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-base">Registro de Incidentes y Trazabilidad</h2>
          <span className="text-xs text-gray-500">{incidents.length} registros</span>
        </div>

        {incidents.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-900 font-medium">Sin incidentes de seguridad registrados</p>
            <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto">
              No hay reportes de brechas abiertas. Si ocurre un evento de ciberseguridad o fuga de datos, debe documentarse inmediatamente aquí.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900">{inc.title}</h3>
                      {inc.tenants && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {inc.tenants.name}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Riesgo {BREACH_RISK_LABELS[inc.risk_level as BreachRisk] || inc.risk_level}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">{inc.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Detectado: {new Date(inc.detected_at).toLocaleString('es-CL')}
                      </span>
                      <span>Titulares afectados estimados: {inc.affected_count ?? 'En evaluación'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-md border font-medium bg-gray-50 text-gray-700">
                      {BREACH_STATUS_LABELS[inc.status as BreachStatus] || inc.status}
                    </span>
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
