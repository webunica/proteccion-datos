import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Shield, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { RatTreatment, Tenant } from '@/types/shared';
import { LEGAL_BASIS_LABELS, RISK_LEVEL_LABELS } from '@/types/shared';
import { PrintTrigger } from './print-trigger';

export const revalidate = 0;

export default async function RatExportPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  const isAgencyAdmin = profile?.role === 'agency_admin';

  let tenant: Tenant | null = null;
  if (profile?.tenant_id) {
    const { data: t } = await supabase.from('tenants').select('*').eq('id', profile.tenant_id).maybeSingle();
    tenant = t as Tenant | null;
  } else {
    // Si es agency_admin, tomar el primer tenant activo para la muestra
    const { data: tList } = await supabase.from('tenants').select('*').eq('is_active', true).limit(1);
    if (tList && tList.length > 0) tenant = tList[0] as Tenant;
  }

  let query = supabase.from('rat_treatments').select('*').order('order_index', { ascending: true });
  if (!isAgencyAdmin && profile?.tenant_id) {
    query = query.eq('tenant_id', profile.tenant_id);
  } else if (tenant) {
    query = query.eq('tenant_id', tenant.id);
  }

  const { data: treatmentsData } = await query;
  const treatments = (treatmentsData || []) as RatTreatment[];

  const emitDate = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-800 font-sans">
      {/* Botones de acción en pantalla (ocultos al imprimir) */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/rat"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel RAT
        </Link>

        <PrintTrigger />
      </div>

      {/* Documento Oficial Formateado para Impresión */}
      <div className="max-w-5xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:rounded-none">
        {/* Encabezado Institucional */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              <Shield className="w-4 h-4 text-indigo-700" />
              República de Chile · Ley N° 21.719
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Registro de Actividades de Tratamiento (RAT)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Documento oficial de cumplimiento obligatorio conforme al artículo 13 y siguientes de la Ley sobre Protección de la Vida Privada y Datos Personales.
            </p>
          </div>

          <div className="text-right sm:text-right border-l sm:border-l-0 pl-3 sm:pl-0 border-slate-200">
            <span className="text-xs text-slate-400 block font-mono">FECHA DE EMISIÓN</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">{emitDate}</span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block mt-1 font-medium">
              Vigencia Actualizada
            </span>
          </div>
        </div>

        {/* Identificación del Responsable del Tratamiento */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-8 text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="text-slate-400 uppercase font-semibold block text-[10px]">Razón Social:</span>
            <span className="font-bold text-slate-900 text-sm">{tenant?.razon_social || tenant?.name || 'Empresa SpA'}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-semibold block text-[10px]">RUT Empresa:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{tenant?.rut_empresa || '76.XXX.XXX-X'}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-semibold block text-[10px]">Encargado / DPO:</span>
            <span className="font-mono text-slate-800">{tenant?.email_dpo || tenant?.email_contacto || 'dpo@empresa.cl'}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-semibold block text-[10px]">Sitio Web / Plataforma:</span>
            <span className="font-mono text-slate-800">{tenant?.website || tenant?.shop_domain || '—'}</span>
          </div>
        </div>

        {/* Tabla Detallada de Actividades de Tratamiento */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <span>Inventario de Operaciones Registradas ({treatments.length} Tratamientos)</span>
          </h2>

          <div className="space-y-4">
            {treatments.map((t, idx) => (
              <div
                key={t.id}
                className="border border-slate-200 rounded-xl p-4 bg-white break-inside-avoid shadow-[0_1px_2px_0_rgba(15,23,42,0.03)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      Base: {LEGAL_BASIS_LABELS[t.legal_basis] || t.legal_basis}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        t.risk_level === 'high' || t.risk_level === 'very_high'
                          ? 'text-amber-700 bg-amber-50 border-amber-200'
                          : 'text-slate-600 bg-slate-50 border-slate-200'
                      }`}
                    >
                      Riesgo {RISK_LEVEL_LABELS[t.risk_level] || t.risk_level}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Finalidad del Tratamiento:</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{t.purpose}</p>
                    {t.legal_basis_detail && (
                      <p className="text-slate-500 italic mt-1 text-[11px]">Fundamento: {t.legal_basis_detail}</p>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Categorías de Datos Tratados:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(t.data_categories || []).map((cat, cIdx) => (
                        <span key={cIdx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Destinatarios y Encargados:</span>
                    <p className="text-slate-700 mt-0.5">
                      {(t.recipients && t.recipients.length > 0) ? t.recipients.join(', ') : 'Exclusivo uso interno'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Plazo de Conservación y Medidas:</span>
                    <p className="text-slate-700 mt-0.5">
                      <strong>Plazo:</strong> {t.retention_period || 'Hasta cumplir la finalidad'}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      <strong>Seguridad:</strong> {(t.security_measures || []).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Declaración de Responsabilidad y Firma */}
        <div className="mt-12 pt-8 border-t-2 border-slate-200 break-inside-avoid">
          <p className="text-xs text-slate-500 text-justify leading-relaxed mb-10">
            Se certifica que el presente Registro de Actividades de Tratamiento (RAT) refleja con exactitud las operaciones de recolección, almacenamiento y tratamiento de datos personales efectuadas por la empresa, en estricto cumplimiento de los principios de licitud, finalidad, proporcionalidad, calidad y seguridad prescritos por la Ley 21.719 de Chile.
          </p>

          <div className="grid grid-cols-2 gap-8 text-center pt-8">
            <div className="border-t border-slate-400 pt-2">
              <span className="text-xs font-bold text-slate-900 block">{tenant?.razon_social || tenant?.name}</span>
              <span className="text-[11px] text-slate-500">Representante Legal / Responsable del Tratamiento</span>
            </div>

            <div className="border-t border-slate-400 pt-2">
              <span className="text-xs font-bold text-slate-900 block font-mono">
                {tenant?.email_dpo || tenant?.email_contacto || 'Oficial de Privacidad'}
              </span>
              <span className="text-[11px] text-slate-500">Delegado de Protección de Datos (DPO)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
