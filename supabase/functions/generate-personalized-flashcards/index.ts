import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
