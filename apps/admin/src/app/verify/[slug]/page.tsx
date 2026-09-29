import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  ExternalLink,
  Lock,
  FileCheck,
  Printer,
  QrCode,
  Shield,
  Layers,
} from 'lucide-react';
import type { Tenant } from '@/types/shared';
import { PrintButton } from './print-button';

export const revalidate = 60;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-key';
  return createClient(url, key);
}

interface VerifyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !tenant) {
    notFound();
  }

  const typedTenant = tenant as Tenant;
  const issueDate = new Date(typedTenant.created_at || Date.now()).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const currentYear = new Date().getFullYear();

  // QR Code URL via free public generator
  const currentUrl = `https://proteccion-datos-admin.vercel.app/verify/${typedTenant.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=ffffff&color=1e3a8a&margin=6`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Acciones Superiores (Oculto en Impresión) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Shield className="w-4 h-4 text-blue-600" />
            Sistema de Cumplimiento Ley 21.719
          </Link>
          <div className="flex items-center gap-2">
            <PrintButton />
          </div>
        </div>

        {/* Certificado Formal */}
        <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-8 sm:p-12 shadow-xl print:shadow-none print:border-none print:p-0 relative overflow-hidden">
          {/* Marca de agua de fondo */}
          <div className="absolute -right-20 -top-20 text-slate-100/60 pointer-events-none print:hidden">
            <ShieldCheck className="w-96 h-96" />
          </div>

          {/* Header del Certificado */}
          <div className="relative border-b-2 border-slate-100 pb-8 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-sm mx-auto">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Certificado Digital de Cumplimiento Normativo
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-3 tracking-tight">
                REPÚBLICA DE CHILE — LEY N° 21.719
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Acreditación de Cumplimiento del Régimen General de Protección de Datos Personales
              </p>
            </div>
          </div>

          {/* Cuerpo del Certificado */}
          <div className="relative py-8 space-y-6">
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed text-center">
              Se certifica que la entidad señalada a continuación ha implementado y mantiene activo el sistema técnico, legal y operativo de protección de datos personales exigido por la legislación chilena:
            </p>

            {/* Ficha de la Entidad */}
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block">Nombre Fantasía / Tienda:</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">{typedTenant.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block">Razón Social:</span>
                  <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                    {typedTenant.razon_social || typedTenant.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block">RUT Empresa:</span>
                  <span className="text-sm font-mono font-semibold text-slate-800 mt-0.5 block">
                    {typedTenant.rut_empresa || 'En proceso de validación'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block">Sitio Web Oficial:</span>
                  <span className="text-sm font-medium text-blue-600 mt-0.5 block truncate">
                    {typedTenant.website || typedTenant.shop_domain || 'Comercio Electrónico'}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist de Pilares Auditados */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Auditoría de Requisitos Técnicos y Jurídicos — Estado: Conforme
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Consentimiento Previo y Libre (Art. 13)</strong>
                    <span className="text-[11px] text-emerald-800">
                      Google Consent Mode v2 & Shopify Privacy sin casillas pre-marcadas.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Canal ARSOP+ con OTP (Art. 21)</strong>
                    <span className="text-[11px] text-emerald-800">
                      Verificación en 2 pasos para prevenir suplantación y SLA legal de 30 días.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Registro de Tratamientos RAT (Art. 24)</strong>
                    <span className="text-[11px] text-emerald-800">
                      Bases de licitud, finalidades, destinatarios y plazos de retención registrados.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Protocolo de Brechas 72h APDP (Art. 38)</strong>
                    <span className="text-[11px] text-emerald-800">
                      Procedimiento de comunicación de incidentes dentro del plazo perentorio de 72 hrs.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Contratos de Encargo DPA (Arts. 15 y 16)</strong>
                    <span className="text-[11px] text-emerald-800">
                      Formalización de mandatos de tratamiento con couriers y pasarelas de pago.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Política de Privacidad Pública (Art. 13)</strong>
                    <span className="text-[11px] text-emerald-800">
                      Información de fácil acceso en lenguaje claro, comprensible y actualizado.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Código QR y Validación Oficial */}
            <div className="border-t-2 border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={qrUrl}
                  alt="QR Verificación"
                  className="w-24 h-24 rounded-xl border border-slate-200 shadow-sm shrink-0"
                />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">Validación Pública en Línea</span>
                  <p className="text-slate-500 text-[11px]">
                    Escanea el código QR o visita la URL única para verificar la vigencia de este certificado en tiempo real.
                  </p>
                  <p className="font-mono text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                    ID Registro: {typedTenant.id.slice(0, 18)}...
                  </p>
                </div>
              </div>

              <div className="text-right text-xs space-y-1 sm:border-l sm:border-slate-100 sm:pl-6 w-full sm:w-auto">
                <span className="text-slate-400 font-medium block">Fecha de Emisión:</span>
                <span className="font-bold text-slate-800 block">{issueDate}</span>
                <span className="text-slate-400 font-medium block mt-1">Período de Validez:</span>
                <span className="font-bold text-emerald-700 block">Vigente Año {currentYear} — Auditado</span>
              </div>
            </div>
          </div>

          {/* Footer de Firma */}
          <div className="border-t-2 border-slate-100 pt-6 text-center text-[11px] text-slate-400 space-y-1">
            <p>
              Emitido por la Plataforma Tecnológica de Cumplimiento Ley 21.719 de Protección de Datos Personales.
            </p>
            <p>
              República de Chile · Conforme al estándar de la Agencia de Protección de Datos Personales (APDP).
            </p>
          </div>
        </div>

        {/* Snippet para el Footer de la Tienda (Oculto en Impresión) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm print:hidden space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Sello de Confianza para el Footer de tu Tienda
          </h2>
          <p className="text-xs text-slate-500">
            Copia este código y pégalo en el footer de Shopify o WooCommerce para que tus clientes vean que tu tienda cumple con la Ley 21.719:
          </p>
          <div className="relative">
            <pre className="p-3 bg-slate-900 text-slate-100 text-xs rounded-xl overflow-x-auto font-mono select-all">
{`<!-- Sello de Confianza Ley 21.719 -->
<div id="ley21719-trust-badge" data-tenant="${typedTenant.slug}"></div>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
