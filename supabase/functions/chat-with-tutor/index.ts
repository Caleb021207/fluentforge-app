
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
        
        console.log(`Tagalog translation result (${tagalogTranslation.length} chars): "${tagalogTranslation.substring(0, 50)}..."`);
        
        return new Response(
          JSON.stringify({ translation: tagalogTranslation }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error in Tagalog translation request:', error);
        throw error;
      }
    }
    
    // Regular translation flow for other languages
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
      
      // Enhanced system message for Tagalog support
      let systemMessageContent = `You are a kind, helpful, and encouraging AI language tutor. Your primary job is to help the user practice ${langToLearn} through natural, realistic conversation. 

PRIORITIZE CONVERSATION OVER ALL ELSE. ONLY CORRECT THE USER IF IT IS IMPOSSIBLE TO CONTINUE COMMUNICATING WITHOUT CLARIFYING.

${cipaFerpaCompliance}

You MUST strictly follow these rules:

1. **Only use grammar, vocabulary, and sentence structures appropriate to an intermediate level.**
2. **Do not correct the user unless they specifically ask.**
3. **Prioritize keeping the conversation flowing.** Ask questions, be friendly, and respond naturally.
4. **Stay in the target language (${langToLearn}) unless the user asks for clarification in their native language (${nativeLanguage}).**
5. **Do NOT use language or expressions beyond an intermediate level.** Simplicity and clarity are more important than accuracy or native-like fluency.`;

      // Add enhanced translation instruction especially for Tagalog
      if (nativeLanguage.toLowerCase() === 'filipino/tagalog' || userLanguage === 'tagalog') {
        systemMessageContent += `

VERY IMPORTANT FOR TAGALOG USERS: ALWAYS provide a translation of your response in Tagalog. 
Your response MUST include a translation prefixed with "Translation:" on a new line after your main response.
The Tagalog translation should use everyday conversational Filipino that would be easily understood.`;
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

      // Use more tokens for Tagalog conversations to ensure complete translations
      const maxTokens = userLanguage === 'tagalog' ? 800 : 500;

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

      // If no translation was provided, make a second API call to translate the response
      if (!translation || translation === '') {
        console.log('No translation provided, getting one now...');
        
        // Check if we have this translation cached
        const cacheKey = `${content}:${userLanguage}`;
        const cachedTranslation = translationCache.get(cacheKey);
        
        if (cachedTranslation) {
          console.log('Using cached translation');
          translation = cachedTranslation;
        } else {
          try {
            // Enhanced for Tagalog
            if (userLanguage === 'tagalog') {
              console.log('Using enhanced Tagalog translation flow');
              translation = await getSpecificLanguageTranslation(
                content,
                'Filipino/Tagalog',
                'Latin',
                openAIApiKey,
                filterCipaProhibitedContent,
                containsProhibitedContent
              );
              
              // Cache the Tagalog translation
              if (translation) {
                translationCache.set(cacheKey, translation);
                console.log(`Cached Tagalog translation (${translation.length} chars)`);
              }
            } else {
              // Regular translation process for non-Tagalog languages
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

      // Final verification for Tagalog - ensure we have a valid translation
      if (userLanguage === 'tagalog' && (!translation || translation.length < 10)) {
        console.log('Final verification: Tagalog translation is missing or too short, trying one more time');
        try {
          translation = await getSpecificLanguageTranslation(
            content,
            'Filipino/Tagalog',
            'Latin',
            openAIApiKey,
            filterCipaProhibitedContent,
            containsProhibitedContent
          );
          console.log(`Final Tagalog translation attempt result (${translation.length} chars): "${translation.substring(0, 50)}..."`);
        } catch (error) {
          console.error('Error in final Tagalog translation attempt:', error);
          // Continue with what we have
        }
      }

      console.log('Formatted response:', { content, translation });

      return new Response(
        JSON.stringify({ content, translation }),
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
