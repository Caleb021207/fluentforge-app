
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  determineLanguagePair,
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
import { getAIResponse, buildTutorInstructions } from "./aiService.ts";
import { buildAssessmentPrompt, processAssessment } from "./assessmentService.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || "";

// Initialize utility classes
const connectionPool = new ConnectionPool();
const rateLimiter = new RateLimiter();
const translationCache = new TranslationCache();

async function handleTranslationRequest(message: string, userLanguage: string) {
  try {
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
    
    if (containsProhibitedContent(translation)) {
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

async function handleChatRequest(
  safeMessage: string,
  userLanguage: string,
  targetLanguage: string | undefined,
  requestType: string
) {
  const langPair = determineLanguagePair(userLanguage, targetLanguage);
  const { isLearningEnglish, targetLanguage: langToLearn, nativeLanguage } = langPair;
  
  const cipaFerpaCompliance = getCipaFerpaInstructions();
  
  const systemMessage = requestType === 'assessment' 
    ? buildAssessmentPrompt(isLearningEnglish, langToLearn, cipaFerpaCompliance)
    : buildTutorInstructions(langToLearn, nativeLanguage, cipaFerpaCompliance);

  const initialHiddenPrompt = "This conversation is just starting. Remember to prioritize conversation flow over corrections. Don't correct grammar errors unless specifically asked. Keep the conversation flowing naturally and ask follow-up questions. ALWAYS provide a translation of your response in the user's native language.";

  const messages = requestType === 'assessment' 
    ? [
        { role: 'system', content: systemMessage },
        { role: 'user', content: safeMessage }
      ]
    : [
        { role: 'system', content: systemMessage },
        { role: 'user', content: initialHiddenPrompt },
        { role: 'assistant', content: "I understand. I'll engage naturally, prioritizing conversation flow over corrections. I'll only correct if explicitly asked or if it's impossible to understand. I'll ask questions to continue the conversation if it ever seems to stall." },
        { role: 'user', content: safeMessage }
      ];

  const { content, translation: initialTranslation } = await getAIResponse(
    safeMessage,
    userLanguage,
    openAIApiKey,
    systemMessage,
    messages
  );

  if (requestType === 'assessment') {
    return processAssessment({ choices: [{ message: { content } }] });
  }

  let translation = initialTranslation;

  if (!translation || translation === '') {
    console.log('No translation provided, getting one now...');
    const cacheKey = `${content}:${userLanguage}`;
    translation = translationCache.get(cacheKey) || await getNewTranslation(content, userLanguage);
  }

  if (userLanguage === 'hindi' && !containsDevanagariScript(translation)) {
    console.log('Hindi translation does not contain Devanagari script, getting proper Hindi translation...');
    const hindiCacheKey = `hindi:${content}`;
    translation = translationCache.get(hindiCacheKey) || 
                 await getHindiTranslation(content);
  }

  return { content, translation };
}

async function getNewTranslation(content: string, userLanguage: string): Promise<string> {
  try {
    const translationResponse = await getTranslation(
      content, 
      userLanguage, 
      openAIApiKey,
      filterCipaProhibitedContent,
      containsProhibitedContent,
      getUserNativeLanguage
    );
    
    if (!translationResponse.ok) return '';
    
    const translationData = await translationResponse.json();
    let translation = translationData.choices?.[0]?.message?.content?.trim() || '';
    
    if (translation) {
      translationCache.set(`${content}:${userLanguage}`, translation);
      
      if (containsProhibitedContent(translation)) {
        translation = filterCipaProhibitedContent(translation);
      }
    }
    
    return translation;
  } catch (error) {
    console.error('Error getting translation:', error);
    return '';
  }
}

async function getHindiTranslation(content: string): Promise<string> {
  try {
    const hindiTranslation = await getSpecificLanguageTranslation(
      content, 
      'hindi', 
      'Devanagari', 
      openAIApiKey,
      filterCipaProhibitedContent,
      containsProhibitedContent
    );
    
    translationCache.set(`hindi:${content}`, hindiTranslation);
    
    if (containsProhibitedContent(hindiTranslation)) {
      return filterCipaProhibitedContent(hindiTranslation);
    }
    
    return hindiTranslation;
  } catch (error) {
    console.error('Error getting Hindi translation:', error);
    return '';
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
    
    const safeMessage = containsProhibitedContent(message) 
      ? filterCipaProhibitedContent(message)
      : message;
    
    logEducationalDataAccess(
      userId, 
      "language_practice", 
      requestType === 'translation' ? "translation_request" : "language_learning"
    );

    try {
      await connectionPool.acquire();
      
      if (requestType === 'translation') {
        return await handleTranslationRequest(safeMessage, userLanguage);
      }

      const result = await handleChatRequest(
        safeMessage,
        userLanguage,
        targetLanguage,
        requestType
      );

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } finally {
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
