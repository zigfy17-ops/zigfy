import type { IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import app from "../dist/server/index.js";

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function toWebHeaders(nodeHeaders: IncomingMessage["headers"]) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const entry of value) headers.append(key, entry);
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }
  return headers;
}

function sendNodeResponse(response: ServerResponse, status: number, contentType: string, body: Buffer | string) {
  response.statusCode = status;
  response.setHeader("content-type", contentType);
  response.end(body);
}

async function serveBuiltAsset(pathname: string, response: ServerResponse) {
  const safePath = normalize(pathname).replace(/^([\\/])+/, "");
  const filePath = join(process.cwd(), "dist", "client", safePath);
  const data = await readFile(filePath);
  const ext = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  response.statusCode = 200;
  response.setHeader("content-type", contentType);
  response.setHeader("cache-control", "public, max-age=31536000, immutable");
  response.end(data);
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const host = request.headers.host ?? "localhost";
  const url = new URL(request.url ?? "/", `https://${host}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith("/assets/") || pathname === "/.assetsignore" || pathname === "/favicon.ico") {
    try {
      await serveBuiltAsset(pathname, response);
      return;
    } catch {
      sendNodeResponse(response, 404, "text/plain; charset=utf-8", "Not Found");
      return;
    }
  }

  const method = request.method ?? "GET";
  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers: toWebHeaders(request.headers),
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = request as unknown as BodyInit;
    init.duplex = "half";
  }

  const webRequest = new Request(url.toString(), init);
  const webResponse = await app.fetch(webRequest);

  response.statusCode = webResponse.status;
  webResponse.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });

  const body = Buffer.from(await webResponse.arrayBuffer());
  response.end(body);
}
