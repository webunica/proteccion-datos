'use client';

import { useState } from 'react';
import {
  FileCheck,
  Shield,
  FileText,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  Download,
  Building2,
} from 'lucide-react';
import type { Tenant } from '@/types/shared';

interface DpaManagerProps {
  tenants: Tenant[];
  isAgencyAdmin: boolean;
  userTenantId?: string | null;
}

interface Processor {
  id: string;
  name: string;
  category: 'logistics' | 'payment' | 'platform' | 'marketing' | 'support';
  categoryLabel: string;
  dataProcessed: string[];
  risk: 'low' | 'medium' | 'high';
  defaultStatus: 'signed' | 'reviewing' | 'pending';
  dpaUrl?: string;
}

const DEFAULT_PROCESSORS: Processor[] = [
  {
    id: 'shopify',
    name: 'Shopify Inc.',
    category: 'platform',
    categoryLabel: 'Plataforma E-commerce & Hosting',
    dataProcessed: ['Nombres', 'Emails', 'Direcciones de envío', 'Historial de compras', 'IP'],
    risk: 'high',
    defaultStatus: 'signed',
    dpaUrl: 'https://www.shopify.com/legal/dpa',
  },
  {
    id: 'transbank',
    name: 'Transbank S.A. (Webpay Plus)',
    category: 'payment',
    categoryLabel: 'Pasarela de Pago',
    dataProcessed: ['Identificación de comprador', 'Monto de transacción', 'Datos de pago cifrados'],
    risk: 'high',
    defaultStatus: 'signed',
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago Chile',
    category: 'payment',
    categoryLabel: 'Pasarela de Pago',
    dataProcessed: ['Emails', 'RUT', 'Monto de compra', 'Token de tarjeta'],
    risk: 'high',
    defaultStatus: 'signed',
    dpaUrl: 'https://www.mercadopago.cl/privacidad',
  },
  {
    id: 'chilexpress',
    name: 'Chilexpress S.A.',
    category: 'logistics',
    categoryLabel: 'Courier y Despacho',
    dataProcessed: ['Nombres y Apellidos', 'RUT de entrega', 'Dirección física de domicilio', 'Teléfono'],
    risk: 'medium',
    defaultStatus: 'reviewing',
  },
  {
    id: 'blueexpress',
    name: 'Blue Express SpA',
    category: 'logistics',
    categoryLabel: 'Courier y Despacho',
    dataProcessed: ['Nombre receptor', 'Dirección física', 'Teléfono de contacto', 'Comuna/Región'],
    risk: 'medium',
    defaultStatus: 'reviewing',
  },
  {
    id: 'starken',
    name: 'Starken Courier',
    category: 'logistics',
    categoryLabel: 'Courier y Despacho',
    dataProcessed: ['Nombre', 'RUT', 'Dirección física de destino', 'Teléfono'],
    risk: 'medium',
    defaultStatus: 'pending',
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo Inc.',
    category: 'marketing',
    categoryLabel: 'Email Marketing & CRM',
    dataProcessed: ['Nombres', 'Correos electrónicos', 'Comportamiento de compra', 'Historial de carritos'],
    risk: 'medium',
    defaultStatus: 'signed',
    dpaUrl: 'https://www.klaviyo.com/legal/dpa',
  },
  {
    id: 'google',
    name: 'Google LLC (GA4 & GTM)',
    category: 'marketing',
    categoryLabel: 'Analítica y Medición',
    dataProcessed: ['Dirección IP anonimizada', 'Identificador de dispositivo', 'Páginas visitadas'],
    risk: 'low',
    defaultStatus: 'signed',
    dpaUrl: 'https://business.safety.google/adsprocessorterms/',
  },
  {
    id: 'meta',
    name: 'Meta Platforms Ireland Ltd.',
    category: 'marketing',
    categoryLabel: 'Publicidad & Conversiones',
    dataProcessed: ['Identificador de usuario anonimizado', 'Eventos de compra (Purchase, ViewContent)'],
    risk: 'high',
    defaultStatus: 'signed',
    dpaUrl: 'https://www.facebook.com/legal/terms/dataprocessing',
  },
];

export default function DpaManager({ tenants, isAgencyAdmin, userTenantId }: DpaManagerProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    userTenantId || (tenants[0]?.id ?? '')
  );

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

  const [statuses, setStatuses] = useState<Record<string, 'signed' | 'reviewing' | 'pending'>>(() => {
    const initial: Record<string, 'signed' | 'reviewing' | 'pending'> = {};
    DEFAULT_PROCESSORS.forEach((p) => {
      initial[p.id] = p.defaultStatus;
    });
    return initial;
  });

  const [selectedProcessorForModal, setSelectedProcessorForModal] = useState<Processor | null>(null);

  function toggleStatus(procId: string) {
    setStatuses((prev) => {
      const current = prev[procId];
      const next = current === 'pending' ? 'reviewing' : current === 'reviewing' ? 'signed' : 'pending';
      return { ...prev, [procId]: next };
    });
  }

  const signedCount = Object.values(statuses).filter((s) => s === 'signed').length;
  const reviewingCount = Object.values(statuses).filter((s) => s === 'reviewing').length;
  const pendingCount = Object.values(statuses).filter((s) => s === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            Contratos de Encargo de Tratamiento (DPAs)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Obligación Legal <strong>Ley N° 21.719 (Art. 15 y 16)</strong>: Formalización obligatoria de acuerdos de tratamiento de datos con todos los proveedores externos.
          </p>
        </div>

        {isAgencyAdmin && tenants.length > 1 && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Legal Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
        <Shield className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <h3 className="font-bold text-blue-950">Exigencia de Diligencia en la Cadena de Custodia de Datos</h3>
          <p className="text-blue-800 mt-1 leading-relaxed">
            La <strong>Ley 21.719</strong> establece que el responsable (la tienda) responderá solidariamente por las infracciones cometidas por sus proveedores (encargados), a menos que acredite la existencia de un contrato escrito que delimite las finalidades, exija medidas técnicas de seguridad e imponga el deber de confidencialidad y restitución de datos.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-sm">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">DPAs Suscritos / Vigentes</span>
          <p className="text-2xl font-extrabold text-emerald-800 mt-2">{signedCount}</p>
          <span className="text-xs text-emerald-600 font-medium">Cobertura legal formalizada</span>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-5 shadow-sm">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">En Negociación / Revisión</span>
          <p className="text-2xl font-extrabold text-amber-800 mt-2">{reviewingCount}</p>
          <span className="text-xs text-amber-600 font-medium">Términos en trámite</span>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 bg-red-50/20 p-5 shadow-sm">
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Pendientes de Firma</span>
          <p className="text-2xl font-extrabold text-red-800 mt-2">{pendingCount}</p>
          <span className="text-xs text-red-600 font-medium">Riesgo legal activo (Art. 15)</span>
        </div>
      </div>

      {/* Processors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-slate-900 text-base">
            Encargados de Tratamiento — {selectedTenant?.name}
          </h2>
          <span className="text-xs text-slate-500">{DEFAULT_PROCESSORS.length} proveedores clave</span>
        </div>

        <div className="divide-y divide-slate-100">
          {DEFAULT_PROCESSORS.map((proc) => {
            const status = statuses[proc.id] || 'pending';

            return (
              <div key={proc.id} className="p-6 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900">{proc.name}</h3>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {proc.categoryLabel}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          proc.risk === 'high'
                            ? 'bg-red-100 text-red-800'
                            : proc.risk === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        Impacto {proc.risk.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-semibold text-slate-400">Datos tratados:</span>
                      {proc.dataProcessed.map((dp) => (
                        <span key={dp} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                          {dp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Badge & Selector */}
                    <button
                      onClick={() => toggleStatus(proc.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        status === 'signed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : status === 'reviewing'
                          ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                      }`}
                      title="Haz clic para alternar estado (Firmado / En Revisión / Pendiente)"
                    >
                      {status === 'signed' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>DPA Vigente</span>
                        </>
                      ) : status === 'reviewing' ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>En Revisión</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Pendiente Firma</span>
                        </>
                      )}
                    </button>

                    {/* DPA Generator Button */}
                    <button
                      onClick={() => setSelectedProcessorForModal(proc)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      Modelo Oficial DPA
                    </button>

                    {proc.dpaUrl && (
                      <a
                        href={proc.dpaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100"
                        title="Ver términos oficiales del proveedor"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Contrato Modelo DPA Ley 21.719 */}
      {selectedProcessorForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Contrato Modelo de Encargo de Tratamiento — {selectedProcessorForModal.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Guardar en PDF
                </button>
                <button
                  onClick={() => setSelectedProcessorForModal(null)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contract Body */}
            <div className="p-8 space-y-5 text-slate-900 text-xs leading-relaxed font-sans printable-area">
              <div className="text-center border-b border-slate-200 pb-4">
                <h1 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                  CONTRATO DE ENCARGO DE TRATAMIENTO DE DATOS PERSONALES (DPA)
                </h1>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  En cumplimiento de los Artículos 15 y 16 de la Ley N° 21.719 sobre Protección de la Vida Privada
                </p>
              </div>

              <div>
                <p className="mb-2">
                  En Santiago de Chile, comparecen por una parte, <strong>{selectedTenant?.razon_social || selectedTenant?.name || 'LA EMPRESA RESPONSABLE'}</strong>, RUT N° <strong>{selectedTenant?.rut_empresa || 'en acreditación'}</strong>, en adelante el <strong>"Responsable del Tratamiento"</strong>; y por la otra, <strong>{selectedProcessorForModal.name}</strong>, en adelante el <strong>"Encargado del Tratamiento"</strong>; quienes acuerdan suscribir el presente instrumento vinculante:
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">CLÁUSULA PRIMERA: OBJETO DEL ENCARGO</h4>
                  <p className="text-slate-700 mt-0.5">
                    El Responsable encomienda al Encargado la realización de operaciones de tratamiento de datos personales necesarias para la adecuada prestación de servicios de <strong>{selectedProcessorForModal.categoryLabel}</strong>, en relación a los clientes, compradores o usuarios de la tienda.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">CLÁUSULA SEGUNDA: CATEGORÍAS DE DATOS Y FINALIDADES</h4>
                  <p className="text-slate-700 mt-0.5">
                    El tratamiento comprenderá exclusivamente las siguientes categorías de datos: <strong>{selectedProcessorForModal.dataProcessed.join(', ')}</strong>. El Encargado se compromete a no utilizar los datos para finalidades distintas de las pactadas ni a cederlos a terceros, salvo mandato legal expreso.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">CLÁUSULA TERCERA: MEDIDAS DE SEGURIDAD TÉCNICAS Y CONFIDENCIALIDAD</h4>
                  <p className="text-slate-700 mt-0.5">
                    El Encargado se obliga a adoptar medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado al riesgo (cifrado en tránsito TLS, control de accesos restringido y respaldos periódicos), y garantizar que las personas autorizadas para tratar datos personales se comprometan a guardar estricto secreto profesional.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">CLÁUSULA CUARTA: NOTIFICACIÓN INMEDIATA DE BRECHAS DE SEGURIDAD</h4>
                  <p className="text-slate-700 mt-0.5">
                    En caso de que el Encargado sufra un incidente de seguridad, filtración, destrucción o acceso no autorizado a los datos, deberá notificar por escrito al Responsable en un plazo perentorio que no exceda de <strong>24 horas</strong> desde su detección, para permitir al Responsable cumplir con el plazo de 72 horas ante la APDP (Art. 38 Ley 21.719).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">CLÁUSULA QUINTA: ASISTENCIA EN DERECHOS ARSOP+</h4>
                  <p className="text-slate-700 mt-0.5">
                    El Encargado asistirá al Responsable, mediante las medidas técnicas pertinentes, para que este último pueda dar respuesta expedita y en plazo a las solicitudes de acceso, rectificación, supresión, oposición, portabilidad y bloqueo cursadas por los titulares de datos.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">CLÁUSULA SEXTA: DESTINO DE LOS DATOS AL TÉRMINO DEL SERVICIO</h4>
                  <p className="text-slate-700 mt-0.5">
                    A elección del Responsable, el Encargado suprimirá o devolverá todos los datos personales una vez finalice la prestación de los servicios de tratamiento, y suprimirá las copias existentes, a menos que la legislación tributaria o mercantil chilena exija su conservación.
                  </p>
                </div>
              </div>

              {/* Firmas */}
              <div className="pt-8 border-t border-slate-200 mt-8">
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="border-t border-slate-400 pt-2 w-48 mx-auto">
                      <p className="font-bold text-xs">{selectedTenant?.name}</p>
                      <p className="text-[11px] text-slate-500">Responsable del Tratamiento</p>
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-2 w-48 mx-auto">
                      <p className="font-bold text-xs">{selectedProcessorForModal.name}</p>
                      <p className="text-[11px] text-slate-500">Encargado del Tratamiento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
