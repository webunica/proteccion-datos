'use client';

import { useState } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Shield,
  Search,
  ChevronRight,
  X,
  Mail,
  Calendar,
  Check,
  Ban,
  Send,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { RightsRequest, RightsType, RightsStatus } from '@/types/shared';
import { RIGHTS_TYPE_LABELS, RIGHTS_STATUS_LABELS } from '@/types/shared';

type RequestWithTenant = RightsRequest & { tenants?: { name: string; slug: string } };

interface RightsManagerProps {
  initialRequests: RequestWithTenant[];
}

export function RightsManager({ initialRequests }: RightsManagerProps) {
  const [requests, setRequests] = useState<RequestWithTenant[]>(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReq, setSelectedReq] = useState<RequestWithTenant | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const supabase = createClient();

  // Filtrado
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.requester_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.requester_name && r.requester_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.requester_rut && r.requester_rut.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.tenants?.name && r.tenants.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Métricas
  const total = requests.length;
  const pendingAck = requests.filter((r) => r.status === 'received').length;
  const inProgress = requests.filter((r) => r.status === 'acknowledged' || r.status === 'in_progress').length;
  const resolved = requests.filter((r) => r.status === 'resolved').length;

  function handleOpenModal(req: RequestWithTenant) {
    setSelectedReq(req);
    setResolutionNote(req.resolution_note || '');
    setNotifyByEmail(true);
    setFeedback(null);
  }

  function handleCloseModal() {
    setSelectedReq(null);
    setFeedback(null);
  }

  async function updateStatus(newStatus: RightsStatus) {
    if (!selectedReq) return;
    setIsUpdating(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/rights/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: selectedReq.id,
          new_status: newStatus,
          resolution_note: resolutionNote,
          send_email: notifyByEmail,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.error || 'Error al actualizar solicitud');
      }

      const now = new Date().toISOString();
      const updated: RequestWithTenant = {
        ...selectedReq,
        status: newStatus,
        updated_at: now,
        ...(newStatus === 'acknowledged' && !selectedReq.acknowledged_at ? { acknowledged_at: now } : {}),
        ...(newStatus === 'resolved' || newStatus === 'rejected'
          ? { resolved_at: now, resolution_note: resolutionNote }
          : resolutionNote
          ? { resolution_note: resolutionNote }
          : {}),
      };

      setRequests((prev) => prev.map((r) => (r.id === selectedReq.id ? updated : r)));
      setSelectedReq(updated);

      const emailNote = notifyByEmail
        ? resData.email_sent
          ? ' (Notificación enviada por email)'
          : ` (${resData.email_detail})`
        : '';
      setFeedback({
        type: 'success',
        message: `Estado actualizado a "${RIGHTS_STATUS_LABELS[newStatus]}"${emailNote}`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Error al actualizar: ${err.message}` });
    } finally {
      setIsUpdating(false);
    }
  }

  function formatDateTime(dateStr?: string | null) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  function getSlaCountdown(deadlineStr: string, isCompleted: boolean) {
    if (isCompleted) return { label: 'Completado', isLate: false, isNear: false };
    const diff = new Date(deadlineStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) {
      return { label: `Vencido hace ${Math.abs(days)}d`, isLate: true, isNear: false };
    }
    if (days <= 2) {
      return { label: `${days}d restante${days === 1 ? '' : 's'} (Urgente)`, isLate: false, isNear: true };
    }
    return { label: `${days}d restantes`, isLate: false, isNear: false };
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Solicitudes</span>
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{total}</p>
          <span className="text-xs text-slate-500">Histórico registrado</span>
        </div>

        <div className="bg-amber-50/50 rounded-2xl border border-amber-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pendientes de Acuse</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-2">{pendingAck}</p>
          <span className="text-xs text-amber-700 font-medium">SLA: 5 días hábiles</span>
        </div>

        <div className="bg-blue-50/50 rounded-2xl border border-blue-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">En Tramitación</span>
            <AlertTriangle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{inProgress}</p>
          <span className="text-xs text-blue-700 font-medium">SLA: 30 días hábiles</span>
        </div>

        <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Resueltas</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-2">{resolved}</p>
          <span className="text-xs text-emerald-700 font-medium">Cumplimiento formal</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por email, titular o tienda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'received', label: 'Pendiente Acuse' },
            { id: 'in_progress', label: 'En Tramitación' },
            { id: 'resolved', label: 'Resueltas' },
            { id: 'rejected', label: 'Rechazadas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Solicitudes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No hay solicitudes encontradas</h3>
            <p className="text-xs text-slate-500 mt-1">
              Las solicitudes enviadas a través del widget de tus tiendas aparecerán automáticamente aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Titular / Email</th>
                  <th className="py-3 px-4">Tienda</th>
                  <th className="py-3 px-4">Derecho</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">SLA Acuse (5d)</th>
                  <th className="py-3 px-4">SLA Resolución (30d)</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const isAckCompleted = req.status !== 'received';
                  const isResCompleted = req.status === 'resolved' || req.status === 'rejected';
                  const ackCountdown = getSlaCountdown(req.ack_deadline, isAckCompleted);
                  const resCountdown = getSlaCountdown(req.resolution_deadline, isResCompleted);

                  return (
                    <tr
                      key={req.id}
                      onClick={() => handleOpenModal(req)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          <span>{req.requester_name || 'Sin nombre'}</span>
                          {req.evidence_url === 'otp:verified' && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300" title="Identidad Verificada con OTP 2FA">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              OTP
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-500">{req.requester_email}</div>
                        {req.requester_rut && (
                          <div className="text-[11px] text-slate-400 font-mono">RUT: {req.requester_rut}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {req.tenants?.name || 'Tienda'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {RIGHTS_TYPE_LABELS[req.type as RightsType] || req.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status as RightsStatus} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
                            isAckCompleted
                              ? 'text-slate-400 bg-slate-50'
                              : ackCountdown.isLate
                              ? 'text-red-700 bg-red-50 border border-red-200'
                              : ackCountdown.isNear
                              ? 'text-amber-700 bg-amber-50 border border-amber-200'
                              : 'text-slate-700 bg-slate-100'
                          }`}
                        >
                          {ackCountdown.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
                            isResCompleted
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : resCountdown.isLate
                              ? 'text-red-700 bg-red-50 border border-red-200'
                              : resCountdown.isNear
                              ? 'text-amber-700 bg-amber-50 border border-amber-200'
                              : 'text-slate-700 bg-slate-100'
                          }`}
                        >
                          {resCountdown.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Tramitar
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal / Detalle de Tramitación */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Solicitud de {RIGHTS_TYPE_LABELS[selectedReq.type as RightsType] || selectedReq.type}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedReq.id} · Tienda: {selectedReq.tenants?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  {feedback.message}
                </div>
              )}

              {/* Datos del Titular */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Titular Solicitante:</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {selectedReq.requester_name || 'No especificado'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Correo Electrónico:</span>
                  <span className="font-semibold text-slate-800 font-mono text-sm">
                    {selectedReq.requester_email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">RUT / Identificación:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {selectedReq.requester_rut || 'No proporcionado'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Fecha de Ingreso:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDateTime(selectedReq.received_at)}
                  </span>
                </div>
              </div>

              {/* Verificación de Identidad Ley 21.719 */}
              {selectedReq.evidence_url === 'otp:verified' ? (
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-emerald-950 font-semibold">Identidad Verificada vía Código OTP (2FA)</strong>
                    <span>El solicitante autenticó la titularidad del correo electrónico conforme al Art. 21 de la Ley 21.719.</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <strong className="block text-amber-950 font-semibold">Verificación Tradicional Requerida</strong>
                    <span>Solicitud ingresada sin confirmación OTP directa. Se recomienda solicitar documento o confirmación por email antes de entregar o suprimir información sensible.</span>
                  </div>
                </div>
              )}

              {/* Descripción de la Solicitud */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Descripción / Detalle ingresado por el titular:
                </label>
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-wrap min-h-[60px]">
                  {selectedReq.description || 'El titular no incluyó detalles adicionales.'}
                </div>
              </div>

              {/* Cumplimiento de Plazos Legales (SLA Ley 21.719) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">1. Plazo Acuse de Recibo:</span>
                    <span className="text-[11px] text-slate-400">Máx. 5 días hábiles</span>
                  </div>
                  <p className="text-slate-600">
                    Límite: <strong className="font-mono">{formatDateTime(selectedReq.ack_deadline)}</strong>
                  </p>
                  <p className="mt-1">
                    {selectedReq.acknowledged_at ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Acusado el {formatDateTime(selectedReq.acknowledged_at)}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold">⚠️ Pendiente de acuse</span>
                    )}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">2. Plazo Resolución Final:</span>
                    <span className="text-[11px] text-slate-400">Máx. 30 días hábiles</span>
                  </div>
                  <p className="text-slate-600">
                    Límite: <strong className="font-mono">{formatDateTime(selectedReq.resolution_deadline)}</strong>
                  </p>
                  <p className="mt-1">
                    {selectedReq.resolved_at ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Resuelto el {formatDateTime(selectedReq.resolved_at)}
                      </span>
                    ) : (
                      <span className="text-blue-600 font-semibold">En proceso de tramitación</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Nota de Resolución Fundada */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nota / Fundamento de Resolución (Para constancia legal y respuesta al titular):
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Describe las medidas adoptadas (ej: 'Se eliminaron los registros de la base de clientes y marketing según Art. 16 Ley 21.719')..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Notificación Automática por Email */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="notifyByEmailCheckbox"
                  checked={notifyByEmail}
                  onChange={(e) => setNotifyByEmail(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="notifyByEmailCheckbox" className="text-xs cursor-pointer select-none">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    Enviar notificación formal por correo electrónico al titular
                  </span>
                  <span className="text-slate-500 block mt-0.5">
                    Destinatario: <strong className="font-mono text-slate-700">{selectedReq.requester_email}</strong>. Despacha el acuse o resolución con la fundamentación legal y número de folio según Ley 21.719.
                  </span>
                </label>
              </div>

              {/* Botones de Cambio de Estado */}
              <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {selectedReq.status === 'received' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => updateStatus('acknowledged')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                    >
                      {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                      Confirmar Acuse de Recibo
                    </button>
                  )}

                  {selectedReq.status === 'acknowledged' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => updateStatus('in_progress')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                    >
                      {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Poner en Tramitación
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => updateStatus('rejected')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Rechazar con Causa
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => updateStatus('resolved')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-emerald-600/20"
                  >
                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Resolver Solicitud
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RightsStatus }) {
  const styles: Record<RightsStatus, string> = {
    received: 'bg-amber-50 text-amber-800 border-amber-200',
    acknowledged: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || 'bg-slate-100 text-slate-800'
      }`}
    >
      {RIGHTS_STATUS_LABELS[status] || status}
    </span>
  );
}
