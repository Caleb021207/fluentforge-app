
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
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
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
  
  // Special case for Cantonese
  if (targetLanguage.toLowerCase() === 'cantonese') {
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
            { role: 'system', content: cantoneseSystemMessage },
            { role: 'user', content: safeContent }
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
      });
    } catch (error) {
      console.error('Translation API call failed:', error);
      throw new Error(`Failed to call translation API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
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
    throw new Error(`Failed to call translation API: ${error instanceof Error ? error.message : String(error)}`);
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
    throw new Error(`Failed to get ${languageName} translation: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Specialized function just for Cantonese translations to ensure proper Traditional Chinese characters and Cantonese grammar
export async function getCantoneseTranslation(
  content: string,
  apiKey: string,
  filterContentFn: (content: string) => string,
  containsProhibitedFn: (content: string) => boolean
): Promise<string> {
  // Enhanced system message specifically for Cantonese with detailed instructions
  const cantoneseSystemMessage = `You are a professional translator specializing in Cantonese (廣東話).
  Translate the following text into CANTONESE ONLY, using Traditional Chinese characters.
  
  EXTREMELY IMPORTANT INSTRUCTIONS:
  - Your output must be 100% in Cantonese using Traditional Chinese characters (NOT Simplified Chinese)
  - DO NOT use Mandarin phrases or grammar - strictly use Cantonese expressions
  - You MUST use Cantonese-specific particles like 嘅, 啦, 喎, 囉 where appropriate
  - You MUST use Cantonese vocabulary like 唔係 (not 不是), 冇 (not 沒有), 喺 (not 在), etc.
  - DO NOT include any Latin/Roman alphabet text at all
  - NEVER use any language other than Cantonese in your translation
  - Provide ONLY the translation, with no additional text or explanations
  
  EXAMPLES OF CORRECT CANTONESE (not Mandarin):
  English: "I don't understand" → Cantonese: "我唔明白" (NOT "我不明白")
  English: "Where are you going?" → Cantonese: "你去邊度呀?" (NOT "你去哪裡?")
  English: "I don't have time" → Cantonese: "我冇時間" (NOT "我沒有時間")
  `;
  
  // Check for prohibited content and filter if needed
  let safeContent = content;
  if (containsProhibitedFn(content)) {
    safeContent = filterContentFn(content);
  }
  
  try {
    // Try up to 3 times to get a valid Cantonese translation
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Cantonese translation attempt ${attempt}`);
      
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
            { role: 'user', content: safeContent }
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
      });
      
      if (!response.ok) {
        console.error(`API error on attempt ${attempt}: ${response.status}`);
        if (attempt === 3) {
          return "翻譯暫時不可用。請諒解不便之處。";
        }
        continue;
      }
      
      const data = await response.json();
      const translation = data.choices[0].message.content.trim();
      
      // Validate that it's proper Cantonese with Chinese characters
      const containsChineseChars = /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(translation);
      const containsSubstantialLatinText = /[a-zA-Z]{4,}/.test(translation);
      
      if (containsChineseChars && !containsSubstantialLatinText && translation.length > 5) {
        console.log(`Valid Cantonese translation obtained on attempt ${attempt}`);
        return translation;
      } else {
        console.log(`Invalid Cantonese translation on attempt ${attempt}:`, translation);
        if (attempt === 3) {
          return "翻譯暫時不可用。請諒解不便之處。";
        }
      }
    }
    
    // Fallback if all attempts fail
    return "翻譯暫時不可用。請諒解不便之處。";
  } catch (error) {
    console.error(`Cantonese translation error:`, error);
    return "翻譯暫時不可用。請諒解不便之處。";
  }
}

