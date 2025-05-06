
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, languageVoiceMap, pollyVoiceMap, metaMmsLanguageMap } from "./config.ts";
import { splitTextIntoChunks, processAudioToBase64 } from "./utils.ts";
import { textToSpeechAzure } from "./azure.ts";
import { textToSpeechPolly } from "./polly.ts";
import { textToSpeechMetaMms } from "./metaMms.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language, isTargetLanguage, useMetaMms } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`TTS request for language: ${language}, text length: ${text.length}, isTargetLanguage: ${isTargetLanguage}, useMetaMms: ${useMetaMms}`);

    // Get voice settings based on language
    const voiceSettings = languageVoiceMap[language?.toLowerCase()] || languageVoiceMap["english"];

    // Split text only if it's actually long
    const textChunks = text.length > 8000 ? splitTextIntoChunks(text) : [text];
    
    if (textChunks.length > 1) {
      console.log(`Split text into ${textChunks.length} chunks`);
    }
    
    // ALWAYS try Azure first for ALL languages
    let audioBuffer;
    const languageLower = language?.toLowerCase();
    
    try {
      // Try Azure first as primary TTS provider
      console.log(`Using Azure TTS with voice: ${voiceSettings.voiceName}`);
      audioBuffer = await textToSpeechAzure(
        text, 
        voiceSettings.voiceName,
        voiceSettings.languageCode
      );
    } catch (azureError) {
      console.error('Azure TTS failed:', azureError);
      
      // Try Meta MMS as second option if supported or explicitly requested
      if (metaMmsLanguageMap[languageLower] || useMetaMms === true) {
        try {
          const metaMmsLangCode = metaMmsLanguageMap[languageLower] || "eng"; // fallback to English
          console.log(`Azure failed, trying Meta MMS with language code: ${metaMmsLangCode}`);
          audioBuffer = await textToSpeechMetaMms(text, metaMmsLangCode);
        } catch (metaError) {
          console.error('Meta MMS failed:', metaError);
          
          // Fall back to Polly as last resort
          try {
            const pollyVoice = pollyVoiceMap[languageLower] || "Joanna";
            console.log(`Azure and Meta MMS failed, trying AWS Polly with voice: ${pollyVoice}`);
            audioBuffer = await textToSpeechPolly(text, pollyVoice);
          } catch (pollyError) {
            console.error(`All TTS services failed: ${azureError}, ${metaError}, ${pollyError}`);
            throw new Error('All TTS services failed');
          }
        }
      } else {
        // If Meta MMS is not supported, try Polly directly
        try {
          const pollyVoice = pollyVoiceMap[languageLower] || "Joanna";
          console.log(`Azure failed, trying AWS Polly with voice: ${pollyVoice}`);
          audioBuffer = await textToSpeechPolly(text, pollyVoice);
        } catch (pollyError) {
          console.error(`Both TTS services failed: ${azureError}, ${pollyError}`);
          throw new Error('All TTS services failed');
        }
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
