
// Translation utility functions for chat-with-tutor

// Create a simple in-memory cache for translations
export class TranslationCache {
  private cache = new Map<string, string>();
  private readonly MAX_ENTRIES = 100;
  
  get(key: string): string | undefined {
    return this.cache.get(key);
  }
  
  set(key: string, value: string): void {
    // Implement simple LRU by clearing oldest entries when exceeding size
    if (this.cache.size >= this.MAX_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, value);
  }
}

// Function to get translation with proper error handling
export async function getTranslation(
  content: string, 
  targetLanguage: string, 
  apiKey: string,
  filterContentFn: (content: string) => string,
  containsProhibitedFn: (content: string) => boolean,
  getLangNameFn: (lang: string) => string
): Promise<Response> {
  const nativeLanguage = getLangNameFn(targetLanguage);
  
  // Create system message for translation
  const systemMessage = `You are a professional translator. Translate the following text into ${nativeLanguage}. 
  Maintain the original meaning and tone. Provide ONLY the translation, with no explanations, notes, or additional text.
  DO NOT include phrases like "Translation:" or "Here's the translation:" in your response.`;
  
  // Check for prohibited content and filter if needed
  let safeContent = content;
  if (containsProhibitedFn(content)) {
    safeContent = filterContentFn(content);
  }
  
  try {
    return await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: safeContent }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
  } catch (error) {
    console.error('Translation API call failed:', error);
    throw new Error(`Failed to call translation API: ${error.message}`);
  }
}

// Specialized function for specific language translations
export async function getSpecificLanguageTranslation(
  content: string,
  languageName: string,
  scriptName: string,
  apiKey: string,
  filterContentFn: (content: string) => string,
  containsProhibitedFn: (content: string) => boolean
): Promise<string> {
  // Enhanced system message with explicit script instructions
  const systemMessage = `You are a professional translator specializing in ${languageName}. 
  Translate the following text into ${languageName} using ${scriptName} script.
  
  VERY IMPORTANT:
  - Provide ONLY the translation, no explanations or any other text
  - DO NOT include phrases like "Translation:" in your response
  - Ensure your translation uses proper ${scriptName} script only
  - DO NOT mix in words from other languages
  - Make sure the translation flows naturally in ${languageName}
  `;
  
  // Special handling for Cantonese
  if (languageName === 'Cantonese') {
    // Enhanced system message specifically for Cantonese
    const cantoneseSystemMessage = `You are a professional translator specializing in Cantonese (廣東話).
    Translate the following text into CANTONESE ONLY, using Traditional Chinese characters.
    
    EXTREMELY IMPORTANT INSTRUCTIONS:
    - Your output must be 100% in Cantonese using Traditional Chinese characters (NOT Simplified Chinese)
    - DO NOT use Mandarin phrases or grammar - strictly use Cantonese expressions
    - You MUST use Cantonese-specific particles like 嘅, 啦, 喎, 囉 where appropriate
    - DO NOT include any Latin/Roman alphabet text at all
    - NEVER use any language other than Cantonese in your translation
    - Provide ONLY the translation, with no additional text or explanations
    - If you're not 100% sure about the Cantonese translation, provide the closest Cantonese equivalent
    
    EXAMPLE OF CORRECT CANTONESE (not Mandarin):
    English: "How are you today?"
    Good Cantonese: "你今日點呀?" (uses 今日 not 今天, uses 點 not 怎麼樣)
    `;
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: cantoneseSystemMessage },
            { role: 'user', content: content }
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error(`Cantonese translation error:`, error);
      return "翻譯暫時不可用。請諒解不便之處。";
    }
  }
  
  // Check for prohibited content and filter if needed
  let safeContent = content;
  if (containsProhibitedFn(content)) {
    safeContent = filterContentFn(content);
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: safeContent }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Translation error for ${languageName}:`, error);
    throw new Error(`Failed to get ${languageName} translation: ${error.message}`);
  }
}
