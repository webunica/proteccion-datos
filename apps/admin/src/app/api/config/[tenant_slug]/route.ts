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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant_slug: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { tenant_slug } = await params;

    if (!tenant_slug) {
      return NextResponse.json(
        { error: 'Parámetro tenant_slug requerido' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('name, slug, platform, config, is_active')
      .eq('slug', tenant_slug)
      .eq('is_active', true)
      .maybeSingle();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tienda o cliente no encontrado' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const bannerConfig = tenant.config?.banner || {};

    const responseData = {
      name: tenant.name,
      slug: tenant.slug,
      platform: tenant.platform,
      primaryColor: bannerConfig.primaryColor || '#2563eb',
      bannerPosition: bannerConfig.position || 'bottom',
      badgePosition: bannerConfig.badgePosition || 'middle-right',
      badgeStyle: bannerConfig.badgeStyle || 'retracted',
      language: bannerConfig.language || 'es',
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (err) {
    console.error('Widget Config API Error:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
