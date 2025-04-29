
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, languageVoiceMap, pollyVoiceMap } from "./config.ts";
import { splitTextIntoChunks, processAudioToBase64, concatenateAudioStreams } from "./utils.ts";
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

    // Split text into chunks if too long
    const textChunks = splitTextIntoChunks(text);
    console.log(`Split text into ${textChunks.length} chunks`);

    // Process each chunk in parallel
    const audioPromises = textChunks.map(async (chunk, index) => {
      console.log(`Processing chunk ${index + 1}/${textChunks.length}, length: ${chunk.length}`);
      
      // Determine which TTS service to use - use Polly for target language, Azure for native language
      let audioBuffer;
      
      if (isTargetLanguage === true) {
        // Use Polly for target language
        try {
          const pollyVoice = pollyVoiceMap[language?.toLowerCase()] || "Joanna";
          console.log(`Using AWS Polly for target language with voice: ${pollyVoice}`);
          audioBuffer = await textToSpeechPolly(chunk, pollyVoice);
        } catch (error) {
          console.error(`Polly TTS failed, falling back to Azure: ${error}`);
          // Fallback to Azure if Polly fails
          audioBuffer = await textToSpeechAzure(
            chunk, 
            voiceSettings.voiceName,
            voiceSettings.languageCode
          );
        }
      } else {
        // Use Azure for native language
        console.log(`Using Azure for native language with voice: ${voiceSettings.voiceName}`);
        audioBuffer = await textToSpeechAzure(
          chunk, 
          voiceSettings.voiceName,
          voiceSettings.languageCode
        );
      }
      
      return audioBuffer;
    });

    // Wait for all audio chunks to be generated
    const audioBuffers = await Promise.all(audioPromises);
    
    // Concatenate audio streams
    const combinedAudio = await concatenateAudioStreams(audioBuffers);
    
    // Process to base64 efficiently
    const base64Audio = processAudioToBase64(combinedAudio);

    console.log("Successfully generated speech, returning base64 audio");

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    let errorMessage = 'Failed to generate speech. Please try again.';
    if (error.message.includes('Azure Speech key')) {
      errorMessage = 'The speech service is not properly configured. Please contact support.';
    } else if (error.message.includes('AWS credentials')) {
      errorMessage = 'AWS Polly is not properly configured. Please contact support.';
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
