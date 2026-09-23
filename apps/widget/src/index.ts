/**
 * @sist-protec-datos/widget — Entry point
 *
 * Bootstraps the Ley 21.719 compliance widget from a single <script> tag:
 *
 *   <script
 *     src="https://privacy.domain.com/widget.js"
 *     data-tenant="mi-tienda-cl"
 *     data-api="https://privacy.domain.com"
 *     data-color="#2563eb"
 *     data-privacy-url="/politica-de-privacidad"
 *     data-name="Mi Tienda"
 *   ></script>
 *
 * Alternatively, the widget reads `window.LEY21719_CONFIG` (set via
 * the WordPress plugin's inline script) when data attributes are absent.
 *
 * Exposes a public API at `window.LEY21719` for programmatic control.
 */

import {
  getConsentState,
  saveConsentState,
  hasValidConsent,
  sendConsentToAPI,
  dispatchConsentEvent,
} from './consent';
import { createBanner } from './banner';
import { initRightsForm } from './rights-form';

(function () {
  // -------------------------------------------------------------------------
  // 1. Resolve configuration
  // -------------------------------------------------------------------------

  // Support reading from window.LEY21719_CONFIG (WordPress plugin approach)
  const winConfig: Record<string, string> =
    (window as any).LEY21719_CONFIG || {};

  // Locate the most recently evaluated <script data-tenant="…"> tag.
  // `document.currentScript` is null when the script is deferred/async, so
  // we fall back to querySelectorAll and pick the last match.
  let scriptEl: HTMLScriptElement | null =
    document.currentScript as HTMLScriptElement | null;
  if (!scriptEl || !scriptEl.getAttribute('data-tenant')) {
    const all = document.querySelectorAll<HTMLScriptElement>(
      'script[data-tenant]',
    );
    scriptEl = all.length ? all[all.length - 1] : null;
  }

  function attr(name: string): string {
    return (
      scriptEl?.getAttribute(name) ||
      winConfig[name.replace('data-', '')] ||
      ''
    );
  }

  const tenantSlug = attr('data-tenant');

  let scriptSrcOrigin = '';
  if (scriptEl && scriptEl.src) {
    try {
      const u = new URL(scriptEl.src);
      scriptSrcOrigin = u.origin;
    } catch {}
  }

  const apiBaseUrl = (
    attr('data-api') ||
    scriptSrcOrigin ||
    'https://proteccion-datos-admin.vercel.app'
  ).replace(/\/$/, '');
  const primaryColor = attr('data-color') || '#2563eb';
  const privacyUrl =
    attr('data-privacy-url') || '#politica-privacidad';
  const tenantName = attr('data-name') || 'esta tienda';

  if (!tenantSlug) {
    console.warn(
      '[Ley21719] Missing data-tenant attribute — widget not initialised.',
    );
    return;
  }

  // -------------------------------------------------------------------------
  // 2. Banner configuration object
  // -------------------------------------------------------------------------

  const bannerConfig = {
    primaryColor,
    textColor: '#111827',
    backgroundColor: '#ffffff',
    position: 'bottom' as const,
    language: 'es' as const,
    privacyPolicyUrl: privacyUrl,
    tenantName,
  };

  // -------------------------------------------------------------------------
  // 3. Consent handler
  // -------------------------------------------------------------------------

  function handleConsentAccepted(categories: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  }): void {
    const state = {
      given: true,
      version: '1.0',
      timestamp: Date.now(),
      categories,
    };

    saveConsentState(state);
    dispatchConsentEvent(state);
    // Fire-and-forget — never block the page on a network call
    sendConsentToAPI(tenantSlug, apiBaseUrl, state).catch(() => {});
  }

  // -------------------------------------------------------------------------
  // 4. Banner initialisation
  // -------------------------------------------------------------------------

  function initBanner(): void {
    if (!hasValidConsent()) {
      createBanner(bannerConfig, handleConsentAccepted);
    } else {
      // Re-dispatch stored consent so GTM / listeners get the state on load
      const state = getConsentState();
      if (state) dispatchConsentEvent(state);

      // Show the floating "Gestionar cookies" button so users can revisit
      ensureFloatingButton();
    }
  }

  /** Creates the floating manage-cookies button if it doesn't exist yet. */
  function ensureFloatingButton(): void {
    if (document.getElementById('ley21719-floating-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'ley21719-floating-btn';
    btn.setAttribute('aria-label', 'Gestionar preferencias de cookies');
    btn.innerHTML = '🍪 Gestionar cookies';
    btn.style.cssText = [
      'position:fixed',
      'bottom:16px',
      'left:16px',
      'z-index:999998',
      `background:${primaryColor}`,
      'color:#fff',
      'border:none',
      'border-radius:20px',
      'padding:6px 14px',
      'font-size:11px',
      'font-weight:500',
      'cursor:pointer',
      'box-shadow:0 2px 8px rgba(0,0,0,0.15)',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      'display:flex',
      'align-items:center',
      'gap:6px',
      'line-height:1.5',
    ].join(';');

    btn.addEventListener('click', () => {
      createBanner(bannerConfig, handleConsentAccepted);
      btn.style.display = 'none';
    });

    document.body.appendChild(btn);
  }

  // -------------------------------------------------------------------------
  // 5. Rights form initialisation
  // -------------------------------------------------------------------------

  function initRightsForms(): void {
    // Support both id="ley21719-rights-form" and data-ley21719-rights="true"
    const containers = document.querySelectorAll<HTMLElement>(
      '#ley21719-rights-form, [data-ley21719-rights]',
    );
    containers.forEach((container) => {
      initRightsForm(tenantSlug, apiBaseUrl, container);
    });
  }

  // -------------------------------------------------------------------------
  // 6. Bootstrap: wait for DOM if needed
  // -------------------------------------------------------------------------

  function boot(): void {
    initBanner();
    initRightsForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // -------------------------------------------------------------------------
  // 7. Event listeners
  // -------------------------------------------------------------------------

  // Internal event dispatched by the floating button inside banner.ts
  window.addEventListener('ley21719:show_banner', () => {
    createBanner(bannerConfig, handleConsentAccepted);
  });

  // -------------------------------------------------------------------------
  // 8. Public JavaScript API  (window.LEY21719)
  // -------------------------------------------------------------------------

  (window as any).LEY21719 = {
    /**
     * Programmatically open the consent banner.
     * Useful for custom "Cookie settings" links.
     */
    showBanner(): void {
      createBanner(bannerConfig, handleConsentAccepted);
    },

    /**
     * Returns the current `ConsentState` or `null` if no consent has been
     * recorded yet.
     */
    getConsent: getConsentState,

    /**
     * Withdraws consent: clears cookie + localStorage and re-opens the
     * banner so the user can make a fresh selection.
     */
    withdraw(): void {
      document.cookie =
        'ley21719_consent=; max-age=0; path=/; SameSite=Lax';
      try {
        localStorage.removeItem('ley21719_consent');
      } catch {
        // ignore
      }
      createBanner(bannerConfig, handleConsentAccepted);
    },
  };
})();
