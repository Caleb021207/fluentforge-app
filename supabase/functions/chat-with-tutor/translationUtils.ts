
// Translation utilities for the chat-with-tutor function

// Translation cache to improve performance
export class TranslationCache {
  private cache: Map<string, string> = new Map();
  private maxSize: number = 100; // Cache size limit
  
  // Get cached translation
  get(key: string): string | undefined {
    return this.cache.get(key);
  }
  
  // Store translation in cache
  set(key: string, value: string): void {
    // Implement simple LRU by removing oldest entry when cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, value);
  }
  
  // Clear the cache
  clear(): void {
    this.cache.clear();
  }
}

// Function to get translation from OpenAI API
export async function getTranslation(
  content: string,
  userLanguage: string,
  apiKey: string,
  filterFn: (text: string) => string,
  containsProhibitedFn: (text: string) => boolean,
  getUserNativeLanguageFn: (lang: string) => string
): Promise<Response> {
  const nativeLanguage = getUserNativeLanguageFn(userLanguage);
  
  // Special prompt for French translations to ensure proper accent marks and grammar
  let systemPrompt = "";
  if (userLanguage === "english" && localStorage.getItem("targetLanguage") === "french") {
    systemPrompt = `You are a professional French language translator. Translate the following English text to natural, accurate French, preserving the tone and meaning. Make sure to include all proper French accent marks (é, è, ê, ë, à, ù, û, ç, etc.) and follow French grammar rules. The translation should be suitable for an intermediate French learner.`;
  } else {
    systemPrompt = `You are a professional translator. Translate the following text to ${nativeLanguage} in a natural, accurate way that preserves the tone and meaning.`;
  }
  
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });
}

// Function to get translation with specific script requirements (e.g., Hindi in Devanagari)
export async function getSpecificLanguageTranslation(
  content: string,
  language: string,
  script: string,
  apiKey: string,
  filterFn: (text: string) => string,
  containsProhibitedFn: (text: string) => boolean
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `You are a professional translator. Translate the following text to ${language} using ${script} script. The output MUST use ${script} script characters only.` 
        },
        { role: 'user', content }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get ${language} translation: ${response.status}`);
  }
  
  const data = await response.json();
  let translation = data.choices?.[0]?.message?.content || '';
  
  // Filter any prohibited content
  if (containsProhibitedFn(translation)) {
    translation = filterFn(translation);
  }
  
  return translation;
}

// French-specific translation helpers for better language learning
export function getFrenchTranslationWithExplanation(
  content: string,
  apiKey: string,
  filterFn: (text: string) => string,
  containsProhibitedFn: (text: string) => boolean
): Promise<Response> {
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `You are a professional French language educator. Translate the following text from English to French, including proper accent marks and following French grammar rules. After the translation, provide a brief note about any notable grammar points or idioms used in the translation, marked with "Note:".` 
        },
        { role: 'user', content }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });
}
