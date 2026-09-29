/**
 * Banner UI module — cookie consent banner for Ley 21.719 compliance.
 *
 * All styles are injected inline into the page <head> so no external CSS
 * file is required. The banner is appended to <body> and removed after
 * the user makes a choice. A small floating button allows re-opening
 * the preference panel at any time.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BannerConfig {
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  position: 'bottom' | 'top';
  language: 'es' | 'en';
  privacyPolicyUrl: string;
  tenantName: string;
}

// ---------------------------------------------------------------------------
// i18n strings (currently only Spanish — Ley 21.719 is Chilean)
// ---------------------------------------------------------------------------

const TEXTS = {
  es: {
    title: 'Esta tienda utiliza cookies',
    description:
      'Usamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. ' +
      'Puedes elegir qué cookies aceptar. Más información en nuestra',
    privacyLink: 'política de privacidad',
    acceptAll: 'Aceptar todo',
    essentialOnly: 'Rechazar opcionales',
    customize: 'Personalizar',
    save: 'Guardar preferencias',
    essential: 'Esenciales (Obligatorias)',
    essentialDesc:
      'Necesarias para el funcionamiento básico de la tienda. No se pueden desactivar.',
    analytics: 'Analítica (Opcional)',
    analyticsDesc:
      'Nos ayudan a entender cómo usas la tienda para mejorar tu experiencia.',
    marketing: 'Marketing (Opcional)',
    marketingDesc:
      'Permiten mostrarte publicidad relevante en otras plataformas.',
    managePrefs: 'Gestionar cookies',
    poweredBy: 'Cumplimiento Ley 21.719',
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates and appends the consent banner to `document.body`.
 * `onAccept` is called with the final categories object once the user acts.
 */
export function createBanner(
  config: BannerConfig,
  onAccept: (categories: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  }) => void,
): void {
  // Do not create a duplicate banner
  if (document.getElementById('ley21719-banner')) return;

  injectStyles(config);
  const banner = buildBannerHTML(config);
  document.body.appendChild(banner);
  attachBannerEvents(banner, config, onAccept);
  createFloatingButton(config);
}

// ---------------------------------------------------------------------------
// Style injection
// ---------------------------------------------------------------------------

function injectStyles(config: BannerConfig): void {
  if (document.getElementById('ley21719-styles')) return;

  const style = document.createElement('style');
  style.id = 'ley21719-styles';
  style.textContent = `
    /* ---- Banner container ---- */
    #ley21719-banner {
      position: fixed;
      ${config.position === 'top' ? 'top: 0;' : 'bottom: 0;'}
      left: 0;
      right: 0;
      z-index: 999999;
      background: ${config.backgroundColor};
      border-${config.position === 'top' ? 'bottom' : 'top'}: 1px solid #e5e7eb;
      box-shadow: 0 ${config.position === 'top' ? '4' : '-4'}px 24px rgba(0,0,0,0.08);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: ${config.textColor};
    }

    /* ---- Inner layout ---- */
    #ley21719-banner-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    /* ---- Text block ---- */
    #ley21719-banner-text {
      flex: 1;
      min-width: 280px;
    }
    #ley21719-banner-text h3 {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 4px;
      color: ${config.textColor};
    }
    #ley21719-banner-text p {
      margin: 0;
      color: #6b7280;
      font-size: 13px;
    }
    #ley21719-banner-text a {
      color: ${config.primaryColor};
      text-decoration: underline;
    }

    /* ---- Action buttons ---- */
    #ley21719-banner-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
    .ley21719-btn {
      padding: 8px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      white-space: nowrap;
      transition: opacity 0.15s;
      font-family: inherit;
    }
    .ley21719-btn:hover { opacity: 0.85; }
    .ley21719-btn:focus-visible {
      outline: 2px solid ${config.primaryColor};
      outline-offset: 2px;
    }
    .ley21719-btn-primary {
      background: ${config.primaryColor};
      color: #fff;
    }
    .ley21719-btn-secondary {
      background: transparent;
      color: ${config.textColor};
      border: 1px solid #d1d5db !important;
    }
    .ley21719-btn-text {
      background: transparent;
      color: ${config.primaryColor};
      padding: 8px 8px;
      text-decoration: underline;
    }

    /* ---- Category panel ---- */
    #ley21719-categories {
      display: none;
      width: 100%;
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
      margin-top: 12px;
      gap: 12px;
      flex-direction: column;
    }
    #ley21719-categories.open { display: flex; }
    .ley21719-category {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .ley21719-category input[type="checkbox"] {
      margin-top: 2px;
      width: 16px;
      height: 16px;
      accent-color: ${config.primaryColor};
      cursor: pointer;
      flex-shrink: 0;
    }
    .ley21719-category input[type="checkbox"]:disabled { cursor: default; opacity: 0.6; }
    .ley21719-category label { cursor: pointer; }
    .ley21719-category-title {
      font-weight: 600;
      font-size: 13px;
      color: ${config.textColor};
    }
    .ley21719-category-desc {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 2px;
    }

    /* ---- Floating re-open button ---- */
    #ley21719-floating-btn {
      position: fixed;
      bottom: 16px;
      left: 16px;
      z-index: 999998;
      background: ${config.primaryColor};
      color: #fff;
      border: none;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      display: none;
      align-items: center;
      gap: 6px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
    }
    #ley21719-floating-btn:hover { opacity: 0.9; }
    #ley21719-floating-btn:focus-visible {
      outline: 2px solid ${config.primaryColor};
      outline-offset: 2px;
    }

    /* ---- Powered-by note ---- */
    .ley21719-powered {
      font-size: 10px;
      color: #d1d5db;
      margin-top: 8px;
    }

    /* ---- Mobile ---- */
    @media (max-width: 640px) {
      #ley21719-banner-inner { padding: 12px 16px; }
      #ley21719-banner-actions { width: 100%; justify-content: flex-end; }
    }
  `;

  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// DOM construction
// ---------------------------------------------------------------------------

function buildBannerHTML(config: BannerConfig): HTMLElement {
  const t = TEXTS.es;

  const div = document.createElement('div');
  div.id = 'ley21719-banner';
  div.setAttribute('role', 'dialog');
  div.setAttribute('aria-label', 'Preferencias de cookies');
  div.setAttribute('aria-modal', 'false');
  div.setAttribute('aria-live', 'polite');

  div.innerHTML = `
    <div id="ley21719-banner-inner">
      <div id="ley21719-banner-text">
        <h3>${t.title}</h3>
        <p>
          ${t.description}
          <a href="${config.privacyPolicyUrl}" target="_blank" rel="noopener noreferrer">${t.privacyLink}</a>.
        </p>

        <div id="ley21719-categories" role="group" aria-label="Categorías de cookies">
          <!-- Essential (always on) -->
          <div class="ley21719-category">
            <input
              type="checkbox"
              id="cat-essential"
              name="cat-essential"
              checked
              disabled
              aria-describedby="cat-essential-desc"
            />
            <label for="cat-essential">
              <div class="ley21719-category-title">🔒 ${t.essential}</div>
              <div class="ley21719-category-desc" id="cat-essential-desc">${t.essentialDesc}</div>
            </label>
          </div>

          <!-- Analytics -->
          <div class="ley21719-category">
            <input
              type="checkbox"
              id="cat-analytics"
              name="cat-analytics"
              aria-describedby="cat-analytics-desc"
            />
            <label for="cat-analytics">
              <div class="ley21719-category-title">📊 ${t.analytics}</div>
              <div class="ley21719-category-desc" id="cat-analytics-desc">${t.analyticsDesc}</div>
            </label>
          </div>

          <!-- Marketing -->
          <div class="ley21719-category">
            <input
              type="checkbox"
              id="cat-marketing"
              name="cat-marketing"
              aria-describedby="cat-marketing-desc"
            />
            <label for="cat-marketing">
              <div class="ley21719-category-title">📣 ${t.marketing}</div>
              <div class="ley21719-category-desc" id="cat-marketing-desc">${t.marketingDesc}</div>
            </label>
          </div>

          <p class="ley21719-powered">⚖️ ${t.poweredBy}</p>
        </div>
      </div>

      <div id="ley21719-banner-actions">
        <button
          class="ley21719-btn ley21719-btn-text"
          id="ley21719-customize"
          aria-expanded="false"
          aria-controls="ley21719-categories"
        >${t.customize}</button>

        <button
          class="ley21719-btn ley21719-btn-secondary"
          id="ley21719-essential-only"
        >${t.essentialOnly}</button>

        <button
          class="ley21719-btn ley21719-btn-primary"
          id="ley21719-accept-all"
        >${t.acceptAll}</button>
      </div>
    </div>
  `;

  return div;
}

// ---------------------------------------------------------------------------
// Event wiring
// ---------------------------------------------------------------------------

function attachBannerEvents(
  banner: HTMLElement,
  config: BannerConfig,
  onAccept: (categories: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  }) => void,
): void {
  const t = TEXTS.es;

  const acceptAllBtn = banner.querySelector(
    '#ley21719-accept-all',
  ) as HTMLButtonElement;
  const essentialOnlyBtn = banner.querySelector(
    '#ley21719-essential-only',
  ) as HTMLButtonElement;
  const customizeBtn = banner.querySelector(
    '#ley21719-customize',
  ) as HTMLButtonElement;
  const categoriesPanel = banner.querySelector(
    '#ley21719-categories',
  ) as HTMLElement;

  let panelExpanded = false;
  let saveMode = false; // true when panel is open and button becomes "save"

  // Accept all
  acceptAllBtn.addEventListener('click', () => {
    onAccept({
      essential: true,
      analytics: true,
      marketing: true,
      personalization: false,
    });
    removeBanner();
  });

  // Essential only
  essentialOnlyBtn.addEventListener('click', () => {
    onAccept({
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
    });
    removeBanner();
  });

  // Customize / Save
  customizeBtn.addEventListener('click', () => {
    if (!saveMode) {
      // Open panel
      panelExpanded = true;
      saveMode = true;
      categoriesPanel.classList.add('open');
      customizeBtn.textContent = t.save;
      customizeBtn.setAttribute('aria-expanded', 'true');
    } else {
      // Save custom selection
      const analytics = (
        banner.querySelector('#cat-analytics') as HTMLInputElement
      ).checked;
      const marketing = (
        banner.querySelector('#cat-marketing') as HTMLInputElement
      ).checked;
      onAccept({
        essential: true,
        analytics,
        marketing,
        personalization: false,
      });
      removeBanner();
    }
  });

  // Keyboard: close on Escape
  banner.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onAccept({
        essential: true,
        analytics: false,
        marketing: false,
        personalization: false,
      });
      removeBanner();
    }
  });

  // Auto-focus the primary button for keyboard users
  acceptAllBtn.focus();
}

// ---------------------------------------------------------------------------
// Show / hide helpers
// ---------------------------------------------------------------------------

function removeBanner(): void {
  const banner = document.getElementById('ley21719-banner');
  if (banner) {
    banner.style.transition = 'opacity 0.3s, transform 0.3s';
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(8px)';
    setTimeout(() => banner.remove(), 300);
  }
  showFloatingButton();
}

function createFloatingButton(config: BannerConfig): void {
  if (document.getElementById('ley21719-floating-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'ley21719-floating-btn';
  btn.setAttribute('aria-label', 'Gestionar preferencias de cookies');
  btn.innerHTML = '🍪 Gestionar cookies';

  btn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('ley21719:show_banner'));
    btn.style.display = 'none';
  });

  document.body.appendChild(btn);
}

function showFloatingButton(): void {
  const btn = document.getElementById('ley21719-floating-btn');
  if (btn) btn.style.display = 'flex';
}
