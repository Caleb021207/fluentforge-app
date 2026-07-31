import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * RETIRED 2026-07-30 — 410 Gone stub (overhaul WS 1.1; plan 15 §R4,
 * wip-01a F9.1).
 *
 * Orphan re-verified 2026-07-30: zero invocations anywhere in src/. This was
 * already a "feature removed" stub (its `student_learning_profiles` dependency
 * was dropped), but it still consumed a unit of the caller's daily paid-request
 * quota on every hit. Personalized review is served by the FSRS deck
 * (`vocab-review`) instead.
 *
 * Kept as a stub instead of deleted so rollback is a `git revert`.
 * This stub performs ZERO reads, writes, or quota consumption.
 */
Deno.serve((req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  return new Response(
    JSON.stringify({ error: "gone", message: "generate-personalized-flashcards has been retired. Use vocab-review." }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
