'use client';

import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  Printer,
  X,
  Send,
  Building2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import type { BreachIncident, BreachRisk, BreachStatus, Tenant } from '@/types/shared';
import { BREACH_RISK_LABELS, BREACH_STATUS_LABELS } from '@/types/shared';

interface BreachManagerProps {
  initialIncidents: (BreachIncident & { tenants?: { name: string; slug: string; rut_empresa?: string; razon_social?: string; email_dpo?: string; email_contacto?: string } })[];
  tenants: Tenant[];
  isAgencyAdmin: boolean;
  userTenantId?: string | null;
}

const DATA_TYPE_OPTIONS = [
  'Nombres y Apellidos',
  'RUT / Cédula de Identidad',
  'Correos Electrónicos',
  'Direcciones de Despacho',
  'Números Telefónicos',
  'Historial de Compras y Pedidos',
  'Credenciales / Contraseñas Cifradas',
  'Datos de Tarjetas / Pago (Token)',
];

export default function BreachManager({
  initialIncidents,
  tenants,
  isAgencyAdmin,
  userTenantId,
}: BreachManagerProps) {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedIncidentForApdp, setSelectedIncidentForApdp] = useState<BreachIncident & { tenants?: any } | null>(null);
  const [selectedIncidentForNotify, setSelectedIncidentForNotify] = useState<BreachIncident | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State para Nuevo Incidente
  const [formData, setFormData] = useState({
    tenant_id: userTenantId || (tenants[0]?.id ?? ''),
    title: '',
    detected_at: new Date().toISOString().slice(0, 16),
    risk_level: 'high' as BreachRisk,
    affected_count: '',
    data_types: ['Nombres y Apellidos', 'Correos Electrónicos'],
    description: '',
    resolution_notes: '',
  });

  // State para Registrar Notificación APDP
  const [apdpRef, setApdpRef] = useState('');

  // Contador de tiempo restante de 72 horas
  function get72hStatus(detectedAtStr: string, notifiedApdp: boolean) {
    if (notifiedApdp) {
      return { status: 'notified', label: 'Notificada a APDP en plazo', color: 'emerald' };
    }
    const detected = new Date(detectedAtStr).getTime();
    const deadline = detected + 72 * 60 * 60 * 1000;
    const diff = deadline - Date.now();

    if (diff <= 0) {
      const overdueHours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
      return {
        status: 'expired',
        label: `PLAZO 72H VENCIDO (hace ${overdueHours}h)`,
        color: 'rose',
        hoursLeft: 0,
      };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours <= 24) {
      return {
        status: 'urgent',
        label: `URGENTE: ${hours}h ${minutes}m restantes (Plazo 72h)`,
        color: 'red',
        hoursLeft: hours,
      };
    }

    return {
      status: 'pending',
      label: `${hours}h ${minutes}m para notificar a APDP`,
      color: 'amber',
      hoursLeft: hours,
    };
  }

  // Enviar Nuevo Incidente
  async function handleCreateIncident(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar');

      setIncidents((prev) => [data.data, ...prev]);
      setShowNewModal(false);
      setFeedback({
        type: 'success',
        message: 'Incidente de seguridad registrado correctamente. El plazo de 72h APDP está en curso.',
      });
      // Reset form
      setFormData({
        tenant_id: userTenantId || (tenants[0]?.id ?? ''),
        title: '',
        detected_at: new Date().toISOString().slice(0, 16),
        risk_level: 'high',
        affected_count: '',
        data_types: ['Nombres y Apellidos', 'Correos Electrónicos'],
        description: '',
        resolution_notes: '',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al registrar incidente' });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Registrar confirmación de Notificación a APDP
  async function handleConfirmApdp(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedIncidentForNotify) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/breach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedIncidentForNotify.id,
          notified_apdp: true,
          apdp_reference: apdpRef.trim() || 'APDP-ELECTRONIC-REG',
          status: 'contained',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar');

      setIncidents((prev) =>
        prev.map((inc) => (inc.id === selectedIncidentForNotify.id ? data.data : inc))
      );
      setSelectedIncidentForNotify(null);
      setApdpRef('');
      setFeedback({
        type: 'success',
        message: 'Notificación oficial ante la APDP registrada con éxito.',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al confirmar notificación' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length;
  const notifiedCount = incidents.filter((i) => i.notified_apdp).length;
  const urgentCount = incidents.filter((i) => {
    if (i.notified_apdp) return false;
    const diff = new Date(i.detected_at).getTime() + 72 * 3600 * 1000 - Date.now();
    return diff > 0 && diff <= 24 * 3600 * 1000;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            Gestión de Brechas e Incidentes de Seguridad
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Obligación Legal <strong>Ley N° 21.719 (Art. 38)</strong>: Notificación formal a la Agencia de Protección de Datos Personales (APDP) en un plazo perentorio de <strong>72 horas</strong>.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm shadow-red-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Reportar Incidente de Seguridad
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Regla de Oro 72 Horas Banner */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
        <AlertOctagon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <h3 className="font-bold text-red-950">Plazo Perentorio de 72 Horas — Agencia de Protección de Datos Personales (APDP)</h3>
          <p className="text-red-800 mt-1 leading-relaxed">
            La <strong>Ley 21.719</strong> impone multas de hasta <strong>10.000 UTM</strong> por no comunicar oportunamente a la autoridad cualquier filtración, pérdida o acceso ilegítimo a datos de clientes. El sistema computa automáticamente las 72 horas desde que se toma conocimiento y redacta el informe oficial.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Histórico</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{incidents.length}</p>
          <span className="text-xs text-slate-500">Incidentes registrados</span>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 bg-red-50/20 p-5 shadow-sm">
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">En Curso</span>
          <p className="text-2xl font-extrabold text-red-800 mt-2">{openIncidents}</p>
          <span className="text-xs text-red-600 font-medium">Abiertos o en contención</span>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-5 shadow-sm">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Urgentes (&lt; 24h)</span>
          <p className="text-2xl font-extrabold text-amber-800 mt-2">{urgentCount}</p>
          <span className="text-xs text-amber-600 font-medium">Próximos a vencer 72h</span>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-sm">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Notificados APDP</span>
          <p className="text-2xl font-extrabold text-emerald-800 mt-2">{notifiedCount}</p>
          <span className="text-xs text-emerald-600 font-medium">Con acuse de la autoridad</span>
        </div>
      </div>

      {/* Tabla de incidentes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-slate-900 text-base">Registro de Incidentes y Trazabilidad de Notificación</h2>
          <span className="text-xs text-slate-500">{incidents.length} incidentes registrados</span>
        </div>

        {incidents.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-900 font-semibold">Sin incidentes de seguridad registrados</p>
            <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
              No se han reportado filtraciones ni incidentes de ciberseguridad. Ante cualquier contingencia, utiliza el botón "Reportar Incidente" para activar el cómputo de 72 horas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {incidents.map((inc) => {
              const countdown = get72hStatus(inc.detected_at, inc.notified_apdp);

              return (
                <div key={inc.id} className="p-6 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-bold text-slate-900">{inc.title}</h3>
                        {inc.tenants && (
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                            {inc.tenants.name}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            inc.risk_level === 'critical'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : inc.risk_level === 'high'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : inc.risk_level === 'medium'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          Riesgo {BREACH_RISK_LABELS[inc.risk_level as BreachRisk] || inc.risk_level}
                        </span>

                        <span className="text-xs px-2.5 py-0.5 rounded-md border font-medium bg-slate-50 text-slate-700">
                          {BREACH_STATUS_LABELS[inc.status as BreachStatus] || inc.status}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed">{inc.description}</p>

                      {/* Categorías de datos afectadas */}
                      {inc.data_types && inc.data_types.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-xs font-semibold text-slate-400">Datos comprometidos:</span>
                          {inc.data_types.map((dt) => (
                            <span key={dt} className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                              {dt}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Contador de 72 Horas y Estado APDP */}
                      <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Conocimiento: {new Date(inc.detected_at).toLocaleString('es-CL')}
                        </span>
                        <span className="text-slate-500">
                          Titulares estimados: <strong>{inc.affected_count ? inc.affected_count.toLocaleString('es-CL') : 'En evaluación'}</strong>
                        </span>

                        {/* Badge de cuenta regresiva APDP */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold border text-xs ${
                            countdown.color === 'emerald'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : countdown.color === 'rose'
                              ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                              : countdown.color === 'red'
                              ? 'bg-red-50 text-red-800 border-red-300 font-extrabold'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{countdown.label}</span>
                          {inc.apdp_reference && (
                            <span className="text-[11px] font-mono opacity-80">({inc.apdp_reference})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones Legales */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedIncidentForApdp(inc)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition-colors"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        Formulario Oficial APDP
                      </button>

                      {!inc.notified_apdp ? (
                        <button
                          onClick={() => {
                            setSelectedIncidentForNotify(inc);
                            setApdpRef('');
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition-colors"
                        >
                          <Send className="w-4 h-4 text-emerald-600" />
                          Registrar Notificación APDP
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Notificada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Reportar Nuevo Incidente */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Registrar Incidente de Seguridad (72h APDP)</h3>
                  <p className="text-xs text-slate-500">Inicia el cómputo del plazo legal conforme al Art. 38 Ley 21.719</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="p-6 space-y-4">
              {isAgencyAdmin && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tienda / Cliente *</label>
                  <select
                    value={formData.tenant_id}
                    onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                    required
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Título del Incidente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fuga de base de datos de pedidos por acceso no autorizado"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Fecha y Hora de Detección *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.detected_at}
                    onChange={(e) => setFormData({ ...formData, detected_at: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Desde aquí corren las 72 horas</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nivel de Riesgo *</label>
                  <select
                    value={formData.risk_level}
                    onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as BreachRisk })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white font-medium"
                  >
                    <option value="low">Bajo (Sin impacto relevante en titulares)</option>
                    <option value="medium">Medio (Impacto moderado en privacidad)</option>
                    <option value="high">Alto (Riesgo evidente de daño económico o suplantación)</option>
                    <option value="critical">Crítico (Exposición masiva o datos de pago/menores)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Número Aproximado de Titulares Afectados
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 350 (Dejar en blanco si está en estimación)"
                  value={formData.affected_count}
                  onChange={(e) => setFormData({ ...formData, affected_count: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Categorías de Datos Comprometidos *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DATA_TYPE_OPTIONS.map((opt) => {
                    const isChecked = formData.data_types.includes(opt);
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-red-50/60 border-red-200 text-red-950 font-medium' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, data_types: [...formData.data_types, opt] });
                            } else {
                              setFormData({
                                ...formData,
                                data_types: formData.data_types.filter((t) => t !== opt),
                              });
                            }
                          }}
                          className="accent-red-600 rounded"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Descripción del Incidente y Vector de Vulnerabilidad *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explica qué ocurrió, sistemas afectados y cómo se tomó conocimiento..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Medidas de Contención Inmediata Implementadas
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Aislamiento del servidor web, revocación de API keys, reseteo preventivo de contraseñas..."
                  value={formData.resolution_notes}
                  onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? 'Registrando...' : 'Registrar Incidente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Formulario Oficial APDP (Art. 38 Ley 21.719) */}
      {selectedIncidentForApdp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Documento Oficial de Notificación de Brecha — Ley N° 21.719
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Exportar PDF
                </button>
                <button
                  onClick={() => setSelectedIncidentForApdp(null)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content (Formato Legal APDP) */}
            <div className="p-8 space-y-6 text-slate-900 text-xs leading-relaxed font-sans printable-area">
              <div className="text-center border-b border-slate-200 pb-5">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                  República de Chile · Agencia de Protección de Datos Personales (APDP)
                </h2>
                <h1 className="text-base font-bold text-slate-950 mt-1">
                  COMUNICACIÓN FORMAL DE VULNERACIÓN DE SEGURIDAD DE DATOS PERSONALES
                </h1>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Conforme a los Artículos 38 y 39 de la Ley N° 21.719 de Protección de Datos Personales
                </p>
              </div>

              {/* 1. Datos del Responsable */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 bg-blue-50/80 p-2 rounded-lg mb-2">
                  1. Identificación del Responsable del Tratamiento
                </h3>
                <div className="grid grid-cols-2 gap-3 pl-2">
                  <div>
                    <span className="text-slate-500 font-semibold block">Razón Social / Titular:</span>
                    <span className="font-bold">{selectedIncidentForApdp.tenants?.razon_social || selectedIncidentForApdp.tenants?.name || 'Responsable Registrado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">RUT de la Empresa:</span>
                    <span className="font-mono font-bold">{selectedIncidentForApdp.tenants?.rut_empresa || 'En acreditación'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Correo Electrónico de Contacto / DPO:</span>
                    <span className="font-mono">{selectedIncidentForApdp.tenants?.email_dpo || selectedIncidentForApdp.tenants?.email_contacto || 'contacto@tienda.cl'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Plataforma Tecnológica:</span>
                    <span>Tienda Online / Comercio Electrónico</span>
                  </div>
                </div>
              </div>

              {/* 2. Antecedentes del Incidente */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 bg-blue-50/80 p-2 rounded-lg mb-2">
                  2. Naturaleza y Cronología del Incidente
                </h3>
                <div className="grid grid-cols-2 gap-3 pl-2 mb-3">
                  <div>
                    <span className="text-slate-500 font-semibold block">Título del Evento:</span>
                    <span className="font-bold">{selectedIncidentForApdp.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Nivel de Riesgo Evaluado:</span>
                    <span className="font-bold uppercase text-red-700">
                      {BREACH_RISK_LABELS[selectedIncidentForApdp.risk_level as BreachRisk] || selectedIncidentForApdp.risk_level}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Fecha y Hora de Toma de Conocimiento:</span>
                    <span className="font-mono">{new Date(selectedIncidentForApdp.detected_at).toLocaleString('es-CL')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Vencimiento Plazo 72h APDP:</span>
                    <span className="font-mono font-bold text-red-700">
                      {new Date(new Date(selectedIncidentForApdp.detected_at).getTime() + 72 * 3600 * 1000).toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>

                <div className="pl-2">
                  <span className="text-slate-500 font-semibold block mb-1">Descripción Circunstanciada de los Hechos:</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap">
                    {selectedIncidentForApdp.description}
                  </div>
                </div>
              </div>

              {/* 3. Afectación de Titulares y Datos */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 bg-blue-50/80 p-2 rounded-lg mb-2">
                  3. Datos y Titulares Comprometidos
                </h3>
                <div className="grid grid-cols-2 gap-3 pl-2 mb-2">
                  <div>
                    <span className="text-slate-500 font-semibold block">Número Estimado de Titulares Afectados:</span>
                    <span className="font-bold text-sm">
                      {selectedIncidentForApdp.affected_count ? selectedIncidentForApdp.affected_count.toLocaleString('es-CL') : 'En proceso pericial de cuantificación'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Estado de Notificación a Titulares (Art. 39):</span>
                    <span>{selectedIncidentForApdp.notified_holders ? 'Notificación cursada directamente' : 'En evaluación técnica de riesgo grave'}</span>
                  </div>
                </div>

                <div className="pl-2">
                  <span className="text-slate-500 font-semibold block mb-1">Tipología de Datos Personales Afectados:</span>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {selectedIncidentForApdp.data_types?.map((dt) => (
                      <li key={dt} className="font-medium text-slate-800">{dt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 4. Medidas de Mitigación */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 bg-blue-50/80 p-2 rounded-lg mb-2">
                  4. Medidas Técnicas y Organizativas de Contención
                </h3>
                <div className="pl-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap">
                    {selectedIncidentForApdp.resolution_notes || 'Implementación de contención inmediata: aislamiento de servidores perimetrales, regeneración de claves de acceso administrativo y auditoría de accesos.'}
                  </div>
                </div>
              </div>

              {/* Pie de firma */}
              <div className="pt-8 border-t border-slate-200 mt-8">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[11px] text-slate-500">
                      Declaración emitida en conformidad a la Ley N° 21.719 de la República de Chile.
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Hash de Integridad / ID de Registro: {selectedIncidentForApdp.id}
                    </p>
                  </div>
                  <div className="text-center w-64 border-t border-slate-400 pt-2">
                    <p className="font-bold text-xs">Firma del Responsable / DPO</p>
                    <p className="text-[11px] text-slate-500">{selectedIncidentForApdp.tenants?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Notificación ante APDP */}
      {selectedIncidentForNotify && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Registrar Notificación APDP</h3>
                <p className="text-xs text-slate-500">Acredita el cumplimiento del plazo de 72 horas</p>
              </div>
            </div>

            <form onSubmit={handleConfirmApdp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Número de Expediente / Folio de Ingreso APDP *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: EXP-2026-004912 o Folio N° 84920"
                  value={apdpRef}
                  onChange={(e) => setApdpRef(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Identificador otorgado por la mesa de entrada o plataforma electrónica de la APDP.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncidentForNotify(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? 'Guardando...' : 'Confirmar Cumplimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
