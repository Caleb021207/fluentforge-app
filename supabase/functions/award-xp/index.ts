import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * RETIRED 2026-07-30 — 410 Gone stub (overhaul WS 1.1; plan 05 §6.2 release 1,
 * plan 15 §R4, wip-01a F6.1).
 *
 * This was the legacy client-trusting XP path: it computed the award from
 * client-supplied `source`/`metadata` with no rate limit, allowing ~600 XP per
 * request in a loop, and it inflated the teacher-visible
 * `certifications_completed` counter.
 *
 * Server-authoritative replacement (System A): XP is awarded ONLY by
 * `_shared/learnerProgress.ts#awardXp`, invoked from `submit-exercise` and
 * `vocab-review` after server-verified work. Awards write `xp_events` and
 * `user_progression` with the service role; level = floor(total_xp/500)+1.
 * Conversational/voice XP is paused, not re-implemented client-side — it
 * returns via server-corroborated awards from the mission runtime.
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
        "award-xp has been retired. XP is now awarded exclusively server-side after verified work " +
        "(submit-exercise / vocab-review via the shared learner-progress module); clients can no longer request XP.",
    }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
