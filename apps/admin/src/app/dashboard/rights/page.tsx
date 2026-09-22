import { createClient } from '@/lib/supabase/server';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Shield,
  Search,
} from 'lucide-react';
import type { RightsRequest, RightsType, RightsStatus } from '@sist-protec-datos/shared';
import { RIGHTS_TYPE_LABELS, RIGHTS_STATUS_LABELS } from '@sist-protec-datos/shared';

export const revalidate = 0;

export default async function RightsDashboardPage() {
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

  // Obtener solicitudes ARSOP+
  let query = supabase
    .from('rights_requests')
    .select('*, tenants(name, slug)');

  if (!isAgencyAdmin && profile?.tenant_id) {
    query = query.eq('tenant_id', profile.tenant_id);
  }

  const { data: requestsData, error } = await query.order('received_at', { ascending: false });
  const requests = (requestsData || []) as (RightsRequest & { tenants?: { name: string; slug: string } })[];

  // Métricas
  const total = requests.length;
  const pendingAck = requests.filter((r) => r.status === 'received').length;
  const inProgress = requests.filter((r) => r.status === 'acknowledged' || r.status === 'in_progress').length;
  const resolved = requests.filter((r) => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Inbox className="w-7 h-7 text-blue-600" />
            Gestión de Derechos ARSOP+
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Plazos legales Ley 21.719: Acuse de recibo en <strong>5 días hábiles</strong> y resolución definitiva en hasta <strong>30 días hábiles</strong>.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Solicitudes</span>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{total}</p>
          <span className="text-xs text-gray-500">Histórico registrado</span>
        </div>

        <div className="bg-white rounded-xl border border-yellow-200 bg-yellow-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">Pendientes de Acuse</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-800 mt-2">{pendingAck}</p>
          <span className="text-xs text-yellow-600 font-medium">SLA: 5 días hábiles</span>
        </div>

        <div className="bg-white rounded-xl border border-blue-200 bg-blue-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">En Tramitación</span>
            <AlertTriangle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-800 mt-2">{inProgress}</p>
          <span className="text-xs text-blue-600 font-medium">SLA: 30 días hábiles</span>
        </div>

        <div className="bg-white rounded-xl border border-green-200 bg-green-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">Resueltas</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-800 mt-2">{resolved}</p>
          <span className="text-xs text-green-600 font-medium">Con evidencia archivada</span>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-base">Bandeja de Solicitudes</h2>
          <div className="text-xs text-gray-500">
            Mostrando {requests.length} solicitudes
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No hay solicitudes de derechos registradas</p>
            <p className="text-gray-400 text-xs mt-1">
              Las solicitudes recibidas a través del widget web o del shortcode de WordPress aparecerán aquí en tiempo real.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Titular / Email</th>
                  <th className="px-6 py-3.5">Tienda</th>
                  <th className="px-6 py-3.5">Derecho</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5">Recepción</th>
                  <th className="px-6 py-3.5">Plazo Acuse</th>
                  <th className="px-6 py-3.5">Plazo Resolución</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => {
                  const receivedDate = new Date(req.received_at).toLocaleDateString('es-CL');
                  const ackDate = req.ack_deadline ? new Date(req.ack_deadline).toLocaleDateString('es-CL') : '5 días';
                  const resDate = req.resolution_deadline ? new Date(req.resolution_deadline).toLocaleDateString('es-CL') : '30 días';

                  return (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{req.requester_name || 'Sin nombre'}</div>
                        <div className="text-xs text-gray-500 font-mono">{req.requester_email}</div>
                        {req.requester_rut && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                            RUT: {req.requester_rut}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">
                          {req.tenants?.name || 'Tienda'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {RIGHTS_TYPE_LABELS[req.type as RightsType] || req.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status as RightsStatus} />
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {receivedDate}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium">
                        {req.status === 'received' ? (
                          <span className="text-yellow-700 font-semibold">{ackDate}</span>
                        ) : (
                          <span className="text-gray-400 line-through">{ackDate}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium">
                        {req.status !== 'resolved' && req.status !== 'rejected' ? (
                          <span className="text-blue-700 font-semibold">{resDate}</span>
                        ) : (
                          <span className="text-green-600 font-medium">Completado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RightsStatus }) {
  const styles: Record<RightsStatus, string> = {
    received: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    acknowledged: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {RIGHTS_STATUS_LABELS[status] || status}
    </span>
  );
}
