// Translation utilities

// Simple in-memory cache for translations
export class TranslationCache {
  private cache: Map<string, { content: string, timestamp: number }> = new Map();
  private ttl = 3600000; // 1 hour cache TTL
  
  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.content;
  }
  
  set(key: string, content: string): void {
    this.cache.set(key, { content, timestamp: Date.now() });
    
    // Clear old entries periodically to avoid memory leaks
    if (this.cache.size > 1000) {
      this.pruneExpiredEntries();
    }
  }
  
  private pruneExpiredEntries(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    });
  }
}

// Helper function to get translation for a message
export async function getTranslation(
  message: string, 
  userLanguage: string, 
  openAIApiKey: string,
  filterContentCallback: (text: string) => string,
  containsProhibitedCallback: (text: string) => boolean,
  getLanguageNameCallback: (lang: string) => string
) {
  try {
    const targetLanguage = getLanguageNameCallback(userLanguage);
    
    // CIPA Compliance: Filter message before translation 
    let safeMessage = message;
    if (containsProhibitedCallback(message)) {
      console.log('Message contains prohibited content, filtering before translation');
      safeMessage = filterContentCallback(message);
    }
    
    return await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a professional translator. Translate the following text from English to ${targetLanguage}. Just return the translation, no explanations. For Hindi translations, ensure you use Devanagari script.
            
            IMPORTANT: Never translate inappropriate content. All translations must be suitable for K-12 classroom settings.` 
          },
          { role: 'user', content: safeMessage }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
  } catch (error) {
    console.error('Error in getTranslation:', error);
    throw error;
  }
}

// Helper function to get special translation for specific languages like Hindi
export async function getSpecificLanguageTranslation(
  message: string, 
  language: string, 
  script: string, 
  openAIApiKey: string,
  filterContentCallback: (text: string) => string,
  containsProhibitedCallback: (text: string) => boolean
): Promise<string> {
  try {
    console.log(`Getting ${language} translation with ${script} script for: "${message}"`);
    
    // CIPA Compliance: Filter message before translation
    let safeMessage = message;
    if (containsProhibitedCallback(message)) {
      console.log('Message contains prohibited content, filtering before translation');
      safeMessage = filterContentCallback(message);
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a professional translator. Translate the following text from English to ${language} using ${script} script. ONLY return the translation, no explanations or additional text. Ensure the translation is accurate and natural-sounding.
            
            IMPORTANT: Never translate inappropriate content. All translations must be suitable for K-12 classroom settings.` 
          },
          { role: 'user', content: safeMessage }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }
    
    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content || '';
    console.log(`Got ${language} translation: "${translation}"`);
    
    // CIPA Compliance: Filter translation before returning
    if (containsProhibitedCallback(translation)) {
      console.log(`${language} translation contains prohibited content, filtering`);
      return filterContentCallback(translation);
    }
    
    return translation;
  } catch (error) {
    console.error(`Error getting ${language} translation:`, error);
    throw error;
  }
}
