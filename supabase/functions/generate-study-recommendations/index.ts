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

    const prompt = `Based on this language assessment analysis, create 3-5 specific, actionable study recommendations using our comprehensive language learning platform features:

Analysis Data:
- Overall Score: ${analysisData.overallScore}/10
- CEFR Level: ${analysisData.cefrLevel}
- Strengths: ${analysisData.strengths.join(', ')}
- Weaknesses: ${analysisData.weaknesses.join(', ')}
- Existing Recommendations: ${analysisData.recommendations.join('; ')}
- Detailed Feedback: ${analysisData.detailedFeedback}

COMPREHENSIVE PLATFORM FEATURES AVAILABLE:

**SPEAKING & LISTENING PRACTICE:**
- Voice Chat Practice: Real-time AI conversation practice with different complexity levels
- Premium Voice Chat: Enhanced voice practice with advanced AI tutors
- Pronunciation Practice: AI-powered pronunciation feedback with phrase-by-phrase analysis
- Conversation Starters: Guided conversation practice for different proficiency levels
- Speech Rate Control: Adjustable speaking speed for comprehension practice
- Real-time transcription and feedback during voice sessions

**WRITING PRACTICE:**
- Text Practice Chat: AI-powered writing practice with real-time feedback
- Grammar correction and suggestions during text conversations
- Writing exercises with instant AI feedback
- Structured writing prompts and guided practice

**READING COMPREHENSION:**
- Interactive lesson modules with reading exercises
- CEFR-leveled reading materials (A1-C2)
- Reading comprehension quizzes and assessments
- Reading Certification tests for skill validation

**VOCABULARY BUILDING:**
- Comprehensive vocabulary lessons organized by CEFR levels (A1-C2)
- Interactive flashcard systems with spaced repetition
- Vocabulary exercises with multiple exercise types:
  * Audio Transcription Exercises
  * Image Identification Exercises
  * Word Ordering Exercises
  * Sentence Correction Exercises
  * Short Answer Exercises
  * Timed Quiz Exercises
- Topic-based vocabulary sets (food, clothing, professions, time, weather, etc.)
- Advanced vocabulary for business, academic, and cultural contexts

**GRAMMAR PRACTICE:**
- Grammar rules and explanations integrated into lessons
- Interactive grammar exercises within lesson modules
- Real-time grammar feedback during practice sessions
- Progressive grammar complexity based on CEFR levels

**LESSON SYSTEM:**
- Structured lesson modules with progressive difficulty
- Multiple exercise types within each lesson
- Progress tracking through lesson completion
- Level-based progression system
- Challenge lists for skill advancement

**CERTIFICATION SYSTEM:**
- Reading Certification tests with detailed scoring
- Writing Certification assessments
- Fluency tests with conversation analysis
- CEFR-aligned certification levels
- Performance tracking and score history

**PROGRESS TRACKING & ANALYTICS:**
- Detailed progress analytics and insights
- Performance metrics across all skill areas
- AI-powered progress analysis and milestone tracking
- Session history and usage statistics
- Improvement recommendations based on performance data

**SPECIALIZED FEATURES:**
- Multi-language support (Spanish, Portuguese, and other languages)
- AI-powered transcript analysis for external test results
- Personalized study plan generation
- Pronunciation practice with complexity levels (beginner to advanced)
- Voice recognition and speech analysis
- Real-time translation assistance during practice

For each recommendation, provide:
1. skill_area (one of: reading, writing, speaking, listening, grammar, vocabulary)
2. priority_level (1-5, where 5 is highest priority)
3. recommendation_text (specific, actionable advice using our platform features)
4. estimated_time_investment (e.g., "15-30 minutes daily", "2-3 hours weekly")
5. difficulty_level (beginner, intermediate, advanced)
6. resources (specific platform features and how to use them)

Focus on directing users to the most appropriate platform features that address their specific weaknesses and build on their strengths. Be specific about which sections, exercise types, and difficulty levels to use.

Return ONLY a JSON array without markdown formatting:
[
  {
    "skill_area": "speaking",
    "priority_level": 4,
    "recommendation_text": "Use Voice Chat Practice at intermediate level with pronunciation feedback enabled to improve conversational fluency and accuracy",
    "estimated_time_investment": "20 minutes daily",
    "difficulty_level": "intermediate",
    "resources": "Access Voice Chat Practice from the main menu, enable pronunciation feedback in settings, start with conversation starters, and use speech rate control for optimal learning pace"
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
    let generatedContent = openAIData.choices[0].message.content;
    
    // Remove markdown code block wrapper if present
    if (generatedContent.startsWith('```json') && generatedContent.endsWith('```')) {
      generatedContent = generatedContent.slice(7, -3).trim();
    } else if (generatedContent.startsWith('```') && generatedContent.endsWith('```')) {
      generatedContent = generatedContent.slice(3, -3).trim();
    }
    
    // Parse the JSON response
    let recommendations;
    try {
      recommendations = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedContent);
      console.error('Parse error:', parseError);
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