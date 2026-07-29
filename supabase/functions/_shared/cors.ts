import { resolveOrigin } from "./allowedOrigins.ts";

const BASE_HEADERS = {
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Credentials": "true",
  "Vary": "Origin",
};

/** Build CORS headers scoped to the requesting origin (allow-listed only). */
export function buildCorsHeaders(req: Request): Record<string, string> {
  return { ...BASE_HEADERS, "Access-Control-Allow-Origin": resolveOrigin(req) };
}

/**
 * Legacy static export kept so existing imports keep compiling.
 * Prefer buildCorsHeaders(req).
 */
export const corsHeaders: Record<string, string> = {
  ...BASE_HEADERS,
  "Access-Control-Allow-Origin":
    "https://id-preview--233dc278-7ee8-401f-97f9-e0d8dd9d1216.lovable.app",
};
