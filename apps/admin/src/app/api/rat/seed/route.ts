import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-service-key';

  return createClient(supabaseUrl, supabaseServiceKey);
}

const DEFAULT_ECOM_TREATMENTS = [
  {
    name: 'Procesamiento de pedidos y checkout',
    purpose: 'Gestión y cumplimiento de pedidos realizados en la tienda online, incluyendo facturación, despacho y comunicaciones relacionadas.',
    legal_basis: 'contract',
    legal_basis_detail: 'Ejecución del contrato de compraventa celebrado con el titular (Art. 13 a) Ley 21.719)',
    data_categories: ['nombre', 'email', 'teléfono', 'dirección de envío', 'datos de pago (token)', 'historial de pedidos'],
    data_subjects: ['clientes', 'compradores'],
    recipients: ['proveedor de pagos (Transbank/PayPal/Stripe)', 'empresa de logística/courier', 'Shopify Inc. (encargado de tratamiento)'],
    third_countries: ['Estados Unidos (Shopify)'],
    retention_period: '5 años (obligación tributaria SII)',
    security_measures: ['cifrado TLS en tránsito', 'acceso restringido por rol', 'tokenización de datos de pago'],
    risk_level: 'normal',
    requires_eipd: false,
    is_active: true,
    order_index: 1,
  },
  {
    name: 'Gestión de cuentas de clientes',
    purpose: 'Creación y administración de cuentas de usuario para acceso a la tienda, historial de pedidos y preferencias.',
    legal_basis: 'contract',
    legal_basis_detail: 'Ejecución del contrato de servicios / relación precontractual (Art. 13 a) Ley 21.719)',
    data_categories: ['nombre', 'email', 'contraseña (hash)', 'dirección', 'historial de pedidos', 'lista de deseos'],
    data_subjects: ['clientes registrados'],
    recipients: ['Shopify Inc. / WooCommerce (encargado)', 'proveedor de email transaccional'],
    third_countries: ['Estados Unidos'],
    retention_period: 'Mientras la cuenta esté activa + 2 años tras eliminación',
    security_measures: ['cifrado de contraseñas (bcrypt)', 'cifrado TLS', 'autenticación de dos factores opcional'],
    risk_level: 'normal',
    requires_eipd: false,
    is_active: true,
    order_index: 2,
  },
  {
    name: 'Email marketing y newsletters',
    purpose: 'Envío de comunicaciones comerciales, promociones, novedades y contenido de interés a clientes y suscriptores que han dado su consentimiento.',
    legal_basis: 'consent',
    legal_basis_detail: 'Consentimiento expreso del titular para recibir comunicaciones comerciales (Art. 13 b) Ley 21.719)',
    data_categories: ['nombre', 'email', 'preferencias de comunicación', 'historial de interacción con emails'],
    data_subjects: ['clientes suscritos', 'suscriptores newsletter'],
    recipients: ['plataforma de email marketing (Klaviyo/Mailchimp/etc.)'],
    third_countries: ['Estados Unidos'],
    retention_period: 'Hasta revocación del consentimiento + 1 año',
    security_measures: ['cifrado TLS', 'gestión de bajas automática', 'registro de consentimientos'],
    risk_level: 'normal',
    requires_eipd: false,
    is_active: true,
    order_index: 3,
  },
  {
    name: 'Analítica web (Google Analytics / equivalente)',
    purpose: 'Medición del rendimiento del sitio web, comportamiento de usuarios y optimización de la experiencia de compra mediante herramientas de analítica.',
    legal_basis: 'consent',
    legal_basis_detail: 'Consentimiento del titular expresado a través del banner de cookies (Art. 13 b) Ley 21.719)',
    data_categories: ['datos de navegación', 'páginas visitadas', 'tiempo en sitio', 'fuente de tráfico', 'dispositivo (anonimizado)', 'IP (anonimizada)'],
    data_subjects: ['visitantes', 'clientes'],
    recipients: ['Google LLC (Google Analytics)', 'Meta Platforms (si aplica)'],
    third_countries: ['Estados Unidos'],
    retention_period: '26 meses (retención GA4 por defecto)',
    security_measures: ['anonimización de IP', 'consentimiento previo requerido', 'DPA con Google'],
    risk_level: 'normal',
    requires_eipd: false,
    is_active: true,
    order_index: 4,
  },
  {
    name: 'Retargeting y publicidad personalizada',
    purpose: 'Mostrar anuncios personalizados a usuarios que han visitado la tienda, a través de plataformas de publicidad digital.',
    legal_basis: 'consent',
    legal_basis_detail: 'Consentimiento expreso del titular para uso de cookies de marketing (Art. 13 b) Ley 21.719)',
    data_categories: ['ID de dispositivo/cookie', 'comportamiento de navegación', 'productos vistos', 'compras realizadas'],
    data_subjects: ['visitantes', 'clientes'],
    recipients: ['Meta Platforms (Facebook/Instagram Ads)', 'Google Ads', 'TikTok Ads (si aplica)'],
    third_countries: ['Estados Unidos'],
    retention_period: 'Hasta revocación del consentimiento',
    security_measures: ['consentimiento previo requerido (banner)', 'DPA con plataformas publicitarias', 'pixel bloqueado hasta consentimiento'],
    risk_level: 'high',
    requires_eipd: true,
    is_active: true,
    order_index: 5,
  },
  {
    name: 'Atención al cliente y soporte',
    purpose: 'Gestión de consultas, reclamos, devoluciones y comunicaciones de soporte con clientes.',
    legal_basis: 'legitimate_interest',
    legal_basis_detail: 'Interés legítimo del responsable en prestar soporte post-venta y gestionar reclamos (Art. 13 d) Ley 21.719)',
    data_categories: ['nombre', 'email', 'teléfono', 'contenido de la consulta', 'historial de pedidos relevante'],
    data_subjects: ['clientes', 'compradores'],
    recipients: ['herramienta de helpdesk (Zendesk/Freshdesk/etc.)', 'equipo interno de soporte'],
    third_countries: ['Estados Unidos'],
    retention_period: '2 años desde el cierre del caso',
    security_measures: ['acceso restringido al equipo de soporte', 'cifrado TLS', 'política de retención aplicada'],
    risk_level: 'normal',
    requires_eipd: false,
    is_active: true,
    order_index: 6,
  },
  {
    name: 'Logística y envíos',
    purpose: 'Coordinación con proveedores de logística para el despacho de pedidos y seguimiento de envíos.',
    legal_basis: 'contract',
    legal_basis_detail: 'Necesario para la ejecución del contrato de compraventa (Art. 13 a) Ley 21.719)',
    data_categories: ['nombre', 'dirección de envío', 'teléfono de contacto', 'email', 'número de pedido'],
    data_subjects: ['clientes compradores'],
    recipients: ['empresa courier (Chilexpress/Starken/Blue Express/etc.)', 'Correos de Chile (si aplica)'],
    third_countries: [],
    retention_period: '1 año desde la entrega',
    security_measures: ['contrato de encargo de tratamiento con courier', 'datos mínimos necesarios para el envío'],
    risk_level: 'normal',
    requires_eipd: false,
    is_active: true,
    order_index: 7,
  },
  {
    name: 'Gestión de devoluciones y reembolsos',
    purpose: 'Procesamiento de solicitudes de devolución de productos y reembolso de pagos.',
    legal_basis: 'contract',
    legal_basis_detail: 'Obligación legal (Ley 19.496 Protección al Consumidor) y ejecución del contrato (Art. 13 a) Ley 21.719)',
    data_categories: ['nombre', 'email', 'datos bancarios para reembolso (si aplica)', 'motivo de devolución', 'número de pedido'],
    data_subjects: ['clientes compradores'],
    recipients: ['proveedor de pagos', 'banco del cliente'],
    third_countries: [],
    retention_period: '5 años (obligación tributaria SII)',
    security_measures: ['cifrado en tránsito', 'acceso restringido', 'datos de pago no almacenados directamente'],
    risk_level: 'normal',
    requires_eipd: false,
    is_active: true,
    order_index: 8,
  },
];

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { tenant_id, tenant_slug } = body;

    let targetTenantId = tenant_id;

    if (!targetTenantId && tenant_slug) {
      const { data: tenant, error: tErr } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenant_slug)
        .single();

      if (tErr || !tenant) {
        return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
      }
      targetTenantId = tenant.id;
    }

    if (!targetTenantId) {
      return NextResponse.json({ error: 'tenant_id o tenant_slug requerido' }, { status: 400 });
    }

    // Insertar los 8 tratamientos para este tenant
    const toInsert = DEFAULT_ECOM_TREATMENTS.map((t) => ({
      ...t,
      tenant_id: targetTenantId,
    }));

    const { data, error: insertError } = await supabase
      .from('rat_treatments')
      .insert(toInsert)
      .select('id');

    if (insertError) {
      console.error('Error insertando RAT seed:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '8 tratamientos estándar insertados exitosamente',
      insertedCount: data?.length || 8,
    });
  } catch (err: any) {
    console.error('Error in rat seed route:', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
