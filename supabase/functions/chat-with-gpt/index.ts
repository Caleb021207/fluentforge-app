
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Helper function to determine the correct URL for the edge function
function getEdgeFunctionUrl(functionName: string): string {
  // Extract the hostname from the current request
  const currentHostname = Deno.env.get('SUPABASE_URL') || '';
  // Return the complete URL to the edge function
  return `${currentHostname}/functions/v1/${functionName}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Forwarding request to chat-with-tutor:', body);
    
    // Forward the request to the chat-with-tutor function
    const response = await fetch(getEdgeFunctionUrl('chat-with-tutor'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      console.error('Error response from chat-with-tutor:', response.status, response.statusText);
      throw new Error(`Failed to get response from chat-with-tutor: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Received data from chat-with-tutor:', data);
    
    if (!data || (!data.content && !data.error)) {
      console.error('Invalid response format from chat-with-tutor:', data);
      throw new Error('Invalid response format from chat-with-tutor');
    }
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error forwarding request to chat-with-tutor:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request', 
        details: error instanceof Error ? error.message : String(error),
        content: null,
        translation: null
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
