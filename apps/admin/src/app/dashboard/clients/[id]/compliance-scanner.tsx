'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  Globe,
  Radio,
  ExternalLink,
  Plus,
  Zap,
} from 'lucide-react';

interface CheckItem {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  weight: number;
}

interface AuditResult {
  score: number;
  verdict: string;
  target_url: string;
  crawl_success: boolean;
  audited_at: string;
  checks: CheckItem[];
  detected_trackers: string[];
  recommendations: string[];
}

interface ComplianceScannerProps {
  tenantSlug: string;
  initialWebsite?: string | null;
}

export function ComplianceScanner({ tenantSlug, initialWebsite }: ComplianceScannerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seedingRat, setSeedingRat] = useState(false);

  async function handleSeedRat() {
    setSeedingRat(true);
    try {
      const res = await fetch('/api/rat/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_slug: tenantSlug }),
      });
      if (res.ok) {
        await runAudit();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSeedingRat(false);
    }
  }

  async function runAudit() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/audit/${encodeURIComponent(tenantSlug)}`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('No se pudo completar el análisis de la tienda');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con la tienda.');
    } finally {
      setLoading(false);
    }
  }

  const score = result ? result.score : 75; // Default score antes del primer escaneo en vivo

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Auditoría en Vivo — Score de Cumplimiento Ley 21.719
            </h2>
            <p className="text-xs text-slate-500">
              Diagnóstico en tiempo real del storefront y pilares regulatorios.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runAudit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Inspeccionando Storefront...' : 'Ejecutar Auditoría en Vivo'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Score Bar y Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
        <div className="sm:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Índice de Madurez Regulatoria:</span>
            <span
              className={`text-sm font-bold font-mono ${
                score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
              }`}
            >
              {score} / 100 PTS
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500">
            {result ? (
              <>Último escaneo: <strong className="font-mono">{new Date(result.audited_at).toLocaleTimeString()}</strong> en {result.target_url}</>
            ) : (
              <>Puntuación base estimada. Haz clic en "Ejecutar Auditoría" para rastrear tu storefront.</>
            )}
          </p>
        </div>

        <div className="flex flex-col justify-center items-start sm:items-end border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-2 sm:pt-0">
          <span className="text-[11px] uppercase font-semibold text-slate-400">Veredicto Legal</span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full mt-1 ${
              score >= 75
                ? 'bg-emerald-100 text-emerald-800'
                : score >= 50
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {result?.verdict || 'Cumplimiento Adecuado'}
          </span>
        </div>
      </div>

      {/* Checklist de los 4 Pilares */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Verificación de Obligaciones Legales:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {(result?.checks || [
            {
              id: 'cmp_widget',
              title: 'Banner CMP de Cookies en Storefront',
              description: 'Consentimiento previo y bloqueo activo en la tienda.',
              passed: true,
              weight: 25,
            },
            {
              id: 'policy',
              title: 'Política de Privacidad Conforme a Ley 21.719',
              description: 'Cláusulas vigentes accesibles públicamente.',
              passed: true,
              weight: 25,
            },
            {
              id: 'rat',
              title: 'Registro de Tratamientos RAT (Mín. 5)',
              description: 'Inventario de operaciones de datos con base legal Art. 13.',
              passed: true,
              weight: 25,
            },
            {
              id: 'arsop',
              title: 'Canal de Solicitudes ARSOP+ Disponible',
              description: 'Formulario para acceso, supresión y oposición activo.',
              passed: true,
              weight: 25,
            },
          ]).map((c) => (
            <div
              key={c.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                c.passed ? 'bg-white border-slate-200' : 'bg-red-50/40 border-red-200'
              }`}
            >
              {c.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${c.passed ? 'text-slate-800' : 'text-red-900'}`}>
                  {c.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                {c.id === 'rat' && !c.passed && (
                  <button
                    type="button"
                    onClick={handleSeedRat}
                    disabled={seedingRat}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-semibold transition shadow-xs cursor-pointer"
                  >
                    <Plus className={`w-3.5 h-3.5 ${seedingRat ? 'animate-spin' : ''}`} />
                    {seedingRat ? 'Cargando tratamientos...' : 'Cargar 8 tratamientos estándar (1 clic)'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trackers Detectados en Storefront */}
      {result && result.detected_trackers.length > 0 && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Radio className="w-4 h-4 text-indigo-600" />
            <span>Rastreadores Detectados en la Tienda (Sujetos a Consentimiento):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.detected_trackers.map((t, idx) => (
              <span
                key={idx}
                className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px] shadow-2xs"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            El widget CMP de Ley 21.719 emite el evento <code>ley21719_consent_update</code> en el <code>dataLayer</code> de Google Tag Manager para permitir o pausar estos rastreadores según la elección del visitante.
          </p>
        </div>
      )}

      {/* Recomendaciones */}
      {result && result.recommendations.length > 0 && (
        <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-1">
          <span className="font-semibold text-amber-900 block">Recomendaciones para alcanzar el 100%:</span>
          <ul className="list-disc list-inside text-amber-800 space-y-0.5">
            {result.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
