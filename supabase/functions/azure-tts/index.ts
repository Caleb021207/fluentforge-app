
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, language } = await req.json()
    
    if (!text || !language) {
      throw new Error('Missing required parameters')
    }

    // Get Azure Speech key from environment
    const azureKey = Deno.env.get('AZURE_SPEECH_KEY')
    if (!azureKey) {
      throw new Error('Azure Speech key not configured')
    }

    const region = 'eastus'  // Using a default region
    const voiceName = getAzureVoiceForLanguage(language)
    
    // Call Azure Speech API to generate speech
    const response = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'LanguageLearningApp'
        },
        body: `<speak version='1.0' xml:lang='${mapLanguageToAzureCode(language)}'><voice xml:lang='${mapLanguageToAzureCode(language)}' xml:gender='Female' name='${voiceName}'>${text}</voice></speak>`
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Azure API error: ${response.status} - ${errorText}`)
    }

    // Get audio content as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer()
    
    // Convert to base64 for transferring over JSON
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    )

    return new Response(
      JSON.stringify({ success: true, audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Azure TTS Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper functions for language and voice mapping
function getAzureVoiceForLanguage(language: string): string {
  const voiceMap: Record<string, string> = {
    'english': 'en-US-JennyNeural',
    'spanish': 'es-ES-ElviraNeural',
    'french': 'fr-FR-DeniseNeural',
    'german': 'de-DE-KatjaNeural',
    'italian': 'it-IT-ElsaNeural',
    'portuguese': 'pt-BR-FranciscaNeural',
    'russian': 'ru-RU-SvetlanaNeural',
    'japanese': 'ja-JP-NanamiNeural',
    'korean': 'ko-KR-SunHiNeural',
    'chinese': 'zh-CN-XiaoxiaoNeural',
    'hindi': 'hi-IN-SwaraNeural',
    'arabic': 'ar-SA-ZariyahNeural',
    // Add more languages as needed
  }

  return voiceMap[language] || 'en-US-JennyNeural'
}

function mapLanguageToAzureCode(language: string): string {
  const languageMap: Record<string, string> = {
    'english': 'en-US',
    'spanish': 'es-ES',
    'french': 'fr-FR',
    'german': 'de-DE',
    'italian': 'it-IT',
    'portuguese': 'pt-BR',
    'russian': 'ru-RU',
    'japanese': 'ja-JP',
    'korean': 'ko-KR',
    'chinese': 'zh-CN',
    'hindi': 'hi-IN',
    'arabic': 'ar-SA',
    // Add more languages as needed
  }

  return languageMap[language] || 'en-US'
}
