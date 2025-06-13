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

    const prompt = `STRICT INSTRUCTIONS: You MUST only recommend features that exist within our language learning platform. NEVER mention external websites, apps, services, or resources outside our platform.

Based on this language assessment analysis, create 3-5 specific study recommendations using ONLY our internal platform features:

Analysis Data:
- Overall Score: ${analysisData.overallScore}/10
- CEFR Level: ${analysisData.cefrLevel}
- Strengths: ${analysisData.strengths.join(', ')}
- Weaknesses: ${analysisData.weaknesses.join(', ')}
- Existing Recommendations: ${analysisData.recommendations.join('; ')}
- Detailed Feedback: ${analysisData.detailedFeedback}

INTERNAL PLATFORM FEATURES ONLY:

**SPEAKING & LISTENING (Routes: /voice-chat, /premium-voice)**
- Voice Chat Practice: AI conversation practice with complexity levels
- Premium Voice Chat: Advanced AI tutors for enhanced practice
- Pronunciation Practice: Phrase-by-phrase pronunciation feedback
- Conversation Starters: Guided practice for different proficiency levels
- Speech Rate Control: Adjustable speed for comprehension

**WRITING PRACTICE (Route: /practice)**
- Text Practice Chat: AI-powered writing with real-time feedback
- Grammar correction during text conversations
- Writing exercises with instant AI feedback

**READING & LESSONS (Route: /lessons)**
- Interactive lesson modules with reading exercises
- CEFR-leveled materials (A1-C2)
- Reading comprehension quizzes
- Multiple exercise types within lessons

**VOCABULARY BUILDING (Route: /vocabulary)**
- CEFR-organized vocabulary lessons (A1-C2)
- Interactive flashcard systems
- Audio Transcription Exercises
- Image Identification Exercises
- Word Ordering Exercises
- Sentence Correction Exercises
- Short Answer Exercises
- Timed Quiz Exercises

**CERTIFICATION TESTING (Route: /certificates)**
- Reading Certification tests
- Writing Certification assessments
- Fluency tests with conversation analysis

**PROGRESS TRACKING (Route: /progress)**
- Progress analytics and insights
- Performance metrics tracking
- AI-powered progress analysis

SKILL AREA MAPPING (USE THESE EXACT ROUTES):
- speaking/listening → "Navigate to Voice Chat (/voice-chat) or Premium Voice (/premium-voice)"
- writing → "Navigate to Practice Chat (/practice) for text-based writing practice"
- reading → "Navigate to Lessons (/lessons) for reading exercises and comprehension"
- vocabulary → "Navigate to Vocabulary (/vocabulary) for flashcards and word exercises"
- grammar → "Navigate to Lessons (/lessons) for grammar modules and exercises"

EXAMPLE RESOURCES FORMAT (ONLY REFERENCE INTERNAL FEATURES):
- "Access Voice Chat from the main navigation menu, select your proficiency level, and practice with AI tutors"
- "Go to Vocabulary section, choose your CEFR level, and complete flashcard exercises"
- "Visit Lessons page, select grammar modules, and complete interactive exercises"

VALIDATION CHECKLIST:
✓ NO external websites mentioned (no BBC, IELTS, Grammarly, etc.)
✓ Only internal navigation routes used (/voice-chat, /practice, /lessons, /vocabulary, /certificates)
✓ Resources describe actual platform features
✓ Navigation instructions use our app's menu structure

Return ONLY a JSON array:
[
  {
    "skill_area": "speaking",
    "priority_level": 4,
    "recommendation_text": "Practice daily conversations using Voice Chat to improve fluency and pronunciation accuracy",
    "estimated_time_investment": "20 minutes daily",
    "difficulty_level": "intermediate",
    "resources": "Navigate to Voice Chat from the main menu, select intermediate level, enable pronunciation feedback, and practice with conversation starters"
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