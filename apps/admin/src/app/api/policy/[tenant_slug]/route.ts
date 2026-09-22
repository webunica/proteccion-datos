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

    // Buscar el tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, razon_social, rut_empresa, email_contacto, email_dpo, address, website')
      .eq('slug', tenant_slug)
      .eq('is_active', true)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tienda o cliente no encontrado' },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Buscar política de privacidad activa
    const { data: policy, error: policyError } = await supabase
      .from('privacy_policies')
      .select('id, version, content_html, effective_date')
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .order('effective_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (policyError) {
      console.error('Error buscando política:', policyError);
      return NextResponse.json(
        { error: 'Error al obtener la política' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Si ya existe una política activa registrada, devolverla
    if (policy) {
      return NextResponse.json(
        {
          tenant_name: tenant.name,
          version: policy.version,
          effective_date: policy.effective_date,
          content_html: policy.content_html,
        },
        { status: 200, headers: corsHeaders() }
      );
    }

    // Si aún no se ha guardado una política personalizada, generar el template dinámico estándar conforme a Ley 21.719
    const generatedHtml = generateDefaultPolicyHtml(tenant);

    return NextResponse.json(
      {
        tenant_name: tenant.name,
        version: '1.0-auto',
        effective_date: new Date().toISOString().split('T')[0],
        content_html: generatedHtml,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (err) {
    console.error('Policy API Error:', err);
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  };
}

function generateDefaultPolicyHtml(tenant: {
  name: string;
  razon_social: string | null;
  rut_empresa: string | null;
  email_contacto: string;
  email_dpo: string | null;
  address: string | null;
  website: string | null;
}): string {
  const companyName = tenant.razon_social || tenant.name;
  const rut = tenant.rut_empresa || '[RUT Empresa]';
  const email = tenant.email_contacto;
  const dpoContact = tenant.email_dpo ? `<p><strong>Delegado/Encargado de Protección de Datos:</strong> ${tenant.email_dpo}</p>` : '';
  const dateStr = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <div class="ley21719-privacy-policy" style="line-height: 1.6; color: #374151; max-width: 800px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="color: #111827; font-size: 28px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">Política de Privacidad y Tratamiento de Datos Personales</h1>
      <p><em>Conforme a la Ley N° 21.719 de Protección de Datos Personales de la República de Chile</em></p>
      <p><strong>Última actualización:</strong> ${dateStr}</p>

      <h2 style="color: #1f2937; font-size: 20px; margin-top: 24px;">1. Identificación del Responsable del Tratamiento</h2>
      <p>El responsable del tratamiento de sus datos personales recopilados a través de esta plataforma es <strong>${companyName}</strong>, RUT N° <strong>${rut}</strong>${tenant.address ? `, con domicilio en ${tenant.address}` : ''}.</p>
      <p><strong>Correo electrónico de contacto para privacidad:</strong> <a href="mailto:${email}">${email}</a></p>
      ${dpoContact}

      <h2 style="color: #1f2937; font-size: 20px; margin-top: 24px;">2. Datos Personales que Recopilamos</h2>
      <p>Recopilamos y tratamos las siguientes categorías de datos personales:</p>
      <ul>
        <li><strong>Datos identificatorios y de contacto:</strong> Nombre completo, correo electrónico, número telefónico y domicilio o dirección de despacho.</li>
        <li><strong>Datos de transacciones y pedidos:</strong> Historial de compras, productos adquiridos y registros de facturación o boleta electrónica.</li>
        <li><strong>Datos de pago:</strong> Los pagos son procesados de forma segura mediante pasarelas de pago certificadas (PCI-DSS). Nosotros no almacenamos números de tarjetas de crédito o débito en nuestros servidores.</li>
        <li><strong>Datos de navegación y cookies:</strong> Dirección IP anonimizada, identificadores de sesión, preferencias de navegación y analíticas con sujeción a su consentimiento previo.</li>
      </ul>

      <h2 style="color: #1f2937; font-size: 20px; margin-top: 24px;">3. Finalidades y Bases de Licitud (Art. 13 Ley 21.719)</h2>
      <ul>
        <li><strong>Ejecución del contrato de compraventa y despacho:</strong> Tratamos sus datos para procesar pedidos, despachar productos y gestionar garantías. <em>(Base legal: Art. 13 a) Ejecución de contrato).</em></li>
        <li><strong>Comunicaciones comerciales y newsletters:</strong> Envío de ofertas y novedades únicamente a quienes hayan otorgado su consentimiento explícito y previo. <em>(Base legal: Art. 13 b) Consentimiento libre e informado).</em></li>
        <li><strong>Cumplimiento de obligaciones legales y tributarias:</strong> Emisión de boletas/facturas electrónicas ante el SII y custodia tributaria legal. <em>(Base legal: Art. 13 c) Obligación legal).</em></li>
        <li><strong>Soporte al cliente y prevención de fraudes:</strong> Atención de consultas y seguridad de la tienda. <em>(Base legal: Art. 13 d) Interés legítimo).</em></li>
      </ul>

      <h2 style="color: #1f2937; font-size: 20px; margin-top: 24px;">4. Destinatarios y Encargados del Tratamiento</h2>
      <p>Sus datos pueden ser compartidos exclusivamente con proveedores de servicios necesarios para la operación de la tienda (encargados de tratamiento), tales como empresas de courier logístico, pasarelas de pago y proveedores de infraestructura en la nube, todos sujetos a cláusulas contractuales de estricta confidencialidad y seguridad de datos.</p>

      <h2 style="color: #1f2937; font-size: 20px; margin-top: 24px;">5. Derechos del Titular (Derechos ARSOP+)</h2>
      <p>Conforme a la Ley 21.719, usted puede ejercer en cualquier momento sus derechos de:</p>
      <ul>
        <li><strong>Acceso:</strong> Solicitar confirmación y copia de sus datos tratados.</li>
        <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos.</li>
        <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios para los fines contratados.</li>
        <li><strong>Oposición:</strong> Oponerse a tratamientos basados en interés legítimo o mercadotecnia directa.</li>
        <li><strong>Portabilidad:</strong> Obtener sus datos en formato estructurado e interoperable.</li>
        <li><strong>Bloqueo:</strong> Suspender temporalmente el tratamiento mientras se verifica una solicitud de rectificación.</li>
      </ul>
      <p>Para ejercer cualquiera de estos derechos, puede utilizar el formulario interactivo disponible en esta tienda o escribir directamente a <a href="mailto:${email}">${email}</a>. Recibirá un acuse de recibo en hasta <strong>5 días hábiles</strong> y una resolución en un plazo máximo de <strong>30 días hábiles</strong>.</p>

      <h2 style="color: #1f2937; font-size: 20px; margin-top: 24px;">6. Autoridad de Control</h2>
      <p>Tiene derecho a acudir ante la Agencia de Protección de Datos Personales (APDP) de Chile si estima que el tratamiento de sus datos personales no se ajusta a la normativa vigente.</p>
    </div>
  `;
}
