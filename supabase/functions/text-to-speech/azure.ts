
/**
 * Azure TTS service implementation
 */
export async function getAzureToken(): Promise<string> {
  const AZURE_SPEECH_KEY = Deno.env.get('AZURE_SPEECH_KEY') || '7QiOIwzneRTyQdfBRbkNTNCkQEqAnR3RLwF0IEIG4resGOP1WfbeJQQJ99BDACYeBjFXJ3w3AAAYACOGMQxo';
  const AZURE_REGION = Deno.env.get('AZURE_REGION') || 'eastus';
  
  if (!AZURE_SPEECH_KEY) {
    throw new Error('Azure Speech key is not configured');
  }

  try {
    const response = await fetch(
      `https://${AZURE_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get Azure token: ${await response.text()}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error getting Azure token:', error);
    throw error;
  }
}

/**
 * Convert text to speech with Azure
 */
export async function textToSpeechAzure(text: string, voice: string, language: string, speechRate: number = 1.0): Promise<ArrayBuffer> {
  const AZURE_REGION = Deno.env.get('AZURE_REGION') || 'eastus';
  const token = await getAzureToken();
  
  // Convert speech rate to percentage for SSML
  const ratePercentage = Math.round((speechRate - 1) * 100);
  const rateString = ratePercentage >= 0 ? `+${ratePercentage}%` : `${ratePercentage}%`;
  
  // Prepare SSML document with speech rate
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
      <voice name="${voice}">
        <prosody rate="${rateString}">
          ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')}
        </prosody>
      </voice>
    </speak>
  `;

  const response = await fetch(
    `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'TextToSpeechFunction'
      },
      body: ssml
    }
  );

  if (!response.ok) {
    throw new Error(`Azure TTS failed: ${await response.text()}`);
  }

  return await response.arrayBuffer();
}
