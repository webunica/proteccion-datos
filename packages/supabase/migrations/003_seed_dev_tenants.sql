-- ============================================
-- SEED: 3 Tenants de desarrollo/prueba
-- Solo para entorno de desarrollo
-- ============================================

INSERT INTO tenants (slug, name, platform, shop_domain, rut_empresa, razon_social, email_contacto, website, plan) VALUES
(
  'tienda-demo-shopify',
  'Tienda Demo Shopify',
  'shopify',
  'tienda-demo.myshopify.com',
  '76.123.456-7',
  'Demo Shopify SpA',
  'admin@demo-shopify.cl',
  'https://tienda-demo.cl',
  'pro'
),
(
  'tienda-demo-woo',
  'Tienda Demo WooCommerce',
  'woocommerce',
  NULL,
  '76.234.567-8',
  'Demo WooCommerce Ltda.',
  'admin@demo-woo.cl',
  'https://tienda-demo-woo.cl',
  'basic'
),
(
  'tienda-demo-otro',
  'Tienda Demo Custom',
  'other',
  NULL,
  '76.345.678-9',
  'Demo Custom SRL',
  'admin@demo-custom.cl',
  'https://tienda-demo-custom.cl',
  'basic'
);
