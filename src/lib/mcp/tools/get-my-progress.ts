import { defineTool } from "@lovable.dev/mcp-js";
import { jsonResult, supabaseForUser, toolError, unauthenticated } from "../supabase";

export default defineTool({
  name: "get_my_progress",
  title: "Get my learning progress",
  description:
    "Return the signed-in learner's XP, level, streaks, lessons completed, and their strongest and weakest skill mastery scores.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const [{ data: progression, error: progressionError }, { data: mastery, error: masteryError }] =
      await Promise.all([
        supabase
          .from("user_progression")
          .select(
            "total_xp, level, current_level, current_streak_days, longest_streak_days, lessons_completed, certifications_completed, last_activity_date",
          )
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("skill_mastery")
          .select("skill_id, mastery, ability, attempts, correct, last_practiced_at")
          .eq("user_id", userId)
          .order("mastery", { ascending: false })
          .limit(50),
      ]);

    if (progressionError) return toolError(progressionError.message);
    if (masteryError) return toolError(masteryError.message);

    const skills = mastery ?? [];
    return jsonResult({
      progression: progression ?? null,
      skillCount: skills.length,
      strongestSkills: skills.slice(0, 5),
      weakestSkills: skills.slice(-5).reverse(),
    });
  },
});
