/**
 * Sistema de Cumplimiento Ley 21.719 Chile — Universal Storefront Widget
 * Banner CMP de Consentimiento + Formulario de Derechos ARSOP+ + Integración GTM
 * Compatible con Shopify, WooCommerce y cualquier plataforma web.
 */
(function () {
  'use strict';

  var winConfig = window.LEY21719_CONFIG || {};
  var scriptEl = document.currentScript;
  if (!scriptEl || !scriptEl.getAttribute('data-tenant')) {
    var all = document.querySelectorAll('script[data-tenant]');
    scriptEl = all.length ? all[all.length - 1] : null;
  }

  function attr(name) {
    return (
      (scriptEl && scriptEl.getAttribute(name)) ||
      winConfig[name.replace('data-', '')] ||
      ''
    );
  }

  var tenantSlug = attr('data-tenant');
  var apiBaseUrl = (attr('data-api') || window.location.origin).replace(/\/$/, '');
  var primaryColor = attr('data-color') || '#2563eb';
  var privacyUrl = attr('data-privacy-url') || '#politica-privacidad';
  var tenantName = attr('data-name') || 'esta tienda';

  if (!tenantSlug) {
    return;
  }

  var CONSENT_COOKIE = 'ley21719_consent';
  var CONSENT_VERSION = '1.0';

  // 1. Utils
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + d.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
  }

  function getSessionId() {
    var sid = sessionStorage.getItem('ley21719_sid');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('ley21719_sid', sid);
    }
    return sid;
  }

  // 2. Consent State
  function getConsentState() {
    try {
      var raw = getCookie(CONSENT_COOKIE) || localStorage.getItem(CONSENT_COOKIE);
      if (!raw) return null;
      var state = JSON.parse(raw);
      return state && state.version === CONSENT_VERSION ? state : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsentState(state) {
    var serialized = JSON.stringify(state);
    setCookie(CONSENT_COOKIE, serialized, 365);
    try {
      localStorage.setItem(CONSENT_COOKIE, serialized);
    } catch (e) {}
  }

  function dispatchConsentEvent(state) {
    window.dispatchEvent(new CustomEvent('ley21719:consent', { detail: state }));
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'ley21719_consent_update',
        consent_analytics: state.categories.analytics,
        consent_marketing: state.categories.marketing,
        consent_personalization: state.categories.personalization,
      });
    }
  }

  function sendConsentToAPI(state) {
    try {
      fetch(apiBaseUrl + '/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_slug: tenantSlug,
          session_id: getSessionId(),
          categories: state.categories,
          policy_version: state.version,
        }),
      }).catch(function () {});
    } catch (err) {}
  }

  // 3. Banner UI & Styles
  function injectStyles() {
    if (document.getElementById('ley21719-styles')) return;
    var style = document.createElement('style');
    style.id = 'ley21719-styles';
    style.textContent = `
      #ley21719-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 2147483640;
        background: #ffffff;
        border-top: 1px solid #e5e7eb;
        box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #111827;
        box-sizing: border-box;
      }
      #ley21719-banner-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      #ley21719-banner-text {
        flex: 1;
        min-width: 280px;
      }
      #ley21719-banner-text h3 {
        font-size: 15px;
        font-weight: 600;
        margin: 0 0 4px;
        color: #111827;
      }
      #ley21719-banner-text p {
        margin: 0;
        color: #4b5563;
        font-size: 13px;
      }
      #ley21719-banner-text a {
        color: ${primaryColor};
        text-decoration: underline;
      }
      #ley21719-banner-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }
      .ley21719-btn {
        padding: 8px 18px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        white-space: nowrap;
        transition: opacity 0.15s;
        font-family: inherit;
      }
      .ley21719-btn:hover { opacity: 0.88; }
      .ley21719-btn-primary {
        background: ${primaryColor};
        color: #ffffff;
      }
      .ley21719-btn-secondary {
        background: #ffffff;
        color: #374151;
        border: 1px solid #d1d5db;
      }
      .ley21719-btn-text {
        background: transparent;
        color: ${primaryColor};
        text-decoration: underline;
        padding: 8px;
      }
      #ley21719-categories {
        display: none;
        width: 100%;
        padding-top: 12px;
        border-top: 1px solid #f3f4f6;
        margin-top: 12px;
        flex-direction: column;
        gap: 10px;
      }
      #ley21719-categories.open { display: flex; }
      .ley21719-category {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      .ley21719-category input {
        margin-top: 2px;
        accent-color: ${primaryColor};
        width: 16px;
        height: 16px;
      }
      .ley21719-category-title { font-weight: 600; font-size: 13px; color: #111827; }
      .ley21719-category-desc { font-size: 12px; color: #6b7280; }
      #ley21719-floating-btn {
        position: fixed;
        bottom: 16px;
        left: 16px;
        z-index: 2147483630;
        background: ${primaryColor};
        color: #ffffff;
        border: none;
        border-radius: 20px;
        padding: 6px 14px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: inherit;
      }
      @media (max-width: 640px) {
        #ley21719-banner-inner { padding: 12px 16px; }
        #ley21719-banner-actions { width: 100%; justify-content: flex-end; }
      }
    `;
    document.head.appendChild(style);
  }

  function createBanner() {
    if (document.getElementById('ley21719-banner')) return;
    injectStyles();

    var div = document.createElement('div');
    div.id = 'ley21719-banner';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-label', 'Gestión de Cookies Ley 21.719');
    div.innerHTML = `
      <div id="ley21719-banner-inner">
        <div id="ley21719-banner-text">
          <h3>Privacidad y Cookies — Ley 21.719</h3>
          <p>
            Utilizamos cookies esenciales para el funcionamiento de la tienda y cookies opcionales para analítica y marketing. Puedes elegir tus preferencias o consultar nuestra <a href="${privacyUrl}" target="_blank">política de privacidad</a>.
          </p>
          <div id="ley21719-categories">
            <div class="ley21719-category">
              <input type="checkbox" id="cat-essential" checked disabled />
              <label for="cat-essential">
                <div class="ley21719-category-title">🔒 Esenciales (Obligatorias)</div>
                <div class="ley21719-category-desc">Imprescindibles para el carrito, checkout y seguridad del sitio.</div>
              </label>
            </div>
            <div class="ley21719-category">
              <input type="checkbox" id="cat-analytics" checked />
              <label for="cat-analytics">
                <div class="ley21719-category-title">📊 Analíticas</div>
                <div class="ley21719-category-desc">Medición anónima de rendimiento de visitas para optimizar la tienda.</div>
              </label>
            </div>
            <div class="ley21719-category">
              <input type="checkbox" id="cat-marketing" />
              <label for="cat-marketing">
                <div class="ley21719-category-title">📣 Marketing y Publicidad</div>
                <div class="ley21719-category-desc">Personalización de anuncios en plataformas externas (ej. Meta, Google).</div>
              </label>
            </div>
          </div>
        </div>
        <div id="ley21719-banner-actions">
          <button class="ley21719-btn ley21719-btn-text" id="ley21719-customize">Personalizar</button>
          <button class="ley21719-btn ley21719-btn-secondary" id="ley21719-essential-only">Solo esenciales</button>
          <button class="ley21719-btn ley21719-btn-primary" id="ley21719-accept-all">Aceptar todo</button>
        </div>
      </div>
    `;

    document.body.appendChild(div);

    var acceptAll = div.querySelector('#ley21719-accept-all');
    var essentialOnly = div.querySelector('#ley21719-essential-only');
    var customize = div.querySelector('#ley21719-customize');
    var cats = div.querySelector('#ley21719-categories');
    var isExpanded = false;

    acceptAll.addEventListener('click', function () {
      applyConsent({ essential: true, analytics: true, marketing: true, personalization: false });
    });

    essentialOnly.addEventListener('click', function () {
      applyConsent({ essential: true, analytics: false, marketing: false, personalization: false });
    });

    customize.addEventListener('click', function () {
      isExpanded = !isExpanded;
      cats.classList.toggle('open', isExpanded);
      customize.textContent = isExpanded ? 'Guardar selección' : 'Personalizar';
      if (!isExpanded) {
        var analytics = div.querySelector('#cat-analytics').checked;
        var marketing = div.querySelector('#cat-marketing').checked;
        applyConsent({ essential: true, analytics: analytics, marketing: marketing, personalization: false });
      }
    });
  }

  function applyConsent(categories) {
    var state = {
      given: true,
      version: CONSENT_VERSION,
      timestamp: Date.now(),
      categories: categories,
    };
    saveConsentState(state);
    dispatchConsentEvent(state);
    sendConsentToAPI(state);

    var banner = document.getElementById('ley21719-banner');
    if (banner) banner.remove();
    createFloatingButton();
  }

  function createFloatingButton() {
    if (document.getElementById('ley21719-floating-btn')) return;
    injectStyles();
    var btn = document.createElement('button');
    btn.id = 'ley21719-floating-btn';
    btn.innerHTML = '🍪 Gestionar cookies';
    btn.addEventListener('click', function () {
      btn.remove();
      createBanner();
    });
    document.body.appendChild(btn);
  }

  // 4. Formulario de Derechos ARSOP+
  function initRightsForms() {
    var containers = document.querySelectorAll('#ley21719-rights-form, [data-ley21719-rights]');
    containers.forEach(function (c) {
      c.innerHTML = `
        <div style="max-width: 600px; font-family: -apple-system, sans-serif; color: #111827; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; background: #ffffff;">
          <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">Ejercicio de Derechos de Datos Personales (Ley 21.719)</h3>
          <p style="font-size: 13px; color: #6b7280; margin: 0 0 16px;">
            Plazo de acuse de recibo: <strong>5 días hábiles</strong>. Plazo máximo de resolución: <strong>30 días hábiles</strong>.
          </p>
          <form id="ley21719-form-inner" style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Tipo de derecho *</label>
              <select name="type" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                <option value="" disabled selected>Selecciona una opción</option>
                <option value="access">Acceso — Conocer qué datos tienen sobre mí</option>
                <option value="rectify">Rectificación — Actualizar o corregir mis datos</option>
                <option value="suppress">Supresión — Eliminar mis datos personales</option>
                <option value="oppose">Oposición — Oponerme al tratamiento de mis datos</option>
                <option value="portability">Portabilidad — Recibir mis datos en formato descargable</option>
                <option value="block">Bloqueo — Suspender temporalmente el tratamiento</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Correo electrónico *</label>
              <input type="email" name="email" required placeholder="tu@email.com" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Nombre completo</label>
              <input type="text" name="name" placeholder="Nombre Apellido" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">RUT (Opcional, para verificación)</label>
              <input type="text" name="rut" placeholder="12.345.678-9" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Detalle de la solicitud</label>
              <textarea name="description" rows="3" placeholder="Describe tu solicitud..." style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box;"></textarea>
            </div>
            <button type="submit" style="padding: 10px; background: ${primaryColor}; color: #ffffff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
              Enviar Solicitud ARSOP+
            </button>
          </form>
        </div>
      `;

      var form = c.querySelector('#ley21719-form-inner');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        var payload = {
          tenant_slug: tenantSlug,
          type: form.elements['type'].value,
          requester_email: form.elements['email'].value,
          requester_name: form.elements['name'].value || undefined,
          requester_rut: form.elements['rut'].value || undefined,
          description: form.elements['description'].value || undefined,
        };

        fetch(apiBaseUrl + '/api/rights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            if (!res.ok) throw new Error('Error al registrar');
            return res.json();
          })
          .then(function () {
            c.innerHTML = `
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 20px; border-radius: 8px; text-align: center; font-family: sans-serif;">
                <h4 style="margin: 0 0 8px; font-size: 16px;">✅ Solicitud Registrada con Éxito</h4>
                <p style="margin: 0; font-size: 13px;">Hemos recibido tu solicitud. Te enviaremos un acuse formal a <strong>${payload.requester_email}</strong> dentro del plazo legal de 5 días hábiles.</p>
              </div>
            `;
          })
          .catch(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Solicitud ARSOP+';
            alert('Hubo un error al enviar tu solicitud. Por favor intenta nuevamente.');
          });
      });
    });
  }

  // 5. Contenedor de Política Embebida
  function initPolicyEmbed() {
    var policyContainer = document.getElementById('ley21719-policy');
    if (policyContainer) {
      policyContainer.innerHTML = '<p style="color:#6b7280; font-size:14px;">Cargando política de privacidad...</p>';
      fetch(apiBaseUrl + '/api/policy/' + encodeURIComponent(tenantSlug))
        .then(function (res) {
          if (!res.ok) throw new Error('Error al obtener política');
          return res.json();
        })
        .then(function (data) {
          if (data && data.content_html) {
            policyContainer.innerHTML = data.content_html;
          }
        })
        .catch(function () {
          policyContainer.innerHTML = '<p style="color:#dc2626; font-size:14px;">No se pudo cargar la política de privacidad en este momento.</p>';
        });
    }
  }

  // Inicialización
  function init() {
    var existing = getConsentState();
    if (!existing) {
      createBanner();
    } else {
      dispatchConsentEvent(existing);
      createFloatingButton();
    }
    initRightsForms();
    initPolicyEmbed();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API pública
  window.LEY21719 = {
    showBanner: createBanner,
    getConsent: getConsentState,
    resetConsent: function () {
      setCookie(CONSENT_COOKIE, '', -1);
      try { localStorage.removeItem(CONSENT_COOKIE); } catch (e) {}
      createBanner();
    },
  };
})();
