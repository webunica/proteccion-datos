/**
 * ARSOP+ Rights Request Form widget.
 *
 * Detects any element with `id="ley21719-rights-form"` or the attribute
 * `data-ley21719-rights` and injects an accessible rights-request form.
 *
 * Rights covered (Ley 21.719 art. 4): Access, Rectification, Suppression,
 * Opposition, Portability, Blocking (ARSOP+).
 */

// ---------------------------------------------------------------------------
// Rights catalogue
// ---------------------------------------------------------------------------

const RIGHTS_TYPES: { value: string; label: string }[] = [
  { value: 'access', label: 'Acceso — Saber qué datos tienen de mí' },
  {
    value: 'rectify',
    label: 'Rectificación — Corregir mis datos incorrectos',
  },
  { value: 'suppress', label: 'Supresión — Eliminar mis datos' },
  {
    value: 'oppose',
    label: 'Oposición — Oponerme a un tratamiento',
  },
  {
    value: 'portability',
    label: 'Portabilidad — Recibir mis datos en formato descargable',
  },
  {
    value: 'block',
    label: 'Bloqueo — Suspender temporalmente el tratamiento',
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Renders the ARSOP+ form inside `container` and wires up submission.
 */
export function initRightsForm(
  tenantSlug: string,
  apiBaseUrl: string,
  container: HTMLElement,
): void {
  injectFormStyles();
  container.innerHTML = buildFormHTML();
  attachFormEvents(container, tenantSlug, apiBaseUrl);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function injectFormStyles(): void {
  if (document.getElementById('ley21719-form-styles')) return;

  const style = document.createElement('style');
  style.id = 'ley21719-form-styles';
  style.textContent = `
    /* ---- Form wrapper ---- */
    .ley21719-form {
      max-width: 600px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 15px;
      color: #111827;
    }
    .ley21719-form h2 {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 8px;
      color: #111827;
    }
    .ley21719-form p.subtitle {
      color: #6b7280;
      margin: 0 0 24px;
      font-size: 14px;
      line-height: 1.6;
    }

    /* ---- Fields ---- */
    .ley21719-field {
      margin-bottom: 16px;
    }
    .ley21719-field label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }
    .ley21719-field input,
    .ley21719-field select,
    .ley21719-field textarea {
      width: 100%;
      padding: 9px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      color: #111827;
      background: #fff;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }
    .ley21719-field input:focus,
    .ley21719-field select:focus,
    .ley21719-field textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }
    .ley21719-field input[aria-invalid="true"],
    .ley21719-field select[aria-invalid="true"],
    .ley21719-field textarea[aria-invalid="true"] {
      border-color: #dc2626;
    }
    .ley21719-field textarea {
      min-height: 100px;
      resize: vertical;
    }

    /* ---- Submit ---- */
    .ley21719-submit {
      width: 100%;
      padding: 11px;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 8px;
      font-family: inherit;
      transition: background 0.15s;
    }
    .ley21719-submit:hover:not(:disabled) { background: #1d4ed8; }
    .ley21719-submit:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }
    .ley21719-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* ---- Success ---- */
    .ley21719-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      color: #166534;
    }
    .ley21719-success h3 { margin: 0 0 8px; font-size: 18px; }
    .ley21719-success p  { margin: 0; font-size: 14px; }

    /* ---- Error ---- */
    .ley21719-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 10px 14px;
      color: #dc2626;
      font-size: 13px;
      margin-bottom: 12px;
    }

    /* ---- Misc ---- */
    .ley21719-required { color: #ef4444; }
    .ley21719-sla-note {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 10px 14px;
      color: #1e40af;
      font-size: 12px;
      margin-bottom: 20px;
      line-height: 1.6;
    }
  `;

  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// HTML template
// ---------------------------------------------------------------------------

function buildFormHTML(): string {
  const options = RIGHTS_TYPES.map(
    (t) => `<option value="${t.value}">${t.label}</option>`,
  ).join('\n            ');

  return `
    <div class="ley21719-form" role="main">
      <h2>Ejercer mis derechos de datos personales</h2>
      <p class="subtitle">
        De acuerdo a la <strong>Ley 21.719</strong> de Protección de Datos Personales de Chile,
        tienes derecho a acceder, corregir, eliminar u oponerte al tratamiento de tus datos.
      </p>

      <div class="ley21719-sla-note" role="note">
        ⏱ Recibirás un acuse de recibo en hasta <strong>5 días hábiles</strong>.
        Tu solicitud será resuelta en un plazo máximo de <strong>30 días hábiles</strong>,
        según lo establecido por la ley.
      </div>

      <div
        id="ley21719-form-error"
        class="ley21719-error"
        role="alert"
        aria-live="assertive"
        style="display:none"
      ></div>

      <form id="ley21719-rights-form-el" novalidate>
        <!-- Rights type -->
        <div class="ley21719-field">
          <label for="rf-type">
            Tipo de solicitud <span class="ley21719-required" aria-hidden="true">*</span>
          </label>
          <select id="rf-type" name="type" required aria-required="true">
            <option value="" disabled selected>Selecciona el tipo de derecho</option>
            ${options}
          </select>
        </div>

        <!-- Full name -->
        <div class="ley21719-field">
          <label for="rf-name">Tu nombre completo</label>
          <input
            type="text"
            id="rf-name"
            name="name"
            placeholder="Nombre Apellido"
            autocomplete="name"
          />
        </div>

        <!-- Email -->
        <div class="ley21719-field">
          <label for="rf-email">
            Tu email <span class="ley21719-required" aria-hidden="true">*</span>
          </label>
          <input
            type="email"
            id="rf-email"
            name="email"
            placeholder="tu@email.com"
            required
            aria-required="true"
            autocomplete="email"
          />
        </div>

        <!-- RUT -->
        <div class="ley21719-field">
          <label for="rf-rut">Tu RUT <span style="color:#9ca3af;font-weight:400;">(opcional, para verificación)</span></label>
          <input
            type="text"
            id="rf-rut"
            name="rut"
            placeholder="12.345.678-9"
            autocomplete="off"
            inputmode="numeric"
          />
        </div>

        <!-- Description -->
        <div class="ley21719-field">
          <label for="rf-description">Descripción de tu solicitud</label>
          <textarea
            id="rf-description"
            name="description"
            placeholder="Describe brevemente tu solicitud…"
            aria-describedby="rf-description-hint"
          ></textarea>
          <small id="rf-description-hint" style="color:#9ca3af;font-size:12px;">
            Incluye cualquier detalle que nos ayude a procesar tu solicitud más rápido.
          </small>
        </div>

        <button type="submit" class="ley21719-submit" id="ley21719-submit-btn">
          Enviar solicitud
        </button>
      </form>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

function attachFormEvents(
  container: HTMLElement,
  tenantSlug: string,
  apiBaseUrl: string,
): void {
  const form = container.querySelector(
    '#ley21719-rights-form-el',
  ) as HTMLFormElement;
  const errorEl = container.querySelector(
    '#ley21719-form-error',
  ) as HTMLElement;
  const submitBtn = container.querySelector(
    '#ley21719-submit-btn',
  ) as HTMLButtonElement;

  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();
    errorEl.style.display = 'none';

    // --- Client-side validation ---
    const typeEl = container.querySelector('#rf-type') as HTMLSelectElement;
    const emailEl = container.querySelector('#rf-email') as HTMLInputElement;

    const validationErrors: string[] = [];
    if (!typeEl.value) {
      validationErrors.push('Por favor selecciona el tipo de solicitud.');
      typeEl.setAttribute('aria-invalid', 'true');
      typeEl.focus();
    } else {
      typeEl.removeAttribute('aria-invalid');
    }
    if (!emailEl.value || !emailEl.validity.valid) {
      validationErrors.push('Por favor ingresa un correo electrónico válido.');
      emailEl.setAttribute('aria-invalid', 'true');
      if (!typeEl.getAttribute('aria-invalid')) emailEl.focus();
    } else {
      emailEl.removeAttribute('aria-invalid');
    }

    if (validationErrors.length > 0) {
      errorEl.textContent = validationErrors.join(' ');
      errorEl.style.display = 'block';
      return;
    }

    // --- Submission ---
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    const nameEl = container.querySelector('#rf-name') as HTMLInputElement;
    const rutEl = container.querySelector('#rf-rut') as HTMLInputElement;
    const descEl = container.querySelector(
      '#rf-description',
    ) as HTMLTextAreaElement;

    const payload: Record<string, unknown> = {
      tenant_slug: tenantSlug,
      type: typeEl.value,
      requester_email: emailEl.value.trim(),
    };
    if (nameEl.value.trim()) payload.requester_name = nameEl.value.trim();
    if (rutEl.value.trim()) payload.requester_rut = rutEl.value.trim();
    if (descEl.value.trim()) payload.description = descEl.value.trim();

    try {
      const res = await fetch(`${apiBaseUrl}/api/rights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(
          (json as any)?.detail || `HTTP ${res.status}`,
        );
      }

      // --- Success state ---
      container.innerHTML = `
        <div class="ley21719-success" role="status" aria-live="polite">
          <h3>✅ Solicitud recibida</h3>
          <p>
            Hemos recibido tu solicitud correctamente. Te enviaremos un acuse de recibo a
            <strong>${escapeHtml(emailEl.value.trim())}</strong>
            en los próximos 5 días hábiles.
          </p>
        </div>
      `;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error desconocido';
      errorEl.textContent = `Hubo un error al enviar tu solicitud: ${msg}. Por favor intenta nuevamente.`;
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar solicitud';
    }
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
