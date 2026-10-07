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

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant_slug: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { tenant_slug } = await params;

    if (!tenant_slug) {
      return NextResponse.json({ error: 'tenant_slug requerido' }, { status: 400, headers: corsHeaders() });
    }

    // 1. Obtener datos del tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, slug, website, shop_domain, platform, is_active')
      .eq('slug', tenant_slug)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404, headers: corsHeaders() });
    }

    // 2. Verificar datos en base de datos
    // A. Tratamientos RAT
    const { count: ratCount } = await supabase
      .from('rat_treatments')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id);

    // B. Política de privacidad
    const { data: policy } = await supabase
      .from('privacy_policies')
      .select('id, version, is_active')
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .maybeSingle();

    // 3. Inspeccionar Storefront en vivo
    let targetUrl = tenant.website;
    if (!targetUrl && tenant.shop_domain) {
      targetUrl = `https://${tenant.shop_domain}`;
    }

    let widgetDetected = false;
    let rightsFormDetected = false;
    let privacyLinkDetected = false;
    const detectedTrackers: string[] = [];
    let crawlSuccess = false;

    if (targetUrl) {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Ley21719ComplianceBot/1.0 (Storefront Privacy Auditor; Chile)',
          },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          crawlSuccess = true;
          const html = await res.text();

          // Detección de widget
          if (html.includes('widget.js') || html.includes(`data-tenant="${tenant.slug}"`) || html.includes('LEY21719')) {
            widgetDetected = true;
          }

          // Detección de ARSOP+ o enlace a privacidad
          if (html.includes('ley21719-rights-form') || html.includes('politica-de-privacidad') || html.includes('privacy')) {
            privacyLinkDetected = true;
          }
          if (html.includes('ley21719-rights-form') || html.includes('data-ley21719-rights')) {
            rightsFormDetected = true;
          }

          // Detección de rastreadores conocidos
          if (html.includes('googletagmanager.com') || html.includes('gtm.js')) detectedTrackers.push('Google Tag Manager (GTM)');
          if (html.includes('google-analytics.com') || html.includes('gtag/js')) detectedTrackers.push('Google Analytics (GA4)');
          if (html.includes('connect.facebook.net') || html.includes('fbevents.js')) detectedTrackers.push('Meta Pixel (Facebook/Instagram)');
          if (html.includes('analytics.tiktok.com')) detectedTrackers.push('TikTok Pixel');
          if (html.includes('klaviyo.com')) detectedTrackers.push('Klaviyo Tracking');
          if (html.includes('hotjar.com')) detectedTrackers.push('Hotjar');
        }
      } catch (crawlErr) {
        console.warn('Crawl no completado para:', targetUrl, crawlErr);
      }
    }

    // 4. Calcular Score de Cumplimiento Ponderado
    const checks = [
      {
        id: 'cmp_widget',
        title: 'Banner CMP de Cookies Activo',
        description: 'Verifica la carga del script universal para bloqueo y consentimiento previo de cookies.',
        passed: widgetDetected,
        weight: 25,
      },
      {
        id: 'policy',
        title: 'Política de Privacidad Conforme a Ley 21.719',
        description: 'Declaración pública y vigente de derechos y finalidades legales.',
        passed: !!policy || privacyLinkDetected,
        weight: 25,
      },
      {
        id: 'rat',
        title: 'Registro de Tratamientos RAT (Mín. 5)',
        description: 'Inventario de tratamientos de e-commerce según Art. 13 de la Ley.',
        passed: (ratCount || 0) >= 5,
        weight: 25,
      },
      {
        id: 'arsop',
        title: 'Canal de Ejercicio de Derechos ARSOP+',
        description: 'Mecanismo disponible para solicitudes de acceso, supresión y oposición.',
        passed: rightsFormDetected || widgetDetected,
        weight: 25,
      },
    ];

    const totalScore = checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0);

    const result = {
      tenant_name: tenant.name,
      tenant_slug: tenant.slug,
      target_url: targetUrl || 'No configurada',
      crawl_success: crawlSuccess,
      audited_at: new Date().toISOString(),
      score: totalScore,
      verdict: totalScore >= 75 ? 'Cumplimiento Alto' : totalScore >= 50 ? 'Cumplimiento Parcial' : 'Requiere Atención Urgente',
      checks,
      detected_trackers: detectedTrackers,
      recommendations: [
        !widgetDetected ? 'Instala el script de widget.js en el layout theme.liquid de Shopify.' : null,
        (ratCount || 0) < 5 ? `Faltan tratamientos en el RAT: actualmente tienes ${ratCount || 0} de los 5 mínimos sugeridos para e-commerce.` : null,
        (!rightsFormDetected && !widgetDetected) ? 'Crea la página /pages/derechos-arsop en tu tienda con el shortcode o div del formulario.' : null,
      ].filter(Boolean),
    };

    return NextResponse.json(result, { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('Audit API Error:', err);
    return NextResponse.json({ error: 'Error al ejecutar auditoría' }, { status: 500, headers: corsHeaders() });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
