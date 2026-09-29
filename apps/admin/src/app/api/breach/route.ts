import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tenant_id,
      title,
      detected_at,
      description,
      affected_count,
      data_types,
      risk_level,
      resolution_notes,
    } = body;

    if (!tenant_id || !title || !detected_at || !description || !risk_level) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios para registrar la brecha' },
        { status: 400 }
      );
    }

    const { data: incident, error } = await supabase
      .from('breach_incidents')
      .insert({
        tenant_id,
        title,
        detected_at: new Date(detected_at).toISOString(),
        description,
        affected_count: affected_count ? Number(affected_count) : null,
        data_types: Array.isArray(data_types) ? data_types : [],
        risk_level,
        status: 'open',
        resolution_notes: resolution_notes || null,
        notified_apdp: false,
        notified_holders: false,
      })
      .select('*, tenants(name, slug)')
      .single();

    if (error) {
      console.error('Error al insertar brecha:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Registro en auditoría
    await supabase.from('audit_logs').insert({
      tenant_id,
      user_id: user.id,
      action: 'breach_incident_reported',
      entity_type: 'breach_incident',
      entity_id: incident.id,
      metadata: {
        title,
        risk_level,
        detected_at,
      },
    });

    return NextResponse.json({ success: true, data: incident }, { status: 201 });
  } catch (err) {
    console.error('Breach POST Error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, notified_apdp, apdp_reference, status, resolution_notes, notified_holders } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de incidente requerido' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof notified_apdp === 'boolean') {
      updatePayload.notified_apdp = notified_apdp;
      if (notified_apdp) {
        updatePayload.notified_apdp_at = new Date().toISOString();
      }
    }

    if (apdp_reference !== undefined) {
      updatePayload.apdp_reference = apdp_reference;
    }

    if (status !== undefined) {
      updatePayload.status = status;
    }

    if (resolution_notes !== undefined) {
      updatePayload.resolution_notes = resolution_notes;
    }

    if (typeof notified_holders === 'boolean') {
      updatePayload.notified_holders = notified_holders;
      if (notified_holders) {
        updatePayload.notified_holders_at = new Date().toISOString();
      }
    }

    const { data: updated, error } = await supabase
      .from('breach_incidents')
      .update(updatePayload)
      .eq('id', id)
      .select('*, tenants(name, slug)')
      .single();

    if (error) {
      console.error('Error al actualizar brecha:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Registro de auditoría
    await supabase.from('audit_logs').insert({
      tenant_id: updated.tenant_id,
      user_id: user.id,
      action: 'breach_incident_updated',
      entity_type: 'breach_incident',
      entity_id: id,
      metadata: updatePayload,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('Breach PATCH Error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
