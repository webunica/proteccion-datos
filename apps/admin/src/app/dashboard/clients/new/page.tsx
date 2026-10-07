'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  ShoppingBag,
  Globe,
  Mail,
  User,
  Shield,
  Palette,
  CheckCircle2,
  Copy,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Platform = 'shopify' | 'woocommerce' | 'other';
type Plan = 'basic' | 'pro' | 'enterprise';
type BannerPosition = 'bottom' | 'top' | 'bottom-left' | 'bottom-right';
type BadgePosition = 'middle-right' | 'middle-left' | 'bottom-right' | 'bottom-left';
type BadgeStyle = 'retracted' | 'floating';

interface FormData {
  name: string;
  platform: Platform;
  shop_domain: string;
  rut: string;
  razon_social: string;
  contact_email: string;
  dpo_email: string;
  website: string;
  plan: Plan;
  primary_color: string;
  banner_position: BannerPosition;
  badge_position: BadgePosition;
  badge_style: BadgeStyle;
}

const INITIAL: FormData = {
  name: '',
  platform: 'shopify',
  shop_domain: '',
  rut: '',
  razon_social: '',
  contact_email: '',
  dpo_email: '',
  website: '',
  plan: 'pro',
  primary_color: '#2563eb',
  banner_position: 'bottom',
  badge_position: 'middle-right',
  badge_style: 'retracted',
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface CreatedTenant {
  id: string;
  slug: string;
}

const inputClass =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition';

function Section({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-4 pt-2">
      <Icon className="w-4 h-4 text-brand-600" />
      <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{title}</h3>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function NewClientPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedTenant | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const slug = slugify(form.name);

    const { data, error: insertError } = await supabase
      .from('tenants')
      .insert({
        name: form.name,
        slug,
        platform: form.platform,
        shop_domain: form.platform === 'shopify' ? form.shop_domain : null,
        rut_empresa: form.rut,
        razon_social: form.razon_social,
        email_contacto: form.contact_email,
        email_dpo: form.dpo_email || null,
        website: form.website,
        plan: form.plan,
        is_active: true,
        config: {
          banner: {
            position: form.banner_position,
            primaryColor: form.primary_color,
            textColor: '#111827',
            backgroundColor: '#ffffff',
            language: 'es',
            badgePosition: form.badge_position,
            badgeStyle: form.badge_style,
          },
          categories: {
            essential: true,
            analytics: true,
            marketing: true,
            personalization: false,
          },
        },
      })
      .select('id, slug')
      .single();

    if (insertError) {
      setError(
        insertError.code === '23505'
          ? 'Ya existe un cliente con ese nombre. Prueba con un nombre diferente.'
          : insertError.message
      );
      setLoading(false);
      return;
    }

    setCreated(data as CreatedTenant);
    setLoading(false);
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const scriptTag = created
    ? `<script src="${process.env.NEXT_PUBLIC_WIDGET_URL ?? 'https://privacy.tudominio.com'}/widget.js" data-tenant="${created.slug}" defer></script>`
    : '';

  if (created) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-900">¡Cliente creado exitosamente!</h2>
          <p className="text-green-700 mt-1 text-sm">
            La tienda <strong>{form.name}</strong> ha sido registrada en el sistema.
          </p>
        </div>

        {/* Tenant ID */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-2">Tenant ID</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2">
            <code className="flex-1 text-xs text-gray-700 font-mono break-all">{created.id}</code>
            <button
              onClick={() => copyToClipboard(created.id, 'id')}
              className="flex-shrink-0 text-gray-400 hover:text-brand-600 transition-colors"
              title="Copiar"
            >
              {copied === 'id' ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Script snippet */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-1">Script del Widget</p>
          <p className="text-xs text-gray-400 mb-3">
            Agrega este tag al <code>&lt;head&gt;</code> o <code>&lt;body&gt;</code> del sitio del cliente.
          </p>
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-4 overflow-x-auto font-mono">
              {scriptTag}
            </pre>
            <button
              onClick={() => copyToClipboard(scriptTag, 'script')}
              className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
            >
              {copied === 'script' ? (
                <><CheckCircle2 className="w-3 h-3" /> Copiado</>
              ) : (
                <><Copy className="w-3 h-3" /> Copiar</>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/dashboard/clients"
            className="flex-1 text-center bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            Ver todos los clientes
          </Link>
          <Link
            href={`/dashboard/clients/${created.id}`}
            className="flex-1 text-center bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            Ver detalle del cliente
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/clients"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Cliente</h1>
          <p className="text-gray-500 text-sm mt-0.5">Registra una nueva tienda en el sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {/* Error */}
        {error && (
          <div className="px-6 pt-5">
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Datos básicos */}
        <div className="px-6 py-5">
          <Section title="Datos de la Tienda" icon={Building2} />
          <div className="space-y-4">
            <Field label="Nombre de la tienda" required>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Mi Tienda Online"
                className={inputClass}
              />
            </Field>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plataforma <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['shopify', 'woocommerce', 'other'] as Platform[]).map(p => (
                  <label
                    key={p}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      form.platform === p
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="platform"
                      value={p}
                      checked={form.platform === p}
                      onChange={() => set('platform', p)}
                      className="sr-only"
                    />
                    <ShoppingBag
                      className={`w-5 h-5 ${
                        p === 'shopify'
                          ? 'text-green-600'
                          : p === 'woocommerce'
                          ? 'text-purple-600'
                          : 'text-gray-500'
                      }`}
                    />
                    <span className="text-xs font-medium capitalize">
                      {p === 'woocommerce' ? 'WooCommerce' : p === 'other' ? 'Otro' : 'Shopify'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {form.platform === 'shopify' && (
              <Field
                label="Shop Domain"
                required
                hint="Ej: mitienda.myshopify.com"
              >
                <input
                  type="text"
                  required
                  value={form.shop_domain}
                  onChange={e => set('shop_domain', e.target.value)}
                  placeholder="mitienda.myshopify.com"
                  className={inputClass}
                />
              </Field>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="RUT empresa" required>
                <input
                  type="text"
                  required
                  value={form.rut}
                  onChange={e => set('rut', e.target.value)}
                  placeholder="76.123.456-7"
                  className={inputClass}
                />
              </Field>
              <Field label="Razón social" required>
                <input
                  type="text"
                  required
                  value={form.razon_social}
                  onChange={e => set('razon_social', e.target.value)}
                  placeholder="Empresa SpA"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="px-6 py-5">
          <Section title="Contacto" icon={Mail} />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email de contacto" required>
                <input
                  type="email"
                  required
                  value={form.contact_email}
                  onChange={e => set('contact_email', e.target.value)}
                  placeholder="contacto@empresa.cl"
                  className={inputClass}
                />
              </Field>
              <Field label="Email DPO" hint="Opcional">
                <input
                  type="email"
                  value={form.dpo_email}
                  onChange={e => set('dpo_email', e.target.value)}
                  placeholder="dpo@empresa.cl"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Sitio web" required>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  required
                  value={form.website}
                  onChange={e => set('website', e.target.value)}
                  placeholder="https://www.empresa.cl"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Plan */}
        <div className="px-6 py-5">
          <Section title="Plan" icon={User} />
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'basic', label: 'Starter ($9.950/mes)', desc: '1 Tienda · Retención HMAC 12m', color: 'text-slate-600' },
              { value: 'pro', label: 'Pro ($50.991/mes)', desc: '3 Tiendas · RAT, EIPD y Brechas 72h', color: 'text-brand-600' },
              { value: 'enterprise', label: 'Enterprise ($127.491/mes)', desc: 'Ilimitado · Marca Blanca total', color: 'text-amber-600' },
            ] as { value: Plan; label: string; desc: string; color: string }[]).map(p => (
              <label
                key={p.value}
                className={`flex flex-col gap-0.5 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  form.plan === p.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={p.value}
                  checked={form.plan === p.value}
                  onChange={() => set('plan', p.value)}
                  className="sr-only"
                />
                <span className={`text-sm font-semibold ${p.color}`}>{p.label}</span>
                <span className="text-xs text-gray-400">{p.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Widget config */}
        <div className="px-6 py-5">
          <Section title="Banner de Consentimiento" icon={Palette} />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Color primario">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={e => set('primary_color', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.primary_color}
                    onChange={e => set('primary_color', e.target.value)}
                    className={`flex-1 ${inputClass}`}
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </Field>
              <Field label="Posición del banner">
                <select
                  value={form.banner_position}
                  onChange={e => set('banner_position', e.target.value as BannerPosition)}
                  className={inputClass}
                >
                  <option value="bottom">Inferior (centrado)</option>
                  <option value="top">Superior</option>
                  <option value="bottom-left">Inferior izquierda</option>
                  <option value="bottom-right">Inferior derecha</option>
                </select>
              </Field>
              <Field label="Ubicación icono de cookies" hint="Pestaña permanente para cambiar preferencias">
                <select
                  value={form.badge_position}
                  onChange={e => set('badge_position', e.target.value as BadgePosition)}
                  className={inputClass}
                >
                  <option value="middle-right">Lateral derecho centrado (Recomendado)</option>
                  <option value="middle-left">Lateral izquierdo centrado</option>
                  <option value="bottom-right">Esquina inferior derecha</option>
                  <option value="bottom-left">Esquina inferior izquierda</option>
                </select>
              </Field>
              <Field label="Comportamiento de la pestaña" hint="Efecto visual en la tienda">
                <select
                  value={form.badge_style}
                  onChange={e => set('badge_style', e.target.value as BadgeStyle)}
                  className={inputClass}
                >
                  <option value="retracted">Pestaña retráctil (se esconde parcialmente)</option>
                  <option value="floating">Botón flotante completo</option>
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Compliance note */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5 mt-0.5 text-brand-500 flex-shrink-0" />
            <span>
              Al crear este cliente, confirmas que la empresa ha sido informada de sus obligaciones bajo la{' '}
              <strong>Ley 21.719</strong> de Protección de Datos Personales de Chile.
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="px-6 py-5 flex items-center justify-between">
          <Link
            href="/dashboard/clients"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</>
            ) : (
              <>Crear cliente</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
