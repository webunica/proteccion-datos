/**
 * Consent management module for Ley 21.719 compliance.
 *
 * Consent state is persisted in both a 1-year cookie (for server-side
 * checking) and localStorage (for fast client-side reads).
 */

import { generateSessionId } from './utils';
import { getCookie, setCookie } from './utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONSENT_COOKIE = 'ley21719_consent';
const CONSENT_VERSION = '1.0';
const STORAGE_KEY = 'ley21719_consent';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConsentState {
  given: boolean;
  version: string;
  timestamp: number;
  categories: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  };
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Returns the current `ConsentState` parsed from the consent cookie, or
 * `null` if no consent has been recorded yet.
 */
export function getConsentState(): ConsentState | null {
  // Prefer cookie (authoritative, works across tabs immediately)
  const raw = getCookie(CONSENT_COOKIE);
  if (raw) {
    try {
      return JSON.parse(decodeURIComponent(raw)) as ConsentState;
    } catch {
      // fall through to localStorage
    }
  }

  // Fallback: localStorage (useful when cookies are cleared manually)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ConsentState;
    }
  } catch {
    // localStorage may be unavailable
  }

  return null;
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Persists `state` to a 365-day cookie and to localStorage.
 */
export function saveConsentState(state: ConsentState): void {
  const serialized = encodeURIComponent(JSON.stringify(state));

  // 1-year cookie
  setCookie(CONSENT_COOKIE, JSON.stringify(state), 365);

  // localStorage backup
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded or private mode — ignore
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Returns `true` when a valid, up-to-date consent record exists.
 * Consent is considered stale when the stored version does not match
 * the current `CONSENT_VERSION`.
 */
export function hasValidConsent(): boolean {
  const state = getConsentState();
  if (!state) return false;
  if (!state.given) return false;
  if (state.version !== CONSENT_VERSION) return false;
  return true;
}

// ---------------------------------------------------------------------------
// API sync
// ---------------------------------------------------------------------------

/**
 * Sends the consent record to the backend for audit-trail purposes.
 * Failures are silently ignored — the widget must never block the page.
 */
export async function sendConsentToAPI(
  tenantSlug: string,
  apiBaseUrl: string,
  state: ConsentState,
): Promise<void> {
  const sessionId = generateSessionId();

  await fetch(`${apiBaseUrl}/api/consent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenant_slug: tenantSlug,
      session_id: sessionId,
      categories: state.categories,
      policy_version: state.version,
    }),
  });
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/**
 * Dispatches a `ley21719:consent` CustomEvent on `window` and pushes to the
 * GTM `dataLayer` (if present) so tag rules can react to the consent state.
 */
export function dispatchConsentEvent(state: ConsentState): void {
  // Custom DOM event — useful for any first-party listener
  window.dispatchEvent(
    new CustomEvent('ley21719:consent', { detail: state }),
  );

  // Google Tag Manager dataLayer integration
  if ((window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: 'ley21719_consent_update',
      consent_analytics: state.categories.analytics,
      consent_marketing: state.categories.marketing,
      consent_personalization: state.categories.personalization,
    });
  }
}
