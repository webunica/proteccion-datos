import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import type { ConsentPostBody } from '@/types/shared';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-service-key';

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: ConsentPostBody = await request.json();
    const { tenant_slug, session_id, categories, policy_version } = body;

    if (!tenant_slug || !session_id || !categories || !policy_version) {
      return NextResponse.json(
        { error: 'Campos requeridos incompletos' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validar existencia de tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', tenant_slug)
      .eq('is_active', true)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tienda/Tenant no encontrado o inactivo' },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Anonimización criptográfica de la dirección IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    const ipHash = hashIP(ip);

    // Generación de Prueba Criptográfica HMAC-SHA256 con Marca de Tiempo (Art. 21 y Carga de la Prueba Ley 21.719)
    const hmacSecret = process.env.IP_HASH_SALT || 'ley21719-consent-hmac-secret-v1';
    const timestamp = Date.now();
    const canonicalPayload = `${tenant.id}:${session_id}:${timestamp}:${JSON.stringify({
      essential: !!categories.essential,
      analytics: !!categories.analytics,
      marketing: !!categories.marketing,
      personalization: !!categories.personalization,
    })}:${policy_version}`;

    const proofToken = crypto
      .createHmac('sha256', hmacSecret)
      .update(canonicalPayload)
      .digest('hex');

    const enhancedCategories = {
      ...categories,
      _proof: {
        hmac: proofToken,
        timestamp,
        algorithm: 'HMAC-SHA256',
        canonical_payload: canonicalPayload,
      },
    };

    const { error: insertError } = await supabase.from('consents').insert({
      tenant_id: tenant.id,
      session_id,
      ip_hash: ipHash,
      categories: enhancedCategories,
      policy_version,
      user_agent: request.headers.get('user-agent'),
    });

    if (insertError) {
      console.error('Error insertando consentimiento:', insertError);
      return NextResponse.json(
        { error: 'Error al registrar consentimiento' },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        proof_token: proofToken,
        timestamp,
        algorithm: 'HMAC-SHA256',
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err) {
    console.error('Consent API Error:', err);
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

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'ley21719-salt-default-secure';
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}
