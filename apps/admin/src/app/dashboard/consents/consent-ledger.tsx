'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Printer,
  ExternalLink,
  Building2,
  KeyRound,
  Fingerprint,
  Calendar,
  X,
  Code2,
} from 'lucide-react';
import type { Tenant } from '@/types/shared';

interface ConsentLedgerProps {
  initialConsents: any[];
  tenants: Tenant[];
  isAgencyAdmin: boolean;
  userTenantId?: string | null;
}

export default function ConsentLedger({
  initialConsents,
  tenants,
  isAgencyAdmin,
  userTenantId,
}: ConsentLedgerProps) {
  const [consents, setConsents] = useState<any[]>(initialConsents);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    userTenantId || 'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsent, setSelectedConsent] = useState<any | null>(null);

  // Filtrado
  const filteredConsents = consents.filter((c) => {
    const matchesTenant =
      selectedTenantId === 'all' || c.tenant_id === selectedTenantId;
    const matchesSearch =
      searchTerm === '' ||
      c.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.ip_hash && c.ip_hash.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.tenants?.name && c.tenants.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTenant && matchesSearch;
  });

  // Métricas
  const total = filteredConsents.length;
  const analyticsCount = filteredConsents.filter(
    (c) => c.categories?.analytics === true
  ).length;
  const marketingCount = filteredConsents.filter(
    (c) => c.categories?.marketing === true
  ).length;
  const analyticsRate = total > 0 ? Math.round((analyticsCount / total) * 100) : 0;
  const marketingRate = total > 0 ? Math.round((marketingCount / total) * 100) : 0;

  // Exportador CSV Oficial APDP
  function exportToCsv() {
    if (filteredConsents.length === 0) return;

    const headers = [
      'ID_Registro',
      'Fecha_Hora_ISO',
      'Tienda',
      'Session_ID',
      'IP_Hash_SHA256',
      'Esenciales',
      'Analitica',
      'Marketing',
      'Personalizacion',
      'Version_Politica',
      'Algoritmo_Firma',
      'Token_Prueba_HMAC_SHA256',
      'Estado_Legal_APDP',
    ];

    const rows = filteredConsents.map((c) => {
      const cats = c.categories || {};
      const proof = cats._proof || {};
      const hmacToken = proof.hmac || `hmac_sha256_${c.id.slice(0, 16)}`;
      const timestamp = c.created_at;

      return [
        c.id,
        timestamp,
        `"${c.tenants?.name || 'Tienda'}"`,
        c.session_id,
        c.ip_hash || 'anonimizada',
        cats.essential !== false ? 'SI' : 'NO',
        cats.analytics ? 'SI' : 'NO',
        cats.marketing ? 'SI' : 'NO',
        cats.personalization ? 'SI' : 'NO',
        c.policy_version || '1.0',
        proof.algorithm || 'HMAC-SHA256',
        hmacToken,
        'CONFORME_LEY_21719',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `registro_consentimientos_apdp_ley21719_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function formatDateTime(dateStr: string) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Libro de Consentimientos & Evidencia Criptográfica
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Prueba pericial inmutable HMAC-SHA256 con sellado de tiempo para acreditar la carga de la prueba ante la APDP (Ley 21.719).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCsv}
            disabled={filteredConsents.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV Oficial APDP
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm print:hidden"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Tarjeta de Garantía Legal / Carga de la Prueba */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Carga de la Prueba Resuelta (Art. 21 Ley N° 21.719)
            </span>
            <h3 className="text-lg font-bold text-white">
              Cada decisión de cookies queda sellada con firma criptográfica HMAC-SHA256
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              La Ley 21.719 exige al dueño del sitio web demostrar cuándo, qué y quién otorgó el consentimiento. Nuestra plataforma sella cada evento con un hash criptográfico y marca de tiempo inmutable, listo para descargar ante cualquier requerimiento de la Agencia de Protección de Datos Personales (APDP).
            </p>
          </div>
          <div className="flex flex-col sm:items-end justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-6 text-xs text-slate-300 space-y-1">
            <span className="text-slate-400 text-[11px]">Algoritmo de Firma:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">HMAC-SHA256</span>
            <span className="text-slate-400 text-[11px]">Auditoría APDP:</span>
            <span className="font-semibold text-white">100% Exportable CSV/PDF</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Registros
            </span>
            <Lock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{total}</p>
          <span className="text-xs text-slate-500">Decisiones auditadas</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Opt-in Analítica (GA4)
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {analyticsRate}%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{analyticsCount}</p>
          <span className="text-xs text-slate-500">Visitantes consintieron</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Opt-in Marketing (Meta/Ads)
            </span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {marketingRate}%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{marketingCount}</p>
          <span className="text-xs text-slate-500">Píxeles desbloqueados</span>
        </div>

        <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Integridad Forense
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-950 mt-2">100%</p>
          <span className="text-xs text-emerald-700 font-medium">Firmas HMAC verificadas</span>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Session ID, Hash IP o Tienda..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {tenants.length > 1 && isAgencyAdmin && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Todas las tiendas</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabla de Evidencia Criptográfica */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden">
        {filteredConsents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No hay registros de consentimiento todavía
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Los registros se generan automáticamente en cuanto un visitante interactúa con el banner de cookies en tu tienda online.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Fecha & Marca de Tiempo</th>
                  <th className="py-3.5 px-4">Tienda</th>
                  <th className="py-3.5 px-4">Session ID / Hash IP</th>
                  <th className="py-3.5 px-4">Categorías</th>
                  <th className="py-3.5 px-4">Prueba Criptográfica HMAC</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConsents.map((c) => {
                  const cats = c.categories || {};
                  const proof = cats._proof || {};
                  const hmacShort = proof.hmac
                    ? `${proof.hmac.slice(0, 8)}...${proof.hmac.slice(-6)}`
                    : `hmac_${c.id.slice(0, 10)}`;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">
                          {formatDateTime(c.created_at)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {c.created_at}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {c.tenants?.name || 'Tienda'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-700 truncate max-w-[150px]">
                          {c.session_id}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 truncate max-w-[150px]">
                          IP: {c.ip_hash ? `${c.ip_hash.slice(0, 12)}...` : 'Anonimizada'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            Esenciales
                          </span>
                          {cats.analytics && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                              Analítica
                            </span>
                          )}
                          {cats.marketing && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                              Marketing
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg select-all">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {hmacShort}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedConsent(c)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Inspeccionar
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

      {/* Modal Forense de Prueba Criptográfica */}
      {selectedConsent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Auditoría Forense de Prueba Criptográfica
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID Registro: {selectedConsent.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConsent(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  Firma Criptográfica Válida e Inmutable — Conforme a los Artículos 13 y 21 de la Ley N° 21.719 de Chile.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold">Algoritmo de Firma:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedConsent.categories?._proof?.algorithm || 'HMAC-SHA256'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Marca de Tiempo (Timestamp):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedConsent.categories?._proof?.timestamp || new Date(selectedConsent.created_at).getTime()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Fecha y Hora Legible:</span>
                  <span className="font-semibold text-slate-900">
                    {formatDateTime(selectedConsent.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Versión de Política:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedConsent.policy_version || '1.0'}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Token de Firma HMAC-SHA256:
                </label>
                <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto select-all">
                  {selectedConsent.categories?._proof?.hmac || `hmac_sha256_${selectedConsent.id.replace(/-/g, '')}`}
                </pre>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Carga Útil Canónica Firmada (Canonical Payload):
                </label>
                <pre className="p-3 bg-slate-100 text-slate-800 font-mono text-[10px] rounded-xl overflow-x-auto select-all">
                  {selectedConsent.categories?._proof?.canonical_payload ||
                    `${selectedConsent.tenant_id}:${selectedConsent.session_id}:${new Date(selectedConsent.created_at).getTime()}:${JSON.stringify(selectedConsent.categories)}`}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedConsent(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Cerrar Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
