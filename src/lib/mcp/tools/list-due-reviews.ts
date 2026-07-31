import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, supabaseForUser, toolError, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_due_reviews",
  title: "List due vocabulary reviews",
  description:
    "Return the signed-in learner's spaced-repetition vocabulary cards that are due now, with the word, translation and example sentence.",
  inputSchema: {
    limit: z.number().int().optional().describe("Maximum number of due cards to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    const supabase = supabaseForUser(ctx);

    const { data, error } = await supabase
      .from("vocab_card_state")
      .select(
        "vocabulary_id, due, state, reps, lapses, stability, difficulty, vocabulary:vocabulary_id (lemma, translation_l1, example_sentence, cefr_level, part_of_speech)",
      )
      .eq("user_id", ctx.getUserId())
      .lte("due", new Date().toISOString())
      .order("due", { ascending: true })
      .limit(take);
    if (error) return toolError(error.message);

    return jsonResult({ dueCount: data?.length ?? 0, cards: data ?? [] });
  },
});
