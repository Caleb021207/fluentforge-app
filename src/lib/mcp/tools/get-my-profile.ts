import { defineTool } from "@lovable.dev/mcp-js";
import { jsonResult, supabaseForUser, toolError, unauthenticated } from "../supabase";

export default defineTool({
  name: "get_my_profile",
  title: "Get my learner profile",
  description:
    "Return the signed-in user's Palavox profile: display name, role, native and target language, target level and grade.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "display_name, role, native_language, target_language, target_level, learning_goal, account_tier, grade_level_id",
      )
      .eq("id", ctx.getUserId())
      .maybeSingle();
    if (error) return toolError(error.message);
    if (!data) return toolError("No profile found for the signed-in user.");
    return jsonResult(data);
  },
});
