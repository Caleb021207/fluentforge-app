// Translation utility functions for chat-with-tutor - using Lovable AI

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export class TranslationCache {
  private cache = new Map<string, string>();
  private readonly MAX_ENTRIES = 100;
  
  get(key: string): string | undefined {
    return this.cache.get(key);
  }
  
  set(key: string, value: string): void {
    if (this.cache.size >= this.MAX_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

export async function getTranslation(
  content: string, 
  targetLanguage: string, 
  apiKey: string,
  filterContentFn: (content: string) => string,
  containsProhibitedFn: (content: string) => boolean,
  getLangNameFn: (lang: string) => string
): Promise<Response> {
  const nativeLanguage = getLangNameFn(targetLanguage);
  
  let systemMessage = `You are a professional translator. Translate the following text into ${nativeLanguage}. Provide ONLY the translation, no explanations.`;
  
  if (targetLanguage.toLowerCase() === 'cantonese') {
    systemMessage = `You are a professional Cantonese (廣東話) translator. Translate into Cantonese using Traditional Chinese characters. Use Cantonese-specific particles (嘅, 啦, 喎, 囉). DO NOT use Mandarin. Provide ONLY the translation.`;
  }

  let safeContent = containsProhibitedFn(content) ? filterContentFn(content) : content;

  return await fetch(LOVABLE_AI_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-lite',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: safeContent }
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });
}

export async function getSpecificLanguageTranslation(
  content: string,
  languageName: string,
  scriptName: string,
  apiKey: string,
  filterContentFn: (content: string) => string,
  containsProhibitedFn: (content: string) => boolean
): Promise<string> {
  let systemMessage = `You are a professional ${languageName} translator. Translate into ${languageName} using ${scriptName} script. Provide ONLY the translation.`;
  
  if (languageName === 'Cantonese') {
    systemMessage = `You are a professional Cantonese (廣東話) translator. Translate into Cantonese using Traditional Chinese characters. Use Cantonese-specific vocabulary (唔係 not 不是, 冇 not 沒有). Provide ONLY the translation.`;
  }

  const safeContent = containsProhibitedFn(content) ? filterContentFn(content) : content;

  try {
    const response = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: safeContent }
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Translation error for ${languageName}:`, error);
    if (languageName === 'Cantonese') return "翻譯暫時不可用。請諒解不便之處。";
    throw error;
  }
}

export async function getCantoneseTranslation(
  content: string,
  apiKey: string,
  filterContentFn: (content: string) => string,
  containsProhibitedFn: (content: string) => boolean
): Promise<string> {
  return getSpecificLanguageTranslation(content, 'Cantonese', 'Traditional Chinese', apiKey, filterContentFn, containsProhibitedFn);
}
