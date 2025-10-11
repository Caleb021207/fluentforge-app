import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  console.log("🔥 REQUEST RECEIVED");

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
  
  socket.onopen = () => {
    console.log("✅ CLIENT CONNECTED");
    
    const openai = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
      { headers: { 
        Authorization: `Bearer ${OPENAI_KEY}`,
        "OpenAI-Beta": "realtime=v1"
      }}
    );

    openai.onopen = () => console.log("✅ OPENAI CONNECTED");
    
    openai.onmessage = (e) => {
      const data = JSON.parse(e.data);
      
      if (data.type === "session.created") {
        console.log("📝 CONFIGURING");
        openai.send(JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["audio"],
            voice: "sage",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            turn_detection: { type: "server_vad" }
          }
        }));
      }
      
      if (socket.readyState === 1) socket.send(e.data);
    };
    
    openai.onerror = (e) => console.error("❌ OPENAI ERROR", e);
    openai.onclose = () => socket.close();

    socket.onmessage = (e) => {
      if (openai.readyState === 1) openai.send(e.data);
    };
    
    socket.onclose = () => openai.close();
  };

  return response;
});
