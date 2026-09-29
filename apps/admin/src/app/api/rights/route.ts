import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { RightsRequestPostBody } from '@/types/shared';

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
    const body: RightsRequestPostBody = await request.json();
    const { tenant_slug, type, requester_email, requester_name, requester_rut, description } = body;

    if (!tenant_slug || !type || !requester_email) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (tenant_slug, type, requester_email)' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const validTypes = ['access', 'rectify', 'suppress', 'oppose', 'portability', 'block'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Tipo de derecho no válido: ${type}` },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Buscar tenant por slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, email_contacto, email_dpo')
      .eq('slug', tenant_slug)
      .eq('is_active', true)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tienda/Tenant no encontrado o inactivo' },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Insertar solicitud en base de datos
    const { data: inserted, error: insertError } = await supabase
      .from('rights_requests')
      .insert({
        tenant_id: tenant.id,
        type,
        requester_email,
        requester_name: requester_name || null,
        requester_rut: requester_rut || null,
        description: description || null,
        status: 'received',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error insertando solicitud ARSOP+:', insertError);
      return NextResponse.json(
        { error: 'No se pudo registrar la solicitud' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Registro de auditoría
    await supabase.from('audit_logs').insert({
      tenant_id: tenant.id,
      action: 'rights_request_created',
      entity_type: 'rights_request',
      entity_id: inserted.id,
      metadata: {
        type,
        requester_email,
      },
    });

    // Envío de email de acuse de recibo y alerta a DPO si está configurado Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await sendAcknowledgementEmail({
          to: requester_email,
          requesterName: requester_name || 'Estimado/a titular',
          storeName: tenant.name,
          requestId: inserted.id,
          requestType: type,
        });

        // Actualizar automáticamente a acuse confirmado
        await supabase
          .from('rights_requests')
          .update({
            status: 'acknowledged',
            acknowledged_at: new Date().toISOString(),
          })
          .eq('id', inserted.id);

        // Notificar al DPO o contacto de la tienda
        const dpoEmail = tenant.email_dpo || tenant.email_contacto;
        if (dpoEmail) {
          await sendDpoAlertEmail({
            to: dpoEmail,
            storeName: tenant.name,
            requestId: inserted.id,
            requestType: type,
            requesterEmail: requester_email,
            requesterName: requester_name || 'No especificado',
            requesterRut: requester_rut || 'No especificado',
            description: description || 'Sin detalle adicional',
          });
        }
      } catch (mailErr) {
        console.warn('Advertencia: No se pudo enviar el email de acuse:', mailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud registrada correctamente. Se acusará recibo dentro de 5 días hábiles.',
        request_id: inserted.id,
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err) {
    console.error('Rights API Error:', err);
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

async function sendAcknowledgementEmail({
  to,
  requesterName,
  storeName,
  requestId,
  requestType,
}: {
  to: string;
  requesterName: string;
  storeName: string;
  requestId: string;
  requestType: string;
}) {
  const typeMap: Record<string, string> = {
    access: 'Acceso a Datos Personales',
    rectify: 'Rectificación de Datos',
    suppress: 'Supresión / Eliminación de Datos',
    oppose: 'Oposición al Tratamiento',
    portability: 'Portabilidad de Datos',
    block: 'Bloqueo Temporal de Datos',
  };

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'notificaciones@privacy.tudominio.com',
      to: [to],
      subject: `Acuse de recibo — Solicitud de derechos Ley 21.719 (${storeName})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827;">
          <h2 style="color: #1d4ed8;">Acuse de Recibo — Solicitud de Derechos</h2>
          <p>Hola <strong>${requesterName}</strong>,</p>
          <p>Confirmamos la recepción de tu solicitud conforme a la <strong>Ley 21.719 de Protección de Datos Personales de Chile</strong> ante <strong>${storeName}</strong>.</p>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>ID de seguimiento:</strong> <code>${requestId}</code></p>
            <p style="margin: 0 0 8px;"><strong>Tipo de derecho:</strong> ${typeMap[requestType] || requestType}</p>
            <p style="margin: 0;"><strong>Plazo de resolución:</strong> Máximo 30 días hábiles.</p>
          </div>
          <p style="font-size: 13px; color: #6b7280;">Te notificaremos a esta misma casilla de correo electrónico una vez que tu solicitud haya sido resuelta o si requerimos información adicional para verificar tu identidad.</p>
        </div>
      `,
    }),
  });
}

async function sendDpoAlertEmail({
  to,
  storeName,
  requestId,
  requestType,
  requesterEmail,
  requesterName,
  requesterRut,
  description,
}: {
  to: string;
  storeName: string;
  requestId: string;
  requestType: string;
  requesterEmail: string;
  requesterName: string;
  requesterRut: string;
  description: string;
}) {
  const typeMap: Record<string, string> = {
    access: 'Acceso a Datos Personales',
    rectify: 'Rectificación de Datos',
    suppress: 'Supresión / Eliminación de Datos',
    oppose: 'Oposición al Tratamiento',
    portability: 'Portabilidad de Datos',
    block: 'Bloqueo Temporal de Datos',
  };

  const portalUrl = process.env.NEXT_PUBLIC_WIDGET_URL || 'https://proteccion-datos-admin.vercel.app';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'notificaciones@privacy.tudominio.com',
      to: [to],
      subject: `🚨 [ALERTA DPO] Nueva solicitud ARSOP+ (${storeName}) — ${typeMap[requestType] || requestType}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827;">
          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #1e40af; font-size: 16px;">Nueva Solicitud ARSOP+ Recibida</h3>
            <p style="margin: 4px 0 0; color: #3b82f6; font-size: 13px;">Tienda: <strong>${storeName}</strong></p>
          </div>
          <p>Se ha registrado una nueva solicitud de ejercicio de derechos bajo la <strong>Ley 21.719</strong>:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
            <tr><td style="padding: 6px; font-weight: bold; width: 140px;">Tipo de Derecho:</td><td style="padding: 6px; color: #2563eb; font-weight: bold;">${typeMap[requestType] || requestType}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Titular:</td><td style="padding: 6px;">${requesterName}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Email:</td><td style="padding: 6px;">${requesterEmail}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">RUT:</td><td style="padding: 6px;">${requesterRut}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Descripción:</td><td style="padding: 6px;">${description}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Plazo de Resolución:</td><td style="padding: 6px; color: #dc2626; font-weight: bold;">Máximo 30 días hábiles</td></tr>
          </table>
          <div style="margin-top: 24px;">
            <a href="${portalUrl}/dashboard/rights" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold;">
              Tramitar Solicitud en el Panel →
            </a>
          </div>
          <p style="font-size: 11px; color: #9ca3af; margin-top: 24px;">Notificación automática enviada conforme a la Ley 21.719 de Protección de Datos Personales de Chile.</p>
        </div>
      `,
    }),
  });
}
