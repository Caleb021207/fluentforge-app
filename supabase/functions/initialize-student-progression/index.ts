import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * RETIRED 2026-07-30 — 410 Gone stub (overhaul WS 1.1; plan 15 §R4,
 * wip-01a F9.1/F9.2).
 *
 * Orphan re-verified 2026-07-30: zero invocations anywhere in src/. The old
 * implementation was a full-table job with no in-body authorization and no
 * config.toml entry: any holder of a bearer header could trigger a service-role
 * scan of `profiles` and receive EVERY student's email + display name in the
 * response — a PII leak (plan 15 §2.3 F2).
 *
 * `user_progression` rows are now created lazily by the server-side award path
 * (`_shared/learnerProgress.ts`) on first verified work; no bulk initializer
 * is needed.
 *
 * Kept as a stub instead of deleted so rollback is a `git revert`.
 * This stub performs ZERO reads or writes.
 */
Deno.serve((req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  return new Response(
    JSON.stringify({ error: "gone", message: "initialize-student-progression has been retired." }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
