// Centralized HTTP client for calling backend services
// Uses NEXT_PUBLIC_API_URL; attaches Authorization: Bearer from token store

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  cache?: RequestCache;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  status: number;
  detail?: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// Prefer direct calls to backend. Set NEXT_PUBLIC_API_PROXY=true to use Next.js API proxy explicitly.
const directBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "");
const useProxy = ((process.env.NEXT_PUBLIC_API_PROXY ?? "false").toLowerCase()) === "true";
const proxyBase = "/api"; // same-origin Next.js API routes

function assertBaseUrl(): string {
  if (!directBase) {
    throw new Error("Missing NEXT_PUBLIC_API_URL. Please set it in your frontend environment.");
  }
  return directBase;
}

function joinUrl(path: string): string {
  const root = useProxy ? proxyBase : assertBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${root}${p}`;
}

export async function request<TResponse, TBody = unknown>(
  path: string,
  opts: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const url = joinUrl(path);
  const { method = "GET", body, headers, cache = "no-store", signal } = opts;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  // Lazy import to avoid SSR issues
  const { getToken } = await import("../auth/token");
  const token = getToken(); // Optional: if present we'll still send header; primary auth via cookie

  const res = await fetch(url, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
  // Authorization header optional; server should read cookie `cvx_access_token`
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body == null ? undefined : isFormData ? (body as unknown as BodyInit) : JSON.stringify(body),
    cache,
    signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

  if (!res.ok) {
    const message = (payload && (payload.detail || payload.message)) || res.statusText || "Request failed";
    throw new ApiError(String(message), res.status, payload);
  }

  return (isJson ? (payload as TResponse) : (undefined as unknown as TResponse));
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T, B = unknown>(path: string, body?: B, options?: Omit<RequestOptions<B>, "method" | "body">) =>
    request<T, B>(path, { ...options, method: "POST", body }),
  patch: <T, B = unknown>(path: string, body?: B, options?: Omit<RequestOptions<B>, "method" | "body">) =>
    request<T, B>(path, { ...options, method: "PATCH", body }),
  put: <T, B = unknown>(path: string, body?: B, options?: Omit<RequestOptions<B>, "method" | "body">) =>
    request<T, B>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export function getApiBaseUrl() {
  return useProxy ? proxyBase : assertBaseUrl();
}

// Direct-only client that always uses NEXT_PUBLIC_API_URL, ignoring proxy
function joinDirectUrl(path: string): string {
  const root = assertBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${root}${p}`;
}

async function requestDirect<TResponse, TBody = unknown>(
  path: string,
  opts: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const url = joinDirectUrl(path);
  const { method = "GET", body, headers, cache = "no-store", signal } = opts;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const { getToken } = await import("../auth/token");
  const token = getToken();
  const res = await fetch(url, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body == null ? undefined : isFormData ? (body as unknown as BodyInit) : JSON.stringify(body),
    cache,
    signal,
  });
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);
  if (!res.ok) {
    const message = (payload && (payload.detail || payload.message)) || res.statusText || "Request failed";
    throw new ApiError(String(message), res.status, payload);
  }
  return (isJson ? (payload as TResponse) : (undefined as unknown as TResponse));
}

export const httpDirect = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) => requestDirect<T>(path, { ...options, method: "GET" }),
  post: <T, B = unknown>(path: string, body?: B, options?: Omit<RequestOptions<B>, "method" | "body">) =>
    requestDirect<T, B>(path, { ...options, method: "POST", body }),
  patch: <T, B = unknown>(path: string, body?: B, options?: Omit<RequestOptions<B>, "method" | "body">) =>
    requestDirect<T, B>(path, { ...options, method: "PATCH", body }),
  put: <T, B = unknown>(path: string, body?: B, options?: Omit<RequestOptions<B>, "method" | "body">) =>
    requestDirect<T, B>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) => requestDirect<T>(path, { ...options, method: "DELETE" }),
};
