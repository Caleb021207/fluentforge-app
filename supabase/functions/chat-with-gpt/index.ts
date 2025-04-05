
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || "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";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to get a language's full name from its code
const getLanguageName = (langCode: string): string => {
  const languageMap: Record<string, string> = {
    "english": "English",
    "spanish": "Spanish", 
    "portuguese": "Portuguese",
    "korean": "Korean",
    "arabic": "Arabic",
    "mandarin": "Mandarin Chinese",
    "vietnamese": "Vietnamese",
    "french": "French",
    "japanese": "Japanese",
    "russian": "Russian"
  };
  
  return languageMap[langCode] || langCode;
};

// Languages that should always receive translations
const alwaysTranslateLanguages = ["japanese", "russian", "french"];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userLanguage, conversationHistory = [], cefrLevel = 'B1' } = await req.json();
    console.log('Received message:', message, 'User language:', userLanguage, 'CEFR Level:', cefrLevel);
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Determine which language the system should respond in
    const responseLanguage = userLanguage === 'english' ? 'Spanish' : 'English';
    const nativeLanguage = getLanguageName(userLanguage);
    
    // Check if we should always include translations regardless of request type
    const alwaysIncludeTranslation = alwaysTranslateLanguages.includes(userLanguage);

    // The comprehensive tutor instructions
    const tutorInstructions = `You are a kind, helpful, and encouraging AI language tutor. Your primary job is to help the user practice ${responseLanguage} through natural, realistic conversation. The user has selected CEFR level ${cefrLevel}.

PRIORITIZE CONVERSATION OVER ALL ELSE. ONLY CORRECT THE USER IF IT IS IMPOSSIBLE TO CONTINUE COMMUNICATING WITHOUT CLARIFYING.

You MUST strictly follow these rules:

1. **Only use grammar, vocabulary, and sentence structures appropriate to the selected level ${cefrLevel}.**
2. **Do not correct the user unless they specifically ask.**
3. **Prioritize keeping the conversation flowing.** Ask questions, be friendly, and respond naturally.
4. **Stay in ${responseLanguage} unless the user asks for clarification in their native language (${nativeLanguage}).**
5. **Do NOT use language or expressions beyond the user's level.** Simplicity and clarity are more important than accuracy or native-like fluency.

📘 LEVEL GUIDE FOR YOUR RESPONSES:

🔹 **A1 (Beginner)**  
• Tenses: Present tense only  
• Grammar: Simple sentences, no subjunctive/conditional  
• Vocab: Basic words (greetings, colors, food, school, family)  

🔹 **A2 (Elementary)**  
• Tenses: Present, simple past (preterite), simple future (ir + a + infinitive)  
• Grammar: Simple connectors, no complex clauses  
• Vocab: Basic daily life (shopping, health, weather, directions)  

🔹 **B1 (Intermediate)**  
• Tenses: Present, preterite, imperfect, future, conditional, some present subjunctive  
• Grammar: Use common complex structures (e.g., "cuando era niño…")  
• Vocab: Emotions, travel, work, relationships  

🔹 **B2 (Upper Intermediate)**  
• Tenses: All common tenses, present/imperfect subjunctive, passive voice  
• Grammar: Complex sentences, relative clauses  
• Vocab: Abstract ideas, idioms, technical terms  

Stay in character as a patient tutor. Don't test the student — just talk with them like a real person, based on their level.
You should never converse with the user in a manner that is not appropriate for a k-12 classroom setting.
You should ask questions to continue the conversation if it ever seems to stall.

${alwaysIncludeTranslation ? `ALWAYS add a translation in ${nativeLanguage} after your response in ${responseLanguage}, prefixed with "Translation: ".` : 
`After your response in ${responseLanguage}, add a translation in ${nativeLanguage} prefixed with "Translation: ".`}`;

    // Create an initial hidden message to ensure the AI behaves correctly from the start
    const initialHiddenPrompt = `This conversation is just starting. Remember to behave according to the user's CEFR level ${cefrLevel}. Don't correct grammar errors unless specifically asked. Keep the conversation flowing naturally and ask follow-up questions.`;

    // Build the messages array with system message, hidden prompt, and conversation history
    const messages = [
      { role: 'system', content: tutorInstructions },
      { role: 'user', content: initialHiddenPrompt },
      { role: 'assistant', content: `I understand. I'll engage naturally at CEFR level ${cefrLevel}, prioritizing conversation flow over corrections. I'll only correct if explicitly asked or if it's impossible to understand. I'll ask questions to keep the conversation going.` },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with messages:', JSON.stringify(messages));

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
        max_tokens: 400, // Increased to accommodate translations
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Failed to get response from OpenAI');
    }

    let fullReply = data.choices[0].message.content;
    console.log('OpenAI response:', fullReply);
    
    // Split the response and translation if present
    let reply = fullReply;
    let translation = '';
    
    if (fullReply.includes('Translation:')) {
      const parts = fullReply.split('Translation:');
      reply = parts[0].trim();
      translation = parts[1].trim();
    }

    // Update conversation history but exclude the hidden prompt/response
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: fullReply }
    ];

    return new Response(
      JSON.stringify({ 
        content: reply,
        translation,
        updatedHistory
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-gpt function:', error);
    
    let errorMessage = 'Failed to get response from AI. Please try again.';
    if (error.message.includes('API key not configured')) {
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
