import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * RETIRED 2026-07-30 — 410 Gone stub (overhaul WS 1.1; plan 15 §R4,
 * wip-01a F4.6/F9.1).
 *
 * Orphan re-verified 2026-07-30: zero invocations anywhere in src/. The old
 * implementation was a stale seeder with NO admin gate that wrote hardcoded
 * demo content with the service role against a schema that no longer exists
 * (`courses.name`/`cefr_min`, `units.idx`/`cefr_target` — the live schema is
 * `courses.title`/`level_band`, `units.position`/`cefr_level`), so it would
 * fail on first insert; but the missing authorization made it a standing
 * hazard regardless.
 *
 * The one supported seeding path is `seed-curriculum`, which is gated by
 * SEED_TOKEN or an admin JWT and runs all content through the authoring
 * gauntlet.
 *
 * Kept as a stub instead of deleted so rollback is a `git revert`.
 * This stub performs ZERO reads or writes.
 */
Deno.serve((req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  return new Response(
    JSON.stringify({ error: "gone", message: "seed-course-data has been retired. Use seed-curriculum (admin/SEED_TOKEN gated)." }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
