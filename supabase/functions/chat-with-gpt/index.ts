
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userLanguage, conversationHistory = [], cefrLevel = 'B1', targetLanguage } = await req.json();
    console.log('Received message:', message, 'User language:', userLanguage, 'CEFR Level:', cefrLevel, 'Target language:', targetLanguage);
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Determine which language the system should respond in
    // If targetLanguage is provided, use it; otherwise, use the default logic
    const responseLanguage = targetLanguage ? targetLanguage :
                            userLanguage === 'english' ? 'Spanish' : 'English';
                            
    const nativeLanguage = userLanguage === 'english' ? 'English' : 
                          userLanguage === 'spanish' ? 'Spanish' : 
                          userLanguage === 'portuguese' ? 'Portuguese' : 
                          userLanguage === 'korean' ? 'Korean' :
                          userLanguage === 'arabic' ? 'Arabic' :
                          userLanguage === 'mandarin' ? 'Mandarin Chinese' :
                          userLanguage === 'vietnamese' ? 'Vietnamese' :
                          userLanguage === 'japanese' ? 'Japanese' :
                          userLanguage === 'ukrainian' ? 'Ukrainian' :
                          userLanguage === 'russian' ? 'Russian' : 
                          userLanguage === 'hindi' ? 'Hindi' : 
                          userLanguage === 'indonesian' ? 'Indonesian' : 'Unknown';
    
    // For Japanese, Russian, French, Ukrainian, Hindi and Indonesian users, always include translations regardless of request type
    const alwaysIncludeTranslation = userLanguage === 'japanese' || userLanguage === 'russian' || userLanguage === 'french' || userLanguage === 'ukrainian' || userLanguage === 'hindi' || userLanguage === 'indonesian';

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

${userLanguage === 'japanese' ? 'ALWAYS add a translation in Japanese after your response in English, prefixed with "Translation: ".' : 
userLanguage === 'russian' ? 'ALWAYS add a translation in Russian after your response in English, prefixed with "Translation: ".' :
userLanguage === 'french' ? 'ALWAYS add a translation in French after your response in English, prefixed with "Translation: ".' :
userLanguage === 'ukrainian' ? 'ALWAYS add a translation in Ukrainian after your response in English, prefixed with "Translation: ".' :
userLanguage === 'hindi' ? 'ALWAYS add a translation in Hindi after your response in English, prefixed with "Translation: ". The Hindi translation should be an actual Hindi translation, not just another English paraphrase.' :
userLanguage === 'indonesian' ? 'ALWAYS add a translation in Indonesian after your response in English, prefixed with "Translation: ". The Indonesian translation should accurately capture your English response.' :
'After your response in ' + responseLanguage + ', add a translation in ' + nativeLanguage + ' prefixed with "Translation: ".'}`;

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

    // For Hindi users, if no proper translation is returned or the translation looks like English,
    // make a separate API call to get a proper Hindi translation
    if (userLanguage === 'hindi' && (!translation || !/[\u0900-\u097F]/.test(translation))) {
      try {
        console.log('Getting proper Hindi translation for:', reply);
        const translateResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: 'You are a professional translator. Translate the following English text to Hindi accurately. ONLY return the Hindi translation, nothing else.'
              },
              { role: 'user', content: reply }
            ],
            temperature: 0.3,
            max_tokens: 300,
          }),
        });

        const translateData = await translateResponse.json();
        
        if (translateResponse.ok) {
          translation = translateData.choices[0].message.content.trim();
          console.log('Received Hindi translation:', translation);
        }
      } catch (translateError) {
        console.error('Error getting Hindi translation:', translateError);
        // Continue even if translation fails
      }
    }
    
    // For Indonesian users, if no proper translation is returned, make a separate API call to get a proper Indonesian translation
    if (userLanguage === 'indonesian' && (!translation || translation.length < 10)) {
      try {
        console.log('Getting proper Indonesian translation for:', reply);
        const translateResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: 'You are a professional translator. Translate the following English text to Indonesian accurately. ONLY return the Indonesian translation, nothing else.'
              },
              { role: 'user', content: reply }
            ],
            temperature: 0.3,
            max_tokens: 300,
          }),
        });

        const translateData = await translateResponse.json();
        
        if (translateResponse.ok) {
          translation = translateData.choices[0].message.content.trim();
          console.log('Received Indonesian translation:', translation);
        }
      } catch (translateError) {
        console.error('Error getting Indonesian translation:', translateError);
        // Continue even if translation fails
      }
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
