
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, languageVoiceMap, pollyVoiceMap } from "./config.ts";
import { splitTextIntoChunks, processAudioToBase64 } from "./utils.ts";
import { textToSpeechAzure } from "./azure.ts";
import { textToSpeechPolly } from "./polly.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language, isTargetLanguage } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`TTS request for language: ${language}, text length: ${text.length}, isTargetLanguage: ${isTargetLanguage}`);

    // Get voice settings based on language
    const voiceSettings = languageVoiceMap[language?.toLowerCase()] || languageVoiceMap["english"];

    // Split text only if it's actually long
    const textChunks = text.length > 8000 ? splitTextIntoChunks(text) : [text];
    
    if (textChunks.length > 1) {
      console.log(`Split text into ${textChunks.length} chunks`);
    }
    
    // Determine single TTS service to use - prefer Azure for consistency and speed
    let audioBuffer;
    
    try {
      // Simplified: Always try Azure first as it's more reliable
      console.log(`Using Azure TTS with voice: ${voiceSettings.voiceName}`);
      audioBuffer = await textToSpeechAzure(
        text, 
        voiceSettings.voiceName,
        voiceSettings.languageCode
      );
    } catch (error) {
      // Only fall back to Polly if explicitly requested AND Azure fails
      if (isTargetLanguage === true) {
        try {
          const pollyVoice = pollyVoiceMap[language?.toLowerCase()] || "Joanna";
          console.log(`Azure failed, trying AWS Polly with voice: ${pollyVoice}`);
          audioBuffer = await textToSpeechPolly(text, pollyVoice);
        } catch (pollyError) {
          console.error(`Both TTS services failed: ${error}, ${pollyError}`);
          throw new Error('All TTS services failed');
        }
      } else {
        throw error;
      }
    }
    
    // Process to base64 efficiently
    const base64Audio = processAudioToBase64(audioBuffer);

    console.log("Successfully generated speech, returning base64 audio");

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate speech. Please try again.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
