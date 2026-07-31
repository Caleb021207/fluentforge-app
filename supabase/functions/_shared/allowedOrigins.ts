// Central allow-list for browser origins that may call these edge functions.
// Wildcard CORS ("*") is intentionally NOT used: these functions handle
// student data and paid provider APIs.

const STATIC_ALLOWED_ORIGINS = [
  "https://id-preview--233dc278-7ee8-401f-97f9-e0d8dd9d1216.lovable.app",
  "https://233dc278-7ee8-401f-97f9-e0d8dd9d1216.lovableproject.com",
];

// Dev-server origins: only honored when the functions runtime is local
// (`supabase functions serve`), never in the deployed production allow-list.
const LOCAL_DEV_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:5173",
];

/**
 * True when running under the local Supabase CLI. In production the runtime
 * always gets an https SUPABASE_URL (https://<ref>.supabase.co); locally it
 * is plain http (e.g. http://kong:8000 / http://127.0.0.1:54321).
 */
function isLocalRuntime(): boolean {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  return !url.startsWith("https://");
}

/** Extra origins (custom domains) can be added via the ALLOWED_ORIGINS secret, comma separated. */
function configuredOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

export function allowedOrigins(): string[] {
  return [
    ...STATIC_ALLOWED_ORIGINS,
    ...(isLocalRuntime() ? LOCAL_DEV_ORIGINS : []),
    ...configuredOrigins(),
  ];
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (allowedOrigins().includes(origin)) return true;
  // Lovable preview/published deployments for this project.
  return /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(origin) ||
    /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/.test(origin);
}

export function resolveOrigin(req: Request): string {
  const origin = req.headers.get("origin");
  return isAllowedOrigin(origin) ? (origin as string) : allowedOrigins()[0];
}
