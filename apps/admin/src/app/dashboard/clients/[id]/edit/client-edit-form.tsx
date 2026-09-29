'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Shield,
  Palette,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Tenant, Platform, Plan, BadgePosition, BadgeStyle } from '@/types/shared';

type BannerPosition = 'bottom' | 'top' | 'bottom-left' | 'bottom-right';

interface ClientEditFormProps {
  initialTenant: Tenant;
}

export function ClientEditForm({ initialTenant }: ClientEditFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(initialTenant.name);
  const [platform, setPlatform] = useState<Platform>(initialTenant.platform);
  const [shopDomain, setShopDomain] = useState(initialTenant.shop_domain || '');
  const [rut, setRut] = useState(initialTenant.rut_empresa || '');
  const [razonSocial, setRazonSocial] = useState(initialTenant.razon_social || '');
  const [emailContacto, setEmailContacto] = useState(initialTenant.email_contacto);
  const [emailDpo, setEmailDpo] = useState(initialTenant.email_dpo || '');
  const [website, setWebsite] = useState(initialTenant.website || '');
  const [plan, setPlan] = useState<Plan>(initialTenant.plan);
  const [isActive, setIsActive] = useState<boolean>(initialTenant.is_active);
  const [primaryColor, setPrimaryColor] = useState(
    initialTenant.config?.banner?.primaryColor || '#2563eb'
  );
  const [bannerPosition, setBannerPosition] = useState<BannerPosition>(
    initialTenant.config?.banner?.position || 'bottom'
  );
  const [badgePosition, setBadgePosition] = useState<BadgePosition>(
    initialTenant.config?.banner?.badgePosition || 'middle-right'
  );
  const [badgeStyle, setBadgeStyle] = useState<BadgeStyle>(
    initialTenant.config?.banner?.badgeStyle || 'retracted'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    const updatedConfig = {
      ...initialTenant.config,
      banner: {
        ...(initialTenant.config?.banner || {
          textColor: '#111827',
          backgroundColor: '#ffffff',
          language: 'es',
        }),
        primaryColor,
        position: bannerPosition,
        badgePosition,
        badgeStyle,
      },
    };

    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        name,
        platform,
        shop_domain: platform === 'shopify' ? shopDomain : null,
        rut_empresa: rut || null,
        razon_social: razonSocial || null,
        email_contacto: emailContacto,
        email_dpo: emailDpo || null,
        website: website || null,
        plan,
        is_active: isActive,
        config: updatedConfig,
        updated_at: new Date().toISOString(),
      })
      .eq('id', initialTenant.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSavedSuccess(true);
    setLoading(false);

    // Refrescar datos en el servidor y redirigir
    setTimeout(() => {
      router.push(`/dashboard/clients/${initialTenant.id}`);
      router.refresh();
    }, 1200);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/dashboard/clients/${initialTenant.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a {initialTenant.name}
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Editar Datos del Cliente</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Modifica la información corporativa, de contacto y configuración del widget.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/clients/${initialTenant.id}`}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-500/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                ¡Cambios Guardados!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notificaciones */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div>
            <p className="font-semibold">Error al guardar:</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="font-semibold">Datos actualizados con éxito. Redirigiendo a la ficha...</p>
        </div>
      )}

      {/* 1. Datos Principales */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          Información de la Tienda
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre Comercial *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Plataforma E-commerce *</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm bg-white"
            >
              <option value="shopify">Shopify</option>
              <option value="woocommerce">WooCommerce (WordPress)</option>
              <option value="other">Otra plataforma / Custom</option>
            </select>
          </div>

          {platform === 'shopify' && (
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Dominio de Shopify (ej: mitienda.myshopify.com)
              </label>
              <input
                type="text"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="mitienda.myshopify.com"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-mono"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Razón Social</label>
            <input
              type="text"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Empresa SpA"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">RUT Empresa</label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="76.123.456-7"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Sitio Web</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://mitienda.cl"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Estado de la Cuenta</label>
            <select
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm bg-white"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo / Pausado</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Contactos de Privacidad */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Mail className="w-4 h-4 text-emerald-600" />
          Canales de Contacto para Derechos ARSOP+
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Correo de Contacto *</label>
            <input
              type="email"
              required
              value={emailContacto}
              onChange={(e) => setEmailContacto(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">Donde se reciben notificaciones y consultas.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email DPO / Encargado de Datos</label>
            <input
              type="email"
              value={emailDpo}
              onChange={(e) => setEmailDpo(e.target.value)}
              placeholder="privacidad@mitienda.cl"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">Aparece en la política de privacidad formal.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Plan de Suscripción</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as Plan)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm bg-white"
            >
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Personalización del Widget */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_0_rgba(15,23_42,0.03)] space-y-6">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-600" />
            Personalización Visual del Banner y Pestaña de Cookies
          </h2>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Ley 21.719 Storefront
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Color de Marca / Botones</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Posición del Banner Inicial</label>
            <select
              value={bannerPosition}
              onChange={(e) => setBannerPosition(e.target.value as BannerPosition)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm bg-white"
            >
              <option value="bottom">Inferior completo (Recomendado)</option>
              <option value="top">Superior completo</option>
              <option value="bottom-left">Flotante abajo izquierda</option>
              <option value="bottom-right">Flotante abajo derecha</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Ubicación del Icono / Pestaña de Cookies
            </label>
            <select
              value={badgePosition}
              onChange={(e) => setBadgePosition(e.target.value as BadgePosition)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm bg-white"
            >
              <option value="middle-right">Lateral derecho centrado (Recomendado — a media altura)</option>
              <option value="middle-left">Lateral izquierdo centrado (a media altura)</option>
              <option value="bottom-right">Esquina inferior derecha</option>
              <option value="bottom-left">Esquina inferior izquierda (Clásico)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Donde permanecerá el acceso para que el cliente pueda cambiar sus preferencias en cualquier momento.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Comportamiento Visual de la Pestaña
            </label>
            <select
              value={badgeStyle}
              onChange={(e) => setBadgeStyle(e.target.value as BadgeStyle)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm bg-white"
            >
              <option value="retracted">
                Pestaña retráctil (Se esconde parcialmente en el borde hasta hacer hover o clic)
              </option>
              <option value="floating">Botón flotante completo permanente</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              En modo retráctil sólo asoma un sutil icono en el borde para no tapar carritos ni botones de WhatsApp.
            </p>
          </div>
        </div>

        {/* Simulador / Previsualización en Vivo */}
        <div className="pt-2">
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            Vista Previa en Tienda (Simulación de pantalla):
          </label>
          <div className="relative w-full h-44 bg-slate-900/5 rounded-xl border border-dashed border-slate-300 overflow-hidden flex flex-col justify-between p-3 select-none">
            {/* Header simulado */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {name || 'mitienda.cl'}
              </div>
              <div className="w-10" />
            </div>

            {/* Contenido simulado de la tienda */}
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
              <div className="w-28 h-2 bg-slate-300 rounded mb-1" />
              <div className="w-40 h-1.5 bg-slate-200 rounded" />
            </div>

            {/* Pestaña simulada en su posición real */}
            <div
              className={`absolute transition-all duration-300 cursor-pointer ${
                badgePosition === 'middle-right'
                  ? 'right-0 top-1/2 -translate-y-1/2'
                  : badgePosition === 'middle-left'
                  ? 'left-0 top-1/2 -translate-y-1/2'
                  : badgePosition === 'bottom-right'
                  ? 'bottom-2 right-3'
                  : 'bottom-2 left-3'
              }`}
            >
              <div
                style={{ backgroundColor: primaryColor }}
                className={`text-white text-[10px] font-medium flex items-center gap-1 shadow-md transition-all ${
                  badgeStyle === 'retracted'
                    ? badgePosition === 'middle-right'
                      ? 'rounded-l-lg pl-2 pr-1.5 py-1 translate-x-1 hover:translate-x-0'
                      : badgePosition === 'middle-left'
                      ? 'rounded-r-lg pr-2 pl-1.5 py-1 -translate-x-1 hover:translate-x-0'
                      : 'rounded-t-lg px-2 py-0.5 translate-y-0.5 hover:translate-y-0'
                    : 'rounded-full px-2.5 py-1'
                }`}
              >
                <span>🍪</span>
                <span className="hidden sm:inline">Cookies</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 text-center">
            Mueve el mouse sobre la pestaña simulada para ver el efecto retráctil en el borde.
          </p>
        </div>
      </div>
    </form>
  );
}
