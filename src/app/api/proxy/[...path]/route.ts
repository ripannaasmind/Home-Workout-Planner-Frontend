import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_BACKEND_URL = "https://fit-home-workout-planner-backend.onrender.com/api";
const LOCAL_BACKEND_URL = "http://localhost:5000/api";

const normalize = (url: string) => {
  const trimmed = url.trim().replace(/\/+$/, "");
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
};

const backendBases = Array.from(
  new Set(
    [process.env.BACKEND_API_URL, process.env.NEXT_PUBLIC_API_URL, DEFAULT_BACKEND_URL, LOCAL_BACKEND_URL]
      .filter((url): url is string => Boolean(url && url.trim()))
      .map(normalize)
  )
);

function buildForwardHeaders(req: NextRequest) {
  const headers = new Headers();
  const auth = req.headers.get("authorization");
  const contentType = req.headers.get("content-type");
  const clientType = req.headers.get("x-client-type");

  if (auth) headers.set("authorization", auth);
  if (contentType) headers.set("content-type", contentType);
  if (clientType) headers.set("x-client-type", clientType);

  return headers;
}

async function forward(req: NextRequest, method: string, path: string, query: string) {
  const headers = buildForwardHeaders(req);
  const body = method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  let lastError: unknown;

  for (const base of backendBases) {
    try {
      const target = `${base}/${path}${query}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000);
      let upstream: Response;
      try {
        upstream = await fetch(target, {
          method,
          headers,
          body,
          cache: "no-store",
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const text = await upstream.text();
      const resHeaders = new Headers();
      const upstreamType = upstream.headers.get("content-type") || "application/json";
      resHeaders.set("content-type", upstreamType);

      return new NextResponse(text, {
        status: upstream.status,
        headers: resHeaders,
      });
    } catch (error) {
      lastError = error;
    }
  }

  const message =
    lastError instanceof Error && lastError.message
      ? `Cannot reach backend from proxy. Tried: ${backendBases.join(", ")}`
      : "Cannot reach backend from proxy.";

  return NextResponse.json({ success: false, message }, { status: 502 });
}

async function handle(req: NextRequest, paramsPromise: Promise<{ path: string[] }>) {
  const params = await paramsPromise;
  const method = req.method.toUpperCase();
  const path = (params.path || []).join("/");
  const query = req.nextUrl.search || "";
  return forward(req, method, path, query);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handle(req, params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handle(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handle(req, params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handle(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handle(req, params);
}
