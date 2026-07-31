import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * RETIRED 2026-07-30 — 410 Gone stub (overhaul WS 1.1; plan 15 §R4,
 * wip-01a F9.1).
 *
 * Orphan re-verified 2026-07-30: zero invocations anywhere in src/. The old
 * implementation read any `transcript_analyses` row by client-supplied id with
 * the service role (no ownership check on the caller vs. the analysis owner)
 * and inserted AI-generated `study_recommendations` for that row's user — an
 * IDOR-shaped write path with no consumer.
 *
 * Kept as a stub instead of deleted so rollback is a `git revert`.
 * This stub performs ZERO reads, writes, or paid API calls.
 */
Deno.serve((req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  return new Response(
    JSON.stringify({ error: "gone", message: "generate-study-recommendations has been retired." }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
