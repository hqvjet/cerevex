import type { NextRequest } from "next/server";

export const runtime = "nodejs";

function getAuthBase() {
  let base = process.env.AUTH_API_URL;
  if (!base) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    if (apiBase) base = `${apiBase.replace(/\/?$/, "")}/auth`;
  }
  return base || "";
}

async function forward(req: NextRequest) {
  const base = getAuthBase();
  if (!base) {
    return new Response(JSON.stringify({ message: "Missing AUTH_API_URL/NEXT_PUBLIC_API_URL" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const pathname = req.nextUrl?.pathname || "";
  const idx = pathname.indexOf("/api/auth/");
  const sub = idx >= 0 ? pathname.slice(idx + "/api/auth/".length) : "";
  const target = `${base.replace(/\/?$/, "")}/${sub}`;

  const method = req.method.toUpperCase();
  const contentType = req.headers.get("content-type") || "";

  const headers = new Headers();
  req.headers.forEach((v, k) => {
    const key = k.toLowerCase();
    if (["host", "content-length", "connection"].includes(key)) return;
    if (contentType.includes("multipart/form-data") && key === "content-type") return;
    headers.set(k, v);
  });

  let body: BodyInit | undefined = undefined;
  if (!["GET", "HEAD"].includes(method)) {
    if (contentType.includes("application/json")) {
      const json = await req.json().catch(() => undefined);
      body = json !== undefined ? JSON.stringify(json) : undefined;
    } else if (contentType.includes("multipart/form-data")) {
      const inFd = await req.formData();
      const fd = new FormData();
      inFd.forEach((value, key) => {
        const entry = value as FormDataEntryValue;
        if (typeof entry === "string") fd.append(key, entry);
        else fd.append(key, entry, (entry as File).name);
      });
      body = fd as unknown as BodyInit;
    } else {
      const ab = await req.arrayBuffer();
      body = Buffer.from(ab);
    }
  }

  const res = await fetch(target, { method, headers, body, cache: "no-store" });
  const outHeaders = new Headers(res.headers);
  if (!outHeaders.get("content-type")) outHeaders.set("content-type", "application/octet-stream");
  return new Response(res.body, { status: res.status, headers: outHeaders });
}

async function optionsHandler() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE, optionsHandler as OPTIONS };
