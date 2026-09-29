'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Printer,
  Sparkles,
  Lock,
  Code2,
} from 'lucide-react';
import type { Tenant } from '@/types/shared';

interface CertificateViewerProps {
  tenants: Tenant[];
}

export function CertificateViewer({ tenants }: CertificateViewerProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    tenants[0]?.id || ''
  );
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

  if (!selectedTenant) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
        No hay tiendas registradas para generar el certificado.
      </div>
    );
  }

  const verifyUrl = `https://proteccion-datos-admin.vercel.app/verify/${selectedTenant.slug}`;
  const trustBadgeSnippet = `<!-- Sello de Confianza Ley 21.719 -->\n<div id="ley21719-trust-badge" data-tenant="${selectedTenant.slug}"></div>`;
  const htmlBadgeSnippet = `<!-- Distintivo HTML Directo Ley 21.719 -->\n<a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:20px;text-decoration:none;font-family:sans-serif;font-size:11px;color:#1e3a8a;font-weight:600;">\n  <span style="color:#2563eb;font-size:14px;">🛡️</span> Empresa Verificada — Ley N° 21.719\n</a>`;

  function copyToClipboard(text: string, type: 'snippet' | 'url') {
    navigator.clipboard.writeText(text);
    if (type === 'snippet') {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Selector de Tienda (si hay más de 1) */}
      {tenants.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Seleccionar Tienda / Cliente:</span>
          </div>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.platform.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tarjeta de Acreditación Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Certificación Vigente Ley 21.719
              </span>
              <span className="text-xs font-mono text-slate-400">
                Folio: #{selectedTenant.id.slice(0, 8)}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              {selectedTenant.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Esta empresa cuenta con la auditoría tecnológica y legal activa para el régimen general de datos personales de Chile. Cumple con los estándares de la Agencia de Protección de Datos Personales (APDP).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">RUT Empresa:</span>
                <span className="font-mono font-semibold text-white">{selectedTenant.rut_empresa || '76.xxx.xxx-x'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Plataforma:</span>
                <span className="font-semibold text-white capitalize">{selectedTenant.platform}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Auditoría:</span>
                <span className="font-semibold text-emerald-400">100% Conforme</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/verify/${selectedTenant.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-blue-600/30"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Certificado Público en Vivo
            </Link>

            <button
              onClick={() => copyToClipboard(verifyUrl, 'url')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-semibold transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUrl ? 'Enlace Copiado' : 'Copiar URL Pública'}
            </button>
          </div>
        </div>

        {/* Vista Previa del Sello en Tienda */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Vista Previa del Sello Web
              </h3>
            </div>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Así es como tus clientes verán el distintivo de confianza en el pie de página de tu tienda online:
            </p>

            <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200/90 rounded-full shadow-sm text-xs font-semibold text-blue-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Empresa Verificada · Ley 21.719</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Al hacer clic, abre el Certificado Digital y código QR de autenticidad.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Compatible con Shopify, WooCommerce y plataformas personalizadas.
            </span>
          </div>
        </div>
      </div>

      {/* Snippet para Insertar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            Cómo Instalar el Sello de Confianza en el Footer
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Inserta este snippet en el archivo <code>footer.liquid</code> en Shopify o en un widget de pie de página en WordPress.
          </p>
        </div>

        {/* Snippet Automático vía Widget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Opción A: Inyección Dinámica vía Widget JS (Recomendada)
            </label>
            <button
              onClick={() => copyToClipboard(trustBadgeSnippet, 'snippet')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSnippet ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
          <pre className="p-3.5 bg-slate-900 text-slate-100 text-xs rounded-xl font-mono overflow-x-auto select-all">
            {trustBadgeSnippet}
          </pre>
          <p className="text-[11px] text-slate-500">
            * El script principal de <code>widget.js</code> detectará este contenedor e insertará automáticamente el sello estilizado con enlace a la validación pública.
          </p>
        </div>

        {/* Snippet HTML Directo */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Opción B: HTML Independiente (Sin dependencias)
            </label>
            <button
              onClick={() => copyToClipboard(htmlBadgeSnippet, 'snippet')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSnippet ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
          <pre className="p-3.5 bg-slate-900 text-slate-100 text-xs rounded-xl font-mono overflow-x-auto select-all">
            {htmlBadgeSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
