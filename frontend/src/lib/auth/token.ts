// Lightweight token store for Bearer auth
// - In-memory for runtime reads
// - Cookie for persistence across reloads & tab sharing

let memToken: string | null = null;
const COOKIE_NAME = "cvx_access_token";

function canUseDom() {
  return typeof document !== "undefined";
}

function readCookie(name: string): string | null {
  if (!canUseDom()) return null;
  const parts = document.cookie.split(/;\s*/);
  for (const part of parts) {
    const [k, ...rest] = part.split("=");
    if (decodeURIComponent(k) === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

export function getToken(): string | null {
  if (memToken) return memToken;
  memToken = readCookie(COOKIE_NAME);
  return memToken;
}

interface SetTokenOptions {
  /** Expiration ISO string */
  expiresAt?: string | null;
  /** Max age seconds (overrides expiresAt if provided) */
  maxAgeSeconds?: number;
}

export function setToken(token: string | null, opts: SetTokenOptions = {}) {
  memToken = token;
  if (!canUseDom()) return;

  if (!token) {
    // Clear cookie
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Strict`;
    return;
  }

  let attrs = `Path=/; SameSite=Strict`;
  // For production you likely also want Secure; keep it here when served over HTTPS
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    attrs += `; Secure`;
  }

  if (opts.maxAgeSeconds && opts.maxAgeSeconds > 0) {
    attrs += `; Max-Age=${opts.maxAgeSeconds}`;
  } else if (opts.expiresAt) {
    const d = new Date(opts.expiresAt);
    if (!isNaN(d.getTime())) {
      attrs += `; Expires=${d.toUTCString()}`;
    }
  }

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; ${attrs}`;
}

export function clearToken() {
  setToken(null);
}

// Keep multiple tabs mostly in sync: refresh memToken when tab regains focus/visibility
if (typeof document !== "undefined") {
  const refresh = () => { memToken = readCookie(COOKIE_NAME); };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refresh();
  });
  window.addEventListener("focus", refresh);
}
