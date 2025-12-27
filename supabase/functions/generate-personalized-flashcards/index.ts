import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlashcardData {
  term: string;
  definition: string;
  example: string;
  category: 'grammar' | 'vocabulary' | 'phrase';
  cefr_level: string;
}

interface GenerationRequest {
  studentId: string;
  maxCards?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { studentId, maxCards = 10 }: GenerationRequest = await req.json();

    if (!studentId) {
      throw new Error('studentId is required');
    }

    console.log(`Generating flashcards for student: ${studentId}`);

    // Get student's learning profile
    const { data: profile, error: profileError } = await supabase
      .from('student_learning_profiles')
      .select('*')
      .eq('student_id', studentId)
      .eq('profiling_enabled', true)
      .single();

    if (profileError || !profile) {
      console.log('No profiling enabled for student or profile not found');
      return new Response(
        JSON.stringify({ success: false, message: 'Profiling not enabled for this student' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing flashcard terms to avoid duplicates
    const { data: existingCards } = await supabase
      .from('personalized_flashcards')
      .select('term')
      .eq('student_id', studentId);

    const existingTerms = new Set((existingCards || []).map(c => c.term.toLowerCase()));

    // Build prompt from profile data
    const grammarWeaknesses = profile.grammar_weaknesses || [];
    const vocabularyGaps = profile.vocabulary_gaps || [];
    const primaryStruggles = profile.primary_struggles || [];
    const cefrLevel = profile.estimated_cefr_level || 'A2';

    if (grammarWeaknesses.length === 0 && vocabularyGaps.length === 0 && primaryStruggles.length === 0) {
      console.log('No weaknesses found in profile to generate flashcards from');
      return new Response(
        JSON.stringify({ success: false, message: 'No learning gaps identified yet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an ESL teaching assistant that creates targeted flashcards for English language learners.
Generate flashcards that help students practice their specific weak areas.
Each flashcard should be appropriate for a ${cefrLevel} level learner.
Focus on practical, everyday usage and clear explanations.`;

    const userPrompt = `Based on this student's learning profile, generate ${maxCards} flashcards to help them improve:

Grammar Weaknesses: ${JSON.stringify(grammarWeaknesses)}
Vocabulary Gaps: ${JSON.stringify(vocabularyGaps)}
Primary Struggles: ${JSON.stringify(primaryStruggles)}
Current Level: ${cefrLevel}

Already existing flashcard terms to AVOID duplicating: ${Array.from(existingTerms).join(', ')}

Generate flashcards in this JSON format:
{
  "flashcards": [
    {
      "term": "the concept/word/phrase to learn",
      "definition": "clear, simple explanation",
      "example": "example sentence using the term",
      "category": "grammar" | "vocabulary" | "phrase",
      "cefr_level": "${cefrLevel}"
    }
  ]
}

Focus on:
- Grammar rules the student struggles with
- Vocabulary words they don't know
- Common phrases and expressions at their level
- Clear, memorable examples`;

    console.log('Calling OpenAI to generate flashcards...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse flashcard data');
    }

    const flashcards: FlashcardData[] = parsed.flashcards || [];
    console.log(`Generated ${flashcards.length} flashcards`);

    // Filter out duplicates and insert new flashcards
    const newFlashcards = flashcards.filter(
      card => !existingTerms.has(card.term.toLowerCase())
    );

    if (newFlashcards.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'All generated cards already exist', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const flashcardsToInsert = newFlashcards.map(card => ({
      student_id: studentId,
      term: card.term,
      definition: card.definition,
      example: card.example,
      category: card.category,
      cefr_level: card.cefr_level,
      source_type: 'profile',
      mastery_level: 0,
      next_due: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('personalized_flashcards')
      .insert(flashcardsToInsert);

    if (insertError) {
      console.error('Error inserting flashcards:', insertError);
      throw new Error('Failed to save flashcards');
    }

    console.log(`Successfully inserted ${flashcardsToInsert.length} flashcards`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: flashcardsToInsert.length,
        message: `Generated ${flashcardsToInsert.length} new flashcards`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-personalized-flashcards:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
