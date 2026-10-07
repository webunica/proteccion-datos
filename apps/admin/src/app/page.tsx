import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Shield,
  ShieldCheck,
  Lock,
  ArrowRight,
  Check,
  KeyRound,
  FileSpreadsheet,
  Layers,
  Zap,
  Globe,
  BarChart3,
  ExternalLink,
  Code2,
  Clock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Webúnica · Cumplimiento de la Ley 21.719 | Protección de Datos Personales Chile',
  description:
    'Plataforma chilena de gestión de consentimiento para cumplir la Ley 21.719. Banner de cookies, auto-blocking de rastreadores, prueba legal criptográfica HMAC-SHA256, panel de administración y canal ARSOP+.',
  keywords: [
    'Ley 21.719',
    'protección de datos personales Chile',
    'cumplimiento Ley 21.719',
    'APDP Chile',
    'banner de cookies Chile',
    'auto blocking scripts e commerce',
    'derechos ARSOP+',
    'Google Consent Mode v2 Chile',
    'software proteccion de datos',
    'webunica proteccion datos',
    'privacity alternativa chile',
  ],
  authors: [{ name: 'Webúnica SpA', url: 'https://webunica.cl' }],
  creator: 'Webúnica SpA',
  publisher: 'Webúnica SpA',
  metadataBase: new URL('https://proteccion-datos.webunica.cl'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Webúnica · Plataforma de Cumplimiento Ley 21.719 Chile',
    description:
      'Plataforma chilena de gestión de consentimiento para cumplir la Ley 21.719. Banner de cookies, auto-blocking y prueba legal HMAC-SHA256.',
    url: 'https://proteccion-datos.webunica.cl',
    siteName: 'Webúnica Protección de Datos',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Webúnica · Software Ley 21.719 Chile',
    description:
      'Cumplimiento técnico y legal para tiendas online y sitios web ante la Ley de Protección de Datos Personales.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Structured Data Schema.org (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Webúnica - Plataforma de Cumplimiento Ley 21.719',
        operatingSystem: 'All',
        applicationCategory: 'BusinessApplication',
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'CLP',
          lowPrice: '9950',
          highPrice: '127491',
          offerCount: '3',
        },
        description:
          'Plataforma chilena de gestión de consentimiento para cumplir la Ley 21.719. Banner de cookies, prueba legal HMAC, panel de administración y módulo ARSOP+.',
        provider: {
          '@type': 'Organization',
          name: 'Webúnica SpA',
          url: 'https://webunica.cl',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Qué exige la Ley 21.719 en sitios web y tiendas online en Chile?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'La Ley 21.719 exige consentimiento previo, libre e informado para cookies no esenciales, prohibición de casillas premarcadas (dark patterns), canal para responder solicitudes ARSOP+ y acreditación de la carga de la prueba ante la Agencia de Protección de Datos Personales (APDP).',
            },
          },
          {
            '@type': 'Question',
            name: '¿Cómo funciona la Prueba Criptográfica HMAC-SHA256?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Cada consentimiento se registra con un token HMAC-SHA256, timestamp UNIX y contexto canónico firmado con clave de servidor. Esto genera una evidencia inmutable descargable en CSV/PDF ante cualquier fiscalización.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Qué es el Auto-Blocking de scripts?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Es un interceptor en tiempo real que pausa Meta Pixel, Google Analytics 4 y TikTok Pixel antes de que el usuario acepte, desanclando los eventos retenidos de inmediato al consentir para no perder conversiones.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-navy-800 font-sans antialiased selection:bg-teal-100 selection:text-navy">
      {/* Schema.org Inyección para Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Floating Modern Navbar (Estilo Privacity) */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-navy-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" title="Webúnica Protección de Datos">
            <div className="w-9 h-9 rounded-xl bg-navy text-white flex items-center justify-center font-display font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-xl text-navy tracking-tight">
                  Webún<span className="text-teal-500">ica</span>
                </span>
                <span className="text-[10px] font-display font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Ley 21.719
                </span>
              </div>
              <p className="text-[10px] text-navy-400 font-medium -mt-0.5">Protección de Datos Personales</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-navy-600 font-medium">
            <a href="#funcionalidades" className="hover:text-navy transition-colors">
              Funcionalidades
            </a>
            <a href="#auto-blocking" className="hover:text-navy transition-colors">
              Auto-Blocking
            </a>
            <a href="#como-funciona" className="hover:text-navy transition-colors">
              Puesta en marcha
            </a>
            <a href="#planes" className="hover:text-navy transition-colors">
              Precios
            </a>
            <a href="#faq" className="hover:text-navy transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-navy font-display font-semibold text-sm rounded-xl shadow-sm shadow-teal-500/25 transition-all"
              >
                Ir al Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy hover:bg-navy-800 text-white font-display font-semibold text-sm rounded-xl shadow-sm transition-all"
              >
                Acceder al Panel
                <ArrowRight className="w-4 h-4 text-teal-400" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-24 overflow-hidden">
        {/* Soft Background Glows */}
        <div className="pointer-events-none absolute -top-24 -left-16 w-[32rem] h-[32rem] rounded-full bg-teal-500/10 blur-3xl -z-10" />
        <div className="pointer-events-none absolute top-40 -right-20 w-[28rem] h-[28rem] rounded-full bg-navy-100/60 blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Plataforma Chilena · Ley N° 21.719 en Vigencia 2026
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-navy tracking-[-0.02em] leading-[1.12]">
            Cumplimiento técnico de la Ley 21.719 para tu{' '}
            <span className="text-teal-600 underline decoration-teal-300 decoration-wavy decoration-2">
              sitio web y e-commerce
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-navy-500 max-w-2xl mx-auto leading-relaxed">
            Banner de consentimiento sin dark patterns, auto-blocking de Meta Pixel y GA4, y prueba legal criptográfica HMAC-SHA256. Todo funcionando en 5 minutos con una sola línea de código.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-navy font-display font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition text-base"
              >
                Entrar al Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-navy font-display font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition text-base"
              >
                Comenzar ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}

            <a
              href="#planes"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-navy-50 text-navy border border-navy-200 font-display font-semibold rounded-xl transition text-base"
            >
              Ver planes y precios
            </a>
          </div>

          <div className="mt-14 pt-8 border-t border-navy-100 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-navy-500 font-medium">
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
              Cero Dark Patterns
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
              Prueba Legal HMAC
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
              Google Consent Mode v2
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
              Instalación en 1 línea
            </div>
          </div>
        </div>
      </section>

      {/* Trust Disclaimer Box (Estilo Privacity) */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="bg-navy-50 border border-navy-100 rounded-2xl p-6 sm:p-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="eyebrow text-teal-700 mb-1">Declaración de Confianza Técnica</p>
            <p className="text-navy-800 text-base sm:text-lg font-medium leading-relaxed">
              &ldquo;No somos un estudio de abogados que cobra honorarios por hora: somos la plataforma de software e infraestructura creada por expertos en desarrollo web para que tu tienda y sitio web cumplan automáticamente las exigencias técnicas de la Ley 21.719.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid (Estilo Privacity) */}
      <section id="funcionalidades" className="py-20 lg:py-24 bg-navy-50 border-t border-navy-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="eyebrow text-teal-600">Capacidades del sistema</p>
            <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
              Todo lo que necesitas para estar 100% en regla
            </h2>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group bg-white rounded-2xl border border-navy-100 p-7 hover:border-teal-400 hover:shadow-lg hover:shadow-navy/5 transition">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-lg text-navy">Banner de consentimiento</h3>
              <p className="mt-2 text-navy-500 text-sm leading-relaxed">
                Sin casillas premarcadas ni dark patterns. Opciones simétricas de aceptar y rechazar, configurable en colores y textos.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-2xl border border-navy-100 p-7 hover:border-teal-400 hover:shadow-lg hover:shadow-navy/5 transition">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-lg text-navy">Auto-blocking de scripts</h3>
              <p className="mt-2 text-navy-500 text-sm leading-relaxed">
                Bloquea Meta Pixel, TikTok y Google Analytics antes del clic. Si el visitante acepta, los eventos se disparan al instante sin perder ventas.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-2xl border border-navy-100 p-7 hover:border-teal-400 hover:shadow-lg hover:shadow-navy/5 transition">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-lg text-navy">Prueba legal (proof token)</h3>
              <p className="mt-2 text-navy-500 text-sm leading-relaxed">
                Cada consentimiento se registra con un token HMAC-SHA256, timestamp UNIX y contexto canónico. Evidencia verificable ante la APDP.
              </p>
            </div>

            {/* Card 4 */}
            <div className="group bg-white rounded-2xl border border-navy-100 p-7 hover:border-teal-400 hover:shadow-lg hover:shadow-navy/5 transition">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-lg text-navy">Google Consent Mode v2</h3>
              <p className="mt-2 text-navy-500 text-sm leading-relaxed">
                Señaliza automáticamente la decisión del usuario a Google Analytics y Google Ads. Compatible con GA4 y Google Tag Manager.
              </p>
            </div>

            {/* Card 5 */}
            <div className="group bg-white rounded-2xl border border-navy-100 p-7 hover:border-teal-400 hover:shadow-lg hover:shadow-navy/5 transition">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-lg text-navy">Módulo de Derechos ARSOP+</h3>
              <p className="mt-2 text-navy-500 text-sm leading-relaxed">
                Formulario integrado para tramitar solicitudes de Acceso, Rectificación, Supresión, Oposición y Portabilidad dentro de los plazos legales.
              </p>
            </div>

            {/* Card 6 */}
            <div className="group bg-white rounded-2xl border border-navy-100 p-7 hover:border-teal-400 hover:shadow-lg hover:shadow-navy/5 transition">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-lg text-navy">Panel y Exportador CSV</h3>
              <p className="mt-2 text-navy-500 text-sm leading-relaxed">
                Dashboard con estadísticas de aceptación, configuración visual del banner y libro de evidencia descargable en CSV y PDF para peritajes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Onboarding (Estilo Privacity) */}
      <section id="como-funciona" className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="eyebrow text-teal-600">Puesta en marcha</p>
            <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
              Funcionando en 5 minutos
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-navy-100 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-navy text-white font-display font-bold text-xl flex items-center justify-center">
                1
              </div>
              <h3 className="mt-5 font-display font-semibold text-xl text-navy">Crear la cuenta</h3>
              <p className="mt-2 text-navy-500 text-sm leading-relaxed">
                Al registrarse se recibe el identificador único (Tenant ID). El banner se configura con colores y textos propios desde el panel.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-navy-100 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-navy text-white font-display font-bold text-xl flex items-center justify-center">
                2
              </div>
              <h3 className="mt-5 font-display font-semibold text-xl text-navy">Instalar el widget</h3>
              <p className="mt-2 text-navy-500 text-sm leading-relaxed">
                Pega una sola línea de código en tu tienda (Shopify, WooCommerce o WordPress), o instala nuestro plugin oficial.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-navy-100 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-navy text-white font-display font-bold text-xl flex items-center justify-center">
                3
              </div>
              <h3 className="mt-5 font-display font-semibold text-xl text-navy">Cumple la ley</h3>
              <p className="mt-2 text-navy-500 text-sm leading-relaxed">
                El banner aparece, los scripts no autorizados se bloquean y cada decisión queda sellada matemáticamente con firma HMAC.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (EXACT STYLE FROM PRIVACITY SCREENSHOT) */}
      <section id="planes" className="py-20 lg:py-24 bg-navy-50 border-t border-navy-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-navy tracking-[-0.02em]">
              Planes simples, sin sorpresas
            </h2>
            <p className="mt-4 text-navy-500 text-base sm:text-lg leading-relaxed">
              Dos capacidades que se pueden contratar por separado o juntas: la <strong className="text-navy-700 font-semibold">gestión de consentimiento</strong> (banner + prueba legal) y el módulo <strong className="text-navy-700 font-semibold">ARSOP+</strong> para responder solicitudes de derechos.
            </p>

            <div className="mt-8 flex flex-col items-center">
              <span className="eyebrow text-teal-700 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full inline-block">
                Gestión de Consentimiento
              </span>
              <p className="mt-2 text-xs text-navy-400">
                Banner de cookies, auto-blocking y prueba legal. Diseñado para tiendas y sitios web.
              </p>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1: Pay-as-you-go / Starter */}
            <div className="bg-white rounded-2xl border border-navy-100 p-8 flex flex-col justify-between hover:border-navy-200 transition">
              <div>
                <h3 className="font-display font-bold text-xl text-navy">Pay-as-you-go</h3>
                <p className="text-xs text-navy-400 mt-1">Para micrositios y uso esporádico</p>

                <div className="mt-6 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-3xl text-navy">$9.950</span>
                    <span className="text-xs font-semibold text-navy-400">CLP + IVA / mes</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-1">≈ 0,25 UF por mes</p>
                  <p className="text-[11px] text-navy-300 mt-0.5">Hasta 10.000 consentimientos incluidos</p>
                </div>

                <p className="text-xs text-navy-500 leading-relaxed mb-6 pt-4 border-t border-navy-100">
                  Sin mínimo ni compromiso: se paga solo por consentimientos nuevos. Registro rápido y activación instantánea.
                </p>

                <ul className="space-y-3 text-xs text-navy-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Banner de cookies + auto-blocking
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Prueba legal HMAC-SHA256
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Google Consent Mode v2
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Notificación por email al revocar
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    1 dominio incluido
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/login"
                className="mt-8 block text-center py-3 bg-white hover:bg-navy-50 text-navy font-display font-semibold text-xs border border-navy-200 rounded-xl transition"
              >
                Comenzar con Pay-as-you-go
              </Link>
            </div>

            {/* Plan 2: Entrada / Pyme (POPULAR - Con Badge Superior) */}
            <div className="bg-white rounded-2xl border-2 border-teal-400 p-8 flex flex-col justify-between shadow-xl shadow-teal-500/10 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-navy text-white text-[11px] font-display font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-sm">
                Popular
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-navy">Entrada</h3>
                <p className="text-xs text-navy-400 mt-1">Para la pyme pequeña estable y e-commerce</p>

                <div className="mt-6 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-3xl text-navy">$50.991</span>
                    <span className="text-xs font-semibold text-navy-400">CLP + IVA / mes</span>
                  </div>
                  <p className="text-xs text-teal-600 font-bold mt-1">Con 30% permanente Webúnica</p>
                  <p className="text-[11px] text-navy-400 mt-0.5">Tarifa plana hasta 50.000 consentimientos/mes</p>
                </div>

                <p className="text-xs text-navy-500 leading-relaxed mb-6 pt-4 border-t border-navy-100">
                  Ideal para tiendas Shopify y WooCommerce activas que buscan blindaje legal continuo sin sorpresas.
                </p>

                <ul className="space-y-3 text-xs text-navy-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    1 dominio + 1 tienda online
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Banner + auto-blocking + prueba HMAC
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Google Consent Mode v2 oficial
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Módulo de Derechos ARSOP+ con SLAs
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Exportador CSV para fiscalizaciones APDP
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Retención de la prueba 12 meses
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/login"
                className="mt-8 block text-center py-3.5 bg-teal-500 hover:bg-teal-400 text-navy font-display font-semibold text-xs rounded-xl shadow-md shadow-teal-500/25 transition-all hover:scale-[1.02]"
              >
                Comenzar con Entrada
              </Link>
            </div>

            {/* Plan 3: Pro / Enterprise */}
            <div className="bg-white rounded-2xl border border-navy-100 p-8 flex flex-col justify-between hover:border-navy-200 transition">
              <div>
                <h3 className="font-display font-bold text-xl text-navy">Pro</h3>
                <p className="text-xs text-navy-400 mt-1">Para empresas y e-commerce de alto tráfico</p>

                <div className="mt-6 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-3xl text-navy">$127.491</span>
                    <span className="text-xs font-semibold text-navy-400">CLP + IVA / mes</span>
                  </div>
                  <p className="text-xs text-teal-600 font-bold mt-1">Con 30% permanente Webúnica</p>
                  <p className="text-[11px] text-navy-300 mt-0.5">Consentimientos ilimitados</p>
                </div>

                <p className="text-xs text-navy-500 leading-relaxed mb-6 pt-4 border-t border-navy-100">
                  Para catálogos grandes, múltiples marcas o sitios de alto flujo con requerimiento de soporte dedicado.
                </p>

                <ul className="space-y-3 text-xs text-navy-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Hasta 3 dominios / multi-tienda
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Portal de privacidad y verificación propio
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Política de privacidad con historial
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Múltiples usuarios y operadores (hasta 10)
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Módulo EIPD (Evaluación de Impacto Art. 25)
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                    Soporte prioritario y DPA personalizado
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/login"
                className="mt-8 block text-center py-3 bg-white hover:bg-navy-50 text-navy font-display font-semibold text-xs border border-navy-200 rounded-xl transition"
              >
                Comenzar con Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Final Call to Action (Estilo Privacity) */}
      <section className="bg-navy relative overflow-hidden text-white">
        <div className="pointer-events-none absolute -bottom-28 -left-20 w-[28rem] h-[28rem] rounded-full bg-teal-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -top-24 -right-16 w-[26rem] h-[26rem] rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-white tracking-[-0.02em] leading-tight">
            Preparar el sitio antes de diciembre de 2026
          </h2>
          <p className="mt-5 text-lg text-navy-200 max-w-xl mx-auto leading-relaxed">
            No conviene esperar a que la ley entre en vigencia ni arriesgar multas de la APDP: implementar la plataforma hoy asegura el cumplimiento técnico desde el primer día.
          </p>
          <div className="mt-10">
            <Link
              href="/auth/login"
              className="inline-flex justify-center items-center px-8 py-4 bg-teal-500 text-navy font-display font-semibold rounded-xl hover:bg-teal-400 transition shadow-lg shadow-teal-500/25"
            >
              Comenzar ahora
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="eyebrow text-teal-600">Preguntas frecuentes</p>
            <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
              Todo lo que necesitas saber
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-navy-50 border border-navy-100">
              <h3 className="font-display font-semibold text-navy text-base mb-2">
                ¿Qué exige la Ley N° 21.719 en tiendas online de Chile?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed">
                Exige que el consentimiento sea libre, previo y documentable antes de instalar cookies de analítica o publicidad. Prohíbe casillas premarcadas y exige un canal para ejercer derechos ARSOP+ en plazos de 5 días para acuse y 30 días para resolución.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-50 border border-navy-100">
              <h3 className="font-display font-semibold text-navy text-base mb-2">
                ¿Por qué un banner simple no es suficiente?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed">
                Porque el Artículo 21 invierte la carga de la prueba sobre el dueño del sitio web. En caso de una denuncia ante la APDP, no basta con mostrar capturas del diseño; debes entregar un registro auditable con fecha, sesión, categorías aceptadas y sello criptográfico HMAC que pruebe que el dato no fue alterado.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-50 border border-navy-100">
              <h3 className="font-display font-semibold text-navy text-base mb-2">
                ¿Cómo se instala en Shopify o WooCommerce?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed">
                Toma solo 5 minutos: pegas una sola línea de código en tu tienda o instalas el plugin de WordPress. El sistema detecta tu tienda y activa el banner con auto-blocking inmediatamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Estilo Privacity) */}
      <footer className="bg-navy text-navy-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:pr-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-500 text-navy flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5 text-navy" />
                </div>
                <span className="font-display font-bold text-xl text-white">
                  Webún<span className="text-teal-400">ica</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-navy-200">
                Plataforma de gestión de consentimiento e infraestructura técnica para la protección de datos personales.
              </p>
              <p className="eyebrow text-teal-400 mt-5">Ley 21.719 · Chile</p>
            </div>

            <div>
              <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider mb-4">
                Producto
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#funcionalidades" className="hover:text-teal-300 transition">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#auto-blocking" className="hover:text-teal-300 transition">
                    Auto-Blocking
                  </a>
                </li>
                <li>
                  <a href="#planes" className="hover:text-teal-300 transition">
                    Precios
                  </a>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-teal-300 transition">
                    Acceso al Panel
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="https://webunica.cl/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition">
                    Política de privacidad
                  </a>
                </li>
                <li>
                  <a href="https://webunica.cl" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition">
                    Términos de servicio
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider mb-4">
                Contacto
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="mailto:contacto@webunica.cl" className="hover:text-teal-300 transition">
                    contacto@webunica.cl
                  </a>
                </li>
                <li>
                  <a href="https://webunica.cl" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition">
                    webunica.cl
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-14 pt-8 text-xs text-navy-300 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              &copy; {new Date().getFullYear()} Webúnica SpA. Todos los derechos reservados.
            </span>
            <span className="font-display text-navy-400">Hecho en Chile 🇨🇱</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
