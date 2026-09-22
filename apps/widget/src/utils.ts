/**
 * Utility helpers used by the Ley 21.719 widget.
 * All functions are pure / side-effect free except where noted.
 */

// ---------------------------------------------------------------------------
// Session ID
// ---------------------------------------------------------------------------

/**
 * Returns a persistent-per-session UUID-like identifier stored in
 * `sessionStorage`. A new one is generated on each browser session.
 */
export function generateSessionId(): string {
  const KEY = 'ley21719_sid';
  const existing = sessionStorage.getItem(KEY);
  if (existing) return existing;

  // Simple UUID v4 – no crypto dependency needed for a session ID
  const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  try {
    sessionStorage.setItem(KEY, id);
  } catch {
    // sessionStorage may be blocked (private mode, etc.) — return the id anyway
  }
  return id;
}

// ---------------------------------------------------------------------------
// Hash
// ---------------------------------------------------------------------------

/**
 * Returns a simple 32-bit FNV-1a hash of `str` as a hex string.
 * Used for lightweight deduplication of events.
 */
export function hashString(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // keep unsigned 32-bit
  }
  return hash.toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------------------
// Cookies
// ---------------------------------------------------------------------------

/**
 * Returns the decoded value of the cookie named `name`, or `null` if absent.
 */
export function getCookie(name: string): string | null {
  const prefix = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');
  for (const raw of cookies) {
    const c = raw.trim();
    if (c.startsWith(prefix)) {
      return decodeURIComponent(c.slice(prefix.length));
    }
  }
  return null;
}

/**
 * Sets a cookie with the given `name`, `value` and expiry in `days`.
 * The cookie is set with `SameSite=Lax` and `path=/`.
 */
export function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `expires=${expires.toUTCString()}`,
    'path=/',
    'SameSite=Lax',
  ].join('; ');
}

/**
 * Deletes the cookie named `name` from path `/`.
 */
export function deleteCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=/; SameSite=Lax`;
}
