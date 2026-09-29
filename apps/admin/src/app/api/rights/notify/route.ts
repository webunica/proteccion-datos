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

const RIGHTS_TYPE_LABELS: Record<string, string> = {
  access: 'Acceso a Datos Personales',
  rectify: 'Rectificación de Datos Erróneos o Inexactos',
  suppress: 'Supresión / Eliminación de Datos Personales',
  oppose: 'Oposición al Tratamiento',
  portability: 'Portabilidad de Datos en Formato Estructurado',
  block: 'Bloqueo Temporal de Tratamiento',
};

const STATUS_LABELS: Record<string, string> = {
  received: 'Recibida',
  acknowledged: 'Acuse de Recibo Emitido',
  in_progress: 'En Proceso de Tramitación',
  resolved: 'Resuelta Favorablemente',
  rejected: 'Rechazada con Fundamentación Legal',
};

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      request_id,
      new_status,
      resolution_note,
      send_email = true,
      custom_message = '',
    } = body;

    if (!request_id || !new_status) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (request_id, new_status)' },
        { status: 400 }
      );
    }

    // 1. Obtener la solicitud actual junto con los datos del tenant
    const { data: reqData, error: reqError } = await supabase
      .from('rights_requests')
      .select('*, tenants(name, slug, email_contacto, email_dpo, razon_social, rut_empresa)')
      .eq('id', request_id)
      .single();

    if (reqError || !reqData) {
      return NextResponse.json(
        { error: 'Solicitud ARSOP+ no encontrada' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      status: new_status,
      updated_at: now,
    };

    if (new_status === 'acknowledged' && !reqData.acknowledged_at) {
      updatePayload.acknowledged_at = now;
    }

    if (new_status === 'resolved' || new_status === 'rejected') {
      updatePayload.resolved_at = now;
      if (resolution_note !== undefined) {
        updatePayload.resolution_note = resolution_note;
      }
    } else if (resolution_note) {
      updatePayload.resolution_note = resolution_note;
    }

    // 2. Actualizar en Supabase
    const { error: updateError } = await supabase
      .from('rights_requests')
      .update(updatePayload)
      .eq('id', request_id);

    if (updateError) {
      return NextResponse.json(
        { error: `Error al actualizar solicitud: ${updateError.message}` },
        { status: 500 }
      );
    }

    // 3. Registrar en audit_logs
    await supabase.from('audit_logs').insert({
      tenant_id: reqData.tenant_id,
      action: `rights_request_${new_status}`,
      entity_type: 'rights_request',
      entity_id: request_id,
      metadata: {
        previous_status: reqData.status,
        new_status,
        resolution_note: resolution_note || null,
        email_sent: send_email,
        recipient: reqData.requester_email,
      },
    });

    let emailSent = false;
    let emailDetail = 'No requerido';

    // 4. Enviar notificación por email si corresponde
    if (send_email && reqData.requester_email) {
      const tenant = reqData.tenants || { name: 'Responsable del Tratamiento' };
      const rightName = RIGHTS_TYPE_LABELS[reqData.type] || reqData.type;
      const requesterName = reqData.requester_name || 'Titular de Datos';
      const formattedDate = new Date().toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      let emailSubject = '';
      let emailHtml = '';

      if (new_status === 'acknowledged') {
        emailSubject = `Acuse de Recibo Oficial — Solicitud de ${rightName} (Ley N° 21.719)`;
        emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); border-radius: 12px; padding: 24px; color: white; margin-bottom: 24px;">
              <span style="display: inline-block; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">Comprobante Legal — Ley 21.719</span>
              <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Acuse de Recibo Oficial</h2>
              <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">${tenant.name}</p>
            </div>

            <p style="font-size: 15px;">Estimado/a <strong>${requesterName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              En cumplimiento del <strong>Artículo 21 de la Ley N° 21.719 sobre Protección de Datos Personales de la República de Chile</strong>, acusamos recibo formal de su solicitud de ejercicio de derechos dentro del plazo legal establecido de 5 días hábiles.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; font-size: 13px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748b; width: 150px;">Folio de Radicación:</td><td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #0f172a;">${request_id}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Derecho Solicitado:</td><td style="padding: 6px 0; font-weight: 600; color: #1d4ed8;">${rightName}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Fecha de Recepción:</td><td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${formattedDate}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Plazo Máximo Resolución:</td><td style="padding: 6px 0; font-weight: 700; color: #059669;">30 días corridos (Art. 21 Ley 21.719)</td></tr>
              </table>
            </div>

            ${custom_message ? `<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 13px; color: #1e40af; margin-bottom: 20px;"><strong>Mensaje del Responsable de Datos:</strong><br/>${custom_message}</div>` : ''}

            <p style="font-size: 13px; line-height: 1.6; color: #475569;">
              Su requerimiento ha sido derivado al equipo de Protección de Datos para su análisis y ejecución. Le comunicaremos la resolución formal a esta misma dirección de correo electrónico una vez concluido el procedimiento.
            </p>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <div style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
              <p style="margin: 0 0 4px;"><strong>${tenant.razon_social || tenant.name}</strong> · RUT: ${tenant.rut_empresa || 'N/A'}</p>
              <p style="margin: 0;">Sistema de Gestión de Privacidad y Cumplimiento de la Ley 21.719 de Chile.</p>
            </div>
          </div>
        `;
      } else if (new_status === 'resolved') {
        emailSubject = `Resolución Formal — Solicitud de ${rightName} (Ley N° 21.719) — Folio #${request_id.slice(0, 8)}`;
        emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #059669, #10b981); border-radius: 12px; padding: 24px; color: white; margin-bottom: 24px;">
              <span style="display: inline-block; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">Resolución Legal Concluida</span>
              <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Solicitud Resuelta Favorablemente</h2>
              <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">${tenant.name}</p>
            </div>

            <p style="font-size: 15px;">Estimado/a <strong>${requesterName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Le informamos que su solicitud de ejercicio del derecho de <strong>${rightName}</strong> radicada bajo el folio <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${request_id}</code> ha sido <strong>tramitada y resuelta con éxito</strong> conforme a los Artículos 19 a 23 de la Ley N° 21.719.
            </p>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 20px 0; font-size: 13px;">
              <h4 style="margin: 0 0 10px; color: #166534; font-size: 14px; font-weight: 700;">Detalle de las Acciones Adoptadas:</h4>
              <p style="margin: 0; color: #14532d; white-space: pre-wrap; line-height: 1.6;">${resolution_note || 'Se han aplicado satisfactoriamente las medidas solicitadas sobre sus datos personales en nuestras bases de datos y sistemas de encargados de tratamiento.'}</p>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; font-size: 12px; color: #64748b; line-height: 1.5; margin: 20px 0;">
              <strong>Derechos ante la Agencia de Protección de Datos Personales (APDP):</strong><br/>
              Si usted no estuviese conforme con la resolución adoptada o considerare que sus derechos han sido vulnerados, la Ley N° 21.719 le asiste el derecho de interponer la acción de tutela ante la Agencia de Protección de Datos Personales dentro del plazo legal.
            </div>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <div style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
              <p style="margin: 0 0 4px;"><strong>${tenant.razon_social || tenant.name}</strong> · DPO Contacto: ${tenant.email_dpo || tenant.email_contacto}</p>
              <p style="margin: 0;">Resolución dictada conforme a la Ley 21.719 de Protección de Datos Personales de Chile.</p>
            </div>
          </div>
        `;
      } else if (new_status === 'rejected') {
        emailSubject = `Resolución Fundada — Solicitud de ${rightName} (Ley N° 21.719) — Folio #${request_id.slice(0, 8)}`;
        emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #b91c1c, #dc2626); border-radius: 12px; padding: 24px; color: white; margin-bottom: 24px;">
              <span style="display: inline-block; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">Notificación Formal — Ley 21.719</span>
              <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Resolución de Solicitud</h2>
              <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">${tenant.name}</p>
            </div>

            <p style="font-size: 15px;">Estimado/a <strong>${requesterName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              En relación a su solicitud de ejercicio del derecho de <strong>${rightName}</strong> (Folio <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${request_id}</code>), comunicamos a usted la resolución fundada adoptada por la organización conforme al Artículo 22 de la Ley N° 21.719:
            </p>

            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px; margin: 20px 0; font-size: 13px;">
              <h4 style="margin: 0 0 10px; color: #991b1b; font-size: 14px; font-weight: 700;">Fundamentos de la Decisión:</h4>
              <p style="margin: 0; color: #7f1d1d; white-space: pre-wrap; line-height: 1.6;">${resolution_note || 'La solicitud no puede ser atendida total o parcialmente por encontrarse los datos amparados en obligaciones legales de conservación tributaria/comercial o vigencia de contrato contractual activo.'}</p>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; font-size: 12px; color: #64748b; line-height: 1.5; margin: 20px 0;">
              <strong>Derechos y Vías de Reclamación:</strong><br/>
              Conforme al Artículo 48 de la Ley N° 21.719, usted tiene derecho a reclamar la presente decisión ante la <strong>Agencia de Protección de Datos Personales (APDP)</strong> dentro de los plazos establecidos por el procedimiento de tutela de derechos.
            </div>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <div style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
              <p style="margin: 0 0 4px;"><strong>${tenant.razon_social || tenant.name}</strong> · Contacto DPO: ${tenant.email_dpo || tenant.email_contacto}</p>
              <p style="margin: 0;">Comunicación emitida conforme a la Ley 21.719 de Protección de Datos Personales de Chile.</p>
            </div>
          </div>
        `;
      }

      if (emailSubject && emailHtml && process.env.RESEND_API_KEY) {
        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || 'notificaciones@privacy.tudominio.com',
              to: [reqData.requester_email],
              subject: emailSubject,
              html: emailHtml,
            }),
          });

          if (resendRes.ok) {
            emailSent = true;
            emailDetail = 'Enviado exitosamente vía Resend';
          } else {
            const errData = await resendRes.json();
            emailDetail = `Error en Resend: ${errData?.message || 'Error desconocido'}`;
          }
        } catch (mailErr: any) {
          emailDetail = `Falla en transporte: ${mailErr?.message || mailErr}`;
        }
      } else if (!process.env.RESEND_API_KEY) {
        emailSent = true;
        emailDetail = 'Simulado (RESEND_API_KEY no configurada)';
      }
    }

    return NextResponse.json({
      success: true,
      status: new_status,
      email_sent: emailSent,
      email_detail: emailDetail,
      message: `Solicitud actualizada a ${STATUS_LABELS[new_status] || new_status}`,
    });
  } catch (err: any) {
    console.error('Rights notify error:', err);
    return NextResponse.json(
      { error: 'Error interno al procesar notificación', detail: err?.message },
      { status: 500 }
    );
  }
}
