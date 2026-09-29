import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function computeSignature(message: string): string {
  const secret = process.env.IP_HASH_SALT || 'ley21719-otp-secret-key-32chars';
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tenant_slug, email, requester_name, otp_code, otp_token } = body;

    if (action === 'send') {
      if (!tenant_slug || !email) {
        return NextResponse.json(
          { error: 'tenant_slug y email son obligatorios' },
          { status: 400, headers: corsHeaders() }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Formato de correo electrónico no válido' },
          { status: 400, headers: corsHeaders() }
        );
      }

      const supabase = getAdminClient();
      const { data: tenant } = await supabase
        .from('tenants')
        .select('name')
        .eq('slug', tenant_slug)
        .eq('is_active', true)
        .maybeSingle();

      const storeName = tenant?.name || 'la tienda';

      // Código numérico seguro de 6 dígitos
      const code = String(crypto.randomInt(100000, 1000000));
      const expiry = Date.now() + 15 * 60 * 1000; // 15 minutos
      const normalizedEmail = email.toLowerCase().trim();
      const signature = computeSignature(`${normalizedEmail}:${code}:${expiry}`);
      const token = `${expiry}.${signature}`;

      // Enviar correo con Resend si está configurado
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || 'notificaciones@privacy.tudominio.com',
              to: [normalizedEmail],
              subject: `Código de verificación de identidad: ${code} — Ley 21.719 (${storeName})`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #111827;">
                  <div style="background: linear-gradient(135deg, #1d4ed8, #2563eb); border-radius: 12px; padding: 20px; color: white; text-align: center; margin-bottom: 24px;">
                    <h2 style="margin: 0; font-size: 20px;">Verificación de Identidad — Ley 21.719</h2>
                    <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">${storeName}</p>
                  </div>
                  <p>Hola <strong>${requester_name || 'Titular de Datos'}</strong>,</p>
                  <p>Para procesar con seguridad tu solicitud de ejercicio de derechos conforme al <strong>Artículo 21 de la Ley 21.719</strong> y prevenir la suplantación de identidad, ingresa el siguiente código de verificación:</p>
                  
                  <div style="text-align: center; margin: 28px 0;">
                    <div style="display: inline-block; background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px 36px; font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e3a8a;">
                      ${code}
                    </div>
                    <p style="color: #64748b; font-size: 12px; margin-top: 8px;">Este código es de un solo uso y expirará en 15 minutos.</p>
                  </div>

                  <p style="font-size: 13px; color: #475569;">Si tú no iniciaste esta solicitud de derechos de protección de datos, puedes desestimar este mensaje; tus datos no serán modificados ni eliminados.</p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                  <p style="font-size: 11px; color: #94a3b8; text-align: center;">Sistema de Cumplimiento Ley 21.719 de Protección de Datos Personales de la República de Chile.</p>
                </div>
              `,
            }),
          });
        } catch (mailErr) {
          console.warn('Error enviando email OTP:', mailErr);
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Código de verificación generado y enviado.',
          otp_token: token,
          expires_at: expiry,
        },
        { status: 200, headers: corsHeaders() }
      );
    }

    if (action === 'verify') {
      if (!email || !otp_code || !otp_token) {
        return NextResponse.json(
          { valid: false, error: 'Faltan parámetros requeridos (email, otp_code, otp_token)' },
          { status: 400, headers: corsHeaders() }
        );
      }

      const parts = String(otp_token).split('.');
      if (parts.length !== 2) {
        return NextResponse.json(
          { valid: false, error: 'Token de verificación no válido' },
          { status: 400, headers: corsHeaders() }
        );
      }

      const [expiryStr, receivedSignature] = parts;
      const expiry = Number(expiryStr);

      if (Date.now() > expiry) {
        return NextResponse.json(
          { valid: false, error: 'El código ha expirado. Por favor solicita uno nuevo.' },
          { status: 400, headers: corsHeaders() }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();
      const expectedSignature = computeSignature(`${normalizedEmail}:${otp_code.trim()}:${expiryStr}`);

      if (expectedSignature !== receivedSignature) {
        return NextResponse.json(
          { valid: false, error: 'Código de verificación incorrecto' },
          { status: 400, headers: corsHeaders() }
        );
      }

      return NextResponse.json(
        { valid: true, message: 'Identidad verificada exitosamente' },
        { status: 200, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { error: 'Acción no soportada. Use "send" o "verify".' },
      { status: 400, headers: corsHeaders() }
    );
  } catch (err) {
    console.error('OTP API error:', err);
    return NextResponse.json(
      { error: 'Error interno en la verificación OTP' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
