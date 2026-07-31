import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, supabaseForUser, toolError, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_my_assignments",
  title: "List my class assignments",
  description:
    "List the assignments visible to the signed-in user (a student's own class assignments, or a teacher's authored assignments), with due dates and topics.",
  inputSchema: {
    class_id: z.string().uuid().optional().describe("Only return assignments for this class id."),
    limit: z.number().int().optional().describe("Maximum assignments to return (default 25, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ class_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 25, 1), 100);
    const supabase = supabaseForUser(ctx);

    let query = supabase
      .from("assignments")
      .select(
        "id, class_id, title, description, topic_prompt, assignment_type, cefr_level, due_date, points_possible, status, created_at",
      )
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(take);
    if (class_id) query = query.eq("class_id", class_id);

    const { data, error } = await query;
    if (error) return toolError(error.message);
    return jsonResult({ count: data?.length ?? 0, assignments: data ?? [] });
  },
});
