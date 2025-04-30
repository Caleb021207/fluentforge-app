
import { corsHeaders } from "./config.ts";

// Function to convert text to speech using Meta MMS
export async function textToSpeechMetaMms(text: string, languageCode: string): Promise<Uint8Array> {
  console.log(`Using Meta MMS TTS with language code: ${languageCode}`);
  
  // Get Meta MMS server URL from environment variable, with a fallback
  const MMS_SERVER_URL = Deno.env.get('META_MMS_SERVER_URL') || 'http://localhost:8080/tts';
  
  // Prepare payload for Meta MMS API
  const payload = {
    text: text,
    language: languageCode,
    voice_id: "v2/en", // Default voice, adjust based on your Meta MMS setup
    model_id: "mms" // Default model, adjust based on your Meta MMS setup
  };

  try {
    // Call the Meta MMS server
    const response = await fetch(MMS_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error(`Meta MMS TTS failed with status ${response.status}: ${errorDetails}`);
      throw new Error(`Meta MMS TTS failed: ${errorDetails}`);
    }

    // Assuming the server returns the audio as binary data
    const audioBuffer = await response.arrayBuffer();
    return new Uint8Array(audioBuffer);
  } catch (error) {
    console.error("Meta MMS TTS error:", error);
    throw error;
  }
}
