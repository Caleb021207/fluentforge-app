import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * RETIRED 2026-07-30 — 410 Gone stub (overhaul WS 1.1; plan 15 §R4,
 * wip-01a F5.6/F9.1/F9.2).
 *
 * Orphan re-verified 2026-07-30: zero invocations anywhere in src/. The old
 * implementation had NO authentication and decremented `access_codes` uses
 * with the service role — an unauthenticated write that let anyone burn a
 * district's code allocation.
 *
 * Certification attempt quota is tracked by `track-usage`
 * (action=certification_attempt) behind requireUser; access-code accounting
 * lives in the server-side `process_access_code` RPC.
 *
 * Kept as a stub instead of deleted so rollback is a `git revert`.
 * This stub performs ZERO reads or writes.
 */
Deno.serve((req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  return new Response(
    JSON.stringify({ error: "gone", message: "record-certification-usage has been retired." }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
