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
    // Authenticate user
    let authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      const url = new URL(req.url);
      const token = url.searchParams.get("authorization");
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }
    
    if (!authHeader) {
      console.error("No authorization provided");
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

    console.log("✅ User authenticated:", user.id);

    // Get languages from query params
    const url = new URL(req.url);
    const nativeLanguage = url.searchParams.get("nativeLanguage") || "english";
    const targetLanguage = url.searchParams.get("targetLanguage") || "english";

    console.log(`Languages: native=${nativeLanguage}, target=${targetLanguage}`);

    // Track session start
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
      console.error("Session tracking error:", insertError);
    }

    const sessionId = sessionData?.id;
    console.log("📊 Session created:", sessionId);

    // Upgrade to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req);

    // Connect to OpenAI Realtime API
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    console.log("🔌 Connecting to OpenAI Realtime API...");
    
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

    // OpenAI connection handlers
    openAISocket.onopen = () => {
      console.log("✅ Connected to OpenAI");
    };

    openAISocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Configure session after connection
      if (data.type === "session.created" && !sessionConfigured) {
        sessionConfigured = true;
        console.log("📝 Configuring session...");
        
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
        console.log("✅ Session configured");
      }

      // Relay all OpenAI messages to client
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };

    openAISocket.onerror = (error) => {
      console.error("❌ OpenAI WebSocket error:", error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1011, "OpenAI connection error");
      }
    };

    openAISocket.onclose = () => {
      console.log("🔌 OpenAI connection closed");
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };

    // Client connection handlers
    socket.onopen = () => {
      console.log("✅ Client connected");
    };

    socket.onmessage = (event) => {
      // Relay client messages to OpenAI
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    };

    socket.onclose = async () => {
      console.log("🔌 Client disconnected");
      
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

        console.log(`📊 Session ended. Minutes: ${minutesUsed}`);
      }
    };

    socket.onerror = (error) => {
      console.error("❌ Client WebSocket error:", error);
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.close();
      }
    };

    return response;
  } catch (error) {
    console.error("❌ Setup error:", error);
    return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }
});
