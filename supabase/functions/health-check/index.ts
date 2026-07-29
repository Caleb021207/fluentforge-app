import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";


serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const startTime = Date.now();
    const memoryUsage = Deno.memoryUsage();

    // Check Lovable AI connectivity
    let aiStatus = "unknown";
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      aiStatus = "missing_key";
    } else {
      aiStatus = "configured";
    }

    return new Response(JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
      dependencies: { ai: aiStatus },
      version: "2.0.0"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: "error", error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
