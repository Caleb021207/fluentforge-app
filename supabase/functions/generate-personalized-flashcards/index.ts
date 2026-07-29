import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";


serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const gate = await guardPaidRequest(req, corsHeaders, 'generate-personalized-flashcards', 50);
  if (gate.error) return gate.error;

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // This function previously depended on student_learning_profiles which has been removed.
  // Returning a message indicating the feature is no longer available.
  return new Response(
    JSON.stringify({ success: false, message: 'Personalized flashcard generation based on profiling has been removed.' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
