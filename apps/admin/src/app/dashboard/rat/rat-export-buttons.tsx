'use client';

import { useState } from 'react';
import { FileDown, Printer, FileSpreadsheet, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { RatTreatment } from '@/types/shared';
import { LEGAL_BASIS_LABELS, RISK_LEVEL_LABELS } from '@/types/shared';

interface RatExportButtonsProps {
  treatments: (RatTreatment & { tenants?: { name: string; slug: string } })[];
  tenantName?: string;
}

export function RatExportButtons({ treatments, tenantName }: RatExportButtonsProps) {
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  function exportCsv() {
    setDownloadingCsv(true);

    const headers = [
      'Nombre de la Actividad',
      'Finalidad del Tratamiento',
      'Base Legal (Art. 13)',
      'Detalle Legal',
      'Categorías de Datos',
      'Titulares Afectados',
      'Destinatarios / Encargados',
      'Transferencias Internacionales',
      'Plazo de Conservación',
      'Medidas de Seguridad',
      'Nivel de Riesgo',
      'Requiere EIPD',
      'Tienda / Empresa',
    ];

    const rows = treatments.map((t) => [
      `"${(t.name || '').replace(/"/g, '""')}"`,
      `"${(t.purpose || '').replace(/"/g, '""')}"`,
      `"${LEGAL_BASIS_LABELS[t.legal_basis] || t.legal_basis}"`,
      `"${(t.legal_basis_detail || '').replace(/"/g, '""')}"`,
      `"${(t.data_categories || []).join(', ').replace(/"/g, '""')}"`,
      `"${(t.data_subjects || []).join(', ').replace(/"/g, '""')}"`,
      `"${(t.recipients || []).join(', ').replace(/"/g, '""')}"`,
      `"${(t.third_countries || []).join(', ').replace(/"/g, '""')}"`,
      `"${(t.retention_period || '').replace(/"/g, '""')}"`,
      `"${(t.security_measures || []).join(', ').replace(/"/g, '""')}"`,
      `"${RISK_LEVEL_LABELS[t.risk_level] || t.risk_level}"`,
      `"${t.requires_eipd ? 'SÍ' : 'NO'}"`,
      `"${(t.tenants?.name || tenantName || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RAT_Oficial_Ley21719_${(tenantName || 'Todas').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloadingCsv(false), 800);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={exportCsv}
        disabled={downloadingCsv || treatments.length === 0}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
      >
        {downloadingCsv ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
        )}
        Descargar CSV / Excel
      </button>

      <Link
        href="/dashboard/rat/export"
        target="_blank"
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-indigo-500/25"
      >
        <Printer className="w-3.5 h-3.5" />
        Generar Libro RAT (PDF Oficial)
      </Link>
    </div>
  );
}
