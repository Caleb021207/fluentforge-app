import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  determineLanguagePair, 
  getLanguageDisplayName, 
  getUserNativeLanguage,
  containsDevanagariScript
} from "./languageUtils.ts";
import {
  filterCipaProhibitedContent,
  containsProhibitedContent,
  logEducationalDataAccess,
  getCipaFerpaInstructions
} from "./complianceUtils.ts";
import {
  TranslationCache,
  getTranslation,
  getSpecificLanguageTranslation
} from "./translationUtils.ts";
import {
  ConnectionPool,
  RateLimiter
} from "./performanceUtils.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || "";

// Initialize utility classes
const connectionPool = new ConnectionPool();
const rateLimiter = new RateLimiter();
const translationCache = new TranslationCache();

// Handler for translation-only requests
async function handleTranslationRequest(message: string, userLanguage: string) {
  try {
    console.log(`Processing translation-only request for language: ${userLanguage}`);
    
    // Special handling for Hindi to ensure proper Devanagari script
    if (userLanguage === 'hindi') {
      try {
        const hindiTranslation = await getSpecificLanguageTranslation(
          message, 
          'hindi', 
          'Devanagari', 
          openAIApiKey,
          filterCipaProhibitedContent,
          containsProhibitedContent
        );
        
        // Validate the translation
        if (!hindiTranslation || typeof hindiTranslation !== 'string') {
          console.error('Invalid Hindi translation result:', hindiTranslation);
          throw new Error('Failed to get valid Hindi translation');
        }
        
        return new Response(
          JSON.stringify({ translation: hindiTranslation }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error in Hindi translation request:', error);
        throw error;
      }
    }
    
    // Enhanced special handling for Tagalog translations
    if (userLanguage === 'tagalog') {
      try {
        console.log('Processing dedicated Tagalog translation request');
        const tagalogTranslation = await getSpecificLanguageTranslation(
          message, 
          'Filipino/Tagalog', 
          'Latin', 
          openAIApiKey,
          filterCipaProhibitedContent,
          containsProhibitedContent
        );
        
        // Validate the translation - ensure it's a proper string
        if (!tagalogTranslation || typeof tagalogTranslation !== 'string') {
          console.error('Invalid Tagalog translation result:', tagalogTranslation);
          throw new Error('Failed to get valid Tagalog translation');
        }
        
        console.log(`Tagalog translation result (${tagalogTranslation.length} chars): "${tagalogTranslation.substring(0, 50)}..."`);
        
        // Wrap in try-catch to ensure we always return a valid response
        try {
          return new Response(
            JSON.stringify({ translation: tagalogTranslation }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (jsonError) {
          console.error('Error stringifying Tagalog translation response:', jsonError);
          // Fallback to a simpler response if JSON stringification fails
          return new Response(
            `{"translation": "May problema sa pagsasalin. Paumanhin sa abala."}`,
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('Error in Tagalog translation request:', error);
        // Return a fallback translation instead of throwing
        return new Response(
          JSON.stringify({ 
            translation: "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.",
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Enhanced special handling for Cantonese translations
    if (userLanguage === 'cantonese') {
      try {
        console.log('Processing dedicated Cantonese translation request');
        const cantoneseTranslation = await getSpecificLanguageTranslation(
          message, 
          'Cantonese', 
          'Traditional Chinese', 
          openAIApiKey,
          filterCipaProhibitedContent,
          containsProhibitedContent
        );
        
        // Validate the translation - ensure it's a proper string with Chinese characters
        if (!cantoneseTranslation || typeof cantoneseTranslation !== 'string') {
          console.error('Invalid Cantonese translation result:', cantoneseTranslation);
          throw new Error('Failed to get valid Cantonese translation');
        }
        
        // Verify that the translation contains Chinese characters
        const containsChineseChars = /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF]/.test(cantoneseTranslation);
        
        // Check for substantial Latin text which would indicate mixed language
        const containsSubstantialLatinScript = /[a-zA-Z]{4,}/.test(cantoneseTranslation);
        
        if (!containsChineseChars || containsSubstantialLatinScript) {
          console.error('Cantonese translation does not contain valid Chinese characters or contains other languages:', cantoneseTranslation);
          throw new Error('Failed to get valid Cantonese translation');
        }
        
        console.log(`Cantonese translation result (${cantoneseTranslation.length} chars): "${cantoneseTranslation.substring(0, 50)}..."`);
        
        // Wrap in try-catch to ensure we always return a valid response
        try {
          return new Response(
            JSON.stringify({ translation: cantoneseTranslation }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (jsonError) {
          console.error('Error stringifying Cantonese translation response:', jsonError);
          // Fallback to a simpler response if JSON stringification fails
          return new Response(
            `{"translation": "翻譯暫時不可用。請諒解不便之處。"}`,
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('Error in Cantonese translation request:', error);
        // Return a fallback translation instead of throwing
        return new Response(
          JSON.stringify({ 
            translation: "翻譯暫時不可用。請諒解不便之處。",
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Regular translation flow for other languages
    try {
      const translationResponse = await getTranslation(
        message, 
        userLanguage, 
        openAIApiKey,
        filterCipaProhibitedContent,
        containsProhibitedContent,
        getUserNativeLanguage
      );
      
      if (!translationResponse.ok) {
        throw new Error('Failed to get translation from OpenAI');
      }
      
      const translationData = await translationResponse.json();
      let translation = translationData.choices?.[0]?.message?.content || '';
      
      // CIPA Compliance: Filter translation before returning
      if (containsProhibitedContent(translation)) {
        console.log('Translation contains prohibited content, filtering');
        translation = filterCipaProhibitedContent(translation);
      }
      
      return new Response(
        JSON.stringify({ translation }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error in regular translation request:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to translate text', 
          details: error.message,
          translation: `Translation not available for ${userLanguage}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in translation request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to translate text', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      requestType, 
      userLanguage, 
      targetLanguage,
      requestTranslation, 
      userId = "anonymous" 
    } = await req.json();
    console.log('Received message:', message, 'Request type:', requestType, 
                'User language:', userLanguage, 'Target language:', targetLanguage, 
                'Request translation:', requestTranslation);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Rate limiting check
    if (rateLimiter.isRateLimited(userId)) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          details: "Too many requests in a short period of time."
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // CIPA Compliance: Check for prohibited content in the message
    const containsProhibited = containsProhibitedContent(message);
    let safeMessage = message;
    
    if (containsProhibited) {
      console.log('Message contains prohibited content, filtering before processing');
      safeMessage = filterCipaProhibitedContent(message);
    }
    
    // Log educational data access for FERPA compliance
    logEducationalDataAccess(
      userId, 
      "language_practice", 
      requestType === 'translation' ? "translation_request" : "language_learning"
    );

    // Determine language pair using new function
    const langPair = determineLanguagePair(userLanguage, targetLanguage);
    const { isLearningEnglish, targetLanguage: langToLearn, nativeLanguage } = langPair;
    
    // Handle translation-only requests
    if (requestType === 'translation') {
      return await handleTranslationRequest(safeMessage, userLanguage);
    }

    // Performance optimization: Acquire connection from pool
    try {
      await connectionPool.acquire();
    } catch (error) {
      console.error('Connection pool error:', error);
      return new Response(
        JSON.stringify({ 
          error: "Service is busy. Please try again later.",
          details: "Too many concurrent requests."
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    try {
      // Add CIPA/FERPA compliance instructions to tutor
      const cipaFerpaCompliance = getCipaFerpaInstructions();
      
      // Enhanced system message with explicit emphasis on response format
      let systemMessageContent = `You are a kind, helpful, and encouraging AI language tutor. Your primary job is to help the user practice ${langToLearn} through natural, realistic conversation. 

PRIORITIZE CONVERSATION OVER ALL ELSE. ONLY CORRECT THE USER IF IT IS IMPOSSIBLE TO CONTINUE COMMUNICATING WITHOUT CLARIFYING.

${cipaFerpaCompliance}

You MUST strictly follow these rules:

1. **Only use grammar, vocabulary, and sentence structures appropriate to an intermediate level.**
2. **Do not correct the user unless they specifically ask.**
3. **Prioritize keeping the conversation flowing.** Ask questions, be friendly, and respond naturally.
4. **Stay in the target language (${langToLearn}) unless the user asks for clarification in their native language (${nativeLanguage}).**
5. **Do NOT use language or expressions beyond an intermediate level.** Simplicity and clarity are more important than accuracy or native-like fluency.

VERY IMPORTANT RESPONSE FORMAT:
- First, provide your response in the target language (${langToLearn})
- Then add a line break
- Then add "Translation:" followed by the translation in the user's native language (${nativeLanguage})`;

      // Add language specific instructions
      if (userLanguage === 'german') {
        systemMessageContent += `

VERY IMPORTANT FOR GERMAN USERS: ALWAYS provide a translation of your response in German. 
Your response MUST include a translation prefixed with "Translation:" on a new line after your main response.
The German translation should use everyday conversational German that would be easily understood.
Make sure the translation is provided as plain text, not as an object or JSON.`;
      } else if (userLanguage === 'italian') {
        systemMessageContent += `

VERY IMPORTANT FOR ITALIAN USERS: ALWAYS provide a translation of your response in Italian. 
Your response MUST include a translation prefixed with "Translation:" on a new line after your main response.
The Italian translation should use everyday conversational Italian that would be easily understood.
Make sure the translation is provided as plain text, not as an object or JSON.`;
      } else if (nativeLanguage.toLowerCase() === 'filipino/tagalog' || userLanguage === 'tagalog') {
        systemMessageContent += `

VERY IMPORTANT FOR TAGALOG USERS: ALWAYS provide a translation of your response in Tagalog. 
Your response MUST include a translation prefixed with "Translation:" on a new line after your main response.
The Tagalog translation should use everyday conversational Filipino that would be easily understood.
Make sure the translation is provided as plain text, not as an object or JSON.`;
      } else if (nativeLanguage.toLowerCase() === 'cantonese' || userLanguage === 'cantonese') {
        systemMessageContent += `

VERY IMPORTANT FOR CANTONESE USERS: ALWAYS provide a translation of your response in Cantonese using Traditional Chinese characters.
Your response MUST include a translation prefixed with "Translation:" on a new line after your main response.
The Cantonese translation should be 100% in Cantonese with Traditional Chinese characters.
DO NOT use Mandarin or any other language in the translation - it must be purely Cantonese.
Use Cantonese-specific particles like 嘅, 啦, 喀, 囉 where appropriate to sound natural.
Make sure the translation is provided as plain text, not as an object or JSON.`;
      } else {
        systemMessageContent += `

IMPORTANT: ALWAYS provide a translation of your response in the user's native language (${nativeLanguage}).
Your response MUST include a translation prefixed with "Translation:" on a new line after your main response.`;
      }

      systemMessageContent += `

Keep responses friendly but concise, focused on language learning.
Stay in character as a patient tutor. Don't test the student — just talk with them like a real person. 
You should never converse with the user in a manner that is not appropriate for a k-12 classroom setting.
You should ask questions to continue the conversation if it ever seems to stall.`;

      // Create an initial hidden message to ensure the AI behaves correctly from the start
      const initialHiddenPrompt = "This conversation is just starting. Remember to prioritize conversation flow over corrections. Don't correct grammar errors unless specifically asked. Keep the conversation flowing naturally and ask follow-up questions. ALWAYS provide a translation of your response in the user's native language.";

      const systemMessage = requestType === 'assessment' 
        ? `You are a professional language assessor. Based on the conversation history with the user, provide a detailed yet concise assessment of their ${isLearningEnglish ? 'English' : targetLanguage} language skills in the following areas:
           - Reading proficiency
           - Writing ability
           - Speaking competency
           - Listening comprehension
           Also provide an overall estimated proficiency level (A1-C2).
           Format your response as JSON with the following keys: reading, writing, speaking, listening, and overallLevel.
           
           ${cipaFerpaCompliance}`
        : systemMessageContent;

      // Add the hidden prompt and response only for regular conversations, not assessments
      let messages = [];
      if (requestType === 'assessment') {
        messages = [
          { role: 'system', content: systemMessage },
          { role: 'user', content: safeMessage }
        ];
      } else {
        messages = [
          { role: 'system', content: systemMessage },
          { role: 'user', content: initialHiddenPrompt },
          { role: 'assistant', content: "I understand. I'll engage naturally, prioritizing conversation flow over corrections. I'll only correct if explicitly asked or if it's impossible to understand. I'll ask questions to continue the conversation if it ever seems to stall." },
          { role: 'user', content: safeMessage }
        ];
      }

      // Use more tokens for special languages to ensure complete translations
      const maxTokens = userLanguage === 'tagalog' || userLanguage === 'cantonese' || 
                        userLanguage === 'german' || userLanguage === 'italian' ? 800 : 500;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      });

      const data = await response.json();
      console.log('OpenAI API Response:', data);

      if (!response.ok) {
        if (data.error?.code === 'insufficient_quota') {
          throw new Error('OpenAI API quota exceeded. Please check your billing details.');
        }
        throw new Error(data.error?.message || 'Failed to get response from OpenAI');
      }

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure from OpenAI');
      }

      if (requestType === 'assessment') {
        try {
          const assessment = JSON.parse(data.choices[0].message.content);
          console.log('Formatted assessment:', assessment);
          return new Response(
            JSON.stringify({ assessment }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error parsing assessment JSON:', error);
          throw new Error('Failed to parse assessment response');
        }
      }

      let content = data.choices[0].message.content;
      let translation = '';

      // Extract translation if available
      if (content.includes('\nTranslation:')) {
        [content, translation] = content.split('\nTranslation:');
        content = content.trim();
        translation = translation.trim();
        
        console.log(`Successfully extracted translation (${translation.length} chars): "${translation.substring(0, 50)}..."`);
      }

      // CIPA Compliance: Filter response content if needed
      if (containsProhibitedContent(content)) {
        console.log('Response contains prohibited content, filtering before sending');
        content = filterCipaProhibitedContent(content);
      }
      
      if (translation && containsProhibitedContent(translation)) {
        console.log('Translation contains prohibited content, filtering before sending');
        translation = filterCipaProhibitedContent(translation);
      }

      // If no translation was provided or if it doesn't seem valid, make a second API call to translate the response
      if (!translation || translation === '' || translation === 'undefined' || translation === '[object Object]') {
        console.log('No valid translation provided, getting one now...');
        
        // Check if we have this translation cached
        const cacheKey = `${content}:${userLanguage}`;
        const cachedTranslation = translationCache.get(cacheKey);
        
        if (cachedTranslation) {
          console.log('Using cached translation');
          translation = cachedTranslation;
        } else {
          try {
            // Special handling for German and Italian translations
            if (userLanguage === 'german') {
              console.log('Using enhanced German translation flow');
              
              // Try to get a valid German translation
              try {
                const germanTranslation = await getSpecificLanguageTranslation(
                  content,
                  'German',
                  'Latin',
                  openAIApiKey,
                  filterCipaProhibitedContent,
                  containsProhibitedContent
                );
                
                if (germanTranslation && 
                    typeof germanTranslation === 'string' && 
                    germanTranslation.length > 10) {
                  translation = germanTranslation;
                  translationCache.set(cacheKey, translation);
                  console.log(`Cached German translation (${translation.length} chars)`);
                } else {
                  console.log('Invalid German translation, will use fallback');
                }
              } catch (error) {
                console.error('Error getting German translation:', error);
              }
              
              // Fallback for German if translation failed
              if (!translation || translation.length < 10) {
                console.log('Using regular translation flow for German as fallback');
                const translationResponse = await getTranslation(
                  content, 
                  'german', 
                  openAIApiKey,
                  filterCipaProhibitedContent,
                  containsProhibitedContent,
                  getUserNativeLanguage
                );
                
                if (translationResponse.ok) {
                  const translationData = await translationResponse.json();
                  if (translationData.choices?.[0]?.message?.content) {
                    translation = translationData.choices[0].message.content.trim();
                    translationCache.set(cacheKey, translation);
                  }
                }
              }
            }
            // Special handling for Italian translations
            else if (userLanguage === 'italian') {
              console.log('Using enhanced Italian translation flow');
              
              // Try to get a valid Italian translation
              try {
                const italianTranslation = await getSpecificLanguageTranslation(
                  content,
                  'Italian',
                  'Latin',
                  openAIApiKey,
                  filterCipaProhibitedContent,
                  containsProhibitedContent
                );
                
                if (italianTranslation && 
                    typeof italianTranslation === 'string' && 
                    italianTranslation.length > 10) {
                  translation = italianTranslation;
                  translationCache.set(cacheKey, translation);
                  console.log(`Cached Italian translation (${translation.length} chars)`);
                } else {
                  console.log('Invalid Italian translation, will use fallback');
                }
              } catch (error) {
                console.error('Error getting Italian translation:', error);
              }
              
              // Fallback for Italian if translation failed
              if (!translation || translation.length < 10) {
                console.log('Using regular translation flow for Italian as fallback');
                const translationResponse = await getTranslation(
                  content, 
                  'italian', 
                  openAIApiKey,
                  filterCipaProhibitedContent,
                  containsProhibitedContent,
                  getUserNativeLanguage
                );
                
                if (translationResponse.ok) {
                  const translationData = await translationResponse.json();
                  if (translationData.choices?.[0]?.message?.content) {
                    translation = translationData.choices[0].message.content.trim();
                    translationCache.set(cacheKey, translation);
                  }
                }
              }
            } 
            // Enhanced for Tagalog
            else if (userLanguage === 'tagalog') {
              console.log('Using enhanced Tagalog translation flow');
              
              // Try up to 3 times to get a valid translation
              let retryCount = 0;
              let validTranslation = false;
              
              while (retryCount < 3 && !validTranslation) {
                retryCount++;
                console.log(`Tagalog translation attempt ${retryCount}`);
                
                try {
                  translation = await getSpecificLanguageTranslation(
                    content,
                    'Filipino/Tagalog',
                    'Latin',
                    openAIApiKey,
                    filterCipaProhibitedContent,
                    containsProhibitedContent
                  );
                  
                  // Validate the translation
                  if (translation && 
                      typeof translation === 'string' && 
                      translation.length > 10 &&
                      translation !== 'undefined' &&
                      translation !== '[object Object]') {
                    validTranslation = true;
                    console.log(`Valid Tagalog translation obtained on attempt ${retryCount}`);
                  } else {
                    console.log(`Invalid Tagalog translation on attempt ${retryCount}:`, translation);
                  }
                } catch (translationError) {
                  console.error(`Error in Tagalog translation attempt ${retryCount}:`, translationError);
                }
              }
              
              // Cache the Tagalog translation if valid
              if (validTranslation && translation) {
                translationCache.set(cacheKey, translation);
                console.log(`Cached Tagalog translation (${translation.length} chars)`);
              } else {
                // Last resort fallback
                translation = "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
                console.log('Using fallback Tagalog message after failed attempts');
              }
            } 
            // Enhanced for Cantonese
            else if (userLanguage === 'cantonese') {
              console.log('Using enhanced Cantonese translation flow');
              
              // Try up to 3 times to get a valid translation
              let retryCount = 0;
              let validTranslation = false;
              
              while (retryCount < 3 && !validTranslation) {
                retryCount++;
                console.log(`Cantonese translation attempt ${retryCount}`);
                
                try {
                  translation = await getSpecificLanguageTranslation(
                    content,
                    'Cantonese',
                    'Traditional Chinese',
                    openAIApiKey,
                    filterCipaProhibitedContent,
                    containsProhibitedContent
                  );
                  
                  // Validate the translation - ensure it has Chinese characters and no substantial Latin text
                  const hasChineseChars = /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF]/.test(translation);
                  const hasSubstantialLatinScript = /[a-zA-Z]{4,}/.test(translation);
                  
                  if (translation && 
                      typeof translation === 'string' && 
                      translation.length > 10 &&
                      translation !== 'undefined' &&
                      translation !== '[object Object]' &&
                      hasChineseChars &&
                      !hasSubstantialLatinScript) {
                    validTranslation = true;
                    console.log(`Valid Cantonese translation obtained on attempt ${retryCount}:`, {
                      length: translation.length,
                      sample: translation.substring(0, 30) + '...'
                    });
                  } else {
                    console.log(`Invalid Cantonese translation on attempt ${retryCount}:`, translation);
                  }
                } catch (translationError) {
                  console.error(`Error in Cantonese translation attempt ${retryCount}:`, translationError);
                }
              }
              
              // Cache the Cantonese translation if valid
              if (validTranslation && translation) {
                translationCache.set(cacheKey, translation);
                console.log(`Cached Cantonese translation (${translation.length} chars)`);
              } else {
                // Last resort fallback
                translation = "翻譯暫時不可用。請諒解不便之處。";
                console.log('Using fallback Cantonese message after failed attempts');
              }
            } else {
              // Regular translation process for non-Tagalog/Cantonese languages
              const translationResponse = await getTranslation(
                content, 
                userLanguage, 
                openAIApiKey,
                filterCipaProhibitedContent,
                containsProhibitedContent,
                getUserNativeLanguage
              );
              
              if (translationResponse.ok) {
                const translationData = await translationResponse.json();
                if (translationData.choices?.[0]?.message?.content) {
                  translation = translationData.choices[0].message.content.trim();
                  
                  // Cache the translation for future use
                  translationCache.set(cacheKey, translation);
                  
                  // CIPA Compliance: Filter translation if needed
                  if (containsProhibitedContent(translation)) {
                    console.log('Generated translation contains prohibited content, filtering');
                    translation = filterCipaProhibitedContent(translation);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error getting translation:', error);
            // Continue even if translation fails
            if (userLanguage === 'tagalog') {
              translation = "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
            } else if (userLanguage === 'cantonese') {
              translation = "翻譯暫時不可用。請諒解不便之處。";
            } else if (userLanguage === 'german') {
              translation = "Übersetzung ist derzeit nicht verfügbar. Wir entschuldigen uns für die Unannehmlichkeiten.";
            } else if (userLanguage === 'italian') {
              translation = "Traduzione non disponibile al momento. Ci scusiamo per l'inconveniente.";
            } else {
              translation = `Translation not available for ${userLanguage}`;
            }
          }
        }
      }

      // For Hindi, verify that the translation is actually in Hindi using script detection
      if (userLanguage === 'hindi' && !containsDevanagariScript(translation)) {
        console.log('Hindi translation does not contain Devanagari script, getting proper Hindi translation...');
        
        // Check if we have this Hindi translation cached
        const hindiCacheKey = `hindi:${content}`;
        const cachedHindiTranslation = translationCache.get(hindiCacheKey);
        
        if (cachedHindiTranslation) {
          console.log('Using cached Hindi translation');
          translation = cachedHindiTranslation;
        } else {
          try {
            const hindiTranslation = await getSpecificLanguageTranslation(
              content, 
              'hindi', 
              'Devanagari', 
              openAIApiKey,
              filterCipaProhibitedContent,
              containsProhibitedContent
            );
            translation = hindiTranslation;
            
            // Cache the Hindi translation
            translationCache.set(hindiCacheKey, translation);
            
            // CIPA Compliance: Filter Hindi translation if needed
            if (containsProhibitedContent(translation)) {
              console.log('Hindi translation contains prohibited content, filtering');
              translation = filterCipaProhibitedContent(translation);
            }
          } catch (error) {
            console.error('Error getting Hindi translation:', error);
            // Continue even if Hindi translation fails
          }
        }
      }
      
      // For Cantonese, verify it doesn't contain substantial Latin characters (which would indicate mixed language)
      if (userLanguage === 'cantonese') {
        // Check if it contains Chinese characters
        const hasChineseChars = /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF]/.test(translation);
        
        // Check for substantial Latin text which would indicate mixed language
        const hasSubstantialLatinScript = /[a-zA-Z]{4,}/.test(translation);
        
        if (!hasChineseChars || hasSubstantialLatinScript) {
          console.log('Cantonese translation contains non-Chinese characters or appears to be in mixed language, getting proper Cantonese translation...');
          
          // Try to get a new, valid Cantonese translation
          try {
            const cantoneseTranslation = await getSpecificLanguageTranslation(
              content,
              'Cantonese',
              'Traditional Chinese',
              openAIApiKey,
              filterCipaProhibitedContent,
              containsProhibitedContent
            );
            
            // Verify the new translation
            const newHasChineseChars = /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF]/.test(cantoneseTranslation);
            const newHasSubstantialLatinScript = /[a-zA-Z]{4,}/.test(cantoneseTranslation);
            
            if (newHasChineseChars && !newHasSubstantialLatinScript) {
              translation = cantoneseTranslation;
              console.log('Successfully obtained valid Cantonese translation');
            } else {
              console.log('Failed to get valid Cantonese translation, using fallback');
              translation = "翻譯暫時不可用。請諒解不便之處。";
            }
          } catch (error) {
            console.error('Error getting Cantonese translation:', error);
            translation = "翻譯暫時不可用。請諒解不便之處。";
          }
        }
      }

      // Final verification for Tagalog - ensure we have a valid translation
      if (userLanguage === 'tagalog' && (!translation || 
                                        translation.length < 10 || 
                                        translation === 'undefined' || 
                                        translation === '[object Object]')) {
        console.log('Final verification: Tagalog translation is missing or too short, using fallback');
        translation = "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
      }
      
      // German and Italian verification - make sure it's not returning Chinese characters
      if (userLanguage === 'german' && /[\u4E00-\u9FFF]/.test(translation)) {
        console.log('German translation contains Chinese characters, getting proper German translation...');
        translation = "Übersetzung ist derzeit nicht verfügbar. Wir entschuldigen uns für die Unannehmlichkeiten.";
        
        try {
          const germanTranslation = await getSpecificLanguageTranslation(
            content,
            'German',
            'Latin',
            openAIApiKey,
            filterCipaProhibitedContent,
            containsProhibitedContent
          );
          
          if (germanTranslation && 
              typeof germanTranslation === 'string' && 
              germanTranslation.length > 10 &&
              !/[\u4E00-\u9FFF]/.test(germanTranslation)) {
            translation = germanTranslation;
          }
        } catch (error) {
          console.error('Error getting German translation during verification:', error);
        }
      }
      
      if (userLanguage === 'italian' && /[\u4E00-\u9FFF]/.test(translation)) {
        console.log('Italian translation contains Chinese characters, getting proper Italian translation...');
        translation = "Traduzione non disponibile al momento. Ci scusiamo per l'inconveniente.";
        
        try {
          const italianTranslation = await getSpecificLanguageTranslation(
            content,
            'Italian',
            'Latin',
            openAIApiKey,
            filterCipaProhibitedContent,
            containsProhibitedContent
          );
          
          if (italianTranslation && 
              typeof italianTranslation === 'string' && 
              italianTranslation.length > 10 &&
              !/[\u4E00-\u9FFF]/.test(italianTranslation)) {
            translation = italianTranslation;
          }
        } catch (error) {
          console.error('Error getting Italian translation during verification:', error);
        }
      }

      // Apply a final type safety check before sending the response
      if (typeof translation !== 'string') {
        console.error('Translation is not a string before response:', translation);
        
        // Convert to string if possible, or use fallback
        try {
          if (translation === null || translation === undefined) {
            translation = userLanguage === 'tagalog' 
              ? "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala."
              : userLanguage === 'cantonese'
                ? "翻譯暫時不可用。請諒解不便之處。"
                : userLanguage === 'german'
                  ? "Übersetzung ist derzeit nicht verfügbar. Wir entschuldigen uns für die Unannehmlichkeiten."
                  : userLanguage === 'italian'
                    ? "Traduzione non disponibile al momento. Ci scusiamo per l'inconveniente."
                    : `Translation not available for ${userLanguage}`;
          } else if (typeof translation === 'object') {
            translation = JSON.stringify(translation);
          } else {
            translation = String(translation);
          }
        } catch (e) {
          console.error('Error converting translation to string:', e);
          translation = userLanguage === 'tagalog' 
            ? "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala."
            : userLanguage === 'cantonese'
              ? "翻譯暫時不可用。請諒解不便之處。"
              : userLanguage === 'german'
                ? "Übersetzung ist derzeit nicht verfügbar. Wir entschuldigen uns für die Unannehmlichkeiten."
                : userLanguage === 'italian'
                  ? "Traduzione non disponibile al momento. Ci scusiamo per l'inconveniente."
                  : `Translation not available for ${userLanguage}`;
        }
      }

      console.log('Formatted response:', { content, translation });

      // Ensure our response object is well-formed before stringifying
      const responseObject = { 
        content: content || "",
        translation: translation || ""
      };

      return new Response(
        JSON.stringify(responseObject),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } finally {
      // Always release the connection back to the pool
      connectionPool.release();
    }

  } catch (error) {
    console.error('Error in chat-with-tutor function:', error);
    
    let errorMessage = 'Failed to get response from AI tutor. Please try again.';
    if (error.message.includes('quota exceeded')) {
      errorMessage = 'The AI service is currently unavailable due to quota limits. Please try again later.';
    } else if (error.message.includes('API key not configured')) {
      errorMessage = 'The AI service is not properly configured. Please contact support.';
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
