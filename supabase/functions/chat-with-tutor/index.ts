
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || "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";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CIPA/FERPA Compliance Content Filters
const cipaFilteredTerms = [
  // Inappropriate language filter
  "profanity", "obscene", "explicit", "curse", "swear",
  
  // Violence-related terms
  "violence", "violent", "weapon", "gun", "rifle", "pistol", "knife", 
  "kill", "murder", "assault", "attack", "fight", "harm", "blood",
  
  // Substance-related terms
  "drug", "narcotic", "marijuana", "cocaine", "heroin", "substance", 
  "alcohol", "beer", "wine", "liquor", "tobacco", "cigarette", "vape",
  
  // Adult content indicators
  "adult", "mature", "nsfw", "pornography", "explicit", "nude", "naked",
  "sexual", "sex", "inappropriate", "dating", "gambling",
  
  // Discriminatory terms
  "hate", "discriminatory", "slur", "racist", "sexist", 
  "bigot", "discrimination", "offensive", "prejudice"
];

// Filter content for CIPA compliance
function filterCipaProhibitedContent(text: string): string {
  if (!text) return "";
  
  let filteredText = text;
  cipaFilteredTerms.forEach(term => {
    const regex = new RegExp(term, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(term.length));
  });
  
  return filteredText;
}

// Check if content violates CIPA guidelines
function containsProhibitedContent(text: string): boolean {
  if (!text) return false;
  
  return cipaFilteredTerms.some(term => 
    text.toLowerCase().includes(term.toLowerCase())
  );
}

// Log access for FERPA compliance
function logEducationalDataAccess(userId: string, dataType: string, purpose: string) {
  // In a production environment, this would write to a database
  console.log(`FERPA Access Log: User ${userId} accessed ${dataType} for ${purpose} at ${new Date().toISOString()}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, requestType, userLanguage, requestTranslation, userId = "anonymous" } = await req.json();
    console.log('Received message:', message, 'Request type:', requestType, 'User language:', userLanguage, 'Request translation:', requestTranslation);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
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

    // Handle translation-only requests
    if (requestType === 'translation') {
      return await handleTranslationRequest(safeMessage, userLanguage);
    }

    // Determine if user is learning English or another language based on their native language
    const isLearningEnglish = userLanguage !== 'english';
    const targetLanguage = isLearningEnglish ? 'English' : 'Spanish';
    const nativeLanguage = getUserNativeLanguage(userLanguage);
    
    // Add CIPA/FERPA compliance instructions to tutor
    const cipaFerpaCompliance = `
    IMPORTANT COMPLIANCE REQUIREMENTS:
    1. Never request or store personal identifying information (names, addresses, phone numbers, etc).
    2. Never use inappropriate language, discuss adult topics, or provide content unsuitable for K-12 students.
    3. All explanations must be appropriate for educational contexts and classroom settings.
    4. Stay focused on language learning without sharing non-educational content.
    `;
    
    // Universal tutor instructions for all language combinations
    const tutorInstructions = `You are a kind, helpful, and encouraging AI language tutor. Your primary job is to help the user practice ${targetLanguage} through natural, realistic conversation. 

PRIORITIZE CONVERSATION OVER ALL ELSE. ONLY CORRECT THE USER IF IT IS IMPOSSIBLE TO CONTINUE COMMUNICATING WITHOUT CLARIFYING.

${cipaFerpaCompliance}

You MUST strictly follow these rules:

1. **Only use grammar, vocabulary, and sentence structures appropriate to an intermediate level.**
2. **Do not correct the user unless they specifically ask.**
3. **Prioritize keeping the conversation flowing.** Ask questions, be friendly, and respond naturally.
4. **Stay in the target language (${targetLanguage}) unless the user asks for clarification in their native language (${nativeLanguage}).**
5. **Do NOT use language or expressions beyond an intermediate level.** Simplicity and clarity are more important than accuracy or native-like fluency.

IMPORTANT: ALWAYS provide a translation of your response in the user's native language (${nativeLanguage}).
Your response MUST include a translation prefixed with "Translation:" on a new line after your main response.

Keep responses friendly but concise, focused on language learning.
Stay in character as a patient tutor. Don't test the student — just talk with them like a real person. 
You should never converse with the user in a manner that is not appropriate for a k-12 classroom setting.
You should ask questions to continue the conversation if it ever seems to stall.`;

    // Create an initial hidden message to ensure the AI behaves correctly from the start
    const initialHiddenPrompt = "This conversation is just starting. Remember to prioritize conversation flow over corrections. Don't correct grammar errors unless specifically asked. Keep the conversation flowing naturally and ask follow-up questions. ALWAYS provide a translation of your response in the user's native language.";

    const systemMessage = requestType === 'assessment' 
      ? `You are a professional language assessor. Based on the conversation history with the user, provide a detailed yet concise assessment of their ${isLearningEnglish ? 'English' : 'Spanish'} language skills in the following areas:
         - Reading proficiency
         - Writing ability
         - Speaking competency
         - Listening comprehension
         Also provide an overall estimated proficiency level (A1-C2).
         Format your response as JSON with the following keys: reading, writing, speaking, listening, and overallLevel.
         
         ${cipaFerpaCompliance}`
      : tutorInstructions;

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
        { role: 'assistant', content: "I understand. I'll engage naturally, prioritizing conversation flow over corrections. I'll only correct if explicitly asked or if it's impossible to understand. I'll ask questions to keep the conversation going. I'll always provide translations." },
        { role: 'user', content: safeMessage }
      ];
    }

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
        max_tokens: 500,
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
      try {
        const translationResponse = await getTranslation(content, userLanguage);
        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          if (translationData.choices?.[0]?.message?.content) {
            translation = translationData.choices[0].message.content.trim();
            
            // CIPA Compliance: Filter translation if needed
            if (containsProhibitedContent(translation)) {
              console.log('Generated translation contains prohibited content, filtering');
              translation = filterCipaProhibitedContent(translation);
            }
          }
        }
      } catch (error) {
        console.error('Error getting translation:', error);
        // Continue even if translation fails
      }
    }

    // For Hindi, verify that the translation is actually in Hindi using script detection
    if (userLanguage === 'hindi' && !containsDevanagariScript(translation)) {
      console.log('Hindi translation does not contain Devanagari script, getting proper Hindi translation...');
      try {
        const hindiTranslation = await getSpecificLanguageTranslation(content, 'hindi', 'Devanagari');
        translation = hindiTranslation;
        
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

    console.log('Formatted response:', { content, translation });

    return new Response(
      JSON.stringify({ content, translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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

// Get the correct native language name based on user language
function getUserNativeLanguage(userLanguage: string): string {
  const languageMap: Record<string, string> = {
    'english': 'English',
    'spanish': 'Spanish',
    'portuguese': 'Portuguese',
    'korean': 'Korean',
    'arabic': 'Arabic',
    'mandarin': 'Mandarin Chinese',
    'vietnamese': 'Vietnamese',
    'french': 'French',
    'japanese': 'Japanese',
    'ukrainian': 'Ukrainian',
    'russian': 'Russian',
    'hindi': 'Hindi',
    'indonesian': 'Indonesian'
  };
  
  return languageMap[userLanguage] || 'English';
}

// Helper function to check if text contains Devanagari script (Hindi)
function containsDevanagariScript(text: string): boolean {
  // Devanagari Unicode range: U+0900 to U+097F
  const devanagariRegex = /[\u0900-\u097F]/;
  return devanagariRegex.test(text);
}

// Helper function to get special translation for specific languages like Hindi
async function getSpecificLanguageTranslation(message: string, language: string, script: string): Promise<string> {
  try {
    console.log(`Getting ${language} translation with ${script} script for: "${message}"`);
    
    // CIPA Compliance: Filter message before translation
    let safeMessage = message;
    if (containsProhibitedContent(message)) {
      console.log('Message contains prohibited content, filtering before translation');
      safeMessage = filterCipaProhibitedContent(message);
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
    if (containsProhibitedContent(translation)) {
      console.log(`${language} translation contains prohibited content, filtering`);
      return filterCipaProhibitedContent(translation);
    }
    
    return translation;
  } catch (error) {
    console.error(`Error getting ${language} translation:`, error);
    throw error;
  }
}

// Helper function to get translation for a message
async function getTranslation(message: string, userLanguage: string) {
  try {
    const targetLanguage = getUserNativeLanguage(userLanguage);
    
    // CIPA Compliance: Filter message before translation 
    let safeMessage = message;
    if (containsProhibitedContent(message)) {
      console.log('Message contains prohibited content, filtering before translation');
      safeMessage = filterCipaProhibitedContent(message);
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

// Handler for translation-only requests
async function handleTranslationRequest(message: string, userLanguage: string) {
  try {
    // Special handling for Hindi to ensure proper Devanagari script
    if (userLanguage === 'hindi') {
      try {
        const hindiTranslation = await getSpecificLanguageTranslation(message, 'hindi', 'Devanagari');
        return new Response(
          JSON.stringify({ translation: hindiTranslation }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error in Hindi translation request:', error);
        throw error;
      }
    }
    
    // Regular translation flow for other languages
    const translationResponse = await getTranslation(message, userLanguage);
    
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
