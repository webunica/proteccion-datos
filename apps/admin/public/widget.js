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
    var all = document.querySelectorAll('script[data-tenant], script[src*="widget.js"]');
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

  // Detectar automáticamente el servidor API desde la URL del script widget.js
  var scriptSrcOrigin = '';
  if (scriptEl && scriptEl.src) {
    try {
      var parsedUrl = new URL(scriptEl.src);
      scriptSrcOrigin = parsedUrl.origin;
    } catch (e) {}
  }

  var fallbackOrigin = 'https://proteccion-datos-admin.vercel.app';
  var apiBaseUrl = (attr('data-api') || scriptSrcOrigin || fallbackOrigin).replace(/\/$/, '');
  var primaryColor = attr('data-color') || '#2563eb';
  var badgePosition = attr('data-badge-position') || attr('data-badge-pos') || 'middle-right';
  var badgeStyle = attr('data-badge-style') || 'retracted';
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

  // 1.1 Google Consent Mode v2
  function initGoogleConsentMode() {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    if (!window.gtag) {
      window.gtag = gtag;
    }
    var existing = getConsentState();
    if (!existing) {
      // Estado inicial bajo Ley 21.719: denegado hasta manifestación libre de voluntad
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        personalization_storage: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: 500,
      });
    }
  }

  function updateGoogleConsentMode(categories) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: categories.analytics ? 'granted' : 'denied',
        ad_storage: categories.marketing ? 'granted' : 'denied',
        ad_user_data: categories.marketing ? 'granted' : 'denied',
        ad_personalization: categories.marketing ? 'granted' : 'denied',
        personalization_storage: categories.personalization ? 'granted' : 'denied',
      });
    }
  }

  // 1.2 Shopify Customer Privacy API
  function syncShopifyCustomerPrivacy(categories) {
    function applyShopify() {
      try {
        if (
          window.Shopify &&
          window.Shopify.customerPrivacy &&
          typeof window.Shopify.customerPrivacy.setTrackingConsent === 'function'
        ) {
          window.Shopify.customerPrivacy.setTrackingConsent(
            {
              analytics: Boolean(categories.analytics),
              marketing: Boolean(categories.marketing),
              preferences: Boolean(categories.personalization),
              sale_of_data: false,
            },
            function (res) {
              if (res && res.error) {
                console.warn('[Ley21719] Error en Shopify customerPrivacy:', res.error);
              }
            }
          );
        }
      } catch (err) {
        console.warn('[Ley21719] Excepción en Shopify customerPrivacy:', err);
      }
    }

    if (window.Shopify && typeof window.Shopify.loadFeatures === 'function') {
      window.Shopify.loadFeatures(
        [
          {
            name: 'consent-tracking-api',
            version: '0.1',
          },
        ],
        function (err) {
          if (!err) {
            applyShopify();
          } else {
            applyShopify();
          }
        }
      );
    } else {
      applyShopify();
    }
  }

  function dispatchConsentEvent(state) {
    window.dispatchEvent(new CustomEvent('ley21719:consent', { detail: state }));

    // Sincronización Google Consent Mode v2
    updateGoogleConsentMode(state.categories);

    // Sincronización Shopify Customer Privacy API
    syncShopifyCustomerPrivacy(state.categories);

    // Google Tag Manager dataLayer
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
        z-index: 2147483630;
        background: ${primaryColor};
        color: #ffffff;
        border: none;
        outline: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px;
        font-weight: 500;
        box-shadow: 0 3px 12px rgba(0,0,0,0.18);
        transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, opacity 0.2s ease;
        line-height: 1;
        user-select: none;
      }
      .ley-badge-icon { font-size: 13px; line-height: 1; display: inline-block; }
      .ley-badge-text { white-space: nowrap; }

      /* Middle Right (Lateral derecho a media altura) */
      #ley21719-floating-btn.ley-pos-middle-right {
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        border-radius: 8px 0 0 8px;
        padding: 8px 12px 8px 10px;
      }
      #ley21719-floating-btn.ley-pos-middle-right.ley-style-retracted {
        transform: translateY(-50%) translateX(calc(100% - 32px));
        opacity: 0.88;
      }
      #ley21719-floating-btn.ley-pos-middle-right.ley-style-retracted:hover,
      #ley21719-floating-btn.ley-pos-middle-right.ley-style-retracted:focus-visible {
        transform: translateY(-50%) translateX(0);
        opacity: 1;
        box-shadow: -4px 6px 18px rgba(0,0,0,0.25);
      }

      /* Middle Left (Lateral izquierdo a media altura) */
      #ley21719-floating-btn.ley-pos-middle-left {
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        border-radius: 0 8px 8px 0;
        padding: 8px 10px 8px 12px;
      }
      #ley21719-floating-btn.ley-pos-middle-left.ley-style-retracted {
        transform: translateY(-50%) translateX(calc(-100% + 32px));
        opacity: 0.88;
      }
      #ley21719-floating-btn.ley-pos-middle-left.ley-style-retracted:hover,
      #ley21719-floating-btn.ley-pos-middle-left.ley-style-retracted:focus-visible {
        transform: translateY(-50%) translateX(0);
        opacity: 1;
        box-shadow: 4px 6px 18px rgba(0,0,0,0.25);
      }

      /* Bottom Right */
      #ley21719-floating-btn.ley-pos-bottom-right {
        bottom: 16px;
        right: 16px;
        border-radius: 20px;
        padding: 7px 14px;
      }
      #ley21719-floating-btn.ley-pos-bottom-right.ley-style-retracted {
        bottom: 0;
        right: 20px;
        border-radius: 8px 8px 0 0;
        padding: 6px 12px;
        transform: translateY(calc(100% - 24px));
        opacity: 0.88;
      }
      #ley21719-floating-btn.ley-pos-bottom-right.ley-style-retracted:hover,
      #ley21719-floating-btn.ley-pos-bottom-right.ley-style-retracted:focus-visible {
        transform: translateY(0);
        opacity: 1;
        box-shadow: 0 -4px 16px rgba(0,0,0,0.2);
      }

      /* Bottom Left */
      #ley21719-floating-btn.ley-pos-bottom-left {
        bottom: 16px;
        left: 16px;
        border-radius: 20px;
        padding: 7px 14px;
      }
      #ley21719-floating-btn.ley-pos-bottom-left.ley-style-retracted {
        bottom: 0;
        left: 20px;
        border-radius: 8px 8px 0 0;
        padding: 6px 12px;
        transform: translateY(calc(100% - 24px));
        opacity: 0.88;
      }
      #ley21719-floating-btn.ley-pos-bottom-left.ley-style-retracted:hover,
      #ley21719-floating-btn.ley-pos-bottom-left.ley-style-retracted:focus-visible {
        transform: translateY(0);
        opacity: 1;
        box-shadow: 0 -4px 16px rgba(0,0,0,0.2);
      }

      @media (max-width: 640px) {
        #ley21719-banner-inner { padding: 12px 16px; }
        #ley21719-banner-actions { width: 100%; justify-content: flex-end; }
        #ley21719-floating-btn.ley-pos-middle-right.ley-style-retracted {
          transform: translateY(-50%) translateX(calc(100% - 30px));
        }
        #ley21719-floating-btn.ley-pos-middle-left.ley-style-retracted {
          transform: translateY(-50%) translateX(calc(-100% + 30px));
        }
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
              <input type="checkbox" id="cat-analytics" />
              <label for="cat-analytics">
                <div class="ley21719-category-title">📊 Analíticas (Opcional)</div>
                <div class="ley21719-category-desc">Medición anónima de rendimiento de visitas para optimizar la tienda.</div>
              </label>
            </div>
            <div class="ley21719-category">
              <input type="checkbox" id="cat-marketing" />
              <label for="cat-marketing">
                <div class="ley21719-category-title">📣 Marketing y Publicidad (Opcional)</div>
                <div class="ley21719-category-desc">Personalización de anuncios en plataformas externas (ej. Meta, Google).</div>
              </label>
            </div>
          </div>
        </div>
        <div id="ley21719-banner-actions">
          <button class="ley21719-btn ley21719-btn-text" id="ley21719-customize">Personalizar</button>
          <button class="ley21719-btn ley21719-btn-secondary" id="ley21719-essential-only">Rechazar opcionales</button>
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
    btn.className = 'ley-pos-' + badgePosition + ' ley-style-' + badgeStyle;
    btn.setAttribute('aria-label', 'Gestionar cookies y privacidad');
    btn.setAttribute('title', 'Gestionar cookies y privacidad');
    btn.innerHTML = '<span class="ley-badge-icon">🍪</span><span class="ley-badge-text">Gestionar cookies</span>';
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
        submitBtn.textContent = 'Enviando código de verificación...';

        var payload = {
          tenant_slug: tenantSlug,
          type: form.elements['type'].value,
          requester_email: form.elements['email'].value.trim(),
          requester_name: form.elements['name'].value.trim() || undefined,
          requester_rut: form.elements['rut'].value.trim() || undefined,
          description: form.elements['description'].value.trim() || undefined,
        };

        // Solicitar código OTP al titular conforme al Art. 21 Ley 21.719
        fetch(apiBaseUrl + '/api/rights/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            tenant_slug: tenantSlug,
            email: payload.requester_email,
            requester_name: payload.requester_name,
          }),
        })
          .then(function (res) {
            if (!res.ok) throw new Error('Error al solicitar OTP');
            return res.json();
          })
          .then(function (otpData) {
            var otpToken = otpData.otp_token;

            // Renderizar interfaz interactiva de verificación en 2 pasos
            c.innerHTML = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; color: #1e293b;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 22px; background: #eff6ff; color: ${primaryColor}; font-size: 20px; margin-bottom: 8px;">
                    🛡️
                  </div>
                  <h3 style="font-size: 17px; font-weight: 700; margin: 0; color: #0f172a;">Verificación de Identidad (Paso 2 de 2)</h3>
                  <p style="font-size: 13px; color: #64748b; margin: 6px 0 0;">
                    Para prevenir la suplantación de identidad (<strong>Ley 21.719 Art. 21</strong>), enviamos un código de 6 dígitos a <strong>${payload.requester_email}</strong>.
                  </p>
                </div>

                <div id="ley-otp-error" style="display: none; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 14px; text-align: center;"></div>

                <form id="ley-otp-form" style="display: flex; flex-direction: column; gap: 16px;">
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 6px;">
                      Código de 6 dígitos
                    </label>
                    <input type="text" id="ley-otp-input" maxlength="6" pattern="[0-9]{6}" required placeholder="000000" autofocus
                           style="letter-spacing: 8px; font-size: 24px; text-align: center; font-weight: 700; width: 100%; padding: 10px; border: 2px solid ${primaryColor}; border-radius: 8px; box-sizing: border-box; outline: none; font-family: monospace;" />
                  </div>

                  <button type="submit" id="ley-otp-submit" style="padding: 12px; background: ${primaryColor}; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;">
                    Confirmar y Enviar Solicitud
                  </button>

                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; padding-top: 4px;">
                    <button type="button" id="ley-otp-back" style="background: none; border: none; color: #64748b; cursor: pointer; text-decoration: underline; padding: 0;">
                      ← Modificar datos
                    </button>
                    <button type="button" id="ley-otp-resend" style="background: none; border: none; color: ${primaryColor}; cursor: pointer; font-weight: 600; padding: 0;">
                      Reenviar código
                    </button>
                  </div>
                </form>
              </div>
            `;

            var otpForm = c.querySelector('#ley-otp-form');
            var otpInput = c.querySelector('#ley-otp-input');
            var otpError = c.querySelector('#ley-otp-error');
            var otpSubmit = c.querySelector('#ley-otp-submit');
            var otpBack = c.querySelector('#ley-otp-back');
            var otpResend = c.querySelector('#ley-otp-resend');

            otpBack.addEventListener('click', function () {
              initRightsForms();
            });

            otpResend.addEventListener('click', function () {
              otpResend.disabled = true;
              otpResend.textContent = 'Enviando...';
              fetch(apiBaseUrl + '/api/rights/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'send',
                  tenant_slug: tenantSlug,
                  email: payload.requester_email,
                  requester_name: payload.requester_name,
                }),
              })
                .then(function (r) { return r.json(); })
                .then(function (newOtpData) {
                  otpToken = newOtpData.otp_token || otpToken;
                  otpResend.textContent = '¡Código reenviado!';
                  setTimeout(function () {
                    otpResend.disabled = false;
                    otpResend.textContent = 'Reenviar código';
                  }, 5000);
                })
                .catch(function () {
                  otpResend.disabled = false;
                  otpResend.textContent = 'Reintentar reenvío';
                });
            });

            otpForm.addEventListener('submit', function (ev) {
              ev.preventDefault();
              otpError.style.display = 'none';
              otpSubmit.disabled = true;
              otpSubmit.textContent = 'Validando y registrando...';

              var codeVal = otpInput.value.trim();
              var fullPayload = Object.assign({}, payload, {
                otp_code: codeVal,
                otp_token: otpToken,
              });

              fetch(apiBaseUrl + '/api/rights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullPayload),
              })
                .then(function (res) {
                  if (!res.ok) throw new Error('Error al registrar solicitud');
                  return res.json();
                })
                .then(function () {
                  c.innerHTML = `
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 24px; border-radius: 12px; text-align: center; font-family: sans-serif; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
                      <div style="font-size: 36px; margin-bottom: 8px;">✅</div>
                      <h4 style="margin: 0 0 8px; font-size: 18px; font-weight: 700;">Solicitud Recibida y Autenticada</h4>
                      <p style="margin: 0 0 12px; font-size: 13px; color: #15803d;">
                        Tu identidad ha sido verificada mediante código seguro (Ley 21.719). Hemos enviado el comprobante oficial a <strong>${payload.requester_email}</strong>.
                      </p>
                      <div style="display: inline-block; background: #ffffff; border: 1px solid #dcfce7; padding: 8px 16px; border-radius: 8px; font-size: 12px; color: #166534; font-weight: 500;">
                        ⏱ Acuse formal dentro de 5 días hábiles · Resolución máxima en 30 días hábiles
                      </div>
                    </div>
                  `;
                })
                .catch(function () {
                  otpError.textContent = 'Código incorrecto o expirado. Por favor verifica e intenta nuevamente.';
                  otpError.style.display = 'block';
                  otpSubmit.disabled = false;
                  otpSubmit.textContent = 'Confirmar y Enviar Solicitud';
                });
            });
          })
          .catch(function () {
            // En caso de incidencia en envío de OTP, fallback a registro directo
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

  // 6. Sincronización dinámica de configuración remota
  function fetchWidgetConfig() {
    if (!tenantSlug) return;
    fetch(apiBaseUrl + '/api/config/' + encodeURIComponent(tenantSlug))
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (cfg) {
        if (!cfg) return;
        var changed = false;
        if (cfg.primaryColor && cfg.primaryColor !== primaryColor) {
          primaryColor = cfg.primaryColor;
          changed = true;
        }
        if (cfg.badgePosition && cfg.badgePosition !== badgePosition) {
          badgePosition = cfg.badgePosition;
          changed = true;
        }
        if (cfg.badgeStyle && cfg.badgeStyle !== badgeStyle) {
          badgeStyle = cfg.badgeStyle;
          changed = true;
        }
        if (changed) {
          var oldStyle = document.getElementById('ley21719-styles');
          if (oldStyle) oldStyle.remove();
          injectStyles();
          var btn = document.getElementById('ley21719-floating-btn');
          if (btn) {
            btn.className = 'ley-pos-' + badgePosition + ' ley-style-' + badgeStyle;
            btn.style.background = primaryColor;
          }
        }
      })
      .catch(function () {});
  }

  // Inicialización
  function init() {
    initGoogleConsentMode();
    var existing = getConsentState();
    if (!existing) {
      createBanner();
    } else {
      dispatchConsentEvent(existing);
      createFloatingButton();
    }
    initRightsForms();
    initPolicyEmbed();
    fetchWidgetConfig();
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
