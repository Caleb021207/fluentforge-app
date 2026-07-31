import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * RETIRED 2026-07-30 — 410 Gone stub (overhaul WS 1.1; plan 05 §6.2 release 1,
 * plan 15 §R4, wip-01a F6.2).
 *
 * This was the legacy streak path. It parsed the JWT WITHOUT verifying the
 * signature (base64-decoded `sub` and trusted it), had no config.toml entry,
 * and wrote `user_progression` streak fields + up to 100 bonus XP/day from an
 * unauthenticated-in-body endpoint.
 *
 * Server-authoritative replacement (System A): `learner_streaks` is the single
 * canonical streak, advanced ONLY by `_shared/learnerProgress.ts#touchStreak`
 * when XP-earning work actually happened (submit-exercise / vocab-review).
 * `user_progression.current_streak_days` is frozen for audit and no longer
 * written (plan 05 §6.2 step 4).
 *
 * Kept as a stub instead of deleted so rollback is a `git revert`. NOTE:
 * redeploying the old implementation is a security regression and requires
 * owner sign-off (plan 05 §6.2). This stub performs ZERO reads or writes.
 */
Deno.serve((req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  return new Response(
    JSON.stringify({
      error: "gone",
      message:
        "check-streak has been retired. Streaks are now maintained server-side in learner_streaks, " +
        "advanced only when verified work is completed; clients can no longer trigger streak writes.",
    }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
