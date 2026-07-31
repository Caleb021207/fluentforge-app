import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, supabaseForUser, toolError, unauthenticated } from "../supabase";

export default defineTool({
  name: "search_vocabulary",
  title: "Search curriculum vocabulary",
  description:
    "Search the Palavox curriculum vocabulary list by word or partial word, optionally filtered by CEFR level.",
  inputSchema: {
    query: z.string().describe("Word or partial word to search for."),
    cefr_level: z.string().optional().describe("Filter to a CEFR level such as A1, A2, B1."),
    limit: z.number().int().optional().describe("Maximum results (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, cefr_level, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const term = query.trim();
    if (!term) return toolError("query must not be empty.");
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    const supabase = supabaseForUser(ctx);

    let request = supabase
      .from("vocabulary")
      .select("id, lemma, translation_l1, part_of_speech, cefr_level, example_sentence, frequency_rank, language")
      .ilike("lemma", `%${term.replace(/[%_]/g, "")}%`)
      .order("frequency_rank", { ascending: true, nullsFirst: false })
      .limit(take);
    if (cefr_level) request = request.eq("cefr_level", cefr_level.toUpperCase());

    const { data, error } = await request;
    if (error) return toolError(error.message);
    return jsonResult({ count: data?.length ?? 0, words: data ?? [] });
  },
});
