import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * RETIRED 2026-07-30 — 410 Gone stub (overhaul WS 1.1; plan 15 §R4,
 * wip-01a F9.1/F9.2).
 *
 * Orphan re-verified 2026-07-30: zero invocations anywhere in src/. The old
 * implementation was an unauthenticated endpoint (no config.toml entry, no
 * in-body auth) that disclosed runtime memory stats and whether the paid AI
 * gateway key was configured — low-value information, but public attack
 * surface with no consumer.
 *
 * Kept as a stub instead of deleted so rollback is a `git revert`.
 * This stub performs ZERO reads or writes.
 */
Deno.serve((req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  return new Response(
    JSON.stringify({ error: "gone", message: "health-check has been retired." }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
