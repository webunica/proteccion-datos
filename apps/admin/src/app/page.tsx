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
  ChevronRight,
  Clock,
  Sparkles,
  HelpCircle,
  FileText,
  AlertTriangle,
  MessageCircle,
  Scale,
  QrCode,
  ShieldAlert,
  Headphones,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Ley 21.719 Protección de Datos Personales Chile | Webunica',
  description:
    'Evita multas de hasta 20.000 UTM con la plataforma de cumplimiento Ley 21.719 para Shopify, WooCommerce y sitios web en Chile. Prueba HMAC-SHA256, tarifa plana en CLP y canal ARSOP+ con OTP.',
  keywords: [
    'ley 21719 chile ecommerce',
    'proteccion de datos personales shopify chile',
    'cumplimiento ley 21719 tienda online',
    'banner cookies ley 21719 chile',
    'prueba hmac sha256 consentimiento chile',
    'consent mode v2 chile',
    'derechos arsop chile otp',
    'multas apdp chile 20000 utm',
    'contratos dpa couriers chile',
    'plataforma privacidad ecommerce chile',
  ],
  authors: [{ name: 'Webunica SpA', url: 'https://webunica.cl' }],
  creator: 'Webunica SpA',
  publisher: 'Webunica SpA',
  metadataBase: new URL('https://proteccion-datos.webunica.cl'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Protección de Datos Personales en tu Tienda Online — Ley N° 21.719 Chile | Webunica',
    description:
      'Evita multas de hasta 20.000 UTM. Plataforma integral de privacidad para Shopify, WooCommerce y sitios web en Chile. Plan Starter a $9.950 + IVA y 15% OFF.',
    url: 'https://proteccion-datos.webunica.cl',
    siteName: 'Webunica',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plataforma Ley 21.719 Protección de Datos E-commerce Chile | Webunica',
    description:
      'Evita multas de la nueva APDP en Chile con nuestra solución integral para tiendas online y sitios web. Plan Starter $9.950 + IVA y 15% OFF.',
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

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Webunica - Sistema de Cumplimiento Ley 21.719',
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
          'Plataforma tecnológica integral diseñada para Shopify, WooCommerce y sitios web en Chile ante la Ley 21.719. Auto-blocking de scripts, prueba HMAC-SHA256 y canal ARSOP+ con OTP.',
        provider: {
          '@type': 'Organization',
          name: 'Webunica SpA',
          url: 'https://webunica.cl',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Afecta la velocidad o carga de mi tienda Shopify o WooCommerce?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Nuestro script pesa menos de 20 KB y se ejecuta de forma asíncrona (defer), sin impactar el puntaje de Google Core Web Vitals ni la velocidad de carga de tus productos.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Qué pasa si un usuario solicita que borre sus datos pero tengo facturas emitidas?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'El sistema incluye la opción de Resolución Fundada de Rechazo Parcial, citando la excepción legal del Servicio de Impuestos Internos (SII) que exige conservar datos tributarios durante 5 años, cumpliendo con la Ley 21.719 sin violar la normativa tributaria chilena.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Cuánto tiempo toma la instalación?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Menos de 5 minutos. Solo requieres pegar una línea de código en el archivo theme.liquid de Shopify o utilizar nuestro plugin para WordPress/WooCommerce. El banner, el formulario y el sello de confianza quedan configurados inmediatamente.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Cómo se contrata el servicio y cómo funciona el 10% de descuento en octubre?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'La contratación opera bajo modalidad de cotización formal. Puedes solicitar tu cotización haciendo clic en cualquier botón de la página. Si contratas durante el mes de octubre, se aplica automáticamente un 10% de descuento extra en cualquier modalidad (mensual o anual).',
            },
          },
          {
            '@type': 'Question',
            name: '¿A qué multas se expone una tienda online en Chile con la Ley N° 21.719?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'La nueva Agencia de Protección de Datos Personales (APDP) está facultada para aplicar sanciones de hasta 20.000 UTM (aproximadamente $1.300 millones de pesos chilenos) por infracciones gravísimas, además del daño reputacional y la suspensión del tratamiento de datos comerciales.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Qué diferencia a Webunica de plugins como Cookiebot u OneTrust?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Las herramientas internacionales solo resuelven el aviso genérico de cookies bajo estándares europeos. No incluyen el canal de derechos ARSOP+ con verificación OTP exigido en Chile, ni los modelos contractuales DPA para couriers locales (Chilexpress, Starken, Blue Express), ni el protocolo de notificación a la APDP en 72 horas.',
            },
          },
        ],
      },
    ],
  };

  const whatsappUrl = 'https://wa.me/56984260117?text=Hola%20Webunica,%20quiero%20cotizar%20la%20plataforma%20de%20cumplimiento%20Ley%2021.719';

  return (
    <div className="min-h-screen bg-white text-navy-800 font-sans antialiased selection:bg-teal-100 selection:text-navy">
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Banner de Notificación */}
      <div className="bg-navy-950 text-white text-[11px] sm:text-xs py-2 px-3 sm:px-6 border-b border-navy-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap truncate">
              <span className="bg-teal-400 text-navy font-display font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shrink-0">
                Cumplimiento APDP 2026
              </span>
              <span className="text-navy-100 truncate text-[11px] sm:text-xs">
                Ley N° 21.719:{' '}
                <strong className="text-white font-semibold">Plan Starter a $9.950 + IVA/mes</strong> (hasta dic.) |{' '}
                <span className="text-teal-300 font-semibold">15% OFF</span> en Pro y Enterprise (oct-nov).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="#planes-ley-21719"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-display font-semibold text-teal-300 hover:text-white transition-colors"
            >
              Ver Planes
              <ArrowRight className="w-3 h-3" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-teal-400 hover:bg-teal-300 text-navy rounded-lg font-display font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition-all shadow-sm"
            >
              Cotizar
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Header (Estilo Privacity: Blanco puro, sombra sutil, Navy & Teal) */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" title="Webunica Protección de Datos">
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

          <nav className="hidden lg:flex items-center gap-7 text-sm text-navy-600 font-medium">
            <a href="#planes-ley-21719" className="hover:text-navy transition-colors">
              Planes
            </a>
            <a href="#como-funciona" className="hover:text-navy transition-colors">
              3 Pasos
            </a>
            <a href="#comparativa" className="hover:text-navy transition-colors">
              Comparativa
            </a>
            <a href="#modulos" className="hover:text-navy transition-colors">
              Módulos
            </a>
            <a href="#faq" className="hover:text-navy transition-colors">
              Preguntas Frecuentes
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-navy-200 text-navy hover:bg-navy-50 font-display font-semibold text-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
              Hablar con Especialista
            </a>
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
                Acceso al Panel
                <ArrowRight className="w-4 h-4 text-teal-400" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Soft Background Glows */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[52rem] h-[26rem] rounded-full bg-teal-400/10 blur-3xl -z-10" />
        <div className="pointer-events-none absolute top-40 -right-20 w-[24rem] h-[24rem] rounded-full bg-navy-100/60 blur-3xl -z-10" />

        {/* Breadcrumb / Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-50 border border-navy-200 text-navy-600 text-xs font-medium mb-6">
          <span className="text-navy-400">Inicio / Servicios /</span>
          <span className="font-semibold text-navy">Páginas Web, Shopify &amp; WooCommerce • Ley N° 21.719</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-navy tracking-[-0.02em] leading-[1.15] max-w-5xl mx-auto">
          Protección de Datos Personales en tu Página Web o Tienda Online —{' '}
          <span className="text-teal-600">100% Ley N° 21.719</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-navy-600 max-w-3xl mx-auto leading-relaxed">
          Evita multas de hasta <strong>20.000 UTM</strong> con la plataforma tecnológica integral diseñada para Shopify, WooCommerce y páginas web en Chile.
        </p>

        <p className="mt-3 text-sm sm:text-base text-navy-500 max-w-3xl mx-auto leading-relaxed">
          Somos desarrolladores de software web: resolvemos la carga técnica que exige la nueva APDP mediante auto-blocking de scripts, prueba legal criptográfica HMAC-SHA256, canal ARSOP+ con OTP y contratos DPA locales.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy font-display font-bold text-base shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
          >
            Solicitar Cotización Formal
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-navy-50 text-navy border border-navy-200 font-display font-semibold text-base transition-all shadow-sm"
          >
            <MessageCircle className="w-5 h-5 text-teal-600" />
            Hablar con Especialista
          </a>
        </div>

        <p className="mt-4 text-xs text-navy-400">
          Inicia antes de la entrada en vigencia de la APDP. Contratación formal por cotización.
        </p>

        {/* 3 Value Pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-7 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-navy mb-2">Multas de hasta 20.000 UTM</h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              Aprox. $1.300M CLP. La Ley 21.719 sanciona duramente el uso no consentido de pixels y la falta de canales formales de atención.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-navy mb-2">Google Consent Mode v2 Oficial</h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              Bloqueo previo de tracking garantizado. Sincronización transparente con Shopify Privacy, Meta Pixel, TikTok y GA4.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-200 flex items-center justify-center text-navy-700 mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-navy mb-2">100% Adaptado a Chile</h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              Diseñado para la realidad local: pasarelas Transbank Webpay, Flow, Mercado Pago y couriers Chilexpress, Starken y Blue Express.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Planes de Cumplimiento Legal (#planes-ley-21719) */}
      <section id="planes-ley-21719" className="py-24 bg-navy-50 border-y border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="eyebrow text-teal-600 mb-2">Contratación por Cotización • Tarifas de Cumplimiento 2026</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
              Planes de Cumplimiento Legal
            </h2>
            <p className="text-navy-500 mt-4 text-base">
              Selecciona el plan adecuado según la escala de tu comercio o cartera de marcas. Todos los servicios se formalizan mediante cotización y acuerdo de encargo legal.
            </p>
          </div>

          {/* Banner Beneficio Exclusivo Cliente Webunica */}
          <div className="max-w-4xl mx-auto mb-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-navy to-navy-900 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-semibold mb-2 border border-teal-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                Beneficio Exclusivo Comunidad Webunica ★ Descuento Permanente
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">
                ¿Ya eres cliente de Webunica? Obtén 30% OFF de por vida
              </h3>
              <p className="text-xs sm:text-sm text-navy-200 max-w-2xl leading-relaxed">
                Si desarrollaste tu página web, tienda online o software con nosotros, accedes de forma preferente y automática a un 30% de descuento vitalicio sobre cualquier plan de la plataforma Ley 21.719.
              </p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 shrink-0 px-6 py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-navy font-display font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Activar con mi 30% de Cliente
            </a>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Plan STARTER */}
            <div className="p-8 rounded-2xl bg-white border border-navy-100 flex flex-col justify-between shadow-sm hover:border-navy-200 transition">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-navy-50 text-navy-700 text-[11px] font-display font-bold uppercase tracking-wider mb-3">
                  Hasta Diciembre: $9.950/mes
                </div>
                <h3 className="font-display font-bold text-2xl text-navy">STARTER</h3>
                <p className="text-xs text-navy-400 mt-1 font-medium">Para 1 Tienda Online o Sitio Web</p>

                <div className="mt-6 mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-4xl text-navy">$9.950</span>
                    <span className="text-xs font-semibold text-navy-400">CLP/mes + IVA</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-1">Precio normal general: $29.990 CLP/mes</p>
                  <p className="text-[11px] text-teal-700 font-semibold mt-0.5">Precio fijado por 12 meses (contratando hasta dic.)</p>
                  <p className="text-[11px] text-navy-400 mt-0.5">O anual general: $119.400 CLP/año (Normal: $299.900)</p>
                </div>

                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 mb-6 text-xs text-teal-900">
                  <span className="font-bold block text-teal-800">Cliente Webunica: 30% OFF DE POR VIDA</span>
                  Solo <strong>$6.965 CLP/mes + IVA</strong> (O plan anual: $83.580 CLP/año)
                </div>

                <ul className="space-y-2.5 text-xs text-navy-700 pt-4 border-t border-navy-100">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span><strong>1 Dominio / Tienda</strong> Shopify, WooCommerce o Web</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span><strong>Tarifa Plana Fija</strong> (Sin límite de visitas ni recargos por Cyber)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Banner Inteligente de Cookies (Google Consent Mode v2)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Auto-blocking previo de Meta Pixel, GA4 y TikTok</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Prueba Legal HMAC-SHA256 (retención 12 meses)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Canal de Derechos ARSOP+ con verificación OTP (Art. 21)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Sello Web de Confianza con código QR verificable</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Política de Privacidad y Cookies dinámicas adaptadas</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Instalación Plug &amp; Play en menos de 5 minutos</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Soporte técnico directo en Chile</span>
                  </li>
                </ul>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block text-center py-3.5 rounded-xl bg-white hover:bg-navy-50 text-navy font-display font-semibold text-xs border border-navy-200 transition"
              >
                Solicitar Cotización STARTER
              </a>
            </div>

            {/* Plan PRO (Recomendado) */}
            <div className="p-8 rounded-2xl bg-white border-2 border-teal-400 shadow-xl shadow-teal-500/10 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-navy text-white text-[11px] font-display font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-sm">
                ⭐ Recomendado • Más Popular
              </div>
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-[11px] font-display font-bold uppercase tracking-wider mb-3">
                  15% OFF OCT - NOV
                </div>
                <h3 className="font-display font-bold text-2xl text-navy">PRO</h3>
                <p className="text-xs text-navy-400 mt-1 font-medium">Marcas en Crecimiento • E-commerce Activos</p>

                <div className="mt-6 mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-4xl text-navy">$50.991</span>
                    <span className="text-xs font-semibold text-navy-400">CLP/mes + IVA</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-1">Precio normal general: $59.990 CLP/mes</p>
                  <p className="text-[11px] text-teal-700 font-semibold mt-0.5">15% OFF contratando en Octubre y Noviembre</p>
                  <p className="text-[11px] text-navy-400 mt-0.5">O anual general: $509.915 CLP/año (Normal: $599.900)</p>
                </div>

                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 mb-6 text-xs text-teal-900">
                  <span className="font-bold block text-teal-800">Cliente Webunica: 30% OFF DE POR VIDA</span>
                  Solo <strong>$35.694 CLP/mes + IVA</strong> (O plan anual: $356.940 CLP/año)
                </div>

                <ul className="space-y-2.5 text-xs text-navy-700 pt-4 border-t border-navy-100">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span><strong>Hasta 3 Tiendas / Dominios</strong> incluidos</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span><strong>Todo lo del Plan Starter</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Prueba Técnica HMAC-SHA256 con retención 3 años</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Logs de auditoría exportables en CSV para la APDP</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Módulo RAT (Registro de Actividades de Tratamiento)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Evaluación de Impacto en Privacidad (EIPD)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Gestor de Incidentes y Brechas con reloj de 72h APDP</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Repositorio Contratos DPA Chile (Transbank, Couriers)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Notificaciones por Email con folios legales formales</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Soporte técnico prioritario local en Chile</span>
                  </li>
                </ul>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block text-center py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy font-display font-bold text-xs shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02]"
              >
                Solicitar Cotización PRO
              </a>
            </div>

            {/* Plan ENTERPRISE */}
            <div className="p-8 rounded-2xl bg-white border border-navy-100 flex flex-col justify-between shadow-sm hover:border-navy-200 transition">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-navy-50 text-navy-700 text-[11px] font-display font-bold uppercase tracking-wider mb-3">
                  15% OFF OCT - NOV
                </div>
                <h3 className="font-display font-bold text-2xl text-navy">ENTERPRISE</h3>
                <p className="text-xs text-navy-400 mt-1 font-medium">Agencias, Retailers &amp; Grandes Marcas</p>

                <div className="mt-6 mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-4xl text-navy">$127.491</span>
                    <span className="text-xs font-semibold text-navy-400">CLP/mes + IVA</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-1">Precio normal general: $149.990 CLP/mes</p>
                  <p className="text-[11px] text-teal-700 font-semibold mt-0.5">15% OFF contratando en Octubre y Noviembre</p>
                  <p className="text-[11px] text-navy-400 mt-0.5">O anual general: $1.266.500 CLP/año (Normal: $1.490.000)</p>
                </div>

                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 mb-6 text-xs text-teal-900">
                  <span className="font-bold block text-teal-800">Cliente Webunica: 30% OFF DE POR VIDA</span>
                  Solo <strong>$89.244 CLP/mes + IVA</strong> (O plan anual: $886.550 CLP/año)
                </div>

                <ul className="space-y-2.5 text-xs text-navy-700 pt-4 border-t border-navy-100">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span><strong>Tiendas y Dominios ILIMITADOS</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span><strong>Todo lo del Plan Pro</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Marca blanca total (sin mención de Webunica)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Gestión multi-usuario con roles para equipos y agencias</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Asesoría técnica de Setup con Oficial de Privacidad (DPO)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Conexión API personalizada para ERP y CRM</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>Auditoría legal técnica anual de cumplimiento</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                    <span>SLA de soporte prioritario 24/7</span>
                  </li>
                </ul>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block text-center py-3.5 rounded-xl bg-white hover:bg-navy-50 text-navy font-display font-semibold text-xs border border-navy-200 transition"
              >
                Solicitar Cotización ENTERPRISE
              </a>
            </div>
          </div>

          {/* Trust Guarantees Row */}
          <div className="mt-14 pt-8 border-t border-navy-200/60 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-white rounded-xl border border-navy-100">
              <span className="text-xl block mb-1">🇨🇱</span>
              <strong className="text-xs font-display font-bold text-navy block">Facturación en Chile</strong>
              <span className="text-[11px] text-navy-400">Factura electrónica afecta a IVA</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-navy-100">
              <span className="text-xl block mb-1">⚡</span>
              <strong className="text-xs font-display font-bold text-navy block">Tarifa Plana en CLP</strong>
              <span className="text-[11px] text-navy-400">Sin recargos por visitas en Cyber</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-navy-100">
              <span className="text-xl block mb-1">🔐</span>
              <strong className="text-xs font-display font-bold text-navy block">Prueba HMAC Inmutable</strong>
              <span className="text-[11px] text-navy-400">Carga de la prueba resuelta</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-navy-100">
              <span className="text-xl block mb-1">🤝</span>
              <strong className="text-xs font-display font-bold text-navy block">Soporte Local Directo</strong>
              <span className="text-[11px] text-navy-400">Por desarrolladores web en Chile</span>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-navy-400 max-w-3xl mx-auto space-y-1">
            <p>
              * Forma de contratación: Por cotización formal emitida por Webunica Chile. El Plan STARTER congela su valor de $9.950 + IVA/mes por 12 meses contratando hasta diciembre de 2026. Los planes PRO y ENTERPRISE incluyen 15% de descuento especial durante octubre y noviembre de 2026.
            </p>
            <p className="text-teal-700 font-semibold">
              ⚖️ Si ya eres cliente de Webunica con un proyecto previo, tu beneficio permanente del 30% de descuento de por vida se aplica de forma preferencial sobre cualquiera de los planes.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Tu tienda protegida en 3 simples pasos (#como-funciona) */}
      <section id="como-funciona" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="eyebrow text-teal-600 mb-2">Puesta en Marcha Inmediata</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
            Tu tienda protegida en 3 simples pasos
          </h2>
          <p className="text-navy-500 mt-4 text-base">
            Sin reuniones interminables ni desarrollos a medida. Un proceso técnico limpio diseñado para dueños y administradores de e-commerce y páginas web.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 01 */}
          <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all relative">
            <div className="text-4xl font-display font-extrabold text-navy-100 mb-4">01</div>
            <h3 className="font-display font-bold text-xl text-navy mb-3">Instala en 2 Minutos</h3>
            <p className="text-sm text-navy-500 leading-relaxed mb-6">
              Pega una sola línea de script en Shopify (<code className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-mono text-xs border border-teal-200">theme.liquid</code>) o instala nuestro plugin oficial para WooCommerce y WordPress.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              Plug &amp; Play • Cero latencia
            </div>
          </div>

          {/* Step 02 */}
          <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all relative">
            <div className="text-4xl font-display font-extrabold text-navy-100 mb-4">02</div>
            <h3 className="font-display font-bold text-xl text-navy mb-3">Auto-Blocking &amp; Prueba HMAC</h3>
            <p className="text-sm text-navy-500 leading-relaxed mb-6">
              El sistema pausa automáticamente Meta Pixel, GA4 y TikTok hasta el consentimiento del usuario, sellando cada decisión con hash HMAC-SHA256.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              Google Consent Mode v2 Activo
            </div>
          </div>

          {/* Step 03 */}
          <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all relative">
            <div className="text-4xl font-display font-extrabold text-navy-100 mb-4">03</div>
            <h3 className="font-display font-bold text-xl text-navy mb-3">Blindaje Legal Continuo</h3>
            <p className="text-sm text-navy-500 leading-relaxed mb-6">
              Quedan activos tu canal ARSOP+ con OTP, el sello web con QR verificable y los modelos DPA para tus couriers locales (Chilexpress, Starken).
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              Carga de la prueba resuelta
            </div>
          </div>
        </div>
      </section>

      {/* Section: Tabla Comparativa (#comparativa) */}
      <section id="comparativa" className="py-24 bg-navy-50 border-t border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="eyebrow text-teal-600 mb-2">Análisis Comparativo de Cumplimiento</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
              ¿Por qué las soluciones genéricas internacionales no son suficientes en Chile?
            </h2>
            <p className="text-navy-500 mt-4 text-base">
              Herramientas como Cookiebot u OneTrust fueron concebidas bajo estándar GDPR europeo. La Ley N° 21.719 de Chile exige formalidades probatorias y operativas específicas que los plugins extranjeros no cubren.
            </p>
          </div>

          {/* Tabla Comparativa estilo Privacity */}
          <div className="overflow-x-auto bg-white rounded-2xl border border-navy-100 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-navy text-white font-display">
                <tr>
                  <th className="p-4 sm:p-5 font-semibold">Criterio Legal / Funcional</th>
                  <th className="p-4 sm:p-5 font-semibold text-navy-200">Plugins Genéricos Extranjeros</th>
                  <th className="p-4 sm:p-5 font-bold text-teal-300 bg-navy-950">
                    Plataforma Webunica Ley N° 21.719
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 font-sans">
                <tr className="hover:bg-navy-50/50">
                  <td className="p-4 sm:p-5 font-medium text-navy">Consentimiento de Cookies</td>
                  <td className="p-4 sm:p-5 text-navy-400">Básico (enfocado en GDPR europeo)</td>
                  <td className="p-4 sm:p-5 font-semibold text-teal-800 bg-teal-50/40">
                    Adaptado a Ley 21.719 y Google Consent Mode v2
                  </td>
                </tr>
                <tr className="hover:bg-navy-50/50">
                  <td className="p-4 sm:p-5 font-medium text-navy">Prueba Legal Criptográfica</td>
                  <td className="p-4 sm:p-5 text-navy-400">Registro simple en base de datos o sin prueba</td>
                  <td className="p-4 sm:p-5 font-semibold text-teal-800 bg-teal-50/40">
                    Token HMAC-SHA256 con timestamp y auditoría inmutable
                  </td>
                </tr>
                <tr className="hover:bg-navy-50/50">
                  <td className="p-4 sm:p-5 font-medium text-navy">Modelo de Precios</td>
                  <td className="p-4 sm:p-5 text-navy-400">En UF y por consumo/visitas (costo impredecible en Cyber)</td>
                  <td className="p-4 sm:p-5 font-semibold text-teal-800 bg-teal-50/40">
                    Tarifa plana fija en Pesos Chilenos (CLP) sin sorpresas
                  </td>
                </tr>
                <tr className="hover:bg-navy-50/50">
                  <td className="p-4 sm:p-5 font-medium text-navy">Canal de Derechos ARSOP+</td>
                  <td className="p-4 sm:p-5 text-navy-400">Se cobra como módulo aparte (~1,5 UF extra) o simple email</td>
                  <td className="p-4 sm:p-5 font-semibold text-teal-800 bg-teal-50/40">
                    Incluido en todos los planes con verificación OTP (Art. 21)
                  </td>
                </tr>
                <tr className="hover:bg-navy-50/50">
                  <td className="p-4 sm:p-5 font-medium text-navy">Notificación Automática de Acuse</td>
                  <td className="p-4 sm:p-5 text-navy-400">No incluye</td>
                  <td className="p-4 sm:p-5 font-semibold text-teal-800 bg-teal-50/40">
                    Acuse legal en 5 días y resolución en 30 días con folio formal
                  </td>
                </tr>
                <tr className="hover:bg-navy-50/50">
                  <td className="p-4 sm:p-5 font-medium text-navy">Contratos de Encargo (DPAs)</td>
                  <td className="p-4 sm:p-5 text-navy-400">Plantillas genéricas en inglés o para la UE</td>
                  <td className="p-4 sm:p-5 font-semibold text-teal-800 bg-teal-50/40">
                    Modelos redactados para Chilexpress, Starken, Transbank, Shopify
                  </td>
                </tr>
                <tr className="hover:bg-navy-50/50">
                  <td className="p-4 sm:p-5 font-medium text-navy">Reporte de Brechas a la APDP</td>
                  <td className="p-4 sm:p-5 text-navy-400">Inexistente</td>
                  <td className="p-4 sm:p-5 font-semibold text-teal-800 bg-teal-50/40">
                    Temporizador legal regresivo de 72 horas y ficha oficial APDP
                  </td>
                </tr>
                <tr className="hover:bg-navy-50/50">
                  <td className="p-4 sm:p-5 font-medium text-navy">Sello Web con QR Verificable</td>
                  <td className="p-4 sm:p-5 text-navy-400">No disponible</td>
                  <td className="p-4 sm:p-5 font-semibold text-teal-800 bg-teal-50/40">
                    Sello oficial de confianza con página pública de validación
                  </td>
                </tr>
                <tr className="hover:bg-navy-50/50">
                  <td className="p-4 sm:p-5 font-medium text-navy">Instalación y Soporte</td>
                  <td className="p-4 sm:p-5 text-navy-400">En inglés, soporte por tickets lejanos</td>
                  <td className="p-4 sm:p-5 font-semibold text-teal-800 bg-teal-50/40">
                    Soporte e instalación directa en Chile por desarrolladores web
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-5 bg-white rounded-xl border border-navy-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-navy-600 text-center sm:text-left">
              Evita depender de plataformas en inglés sin conocimiento de la jurisprudencia y autoridades chilenas (APDP, SERNAC, SII).
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-6 py-2.5 rounded-xl bg-navy hover:bg-navy-800 text-white font-display font-semibold text-xs transition"
            >
              Solicitar Cotización de la Solución
            </a>
          </div>
        </div>
      </section>

      {/* Section: Módulos y Funcionalidades del Sistema (#modulos) */}
      <section id="modulos" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="eyebrow text-teal-600 mb-2">Arquitectura Integral</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
            Módulos y Funcionalidades del Sistema
          </h2>
          <p className="text-navy-500 mt-4 text-base">
            Todo lo que tu página web o tienda online necesita para una gobernanza de datos intachable en un solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-navy mb-1">
                1. Consent Banner Inteligente y No Intrusivo
              </h3>
              <p className="text-xs text-teal-700 font-semibold mb-4">
                Bloqueo previo real de scripts y analítica
              </p>
              <ul className="space-y-3 text-xs text-navy-600">
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Auto-Blocking de Scripts:</strong> Los scripts de Meta Pixel, Google Ads, GA4 y TikTok no disparan eventos hasta que el visitante otorgue consentimiento explícito.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Pestaña Lateral Retráctil:</strong> Diseñado para no estorbar el carrito, checkout, botones de compra ni burbujas de WhatsApp flotantes.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Sin Dark Patterns (Art. 13):</strong> Los botones &apos;Aceptar&apos; y &apos;Rechazar&apos; tienen el mismo peso y visibilidad, cumpliendo estrictamente con el estándar legal chileno.
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-navy-100 flex items-center justify-between text-[11px] text-teal-700 font-bold">
              <span>Módulo incluido</span>
              <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-navy mb-1">
                2. Registro y Prueba Técnica HMAC-SHA256
              </h3>
              <p className="text-xs text-teal-700 font-semibold mb-4">
                La carga de la prueba resuelta ante la APDP
              </p>
              <ul className="space-y-3 text-xs text-navy-600">
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Token Criptográfico HMAC:</strong> Cada decisión de cookies genera un comprobante digital cifrado (proof token) con marca de tiempo inalterable.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Cumplimiento Art. 13 y 24:</strong> Permite exhibir trazabilidad técnica fehaciente ante inspecciones de la Agencia de Protección de Datos Personales.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Logs Exportables en CSV:</strong> Descarga reportes técnicos de auditoría con fecha, hora, estado del consentimiento y hashes de verificación.
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-navy-100 flex items-center justify-between text-[11px] text-teal-700 font-bold">
              <span>Módulo incluido</span>
              <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-navy mb-1">
                3. Portal de Derechos ARSOP+ con OTP (2FA)
              </h3>
              <p className="text-xs text-teal-700 font-semibold mb-4">
                Previene suplantación y automatiza plazos legales
              </p>
              <ul className="space-y-3 text-xs text-navy-600">
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Previene la Suplantación (Art. 21):</strong> Exige un código OTP de 6 dígitos enviado al correo del solicitante para validar que sea el titular legítimo antes de procesar su solicitud.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Automatización de Plazos Legales:</strong> Cumple los 5 días de acuse de recibo y los 30 días de resolución con notificaciones formales enviadas automáticamente.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Gestión de Expedientes:</strong> Panel para tramitar solicitudes de Acceso, Rectificación, Supresión, Oposición, Portabilidad y Bloqueo.
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-navy-100 flex items-center justify-between text-[11px] text-teal-700 font-bold">
              <span>Módulo incluido</span>
              <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-navy mb-1">
                4. Registro de Tratamiento (RAT) y EIPD
              </h3>
              <p className="text-xs text-teal-700 font-semibold mb-4">
                Inventario automatizado según Artículos 24 y 25
              </p>
              <ul className="space-y-3 text-xs text-navy-600">
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Artículos 24 y 25:</strong> Inventario automatizado de qué datos se recopilan en el checkout, con qué bases de licitud y plazos de conservación.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Evaluación de Impacto (EIPD):</strong> Test interactivo y generador del informe formal para presentar inmediatamente ante una inspección de la APDP.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Exportación Ejecutiva:</strong> Descarga reportes técnicos en PDF listos para auditorías internas o requerimientos legales de clientes corporativos.
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-navy-100 flex items-center justify-between text-[11px] text-teal-700 font-bold">
              <span>Módulo incluido</span>
              <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-navy mb-1">
                5. Repositorio de Contratos DPA E-commerce
              </h3>
              <p className="text-xs text-teal-700 font-semibold mb-4">
                Blindaje contractual con couriers y pasarelas
              </p>
              <ul className="space-y-3 text-xs text-navy-600">
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Protección Artículos 15 y 16:</strong> Formaliza la relación con tus encargados de tratamiento chilenos e internacionales, liberando a tu empresa de responsabilidad subsidiaria indebida.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Modelos Específicos para Chile:</strong> Contratos listos para Shopify, Transbank Webpay, Mercado Pago, Flow, Chilexpress, Starken, Blue Express y Shipit.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Gestor Documental Centralizado:</strong> Conserva todos los acuerdos firmados en un solo panel para exhibición inmediata ante la autoridad fiscalizadora.
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-navy-100 flex items-center justify-between text-[11px] text-teal-700 font-bold">
              <span>Módulo incluido</span>
              <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl bg-white border border-navy-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-navy mb-1">
                6. Brechas 72h APDP &amp; Sello con QR
              </h3>
              <p className="text-xs text-teal-700 font-semibold mb-4">
                Gestión perentoria y sello de confianza para ventas
              </p>
              <ul className="space-y-3 text-xs text-navy-600">
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Temporizador Legal 72h APDP:</strong> Reloj regresivo perentorio activado desde la detección de cualquier incidente o filtración de seguridad.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Sello Web con QR Verificable:</strong> Distintivo dinámico en el footer con código QR escaneable que certifica en tiempo real que tu tienda cumple la Ley 21.719.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-navy font-semibold">Mayor Conversión en Checkout:</strong> Brinda tranquilidad inmediata a los compradores primerizos, disminuyendo la fricción y los carritos abandonados.
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-navy-100 flex items-center justify-between text-[11px] text-teal-700 font-bold">
              <span>Módulo incluido</span>
              <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Setup Asistido Box */}
        <div className="mt-14 p-8 rounded-2xl bg-navy-50 border border-navy-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-navy mb-1">
                ¿Prefieres que nuestro equipo técnico lo configure por ti?
              </h3>
              <p className="text-xs sm:text-sm text-navy-600 max-w-2xl leading-relaxed">
                Si no quieres tocar código ni configuraciones en tu sitio web, Shopify o WooCommerce, nuestro equipo audita los scripts activos de tu plataforma, sincroniza pasarelas de pago y couriers, y deja todo 100% operativo en menos de 24 horas.
              </p>
            </div>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy font-display font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            Consultar Setup Asistido
          </a>
        </div>
      </section>

      {/* Section: Preguntas Frecuentes (#faq) */}
      <section id="faq" className="py-24 bg-navy-50 border-t border-navy-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="eyebrow text-teal-600 mb-2">Preguntas Frecuentes</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy tracking-[-0.02em]">
              Preguntas Frecuentes sobre la Ley 21.719 en E-commerce y Sitios Web
            </h2>
            <p className="text-navy-500 mt-4 text-base">
              Resolvemos las principales dudas técnicas, tributarias y operativas sobre la adaptación de tu página web o tienda online en Chile.
            </p>
          </div>

          <div className="space-y-5">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-navy-100 shadow-sm">
              <h3 className="font-display font-bold text-navy text-base sm:text-lg mb-2 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                ¿Afecta la velocidad o carga de mi tienda Shopify o WooCommerce?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed pl-8">
                No. Nuestro script pesa menos de 20 KB y se ejecuta de forma asíncrona (defer), sin impactar el puntaje de Google Core Web Vitals ni la velocidad de carga de tus productos.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-navy-100 shadow-sm">
              <h3 className="font-display font-bold text-navy text-base sm:text-lg mb-2 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                ¿Qué pasa si un usuario solicita que borre sus datos pero tengo facturas emitidas?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed pl-8">
                El sistema incluye la opción de Resolución Fundada de Rechazo Parcial, citando la excepción legal del Servicio de Impuestos Internos (SII) que exige conservar datos tributarios durante 5 años, cumpliendo con la Ley 21.719 sin violar la normativa tributaria chilena.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-navy-100 shadow-sm">
              <h3 className="font-display font-bold text-navy text-base sm:text-lg mb-2 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                ¿Cuánto tiempo toma la instalación?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed pl-8">
                Menos de 5 minutos. Solo requieres pegar una línea de código en el archivo theme.liquid de Shopify o utilizar nuestro plugin para WordPress/WooCommerce. El banner, el formulario y el sello de confianza quedan configurados inmediatamente.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-navy-100 shadow-sm">
              <h3 className="font-display font-bold text-navy text-base sm:text-lg mb-2 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                ¿Cómo se contrata el servicio y cómo funciona el 10% de descuento en octubre?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed pl-8">
                La contratación opera bajo modalidad de cotización formal. Puedes solicitar tu cotización haciendo clic en cualquier botón de la página. Si contratas durante el mes de octubre, se aplica automáticamente un 10% de descuento extra en cualquier modalidad (mensual o anual).
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-navy-100 shadow-sm">
              <h3 className="font-display font-bold text-navy text-base sm:text-lg mb-2 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                ¿A qué multas se expone una tienda online en Chile con la Ley N° 21.719?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed pl-8">
                La nueva Agencia de Protección de Datos Personales (APDP) está facultada para aplicar sanciones de hasta 20.000 UTM (aproximadamente $1.300 millones de pesos chilenos) por infracciones gravísimas, además del daño reputacional y la suspensión del tratamiento de datos comerciales.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-navy-100 shadow-sm">
              <h3 className="font-display font-bold text-navy text-base sm:text-lg mb-2 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                ¿Qué diferencia a Webunica de plugins como Cookiebot u OneTrust?
              </h3>
              <p className="text-sm text-navy-500 leading-relaxed pl-8">
                Las herramientas internacionales solo resuelven el aviso genérico de cookies bajo estándares europeos. No incluyen el canal de derechos ARSOP+ con verificación OTP exigido en Chile, ni los modelos contractuales DPA para couriers locales (Chilexpress, Starken, Blue Express), ni el protocolo de notificación a la APDP en 72 horas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Bottom CTA & Conversion */}
      <section className="py-24 bg-white border-t border-navy-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-6">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            Blindaje Normativo &amp; Certeza Legal
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-5xl text-navy tracking-[-0.02em] leading-tight max-w-4xl mx-auto">
            Adapta tu página web o tienda online a la Ley N° 21.719 hoy mismo
          </h2>

          <p className="mt-6 text-base sm:text-lg text-navy-600 max-w-3xl mx-auto leading-relaxed">
            No esperes a las primeras fiscalizaciones ni arriesgues la reputación de tu marca. Protege los datos de tus clientes, evita multas de la nueva APDP y convierte el cumplimiento legal en un estándar de confianza corporativa.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy font-display font-bold text-base shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
            >
              Solicitar Cotización Formal
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-navy-50 text-navy border border-navy-200 font-display font-semibold text-base transition-all shadow-sm"
            >
              <MessageCircle className="w-5 h-5 text-teal-600" />
              Habla con un especialista por WhatsApp →
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-navy-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Respuesta rápida: Respondemos en menos de 2 horas hábiles.</span>
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
                Secciones
              </h4>
              <ul className="space-y-2.5 text-sm text-navy-300">
                <li>
                  <a href="#planes-ley-21719" className="hover:text-teal-300 transition">
                    Planes de Cumplimiento
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-teal-300 transition">
                    Puesta en Marcha en 3 Pasos
                  </a>
                </li>
                <li>
                  <a href="#comparativa" className="hover:text-teal-300 transition">
                    Comparativa con Plugins
                  </a>
                </li>
                <li>
                  <a href="#modulos" className="hover:text-teal-300 transition">
                    Módulos y Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-teal-300 transition">
                    Preguntas Frecuentes
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider mb-4">
                Plataforma
              </h4>
              <ul className="space-y-2.5 text-sm text-navy-300">
                <li>
                  <a href="https://webunica.cl" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition">
                    Webunica.cl Oficial
                  </a>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-teal-300 transition">
                    Acceso al Panel de Clientes
                  </Link>
                </li>
                <li>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition">
                    Solicitar Cotización
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider mb-4">
                Contacto &amp; Soporte
              </h4>
              <ul className="space-y-2.5 text-sm text-navy-300">
                <li>
                  <a href="mailto:contacto@webunica.cl" className="hover:text-teal-300 transition">
                    contacto@webunica.cl
                  </a>
                </li>
                <li>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition">
                    +56 9 8426 0117 (WhatsApp)
                  </a>
                </li>
                <li>Santiago, Chile</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-14 pt-8 text-xs text-navy-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              &copy; {new Date().getFullYear()} Webúnica SpA. Todos los derechos reservados. Ley N° 21.719 Chile.
            </span>
            <span className="font-display text-navy-400">Hecho en Chile 🇨🇱</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
