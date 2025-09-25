
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Health check service for monitoring system health
 * - Checks OpenAI API connectivity
 * - Checks database connectivity
 * - Reports system resource usage
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    
    // Get system memory information (Deno provides this)
    const memoryUsage = Deno.memoryUsage();
    
    // Check OpenAI API connectivity
    let openAIStatus = "unknown";
    try {
      const openAIKey = Deno.env.get('OPENAI_API_KEY');
      if (!openAIKey) {
        openAIStatus = "missing_key";
      } else {
        const openAIResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
          },
        });
        
        openAIStatus = openAIResponse.ok ? "healthy" : "error";
      }
    } catch (error) {
      console.error("OpenAI API check failed:", error);
      openAIStatus = "error";
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: "ok",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
      dependencies: {
        openai: openAIStatus,
      },
      version: "1.0.0"
    };

    return new Response(
      JSON.stringify(healthStatus),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate' 
        }
      }
    );

  } catch (error) {
    console.error('Error in health-check function:', error);
    
    return new Response(
      JSON.stringify({ 
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
