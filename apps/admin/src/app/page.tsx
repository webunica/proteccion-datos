import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Shield,
  ShieldCheck,
  Lock,
  ArrowRight,
  Check,
  CheckCircle2,
  KeyRound,
  FileSpreadsheet,
  Layers,
  Zap,
  Globe,
  BarChart3,
  ChevronRight,
  Code2,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Ley 21.719 Protección de Datos Personales Chile | Software SaaS Webúnica',
  description:
    'Plataforma SaaS para el cumplimiento técnico de la Ley N° 21.719 en Chile. Auto-blocking de Meta Pixel y Google Analytics 4, Libro de Evidencia Criptográfica HMAC-SHA256, canal de derechos ARSOP+ y registro RAT para Shopify, WooCommerce y sitios web.',
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
    'multas ley 21719',
    'registro actividades tratamiento RAT',
  ],
  authors: [{ name: 'Webúnica SpA', url: 'https://webunica.cl' }],
  creator: 'Webúnica SpA',
  publisher: 'Webúnica SpA',
  metadataBase: new URL('https://proteccion-datos.webunica.cl'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Plataforma de Cumplimiento Ley 21.719 Chile | Webúnica',
    description:
      'Blindaje técnico y legal para tiendas y sitios web ante la Ley de Protección de Datos Personales. Auto-blocking de rastreadores y sello criptográfico HMAC-SHA256.',
    url: 'https://proteccion-datos.webunica.cl',
    siteName: 'Webúnica Protección de Datos Personales',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Software de Cumplimiento Ley 21.719 Chile | Webúnica',
    description:
      'Solución técnica para e-commerce y tiendas ante la nueva Ley de Protección de Datos Personales en Chile.',
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

  // Structured Data Schema.org (JSON-LD) para SEO Técnico
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Webúnica - Sistema de Cumplimiento Ley 21.719',
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
          'Software e infraestructura para cumplimiento de la Ley 21.719 de Protección de Datos Personales en Chile. Auto-blocking, banner CMP y libro de consentimientos HMAC-SHA256.',
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
            name: '¿Qué exige la Ley N° 21.719 en sitios web y tiendas online en Chile?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'La Ley 21.719 exige consentimiento previo, libre e informado para cookies no esenciales, prohibición de casillas premarcadas (dark patterns), canal para ejercer derechos ARSOP+ y acreditación de la carga de la prueba ante la nueva Agencia de Protección de Datos Personales (APDP).',
            },
          },
          {
            '@type': 'Question',
            name: '¿Cómo funciona la Prueba Criptográfica HMAC-SHA256?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Cada vez que un visitante toma una decisión en el banner de cookies, el sistema genera un hash criptográfico HMAC-SHA256 con timestamp UNIX y firma de servidor. Esto permite demostrar de manera inmutable ante la APDP qué aceptó el usuario y en qué fecha exacta.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Qué es el Auto-Blocking de scripts y por qué protege mi tienda?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Es un interceptor en tiempo real que pausa Meta Pixel, Google Analytics 4 y TikTok Pixel antes de que el usuario haga clic en Aceptar. Si el usuario acepta, los eventos acumulados se disparan de inmediato sin perder atribución de ventas.',
            },
          },
          {
            '@type': 'Question',
            name: '¿En qué plataformas se puede instalar?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Se integra mediante 1 sola línea de código en Shopify, WooCommerce, WordPress, Magento o sitios desarrollados a medida.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-navy-800 font-sans antialiased selection:bg-teal-100 selection:text-navy">
      {/* Schema.org Inyección para Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation Header (Estilo Privacity: Blanco puro, blur y acento Navy/Teal) */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" title="Webúnica Protección de Datos">
            <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-display font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl text-navy tracking-tight">
                  Webún<span className="text-teal-500">ica</span>
                </span>
                <span className="text-[10px] font-display font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Ley 21.719
                </span>
              </div>
              <p className="text-[11px] text-navy-400 font-medium -mt-0.5">Protección de Datos Personales</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-navy-600 font-medium">
            <a href="#como-funciona" className="hover:text-navy transition-colors">
              Puesta en Marcha
            </a>
            <a href="#auto-blocking" className="hover:text-navy transition-colors">
              Auto-Blocking
            </a>
            <a href="#evidencia-hmac" className="hover:text-navy transition-colors">
              Prueba HMAC
            </a>
            <a href="#modulos" className="hover:text-navy transition-colors">
              Módulos
            </a>
            <a href="#planes" className="hover:text-navy transition-colors">
              Planes
            </a>
            <a href="#faq" className="hover:text-navy transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy font-display font-semibold text-sm shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02]"
              >
                Ir al Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy hover:bg-navy-800 text-white font-display font-semibold text-sm shadow-md transition-all hover:scale-[1.02]"
              >
                Acceder al Panel
                <ArrowRight className="w-4 h-4 text-teal-400" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section (Fondo blanco, Poppins + DM Sans, acentos Teal) */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Soft Background Glows */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[48rem] h-[24rem] rounded-full bg-teal-400/10 blur-3xl -z-10" />
        <div className="pointer-events-none absolute top-40 -right-20 w-[24rem] h-[24rem] rounded-full bg-navy-100/60 blur-3xl -z-10" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-teal-500" />
          Plataforma de Cumplimiento Técnico Oficial · Ley N° 21.719 Chile
        </div>

        {/* Main Headline */}
        <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl text-navy tracking-[-0.02em] leading-[1.12] max-w-5xl mx-auto">
          Blindaje Técnico y Legal para tu{' '}
          <span className="text-teal-600 underline decoration-teal-300 decoration-wavy decoration-2">
            E-Commerce y Sitio Web
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-lg sm:text-xl text-navy-500 max-w-3xl mx-auto leading-relaxed">
          Pega una sola línea de código en tu tienda (Shopify, WooCommerce o a medida).{' '}
          <strong className="text-navy-800 font-semibold">Auto-blocking inteligente de Meta Pixel y GA4</strong>, libro de{' '}
          <strong className="text-navy-800 font-semibold">evidencia criptográfica HMAC-SHA256</strong> y gestión de derechos ARSOP+ lista para fiscalizaciones de la APDP.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy font-display font-semibold text-base shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
            >
              Ir a mi Panel de Control
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy font-display font-semibold text-base shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
            >
              Iniciar Sesión en el Panel
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}

          <a
            href="#planes"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-navy-50 text-navy border border-navy-200 font-display font-semibold text-base transition-all shadow-sm"
          >
            Ver Planes & Tarifas
          </a>
        </div>

        {/* Trust Pill Highlights */}
        <div className="mt-14 pt-8 border-t border-navy-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-navy-500">
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
            Cero Dark Patterns
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
            Prueba Criptográfica HMAC
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
            Google Consent Mode v2
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
            Puesta en marcha en 5 min
          </div>
        </div>
      </section>

      {/* Trust Disclaimer Box (Estilo Privacity: bg-navy-50, border-navy-100) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="p-6 sm:p-8 rounded-2xl bg-navy-50 border border-navy-100 shadow-sm relative overflow-hidden flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="eyebrow text-teal-700 mb-1">
              Declaración de Rol y Confianza Técnica
            </p>
            <p className="text-base sm:text-lg text-navy-800 font-medium leading-relaxed">
              &ldquo;No somos un estudio de abogados que cobra honorarios por hora: somos la plataforma de software e infraestructura creada por expertos en desarrollo web para que tu tienda y sitio web cumplan automáticamente las exigencias técnicas de la Ley 21.719.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* 3 Steps Onboarding Section (bg-navy-50, cards blancas, números en círculo navy) */}
      <section id="como-funciona" className="py-20 bg-navy-50 border-y border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="eyebrow text-teal-600 mb-2">Simplicidad Total</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
              Puesta en Marcha en 3 Pasos
            </h2>
            <p className="text-navy-500 mt-4 text-base">
              Sin configuraciones complejas ni necesidad de tocar bases de datos. Todo opera mediante un script inteligente y liviano (~15 KB).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all relative">
              <div className="w-12 h-12 rounded-full bg-navy text-white font-display font-bold text-xl flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="font-display font-semibold text-xl text-navy mb-3">Pega 1 línea de código</h3>
              <p className="text-sm text-navy-500 leading-relaxed mb-4">
                Inserta nuestro script universal en el <code className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-mono text-xs border border-teal-200">&lt;head&gt;</code> de tu tienda Shopify, WooCommerce, WordPress o web a medida.
              </p>
              <div className="p-3 bg-navy-50 rounded-xl font-mono text-[11px] text-navy-700 border border-navy-100 select-all overflow-x-auto">
                &lt;script src=&quot;https://proteccion-datos.webunica.cl/widget.js&quot; data-tenant=&quot;tu-empresa&quot;&gt;&lt;/script&gt;
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all relative">
              <div className="w-12 h-12 rounded-full bg-navy text-white font-display font-bold text-xl flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="font-display font-semibold text-xl text-navy mb-3">Auto-blocking activo</h3>
              <p className="text-sm text-navy-500 leading-relaxed">
                El sistema despliega el banner simétrico sin trucos visuales (dark patterns) y bloquea automáticamente Meta Pixel, TikTok y GA4 hasta que el usuario elija.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all relative">
              <div className="w-12 h-12 rounded-full bg-navy text-white font-display font-bold text-xl flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="font-display font-semibold text-xl text-navy mb-3">Evidencia Criptográfica</h3>
              <p className="text-sm text-navy-500 leading-relaxed">
                Cada decisión genera un token HMAC-SHA256 con timestamp inmutable. Si la APDP te fiscaliza, descargas el reporte CSV oficial en 1 clic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auto-Blocking Feature Highlight */}
      <section id="auto-blocking" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-4 border border-teal-200">
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              Ingeniería E-Commerce
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em] leading-tight">
              Auto-Blocking inteligente: Cumple la ley sin perder ventas ni conversiones
            </h2>
            <p className="text-navy-500 mt-6 text-base leading-relaxed">
              Muchas soluciones rompen el carrito de compras o pierden la atribución publicitaria. Nuestro widget intercepta los eventos de marketing y los retiene en una cola segura.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                <div>
                  <strong className="text-navy font-display font-semibold text-sm block">Pausa preventiva de píxeles:</strong>
                  <span className="text-xs text-navy-500">Meta Pixel (fbq), TikTok Pixel (ttq), Microsoft Clarity y Google Analytics 4.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                <div>
                  <strong className="text-navy font-display font-semibold text-sm block">Carrito y Checkout siempre operativos:</strong>
                  <span className="text-xs text-navy-500">Transbank, Webpay, MercadoPago, Stripe y el inventario jamás se bloquean.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-teal-600 shrink-0 mt-0.5 stroke-[3]" />
                <div>
                  <strong className="text-navy font-display font-semibold text-sm block">Disparo inmediato de conversiones:</strong>
                  <span className="text-xs text-navy-500">Al presionar &ldquo;Aceptar todo&rdquo;, los eventos retenidos se disparan en tiempo real protegiendo tu ROI de pauta.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-navy-100 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-navy-100 mb-6">
              <span className="text-xs font-semibold text-navy flex items-center gap-2 font-display">
                <Code2 className="w-4 h-4 text-teal-600" />
                Matriz de Control de Rastreo
              </span>
              <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Consent Mode v2
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-navy-50 flex items-center justify-between border border-navy-100">
                <span className="text-navy-700 font-medium">Meta Pixel (Facebook/IG)</span>
                <span className="text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded text-[11px] font-semibold">Pausado en cola</span>
              </div>
              <div className="p-3.5 rounded-xl bg-navy-50 flex items-center justify-between border border-navy-100">
                <span className="text-navy-700 font-medium">Google Analytics 4</span>
                <span className="text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded text-[11px] font-semibold">Denied por defecto</span>
              </div>
              <div className="p-3.5 rounded-xl bg-navy-50 flex items-center justify-between border border-navy-100">
                <span className="text-navy-700 font-medium">TikTok Pixel</span>
                <span className="text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded text-[11px] font-semibold">Retenido</span>
              </div>
              <div className="p-3.5 rounded-xl bg-teal-50/60 flex items-center justify-between border border-teal-200">
                <span className="text-teal-900 font-bold">Carrito & Pasarelas de Pago</span>
                <span className="text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded text-[11px] font-bold">100% Activo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cryptographic Proof Section */}
      <section id="evidencia-hmac" className="py-24 bg-navy-50 border-t border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="eyebrow text-teal-600 mb-2">Carga de la Prueba · Art. 21 Ley 21.719</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
              Evidencia Criptográfica HMAC-SHA256
            </h2>
            <p className="text-navy-500 mt-4 text-base">
              La ley exige que el titular de la tienda demuestre cuándo, quién y qué aceptó el visitante. Un banner simple no constituye prueba legal; nuestro sello matemático sí.
            </p>
          </div>

          <div className="p-6 sm:p-10 rounded-2xl bg-white border border-navy-100 shadow-xl max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-navy text-base">Registro Auditable con Firma Digital</h4>
                  <p className="text-xs text-navy-400">Algoritmo: HMAC-SHA256 con Clave de Servidor Salteada</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold self-start sm:self-auto">
                <Check className="w-3.5 h-3.5 text-teal-600 stroke-[3]" />
                Validez Técnica Probatoria
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-navy-500 block mb-1">
                  Carga Útil Canónica Auditada:
                </label>
                <div className="p-3.5 rounded-xl bg-navy-50 border border-navy-100 font-mono text-xs text-navy-800 break-all">
                  tienda-id:session_e71b29:1791387233:&#123;&quot;essential&quot;:true,&quot;analytics&quot;:true,&quot;marketing&quot;:false&#125;:v1.0
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-navy-500 block mb-1">
                  Sello Criptográfico Inmutable (Token HMAC):
                </label>
                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-900 font-mono text-xs text-teal-300 break-all select-all">
                  e29f7815792c973261fceb00f1a5144ff0d2240c2c669c376422a96ee5cc605d
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-navy-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-navy-500">
                Descarga en cualquier momento tu archivo oficial <strong className="text-navy font-semibold">.csv</strong> con formato pericial para la APDP.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-teal-700 hover:text-teal-800"
              >
                Auditar libro de consentimientos
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid (Cards blancas con estilo Privacity) */}
      <section id="modulos" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="eyebrow text-teal-600 mb-2">Arquitectura Completa</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
            Todo lo que Exige la Ley 21.719 en un Solo Sistema
          </h2>
          <p className="text-navy-500 mt-4 text-base">
            Diseñado para cumplir cada artículo de la normativa chilena sin fricción operativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-7 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-navy mb-2">Banner CMP Universal</h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              Banner limpio, responsive y accesible. Sin casillas premarcadas con opciones simétricas de aceptación y rechazo.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-navy mb-2">Canal de Derechos ARSOP+</h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              Formulario embebible para Acceso, Rectificación, Supresión, Oposición, Portabilidad y Bloqueo, con control de plazos legales (5 y 30 días).
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-navy mb-2">Registro de Tratamientos (RAT)</h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              Módulo interactivo con inventario de datos y bases legales del Art. 13. Exportable en formato oficial para auditorías.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-navy mb-2">Protocolo de Brechas (72 Horas)</h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              Registro y notificación de incidentes de seguridad con alertas automáticas ante requerimientos de la APDP.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-navy mb-2">Sello Público de Confianza</h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              Certificado público en tiempo real (/verify/tu-empresa) que valida ante clientes y fiscalizadores tu estado de cumplimiento.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-navy mb-2">Score de Cumplimiento</h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              Algoritmo que audita tu tienda de 0 a 100 puntos y te notifica alertas antes de vencimientos legales.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section (Contenido Original Webúnica con Estilos Privacity) */}
      <section id="planes" className="py-24 bg-navy-50 border-t border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="eyebrow text-teal-600 mb-2">Tarifas Transparentes 2026</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
              Planes Adaptados a tu Negocio
            </h2>
            <p className="text-navy-500 mt-4 text-base">
              Clientes de la agencia disfrutan de un <strong className="text-teal-700 font-semibold">30% de descuento permanente</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Starter */}
            <div className="p-8 rounded-2xl bg-white border border-navy-100 flex flex-col justify-between shadow-sm hover:border-navy-200 transition">
              <div>
                <h3 className="font-display font-bold text-xl text-navy">Starter</h3>
                <p className="text-xs text-navy-400 mt-1">Para sitios corporativos y tiendas emergentes</p>
                <div className="mt-6 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-3xl text-navy">$9.950</span>
                    <span className="text-xs font-semibold text-navy-400">CLP/mes + IVA</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-1">≈ 0,25 UF por mes</p>
                </div>
                <ul className="space-y-3 text-xs text-navy-700 pt-4 border-t border-navy-100">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Hasta 10.000 visitas/mes
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Banner CMP sin dark patterns
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Registro de consentimientos
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Plantillas RAT de base
                  </li>
                </ul>
              </div>
              <Link
                href="/auth/login"
                className="mt-8 block text-center py-3 rounded-xl bg-white hover:bg-navy-50 text-navy font-display font-semibold text-xs border border-navy-200 transition"
              >
                Comenzar con Starter
              </Link>
            </div>

            {/* Pro - Featured (Popular con Badge Navy y Borde Teal) */}
            <div className="p-8 rounded-2xl bg-white border-2 border-teal-400 shadow-xl shadow-teal-500/10 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-navy text-white text-[11px] font-display font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-sm">
                Más Recomendado E-Commerce
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-navy">Pro</h3>
                <p className="text-xs text-navy-400 mt-1">Para e-commerce Shopify y WooCommerce activos</p>
                <div className="mt-6 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-3xl text-navy">$50.991</span>
                    <span className="text-xs font-semibold text-navy-400">CLP/mes + IVA</span>
                  </div>
                  <div className="text-[11px] text-teal-700 font-bold mt-1">Con 30% permanente Webúnica</div>
                </div>
                <ul className="space-y-3 text-xs text-navy-700 pt-4 border-t border-navy-100">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Hasta 50.000 visitas/mes
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Auto-Blocking Meta, TikTok & GA4
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Libro Criptográfico HMAC-SHA256
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Exportador CSV oficial APDP
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Canal ARSOP+ con SLAs legales
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Certificado público de cumplimiento
                  </li>
                </ul>
              </div>
              <Link
                href="/auth/login"
                className="mt-8 block text-center py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy font-display font-semibold text-xs shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02]"
              >
                Comenzar con Plan Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-2xl bg-white border border-navy-100 flex flex-col justify-between shadow-sm hover:border-navy-200 transition">
              <div>
                <h3 className="font-display font-bold text-xl text-navy">Enterprise</h3>
                <p className="text-xs text-navy-400 mt-1">Para grandes marcas y cadenas multi-tienda</p>
                <div className="mt-6 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-3xl text-navy">$127.491</span>
                    <span className="text-xs font-semibold text-navy-400">CLP/mes + IVA</span>
                  </div>
                  <div className="text-[11px] text-teal-700 font-bold mt-1">Con 30% permanente Webúnica</div>
                </div>
                <ul className="space-y-3 text-xs text-navy-700 pt-4 border-t border-navy-100">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Visitas mensuales ilimitadas
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Multi-tienda y multi-dominio
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Módulo de Evaluaciones EIPD (Art. 25)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                    Auditorías y soporte dedicado
                  </li>
                </ul>
              </div>
              <Link
                href="/auth/login"
                className="mt-8 block text-center py-3 rounded-xl bg-white hover:bg-navy-50 text-navy font-display font-semibold text-xs border border-navy-200 transition"
              >
                Contactar Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white border-t border-navy-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="eyebrow text-teal-600 mb-2">Preguntas Frecuentes</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
              Todo lo que Necesitas Saber sobre la Ley 21.719
            </h2>
            <p className="text-navy-500 mt-4 text-base">
              Respuestas directas preparadas por nuestros desarrolladores y consultores web.
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-navy-50 border border-navy-100">
              <h3 className="font-display font-semibold text-navy text-base mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                ¿Qué exige la Ley N° 21.719 en tiendas online y sitios web de Chile?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed">
                Exige que el consentimiento sea libre, expreso e informado antes de activar cualquier cookie no esencial (marketing o analítica). Queda prohibido el uso de casillas premarcadas (dark patterns) y se debe habilitar un mecanismo expedito para ejercer derechos ARSOP+ con plazos perentorios de 5 días hábiles para acuse y 30 días para resolver.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-50 border border-navy-100">
              <h3 className="font-display font-semibold text-navy text-base mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                ¿Cómo funciona la Prueba Criptográfica HMAC-SHA256 ante la APDP?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed">
                La ley establece que la carga de la prueba recae sobre el dueño de la web. En cada clic del visitante, nuestro sistema calcula un sello digital único combinando el ID de sesión, el timestamp UNIX, las categorías aceptadas y una clave secreta salteada del servidor. Esto genera un registro inmutable descargable en CSV/PDF ante cualquier requerimiento de la Agencia.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-50 border border-navy-100">
              <h3 className="font-display font-semibold text-navy text-base mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                ¿El auto-blocking de scripts romperá mi pasarela de pago o el carrito?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed">
                No. Nuestro script diferencia estrictamente entre scripts esenciales (Webpay, Transbank, MercadoPago, carritos de compra) y scripts de marketing (Meta Pixel, Google Analytics 4, TikTok Pixel). El checkout y la pasarela permanecen 100% funcionales en todo momento.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-50 border border-navy-100">
              <h3 className="font-display font-semibold text-navy text-base mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                ¿Cuánto tiempo toma la instalación en Shopify o WooCommerce?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed">
                Menos de 5 minutos. En Shopify simplemente agregas 1 línea en theme.liquid; en WordPress puedes utilizar nuestro plugin privado o pegar la etiqueta de script. El sistema activa el banner y comienza a auditar consentimientos al instante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Estilo Privacity: Navy profundo, texto claro y acento Teal) */}
      <footer className="bg-navy text-navy-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:pr-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-500 text-navy flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5 text-navy" />
                </div>
                <span className="font-display font-bold text-xl text-white">
                  Webún<span className="text-teal-400">ica</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-navy-300">
                Plataforma de software e infraestructura para el cumplimiento técnico de la Ley 21.719 de Protección de Datos Personales en Chile.
              </p>
              <p className="eyebrow text-teal-400 mt-5">Ley 21.719 · Chile</p>
            </div>

            <div>
              <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider mb-4">
                Módulos
              </h4>
              <ul className="space-y-2.5 text-sm text-navy-300">
                <li>
                  <a href="#como-funciona" className="hover:text-teal-300 transition">
                    Puesta en Marcha
                  </a>
                </li>
                <li>
                  <a href="#auto-blocking" className="hover:text-teal-300 transition">
                    Auto-Blocking
                  </a>
                </li>
                <li>
                  <a href="#evidencia-hmac" className="hover:text-teal-300 transition">
                    Evidencia HMAC-SHA256
                  </a>
                </li>
                <li>
                  <a href="#modulos" className="hover:text-teal-300 transition">
                    Derechos ARSOP+
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider mb-4">
                Empresa
              </h4>
              <ul className="space-y-2.5 text-sm text-navy-300">
                <li>
                  <a href="https://webunica.cl" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition">
                    webunica.cl
                  </a>
                </li>
                <li>
                  <a href="#planes" className="hover:text-teal-300 transition">
                    Planes & Tarifas
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
                Contacto
              </h4>
              <ul className="space-y-2.5 text-sm text-navy-300">
                <li>
                  <a href="mailto:contacto@webunica.cl" className="hover:text-teal-300 transition">
                    contacto@webunica.cl
                  </a>
                </li>
                <li>Santiago, Chile</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-14 pt-8 text-xs text-navy-400 flex flex-col sm:flex-row items-center justify-between gap-3">
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
