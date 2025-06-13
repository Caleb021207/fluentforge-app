import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcriptId } = await req.json();

    if (!transcriptId) {
      return new Response(
        JSON.stringify({ error: 'Transcript ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the transcript analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('transcript_analyses')
      .select('*')
      .eq('id', transcriptId)
      .single();

    if (analysisError || !analysis) {
      return new Response(
        JSON.stringify({ error: 'Transcript analysis not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if recommendations already exist for this transcript
    const { data: existingRecs, error: existingError } = await supabase
      .from('study_recommendations')
      .select('id')
      .eq('transcript_id', transcriptId);

    if (existingError) {
      throw existingError;
    }

    if (existingRecs && existingRecs.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Study recommendations already exist for this transcript' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare data for AI processing
    const analysisData = {
      overallScore: analysis.overall_score,
      cefrLevel: analysis.cefr_level,
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      recommendations: analysis.recommendations || [],
      detailedFeedback: analysis.detailed_feedback
    };

    // Generate structured recommendations using OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Based on this language assessment analysis, create 3-5 specific, actionable study recommendations:

Analysis Data:
- Overall Score: ${analysisData.overallScore}/10
- CEFR Level: ${analysisData.cefrLevel}
- Strengths: ${analysisData.strengths.join(', ')}
- Weaknesses: ${analysisData.weaknesses.join(', ')}
- Existing Recommendations: ${analysisData.recommendations.join('; ')}
- Detailed Feedback: ${analysisData.detailedFeedback}

For each recommendation, provide:
1. skill_area (one of: reading, writing, speaking, listening, grammar, vocabulary)
2. priority_level (1-5, where 5 is highest priority)
3. recommendation_text (specific, actionable advice)
4. estimated_time_investment (e.g., "15-30 minutes daily", "2-3 hours weekly")
5. difficulty_level (beginner, intermediate, advanced)
6. resources (specific study materials, exercises, or techniques)

Focus on the identified weaknesses while building on strengths. Prioritize areas that will have the most impact on overall improvement.

Return as JSON array with this exact structure:
[
  {
    "skill_area": "grammar",
    "priority_level": 4,
    "recommendation_text": "Focus on improving verb tenses through targeted exercises",
    "estimated_time_investment": "20 minutes daily",
    "difficulty_level": "intermediate",
    "resources": "Practice conditional sentences, complete online grammar exercises, use language apps with grammar focus"
  }
]`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a language learning expert. Generate structured study recommendations based on assessment data. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;
    
    // Parse the JSON response
    let recommendations;
    try {
      recommendations = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedContent);
      throw new Error('Invalid AI response format');
    }

    // Insert recommendations into the database
    const recommendationsToInsert = recommendations.map((rec: any) => ({
      user_id: analysis.user_id,
      transcript_id: transcriptId,
      skill_area: rec.skill_area,
      priority_level: rec.priority_level,
      recommendation_text: rec.recommendation_text,
      estimated_time_investment: rec.estimated_time_investment,
      difficulty_level: rec.difficulty_level,
      resources: rec.resources
    }));

    const { data: insertedRecs, error: insertError } = await supabase
      .from('study_recommendations')
      .insert(recommendationsToInsert)
      .select();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Study recommendations generated successfully',
        recommendations: insertedRecs 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in generate-study-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});