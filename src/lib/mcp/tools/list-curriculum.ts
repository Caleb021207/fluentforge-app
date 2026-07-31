import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, supabaseForUser, toolError, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_curriculum",
  title: "List curriculum courses and units",
  description:
    "List published Palavox courses and their units, including CEFR/WIDA levels and the unit can-do statement. Optionally filter to one course.",
  inputSchema: {
    course_id: z.string().uuid().optional().describe("Only return units for this course id."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ course_id }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);

    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, title, description, language, level_band, target_framework, status");
    if (coursesError) return toolError(coursesError.message);

    let unitsQuery = supabase
      .from("units")
      .select(
        "id, course_id, title, theme, position, cefr_level, wida_level, can_do_statement, language_objective, status",
      )
      .order("position", { ascending: true });
    if (course_id) unitsQuery = unitsQuery.eq("course_id", course_id);

    const { data: units, error: unitsError } = await unitsQuery;
    if (unitsError) return toolError(unitsError.message);

    const visibleCourses = (courses ?? []).filter((c) => !course_id || c.id === course_id);
    return jsonResult({
      courses: visibleCourses.map((course) => ({
        ...course,
        units: (units ?? []).filter((u) => u.course_id === course.id),
      })),
    });
  },
});
