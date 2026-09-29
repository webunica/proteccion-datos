'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  ChevronRight,
  Building2,
  Info,
  Check,
  X,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import type { Tenant } from '@/types/shared';

interface EipdManagerProps {
  tenants: Tenant[];
  isAgencyAdmin: boolean;
  userTenantId?: string | null;
}

interface Question {
  id: string;
  title: string;
  desc: string;
  legalArticle: string;
  riskWeight: number; // 1-3
}

const THRESHOLD_QUESTIONS: Question[] = [
  {
    id: 'profiling',
    title: '1. Perfilamiento sistemático y segmentación publicitaria',
    desc: '¿Realizas retargeting, audiencias similares o evaluación de patrones de navegación y compra mediante Meta Pixel, Google Ads o herramientas de scoring predictivo?',
    legalArticle: 'Art. 25 Ley 21.719 (Perfilamiento sistemático)',
    riskWeight: 3,
  },
  {
    id: 'large_scale',
    title: '2. Tratamiento a gran escala de titulares',
    desc: '¿La tienda procesa o almacena datos de más de 5.000 clientes, compradores o usuarios suscritos de forma recurrente?',
    legalArticle: 'Art. 25 inc. 2° (Volumen significativo de titulares)',
    riskWeight: 2,
  },
  {
    id: 'cross_border',
    title: '3. Transferencia internacional de bases de datos',
    desc: '¿Los datos de tus clientes se alojan en servidores de proveedores extranjeros (ej: Shopify en Canadá/EE.UU., Klaviyo, AWS) fuera de Chile?',
    legalArticle: 'Arts. 26 y 27 (Transferencias transfronterizas)',
    riskWeight: 2,
  },
  {
    id: 'sensitive',
    title: '4. Datos de categorías especiales o sensibles',
    desc: '¿Recolectas datos de salud, biometría, hábitos personales o productos de consumo que revelen condiciones sensibles?',
    legalArticle: 'Art. 14 Ley 21.719 (Datos de categorías especiales)',
    riskWeight: 3,
  },
  {
    id: 'minors',
    title: '5. Tratamiento de datos de menores de 14 años',
    desc: '¿La tienda comercializa productos dirigidos a niños, niñas o adolescentes requiriendo consentimiento parental?',
    legalArticle: 'Art. 17 Ley 21.719 (Datos de niños, niñas y adolescentes)',
    riskWeight: 3,
  },
  {
    id: 'automated_decisions',
    title: '6. Decisiones automatizadas de crédito o precios',
    desc: '¿Se aplican algoritmos automatizados que modifiquen precios de forma dinámica o bloqueen compras por scoring de riesgo sin intervención humana?',
    legalArticle: 'Art. 20 Ley 21.719 (Derecho a no ser objeto de decisiones automatizadas)',
    riskWeight: 2,
  },
];

export default function EipdManager({
  tenants,
  isAgencyAdmin,
  userTenantId,
}: EipdManagerProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    userTenantId || tenants[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'test' | 'matrix' | 'report'>('test');
  const [answers, setAnswers] = useState<Record<string, boolean>>({
    profiling: true, // Typical e-commerce
    large_scale: false,
    cross_border: true, // Typical e-commerce Shopify/AWS
    sensitive: false,
    minors: false,
    automated_decisions: false,
  });

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

  function toggleAnswer(id: string) {
    setAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Cálculo de Riesgo
  const positiveCount = Object.values(answers).filter(Boolean).length;
  const highRiskScore = THRESHOLD_QUESTIONS.reduce((acc, q) => {
    return acc + (answers[q.id] ? q.riskWeight : 0);
  }, 0);

  const isMandatory = answers.profiling || answers.sensitive || answers.minors || highRiskScore >= 5;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Evaluación de Impacto en Protección de Datos (EIPD)
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Auditoría de riesgos y generación del dictamen formal exigido por el Artículo 25 de la Ley N° 21.719.
              </p>
            </div>
          </div>
        </div>

        {/* Selector de Tienda */}
        {tenants.length > 1 && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.platform.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs de Navegación */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'test'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          1. Test de Obligatoriedad (Umbrales)
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'matrix'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          2. Matriz de Riesgos & Mitigación
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'report'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          3. Informe Oficial APDP (Exportable)
        </button>
      </div>

      {/* TAB 1: TEST DE OBLIGATORIEDAD */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          {/* Banner de Resultado del Test */}
          <div
            className={`p-6 rounded-3xl border transition-all ${
              isMandatory
                ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isMandatory ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isMandatory ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Dictamen Legal — Tienda: {selectedTenant?.name}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isMandatory ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {isMandatory ? 'EIPD Obligatoria' : 'EIPD Voluntaria / Riesgo Controlado'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-950">
                  {isMandatory
                    ? 'Esta tienda está legalmente obligada a mantener una Evaluación de Impacto (EIPD).'
                    : 'Las actividades de tratamiento actuales no superan los umbrales de alto riesgo.'}
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  {isMandatory
                    ? 'Conforme al Artículo 25 de la Ley 21.719, las actividades de perfilamiento publicitario masivo (cookies/pixel) o transferencias internacionales requieren la formalización de este documento con medidas de mitigación para evitar multas de la APDP.'
                    : 'Aunque no supere el umbral obligatorio, mantener la evaluación documentada es prueba de diligencia debida y cumplimiento proactivo (Accountability, Art. 4° bis).'}
                </p>
              </div>
            </div>
          </div>

          {/* Cuestionario Interactivo */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Criterios de Evaluación según Directrices de la APDP
            </h3>

            <div className="space-y-3">
              {THRESHOLD_QUESTIONS.map((q) => {
                const checked = !!answers[q.id];
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleAnswer(q.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      checked
                        ? 'bg-purple-50/40 border-purple-300 shadow-sm'
                        : 'bg-slate-50/40 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                        checked
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white border-slate-300 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{q.title}</span>
                        <span className="text-[11px] font-mono text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
                          {q.legalArticle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{q.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Puntaje de riesgo acumulado: <strong className="text-slate-800">{highRiskScore} pts</strong>
              </span>
              <button
                onClick={() => setActiveTab('matrix')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Ver Matriz de Mitigación
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIZ DE RIESGOS & MITIGACIÓN */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Matriz de Control y Mitigación de Riesgos (Art. 25 inc. 3°)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Medidas técnicas, organizativas y jurídicas implementadas en {selectedTenant?.name} para reducir el riesgo residual a nivel aceptable:
              </p>
            </div>

            <div className="space-y-4">
              {/* Riesgo 1 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <h4 className="text-xs font-bold text-slate-900">
                      Riesgo: Rastreo y perfilamiento publicitario sin consentimiento expreso
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Riesgo Residual: Bajo
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Impacto:</strong> Sanciones de la APDP por recopilación ilícita de hábitos de navegación mediante pixels de Meta o Google.
                </p>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <strong className="text-emerald-800 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Medida de Mitigación Implementada:
                  </strong>
                  <span>
                    Bloqueo previo estricto con Google Consent Mode v2 y Shopify Customer Privacy API vía <code>widget.js</code>. Los pixels permanecen inactivos hasta que el visitante otorga consentimiento afirmativo libre.
                  </span>
                </div>
              </div>

              {/* Riesgo 2 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h4 className="text-xs font-bold text-slate-900">
                      Riesgo: Suplantación de identidad en solicitudes de ejercicio de derechos ARSOP+
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Riesgo Residual: Bajo
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Impacto:</strong> Entrega o eliminación indebida de datos personales a un tercero no autorizado vulnerando el Art. 21.
                </p>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <strong className="text-emerald-800 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Medida de Mitigación Implementada:
                  </strong>
                  <span>
                    Verificación en dos pasos (OTP / 2FA) vía correo electrónico con token criptográfico HMAC SHA-256 antes de dar trámite al requerimiento.
                  </span>
                </div>
              </div>

              {/* Riesgo 3 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <h4 className="text-xs font-bold text-slate-900">
                      Riesgo: Fuga o uso indebido de datos por proveedores externos (Couriers, Pasarelas)
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Riesgo Residual: Bajo
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Impacto:</strong> Responsabilidad solidaria o subsidiaria del responsable por infracciones cometidas por el encargado (Arts. 15 y 16).
                </p>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <strong className="text-emerald-800 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Medida de Mitigación Implementada:
                  </strong>
                  <span>
                    Celebración formal de Contratos de Encargo de Tratamiento (DPAs) con cláusulas de confidencialidad, no reutilización para fines propios y deber de notificación de incidentes en 48 horas.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('report')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Generar Informe Oficial APDP
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INFORME OFICIAL EIPD */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="flex justify-end print:hidden">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Guardar Informe EIPD en PDF
            </button>
          </div>

          {/* Documento Formal EIPD */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-xl print:shadow-none print:border-none print:p-0 space-y-6 text-slate-900 font-sans">
            <div className="border-b-2 border-slate-100 pb-6 text-center space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Documento Oficial de Cumplimiento Legal
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-2">
                INFORME DE EVALUACIÓN DE IMPACTO EN PROTECCIÓN DE DATOS (EIPD)
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Emitido de conformidad al Artículo 25 de la Ley N° 21.719 de la República de Chile
              </p>
            </div>

            {/* Metadatos */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Responsable del Tratamiento:</span>
                <span className="font-bold text-slate-900">{selectedTenant?.razon_social || selectedTenant?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">RUT Empresa:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTenant?.rut_empresa || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Plataforma Tecnológica:</span>
                <span className="font-semibold text-slate-900 capitalize">{selectedTenant?.platform}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Fecha de Conclusión EIPD:</span>
                <span className="font-semibold text-slate-900">
                  {new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Sección 1 */}
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Descripción Sistemática del Tratamiento
              </h3>
              <p>
                El presente informe evalúa los tratamientos de datos personales efectuados a través del sitio de comercio electrónico <strong>{selectedTenant?.name}</strong>, incluyendo la gestión de carritos de compra, checkout, pasarelas de pago, coordinación de despacho físico y herramientas de analítica y publicidad digital.
              </p>
            </div>

            {/* Sección 2 */}
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Juicio de Necesidad y Proporcionalidad (Art. 3° Ley 21.719)
              </h3>
              <p>
                Se constata que la recolección de datos personales de compra (nombre, RUT, dirección y correo electrónico) es estrictamente necesaria para el cumplimiento de las obligaciones contractuales (Art. 13 a) y tributarias del comercio.
              </p>
              <p>
                En materia publicitaria y de analítica web, el tratamiento se fundamenta en el <strong>consentimiento libre, expreso e informado</strong> del titular mediante banner interactivo sin casillas pre-marcadas, garantizando el derecho a revocar las preferencias en cualquier momento.
              </p>
            </div>

            {/* Sección 3 */}
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Medidas de Mitigación de Riesgos y Controles de Seguridad
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Cifrado Robusto:</strong> Transmisión segura con protocolo TLS 1.3 y algoritmos HMAC SHA-256.</li>
                <li><strong>Gobernanza de Consentimiento:</strong> Integración de Google Consent Mode v2 y Shopify Customer Privacy API.</li>
                <li><strong>Control de Encargados (DPAs):</strong> Formalización de contratos de encargo con cláusulas de retención limitada y deber de reporte de incidentes en 48 horas.</li>
                <li><strong>Autenticación en 2 Pasos (OTP):</strong> Validación de identidad para evitar fraudes en solicitudes ARSOP+.</li>
              </ul>
            </div>

            {/* Dictamen */}
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-1">
              <strong className="text-purple-950 font-bold block">
                4. Dictamen Final del Responsable / Delegado de Protección de Datos (DPO):
              </strong>
              <p className="text-purple-900 leading-relaxed">
                Concluido el análisis, se dictamina que los riesgos identificados han sido debidamente mitigados a niveles aceptables y proporcionales. Las operaciones de tratamiento se consideran <strong>CONFORMES Y AUTORIZADAS</strong> para su ejecución bajo el régimen general de la Ley N° 21.719.
              </p>
            </div>

            {/* Firma */}
            <div className="pt-10 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
              <div className="space-y-1 text-center w-60 border-t border-slate-400 pt-2">
                <span className="font-bold text-slate-800 block">Oficial de Privacidad / DPO</span>
                <span className="text-[11px] block">{selectedTenant?.email_dpo || selectedTenant?.email_contacto}</span>
              </div>
              <div className="space-y-1 text-center w-60 border-t border-slate-400 pt-2">
                <span className="font-bold text-slate-800 block">Representante Legal</span>
                <span className="text-[11px] block">{selectedTenant?.razon_social || selectedTenant?.name}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
