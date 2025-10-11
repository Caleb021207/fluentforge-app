import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";

    if (upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket connection", { status: 400 });
    }

    // Get authorization token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify user and check usage limits
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Check if user can start premium voice session
    const { data: canStart, error: checkError } = await supabase.rpc(
      'can_start_premium_voice_session',
      { target_student_id: user.id }
    );

    if (checkError || !canStart?.allowed) {
      return new Response(
        JSON.stringify({ error: 'Monthly limit reached', details: canStart }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let openAISocket: WebSocket | null = null;
    let sessionStartTime = Date.now();
    let sessionId = crypto.randomUUID();
    let minutesUsed = 0;

    socket.onopen = async () => {
      console.log('Client connected');
      
      // Connect to OpenAI Realtime API
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        socket.send(JSON.stringify({ type: 'error', message: 'OpenAI API key not configured' }));
        socket.close();
        return;
      }

      openAISocket = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "OpenAI-Beta": "realtime=v1"
          }
        }
      );

      openAISocket.onopen = () => {
        console.log('Connected to OpenAI');
        // Send session configuration after connection
        openAISocket?.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are a helpful English language tutor. Speak clearly and at a moderate pace. Help students practice their English conversation skills by asking engaging questions and providing gentle corrections when needed.',
            voice: 'sage',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.8,
            max_response_output_tokens: 'inf'
          }
        }));
      };

      openAISocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Check time limit every response
        const currentMinutes = Math.ceil((Date.now() - sessionStartTime) / 60000);
        const remaining = canStart.minutes_limit - canStart.minutes_used - currentMinutes;
        
        if (remaining <= 0) {
          socket.send(JSON.stringify({
            type: 'time_limit_reached',
            message: 'Your 15-minute session has ended'
          }));
          openAISocket?.close();
          socket.close();
          return;
        }
        
        // Send time warnings
        if (remaining === 2 && minutesUsed !== currentMinutes) {
          socket.send(JSON.stringify({
            type: 'time_warning',
            minutes_remaining: 2
          }));
        } else if (remaining === 1 && minutesUsed !== currentMinutes) {
          socket.send(JSON.stringify({
            type: 'time_warning',
            minutes_remaining: 1
          }));
        }
        
        minutesUsed = currentMinutes;
        
        // Forward message to client
        socket.send(event.data);
      };

      openAISocket.onerror = (error) => {
        console.error('OpenAI WebSocket error:', error);
        socket.send(JSON.stringify({ type: 'error', message: 'Connection error' }));
      };

      openAISocket.onclose = () => {
        console.log('OpenAI connection closed');
        socket.close();
      };
    };

    socket.onmessage = (event) => {
      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    };

    socket.onclose = async () => {
      console.log('Client disconnected');
      openAISocket?.close();
      
      // Save usage
      const totalMinutes = Math.ceil((Date.now() - sessionStartTime) / 60000);
      if (totalMinutes > 0) {
        await supabase.from('usage_tracking').insert({
          student_id: user.id,
          session_id: sessionId,
          session_type: 'premium_voice_practice',
          minutes_used: totalMinutes
        });

        // Update student usage limits
        const { data: currentLimits } = await supabase
          .from('student_usage_limits')
          .select('premium_voice_minutes_used_current_month')
          .eq('student_id', user.id)
          .single();

        if (currentLimits) {
          await supabase
            .from('student_usage_limits')
            .update({
              premium_voice_minutes_used_current_month: 
                currentLimits.premium_voice_minutes_used_current_month + totalMinutes
            })
            .eq('student_id', user.id);
        }
      }
    };

    socket.onerror = (error) => {
      console.error('Client socket error:', error);
      openAISocket?.close();
    };

    return response;
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
