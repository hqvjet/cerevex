// Lightweight token store for Bearer auth
// - In-memory for runtime reads
// - localStorage for persistence across reloads (browser only)

let memToken: string | null = null;
const STORAGE_KEY = "cvx_access_token";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getToken(): string | null {
  if (memToken) return memToken;
  if (canUseStorage()) {
    memToken = window.localStorage.getItem(STORAGE_KEY);
  }
  return memToken;
}

export function setToken(token: string | null) {
  memToken = token;
  if (canUseStorage()) {
    if (token) window.localStorage.setItem(STORAGE_KEY, token);
    else window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function clearToken() {
  setToken(null);
}

// Keep multiple tabs in sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      memToken = e.newValue;
    }
  });
}
