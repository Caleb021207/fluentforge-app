import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    // Authenticate user - try both header and query param
    let authHeader = req.headers.get("Authorization");
    
    // If not in headers, check query params (for WebSocket connections)
    if (!authHeader) {
      const url = new URL(req.url);
      const token = url.searchParams.get("authorization");
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }
    
    if (!authHeader) {
      return new Response("Missing authorization", { status: 401 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("User authenticated:", user.id);

    // Get native and target languages from query params
    const url = new URL(req.url);
    const nativeLanguage = url.searchParams.get("nativeLanguage") || "english";
    const targetLanguage = url.searchParams.get("targetLanguage") || "english";

    // Check usage limits
    const { data: usageLimits, error: usageError } = await supabase
      .from("student_usage_limits")
      .select("*")
      .eq("student_id", user.id)
      .eq("academic_year", `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`)
      .single();

    if (usageError && usageError.code !== "PGRST116") {
      console.error("Usage check error:", usageError);
      return new Response("Error checking usage limits", { status: 500 });
    }

    if (usageLimits) {
      const minutesUsed = usageLimits.premium_voice_minutes_used_current_month || 0;
      const minutesLimit = usageLimits.premium_voice_minutes_monthly_limit || 120;

      if (minutesUsed >= minutesLimit) {
        return new Response("Monthly premium voice limit reached", { status: 403 });
      }
    }

    // Create session tracking
    const sessionStartTime = Date.now();
    const { data: sessionData, error: insertError } = await supabase
      .from("usage_tracking")
      .insert({
        student_id: user.id,
        session_type: "voice_practice",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Session tracking insert error:", insertError);
      return new Response(`Error creating session: ${insertError.message}`, { status: 500, headers: corsHeaders });
    }

    const sessionId = sessionData?.id;
    console.log("Session created:", sessionId);

    // Upgrade to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req);

    // Connect to OpenAI
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const openAISocket = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        },
      }
    );

    let sessionConfigured = false;

    // Handle OpenAI connection
    openAISocket.onopen = () => {
      console.log("Connected to OpenAI");
    };

    openAISocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Send session configuration after receiving session.created
      if (data.type === "session.created" && !sessionConfigured) {
        sessionConfigured = true;
        console.log("Session created, sending configuration");
        
        const sessionConfig = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: `You are a helpful AI language tutor. You are helping a ${nativeLanguage} speaker practice their ${targetLanguage}. Be encouraging, patient, and provide gentle corrections when needed. Keep responses conversational and natural. Focus on practical conversation skills.`,
            voice: "sage",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1",
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000,
            },
            temperature: 0.8,
            max_response_output_tokens: "inf",
          },
        };

        openAISocket.send(JSON.stringify(sessionConfig));
        console.log("Session configuration sent");
      }

      // Relay all messages to client
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };

    openAISocket.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1011, "OpenAI connection error");
      }
    };

    openAISocket.onclose = () => {
      console.log("OpenAI connection closed");
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };

    // Handle client messages
    socket.onopen = () => {
      console.log("Client connected");
    };

    socket.onmessage = (event) => {
      // Relay client messages to OpenAI
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    };

    socket.onclose = async () => {
      console.log("Client disconnected");
      
      // Close OpenAI connection
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.close();
      }

      // Update session tracking
      if (sessionId) {
        const sessionEndTime = Date.now();
        const minutesUsed = Math.ceil((sessionEndTime - sessionStartTime) / 60000);

        await supabase
          .from("usage_tracking")
          .update({
            ended_at: new Date().toISOString(),
            minutes_used: minutesUsed,
          })
          .eq("id", sessionId);

        console.log(`Session ${sessionId} ended. Minutes used: ${minutesUsed}`);
      }
    };

    socket.onerror = (error) => {
      console.error("Client WebSocket error:", error);
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.close();
      }
    };

    return response;
  } catch (error) {
    console.error("WebSocket setup error:", error);
    return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }
});
