'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ShieldCheck,
  Clock,
  Building2,
  Lock,
  Globe,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  FileText,
  Save,
} from 'lucide-react';
import type { RatTreatment, LegalBasis, RiskLevel } from '@/types/shared';

interface RatEditModalProps {
  treatment: RatTreatment;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function RatEditModal({ treatment, isOpen, onClose, onSaved }: RatEditModalProps) {
  const router = useRouter();

  // Form states matching the 6 essential audit requirements
  const [name, setName] = useState(treatment.name);
  const [purpose, setPurpose] = useState(treatment.purpose);
  const [legalBasis, setLegalBasis] = useState<LegalBasis>(treatment.legal_basis);
  const [legalBasisDetail, setLegalBasisDetail] = useState(treatment.legal_basis_detail || '');
  const [dataCategories, setDataCategories] = useState(treatment.data_categories?.join(', ') || '');
  const [dataSubjects, setDataSubjects] = useState(treatment.data_subjects?.join(', ') || '');
  const [recipients, setRecipients] = useState(treatment.recipients?.join(', ') || '');
  const [thirdCountries, setThirdCountries] = useState(treatment.third_countries?.join(', ') || '');
  const [retentionPeriod, setRetentionPeriod] = useState(treatment.retention_period || '');
  const [securityMeasures, setSecurityMeasures] = useState(treatment.security_measures?.join(', ') || '');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(treatment.risk_level);
  const [requiresEipd, setRequiresEipd] = useState(treatment.requires_eipd);
  const [isActive, setIsActive] = useState(treatment.is_active);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const payload = {
        name,
        purpose,
        legal_basis: legalBasis,
        legal_basis_detail: legalBasisDetail || null,
        data_categories: dataCategories.split(',').map((s) => s.trim()).filter(Boolean),
        data_subjects: dataSubjects.split(',').map((s) => s.trim()).filter(Boolean),
        recipients: recipients.split(',').map((s) => s.trim()).filter(Boolean),
        third_countries: thirdCountries.split(',').map((s) => s.trim()).filter(Boolean),
        retention_period: retentionPeriod || null,
        security_measures: securityMeasures.split(',').map((s) => s.trim()).filter(Boolean),
        risk_level: riskLevel,
        requires_eipd: requiresEipd,
        is_active: isActive,
      };

      const res = await fetch(`/api/rat/${treatment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar el tratamiento');
      }

      setSavedSuccess(true);
      if (onSaved) onSaved();
      router.refresh();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider font-mono">
                Art. 13 · Ley 21.719
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}
              >
                {isActive ? '✓ Confirmado por Tienda' : '🟡 Borrador Sugerido'}
              </span>
            </div>
            <h2 className="text-lg font-bold mt-1 text-slate-50">{name || 'Ficha de Tratamiento RAT'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>¡Ficha de tratamiento actualizada y validada con éxito!</span>
            </div>
          )}

          {/* Banner de Aviso de Responsabilidad */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              Principio de Responsabilidad Proactiva (Art. 21 y 24)
            </span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Esta ficha contiene una propuesta técnica estándar para e-commerce. Como responsable del tratamiento,
              debes confirmar que los datos, proveedores y plazos concuerden exactamente con las herramientas activas en tu tienda.
            </p>
          </div>

          {/* 1. Datos y Titulares */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              1. ¿Qué datos se recogen y de quién?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Categorías de Datos Tratados (separadas por coma):
                </label>
                <input
                  type="text"
                  value={dataCategories}
                  onChange={(e) => setDataCategories(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  placeholder="nombre, email, rut, dirección de envío, token de pago"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Titulares de los Datos (separados por coma):
                </label>
                <input
                  type="text"
                  value={dataSubjects}
                  onChange={(e) => setDataSubjects(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                  placeholder="clientes compradores, usuarios registrados, visitantes"
                />
              </div>
            </div>
          </div>

          {/* 2. Finalidad y Base Legal */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              2. Finalidad y Base Legal Específica
            </h3>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nombre de la Actividad de Tratamiento:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Finalidad Concreta del Tratamiento:</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                placeholder="Explicación clara de por qué y para qué se usan los datos..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Base Legal (Art. 13 Ley 21.719):</label>
                <select
                  value={legalBasis}
                  onChange={(e) => setLegalBasis(e.target.value as LegalBasis)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="contract">Ejecución de Contrato (Art. 13 a)</option>
                  <option value="consent">Consentimiento Expreso (Art. 13 b)</option>
                  <option value="legal_obligation">Obligación Legal / Tributaria (Art. 13 c)</option>
                  <option value="legitimate_interest">Interés Legítimo (Art. 13 d)</option>
                  <option value="vital_interests">Intereses Vitales</option>
                  <option value="public_interest">Interés Público</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Justificación Legal Específica:</label>
                <input
                  type="text"
                  value={legalBasisDetail}
                  onChange={(e) => setLegalBasisDetail(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Cumplimiento de contrato de compraventa o Art. 17 D-Ley 825"
                />
              </div>
            </div>
          </div>

          {/* 3. Plazo de Conservación */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              3. Plazo de Conservación y Destrucción
            </h3>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Plazo de Retención Justificado:</label>
              <input
                type="text"
                value={retentionPeriod}
                onChange={(e) => setRetentionPeriod(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: 5 años según exigencia tributaria SII Art. 200 / Hasta revocación de consentimiento"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Ojo: los datos deben suprimirse o anonimizarse una vez cumplida la finalidad o el plazo legal obligatorio.
              </span>
            </div>
          </div>

          {/* 4. Destinatarios y Proveedores */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              4. Quién accede o recibe los datos (Destinatarios y Encargados)
            </h3>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Proveedores, Couriers y Pasarelas (separados por coma):
              </label>
              <input
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                placeholder="Shopify Inc., Transbank, Chilexpress, Starken, Blue Express, Google LLC"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Debes contar con un Acuerdo de Encargo de Tratamiento (DPA) firmado con cada uno.
              </span>
            </div>
          </div>

          {/* 5. Seguridad y Transferencias Internacionales */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              5. Medidas de Seguridad y Transferencias Internacionales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Medidas de Seguridad Aplicadas:
                </label>
                <input
                  type="text"
                  value={securityMeasures}
                  onChange={(e) => setSecurityMeasures(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                  placeholder="Cifrado TLS, Tokenización PCI-DSS, Acceso restringido por roles"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Países Destino / Transferencias Internacionales:
                </label>
                <input
                  type="text"
                  value={thirdCountries}
                  onChange={(e) => setThirdCountries(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                  placeholder="Estados Unidos (servidores Shopify / Google), Irlanda"
                />
              </div>
            </div>
          </div>

          {/* 6. Evaluación de Riesgo y Estado de Confirmación */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              6. Validación y Confirmación de la Tienda
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nivel de Riesgo del Tratamiento:</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="normal">Riesgo Normal (E-commerce habitual)</option>
                  <option value="high">Riesgo Alto (Retargeting masivo, perfiles)</option>
                  <option value="very_high">Muy Alto (Datos sensibles o biométricos)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="eipd-check"
                  checked={requiresEipd}
                  onChange={(e) => setRequiresEipd(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <label htmlFor="eipd-check" className="font-semibold text-slate-700 text-xs cursor-pointer">
                  Requiere Evaluación de Impacto (EIPD Art. 25)
                </label>
              </div>
            </div>

            {/* Checkbox de Validación por el Responsable */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 mt-4">
              <input
                type="checkbox"
                id="is-active-check"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 mt-0.5 cursor-pointer"
              />
              <label htmlFor="is-active-check" className="cursor-pointer">
                <span className="font-bold text-slate-900 block text-xs">
                  Validar y Confirmar este Tratamiento para la Tienda
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                  Declaro que he revisado las finalidades, la base legal concreta, los destinatarios reales y las medidas
                  de seguridad de esta operación para garantizar el cumplimiento de la Ley 21.719.
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Ficha RAT
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
