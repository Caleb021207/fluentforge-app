
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || "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";

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
    const { message, userLanguage, conversationHistory = [], cefrLevel = 'B1' } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Determine which language the system should respond in
    const responseLanguage = userLanguage === 'english' ? 'Spanish' : 'English';
    const nativeLanguage = userLanguage === 'english' ? 'English' : userLanguage === 'spanish' ? 'Spanish' : 'Portuguese';

    // CEFR level-specific guidelines
    let cefrGuidelines = '';
    
    switch(cefrLevel) {
      case 'A1':
        cefrGuidelines = `
        LEVEL A1 (Beginner):
        • Grammar: Use ONLY present tense verbs. Do not use compound tenses (e.g., present perfect, past perfect, etc.). No subjunctive, no conditional. Use simple sentence structures: subject + verb + object. Avoid passive voice.
        • Vocabulary: Use the most basic and essential vocabulary. Limit words to common topics like greetings, days, numbers, colors, family, food, and school. Do not use slang, idioms, or figurative language.
        `;
        break;
      case 'A2':
        cefrGuidelines = `
        LEVEL A2 (Elementary):
        • Grammar: Use present, simple past (preterite), and basic future tense (ir + a + infinitive). No subjunctive or conditional. Use short compound sentences. Keep sentence structure simple.
        • Vocabulary: Expand slightly beyond A1 to include shopping, health, directions, and simple opinions. Still avoid idioms and advanced words.
        `;
        break;
      case 'B1':
        cefrGuidelines = `
        LEVEL B1 (Intermediate):
        • Grammar: Use present, preterite, imperfect, future, and introduce basic subjunctive in common phrases (e.g., "quiero que", "es importante que"). Use conditional only for polite requests. Use linking words (porque, aunque, entonces).
        • Vocabulary: Include broader vocabulary about work, school, travel, emotions, and relationships. You may use some common idioms and phrasal expressions, as long as you explain them if needed.
        `;
        break;
      case 'B2':
        cefrGuidelines = `
        LEVEL B2 (Upper Intermediate):
        • Grammar: Use all major verb tenses: present, preterite, imperfect, future, conditional, present perfect, pluperfect, subjunctive (present and imperfect), and passive voice. Use complex sentences with multiple clauses.
        • Vocabulary: Use more abstract, nuanced vocabulary, technical terms, and idiomatic expressions. Feel free to introduce figurative language and cultural references.
        `;
        break;
      default:
        cefrGuidelines = `
        LEVEL B1 (Intermediate):
        • Grammar: Use present, preterite, imperfect, future, and introduce basic subjunctive in common phrases. Use conditional only for polite requests. Use linking words.
        • Vocabulary: Include vocabulary about work, school, travel, emotions, and relationships. You may use some common idioms and expressions.
        `;
    }

    const systemPrompt = `You are a friendly and supportive language tutor for ${responseLanguage}. 
    The user is a ${nativeLanguage} speaker learning ${responseLanguage} at CEFR level ${cefrLevel}.
    
    ${cefrGuidelines}
    
    REMEMBER: Throughout the conversation, stay within the selected level. Do NOT use tenses or vocabulary beyond the student's chosen level. This is for learners, not native speakers.
    
    Respond conversationally in ${responseLanguage} to help them practice.
    Keep your responses short and focused.
    If they make mistakes, gently correct them only if it impacts understanding.
    Encourage them to continue practicing.
    
    After your response in ${responseLanguage}, add a translation in ${nativeLanguage} prefixed with "Translation: ".
    For example:
    [Response in ${responseLanguage}]
    Translation: [Same content translated to ${nativeLanguage}]`;

    // Build the messages array with system message and conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
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

    return new Response(
      JSON.stringify({ 
        content: reply,
        translation,
        // Return the updated conversation history
        updatedHistory: [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: fullReply }
        ]
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
