import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Code2,
  Palette,
  ShoppingBag,
  Sliders,
  ExternalLink,
  Layers,
  Sparkles,
  Shield,
} from 'lucide-react';
import type { Tenant } from '@/types/shared';
import { CodeSnippet } from '@/components/dashboard/code-snippet';

export const revalidate = 0;

interface ClientWidgetPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientWidgetPage({ params }: ClientWidgetPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: tenantData, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !tenantData) {
    notFound();
  }

  const tenant = tenantData as Tenant;
  const widgetUrl = process.env.NEXT_PUBLIC_WIDGET_URL || 'https://proteccion-datos-admin.vercel.app';
  const primaryColor = tenant.config?.banner?.primaryColor || '#2563eb';
  const badgePosition = tenant.config?.banner?.badgePosition || 'middle-right';
  const badgeStyle = tenant.config?.banner?.badgeStyle || 'retracted';

  const shopifySnippet = `<!-- Cumplimiento Ley 21.719 — ${tenant.name} -->\n<script\n  src="${widgetUrl}/widget.js"\n  data-tenant="${tenant.slug}"\n  data-api="${widgetUrl}"\n  data-color="${primaryColor}"\n  data-badge-position="${badgePosition}"\n  data-badge-style="${badgeStyle}"\n  defer\n></script>`;

  const rightsSnippet = `<div id="ley21719-rights-form"></div>`;
  const policySnippet = `<div id="ley21719-policy"></div>`;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <Link
          href={`/dashboard/clients/${tenant.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Detalle de {tenant.name}
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Instalación de Widget: {tenant.name}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Código de integración y personalización de banner para {tenant.platform.toUpperCase()}.
            </p>
          </div>
        </div>
      </div>

      {/* Identificadores Rápidos */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tenant Slug
          </label>
          <p className="text-sm font-mono font-bold text-indigo-700 bg-indigo-50/60 border border-indigo-200/60 px-3 py-1.5 rounded-lg mt-1 select-all">
            {tenant.slug}
          </p>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Color del Banner
          </label>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-7 h-7 rounded-lg border border-slate-300 shadow-sm shrink-0"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-sm font-mono text-slate-800 font-medium">{primaryColor}</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Ubicación Pestaña
          </label>
          <p className="text-xs font-semibold text-slate-800 mt-1 capitalize bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            {badgePosition === 'middle-right'
              ? 'Lateral Derecho (Medio)'
              : badgePosition === 'middle-left'
              ? 'Lateral Izquierdo (Medio)'
              : badgePosition === 'bottom-right'
              ? 'Inferior Derecho'
              : 'Inferior Izquierdo'}
          </p>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Efecto Visual
          </label>
          <p className="text-xs font-semibold text-emerald-700 mt-1 capitalize bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {badgeStyle === 'retracted' ? 'Pestaña Retráctil' : 'Flotante Continuo'}
          </p>
        </div>
      </div>

      {/* Instrucciones Shopify */}
      {tenant.platform === 'shopify' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">1. Instalación en Shopify</h2>
              <p className="text-xs text-slate-500">
                Pega este script en <strong>Online Store &gt; Themes &gt; Edit code &gt; layout/theme.liquid</strong> antes de <code>&lt;/head&gt;</code>
              </p>
            </div>
          </div>

          <CodeSnippet code={shopifySnippet} title="theme.liquid Script Tag" />
        </div>
      )}

      {/* Instrucciones WooCommerce */}
      {tenant.platform === 'woocommerce' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">1. Instalación en WooCommerce / WordPress</h2>
              <p className="text-xs text-slate-500">
                Usa el plugin oficial <code>ley21719-compliance</code> e ingresa tu Tenant Slug en los ajustes.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900 space-y-2">
            <p><strong>Paso 1:</strong> Instala el plugin desde <code>integrations/wordpress/ley21719-compliance</code>.</p>
            <p><strong>Paso 2:</strong> En WordPress ve a <strong>Ajustes &gt; Ley 21.719</strong> y pega el Tenant ID: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold select-all">{tenant.slug}</code>.</p>
          </div>
        </div>
      )}

      {/* Snippet para Otras Plataformas si aplica */}
      {tenant.platform === 'other' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">1. Instalación Universal en HTML</h2>
          <CodeSnippet code={shopifySnippet} title="HTML <head> Snippet" />
        </div>
      )}

      {/* Explicación Técnica de Auto-Blocking de Scripts */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Auto-Blocking de Scripts & Google Consent Mode v2 Activo</h2>
              <p className="text-xs text-slate-300">Garantía de cero fugas de datos conforme al estándar de la Ley N° 21.719</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase self-start sm:self-auto">
            Auto-Blocking Activo
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Para evitar multas de hasta <strong>20.000 UTM</strong> por recopilación no consentida, el widget intercepta automáticamente los pixels de marketing y analítica antes de que el usuario interactúe con el banner:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Pausados antes del consentimiento:
            </span>
            <ul className="text-slate-300 space-y-1 pl-3 list-disc text-[11px]">
              <li><strong>Meta Pixel (Facebook/Instagram):</strong> <code>fbq('track')</code> retenido en cola.</li>
              <li><strong>Google Analytics 4 & Ads:</strong> Consent Mode v2 en <code>denied</code>.</li>
              <li><strong>TikTok Pixel:</strong> <code>ttq.track()</code> pausado sin disparar cookies.</li>
              <li><strong>Microsoft Clarity & Hotjar:</strong> Grabación de sesiones bloqueada.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Siempre Permitidos (Esenciales):
            </span>
            <ul className="text-slate-300 space-y-1 pl-3 list-disc text-[11px]">
              <li><strong>Carrito y Checkout:</strong> Sesiones de Shopify / WooCommerce activas.</li>
              <li><strong>Pasarelas de Pago:</strong> Transbank, Mercado Pago, Fintoc.</li>
              <li><strong>Seguridad y CSRF:</strong> Cookies técnicas necesarias para la compra.</li>
              <li><strong>Desbloqueo Inmediato:</strong> Al consentir, se despachan los eventos en cola sin perder atribución.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulario ARSOP+ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">2. Formulario de Derechos ARSOP+ en la Tienda</h2>
        <p className="text-xs text-slate-500">
          Crea una página en tu tienda (ejemplo: <code>/pages/ejercer-derechos</code>) y pega este contenedor HTML:
        </p>

        <CodeSnippet code={rightsSnippet} title="Contenedor ARSOP+" />

        {tenant.platform === 'woocommerce' && (
          <p className="text-xs text-slate-600 mt-2">
            En WordPress también puedes usar el shortcode: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono">[arsop_form]</code>
          </p>
        )}
      </div>

      {/* Política de Privacidad Embebida */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">3. Política de Privacidad Dinámica</h2>
        <p className="text-xs text-slate-500">
          Para que la política de privacidad se actualice sola desde esta plataforma sin editar el theme:
        </p>

        <CodeSnippet code={policySnippet} title="Contenedor Política de Privacidad" />

        {tenant.platform === 'woocommerce' && (
          <p className="text-xs text-slate-600 mt-2">
            En WordPress también puedes usar el shortcode: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono">[politica_privacidad]</code>
          </p>
        )}
      </div>
    </div>
  );
}
