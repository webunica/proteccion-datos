-- ============================================
-- SEED: Templates de RAT para e-commerce
-- Se insertan como tenant_id = NULL para uso como templates
-- ============================================
-- Nota: Estos templates se copian al crear un nuevo tenant

CREATE TABLE rat_templates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  purpose             TEXT NOT NULL,
  legal_basis         TEXT NOT NULL,
  legal_basis_detail  TEXT,
  data_categories     TEXT[] NOT NULL DEFAULT '{}',
  data_subjects       TEXT[] NOT NULL DEFAULT '{}',
  recipients          TEXT[] NOT NULL DEFAULT '{}',
  third_countries     TEXT[] NOT NULL DEFAULT '{}',
  retention_period    TEXT,
  security_measures   TEXT[] NOT NULL DEFAULT '{}',
  risk_level          TEXT NOT NULL DEFAULT 'normal',
  requires_eipd       BOOLEAN NOT NULL DEFAULT FALSE,
  platform_tags       TEXT[] NOT NULL DEFAULT '{}',
  order_index         INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO rat_templates (name, purpose, legal_basis, legal_basis_detail, data_categories, data_subjects, recipients, retention_period, security_measures, risk_level, platform_tags, order_index) VALUES
(
  'Procesamiento de pedidos y checkout',
  'Gestión y cumplimiento de pedidos realizados en la tienda online, incluyendo facturación, despacho y comunicaciones relacionadas.',
  'contract',
  'Ejecución del contrato de compraventa celebrado con el titular (Art. 13 a) Ley 21.719)',
  ARRAY['nombre', 'email', 'teléfono', 'dirección de envío', 'datos de pago (token)', 'historial de pedidos'],
  ARRAY['clientes', 'compradores'],
  ARRAY['proveedor de pagos (Transbank/PayPal/Stripe)', 'empresa de logística/courier', 'Shopify Inc. (encargado de tratamiento)'],
  '5 años (obligación tributaria)',
  ARRAY['cifrado TLS en tránsito', 'acceso restringido por rol', 'tokenización de datos de pago'],
  'normal',
  ARRAY['shopify', 'woocommerce'],
  1
),
(
  'Gestión de cuentas de clientes',
  'Creación y administración de cuentas de usuario para acceso a la tienda, historial de pedidos y preferencias.',
  'contract',
  'Ejecución del contrato de servicios / relación precontractual (Art. 13 a) Ley 21.719)',
  ARRAY['nombre', 'email', 'contraseña (hash)', 'dirección', 'historial de pedidos', 'lista de deseos'],
  ARRAY['clientes registrados'],
  ARRAY['Shopify Inc. / WooCommerce (encargado)', 'proveedor de email transaccional'],
  'Mientras la cuenta esté activa + 2 años tras eliminación',
  ARRAY['cifrado de contraseñas (bcrypt)', 'cifrado TLS', 'autenticación de dos factores opcional'],
  'normal',
  ARRAY['shopify', 'woocommerce'],
  2
),
(
  'Email marketing y newsletters',
  'Envío de comunicaciones comerciales, promociones, novedades y contenido de interés a clientes y suscriptores que han dado su consentimiento.',
  'consent',
  'Consentimiento expreso del titular para recibir comunicaciones comerciales (Art. 13 b) Ley 21.719)',
  ARRAY['nombre', 'email', 'preferencias de comunicación', 'historial de interacción con emails'],
  ARRAY['clientes suscritos', 'suscriptores newsletter'],
  ARRAY['plataforma de email marketing (Klaviyo/Mailchimp/etc.)'],
  'Hasta revocación del consentimiento + 1 año',
  ARRAY['cifrado TLS', 'gestión de bajas automática', 'registro de consentimientos'],
  'normal',
  ARRAY['shopify', 'woocommerce'],
  3
),
(
  'Analítica web (Google Analytics / equivalente)',
  'Medición del rendimiento del sitio web, comportamiento de usuarios y optimización de la experiencia de compra mediante herramientas de analítica.',
  'consent',
  'Consentimiento del titular expresado a través del banner de cookies (Art. 13 b) Ley 21.719)',
  ARRAY['datos de navegación', 'páginas visitadas', 'tiempo en sitio', 'fuente de tráfico', 'dispositivo (anonimizado)', 'IP (anonimizada)'],
  ARRAY['visitantes', 'clientes'],
  ARRAY['Google LLC (Google Analytics)', 'Meta Platforms (si aplica)'],
  '26 meses (retención GA4 por defecto)',
  ARRAY['anonimización de IP', 'consentimiento previo requerido', 'DPA con Google'],
  'normal',
  ARRAY['shopify', 'woocommerce'],
  4
),
(
  'Retargeting y publicidad personalizada',
  'Mostrar anuncios personalizados a usuarios que han visitado la tienda, a través de plataformas de publicidad digital.',
  'consent',
  'Consentimiento expreso del titular para uso de cookies de marketing (Art. 13 b) Ley 21.719)',
  ARRAY['ID de dispositivo/cookie', 'comportamiento de navegación', 'productos vistos', 'compras realizadas'],
  ARRAY['visitantes', 'clientes'],
  ARRAY['Meta Platforms (Facebook/Instagram Ads)', 'Google Ads', 'TikTok Ads (si aplica)'],
  'Hasta revocación del consentimiento',
  ARRAY['consentimiento previo requerido (banner)', 'DPA con plataformas publicitarias', 'pixel bloqueado hasta consentimiento'],
  'high',
  ARRAY['shopify', 'woocommerce'],
  5
),
(
  'Atención al cliente y soporte',
  'Gestión de consultas, reclamos, devoluciones y comunicaciones de soporte con clientes.',
  'legitimate_interest',
  'Interés legítimo del responsable en prestar soporte post-venta y gestionar reclamos (Art. 13 d) Ley 21.719)',
  ARRAY['nombre', 'email', 'teléfono', 'contenido de la consulta', 'historial de pedidos relevante'],
  ARRAY['clientes', 'compradores'],
  ARRAY['herramienta de helpdesk (Zendesk/Freshdesk/etc.)', 'equipo interno de soporte'],
  '2 años desde el cierre del caso',
  ARRAY['acceso restringido al equipo de soporte', 'cifrado TLS', 'política de retención aplicada'],
  'normal',
  ARRAY['shopify', 'woocommerce'],
  6
),
(
  'Logística y envíos',
  'Coordinación con proveedores de logística para el despacho de pedidos y seguimiento de envíos.',
  'contract',
  'Necesario para la ejecución del contrato de compraventa (Art. 13 a) Ley 21.719)',
  ARRAY['nombre', 'dirección de envío', 'teléfono de contacto', 'email', 'número de pedido'],
  ARRAY['clientes compradores'],
  ARRAY['empresa courier (Chilexpress/Starken/Blue Express/etc.)', 'Correos de Chile (si aplica)'],
  '1 año desde la entrega',
  ARRAY['contrato de encargo de tratamiento con courier', 'datos mínimos necesarios para el envío'],
  'normal',
  ARRAY['shopify', 'woocommerce'],
  7
),
(
  'Gestión de devoluciones y reembolsos',
  'Procesamiento de solicitudes de devolución de productos y reembolso de pagos.',
  'contract',
  'Obligación legal (Ley 19.496 Protección al Consumidor) y ejecución del contrato (Art. 13 a) Ley 21.719)',
  ARRAY['nombre', 'email', 'datos bancarios para reembolso (si aplica)', 'motivo de devolución', 'número de pedido'],
  ARRAY['clientes compradores'],
  ARRAY['proveedor de pagos', 'banco del cliente'],
  '5 años (obligación tributaria)',
  ARRAY['cifrado en tránsito', 'acceso restringido', 'datos de pago no almacenados directamente'],
  'normal',
  ARRAY['shopify', 'woocommerce'],
  8
);
