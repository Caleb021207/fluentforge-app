import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * RETIRED 2026-07-30 — 410 Gone stub (overhaul WS 1.1; plan 15 §R4,
 * wip-01a F5.6/F9.1/F9.2).
 *
 * Orphan re-verified 2026-07-30: zero invocations anywhere in src/. The old
 * implementation was an unauthenticated, unrate-limited validity oracle over
 * `access_codes` (queried with the service role) — usable to brute-force live
 * district access codes.
 *
 * Access-code redemption flows exclusively through the server-side
 * `process_access_code` RPC; no standalone verification endpoint exists.
 *
 * Kept as a stub instead of deleted so rollback is a `git revert`.
 * This stub performs ZERO reads or writes.
 */
Deno.serve((req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  return new Response(
    JSON.stringify({ error: "gone", message: "verify-certification-code has been retired." }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
