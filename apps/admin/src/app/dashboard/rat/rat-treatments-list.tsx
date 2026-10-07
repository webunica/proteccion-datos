'use client';

import { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  Pencil,
  FileText,
  CheckCircle2,
  Building2,
  Lock,
} from 'lucide-react';
import type { RatTreatment, LegalBasis, RiskLevel } from '@/types/shared';
import { LEGAL_BASIS_LABELS, RISK_LEVEL_LABELS } from '@/types/shared';
import { RatEditModal } from './rat-edit-modal';

interface RatTreatmentsListProps {
  treatments: (RatTreatment & { tenants?: { name: string; slug: string } })[];
}

export function RatTreatmentsList({ treatments }: RatTreatmentsListProps) {
  const [selectedTreatment, setSelectedTreatment] = useState<RatTreatment | null>(null);

  return (
    <>
      <div className="divide-y divide-gray-100">
        {treatments.map((t, index) => (
          <div key={t.id} className="p-6 hover:bg-gray-50/70 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold font-mono">
                    {index + 1}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>

                  {/* Estado: Borrador vs Confirmado */}
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      t.is_active
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {t.is_active ? '✓ Confirmado por Tienda' : '🟡 Borrador Sugerido'}
                  </span>

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
                    {t.legal_basis_detail && (
                      <span className="text-gray-400 text-[11px]">({t.legal_basis_detail})</span>
                    )}
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
                    {t.data_categories?.length > 0
                      ? t.data_categories.join(', ')
                      : 'Sin especificar'}
                  </div>
                  <div>
                    <strong className="text-gray-700">Encargados / Destinatarios:</strong>{' '}
                    {t.recipients?.length > 0 ? t.recipients.join(', ') : 'Solo uso interno'}
                  </div>
                </div>

                {/* Titulares y transferencias */}
                <div className="pl-9 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-400">
                  <div>
                    <strong>Titulares:</strong>{' '}
                    {t.data_subjects?.length > 0 ? t.data_subjects.join(', ') : 'No especificado'}
                  </div>
                  <div>
                    <strong>Transferencias internacionales:</strong>{' '}
                    {t.third_countries?.length > 0
                      ? t.third_countries.join(', ')
                      : 'Sin transferencias transfronterizas'}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setSelectedTreatment(t)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-2xs cursor-pointer shrink-0"
              >
                <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                Revisar / Validar Ficha
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedTreatment && (
        <RatEditModal
          treatment={selectedTreatment}
          isOpen={true}
          onClose={() => setSelectedTreatment(null)}
        />
      )}
    </>
  );
}
