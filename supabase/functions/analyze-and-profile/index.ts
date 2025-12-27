import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnalysisRequest {
  studentId: string;
  sessionId: string;
  messages: ConversationMessage[];
  topic?: string;
  targetLevel?: string;
}

interface GrammarIssue {
  pattern: string;
  frequency: number;
  examples: string[];
}

interface AnalysisResult {
  conversationSummary: string;
  grammarIssues: GrammarIssue[];
  vocabularyUsed: string[];
  cefrLevelDemonstrated: string;
  primaryStruggles: string[];
  strengths: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { studentId, sessionId, messages, topic, targetLevel }: AnalysisRequest = await req.json();

    if (!studentId || !sessionId || !messages?.length) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: studentId, sessionId, messages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if profiling is enabled for this student
    const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    const { data: profile, error: profileError } = await supabase
      .from('student_learning_profiles')
      .select('profiling_enabled')
      .eq('student_id', studentId)
      .eq('academic_year', academicYear)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profiling status:', profileError);
    }

    if (!profile?.profiling_enabled) {
      console.log(`Profiling not enabled for student ${studentId}, skipping analysis`);
      return new Response(
        JSON.stringify({ skipped: true, reason: 'Profiling not enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format conversation for analysis
    const conversationText = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    // Analyze with GPT-4o-mini
    console.log('Analyzing conversation for student:', studentId);
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert language learning analyst. Analyze this English learning conversation and provide a structured assessment.

Return a JSON object with these fields:
- conversationSummary: Brief 1-2 sentence summary of the conversation topic and student performance
- grammarIssues: Array of {pattern: string, frequency: number, examples: string[]} for grammar mistakes
- vocabularyUsed: Array of key vocabulary words the student used (max 20)
- cefrLevelDemonstrated: Estimated CEFR level (A1, A2, B1, B2, C1, or C2) based on language use
- primaryStruggles: Array of specific areas the student struggles with (max 5)
- strengths: Array of things the student does well (max 5)

Be specific and actionable in your analysis. Focus on patterns, not individual mistakes.`
          },
          {
            role: 'user',
            content: `Analyze this language learning conversation:\n\n${conversationText}\n\nTarget level: ${targetLevel || 'unknown'}\nTopic: ${topic || 'general practice'}`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    const analysis: AnalysisResult = JSON.parse(analysisData.choices[0].message.content);

    console.log('Analysis complete:', {
      cefrLevel: analysis.cefrLevelDemonstrated,
      issuesCount: analysis.grammarIssues.length,
      strugglesCount: analysis.primaryStruggles.length
    });

    // Store conversation memory (rolling 10 - trigger handles cleanup)
    const { error: memoryError } = await supabase
      .from('student_conversation_memory')
      .insert({
        student_id: studentId,
        session_id: sessionId,
        conversation_summary: analysis.conversationSummary,
        grammar_issues_found: analysis.grammarIssues,
        vocabulary_used: analysis.vocabularyUsed,
        topic: topic || 'general practice',
        cefr_level_demonstrated: analysis.cefrLevelDemonstrated,
        message_count: messages.length
      });

    if (memoryError) {
      console.error('Error storing conversation memory:', memoryError);
    }

    // Update student learning profile
    const { data: existingProfile } = await supabase
      .from('student_learning_profiles')
      .select('*')
      .eq('student_id', studentId)
      .eq('academic_year', academicYear)
      .single();

    if (existingProfile) {
      // Merge new analysis with existing profile
      const existingStruggles = existingProfile.primary_struggles || [];
      const existingStrengths = existingProfile.strengths || [];
      const existingGrammarWeaknesses = existingProfile.grammar_weaknesses || [];
      const existingVocabGaps = existingProfile.vocabulary_gaps || [];

      // Merge and deduplicate struggles
      const mergedStruggles = [...new Set([
        ...existingStruggles,
        ...analysis.primaryStruggles
      ])].slice(0, 10);

      // Merge and deduplicate strengths
      const mergedStrengths = [...new Set([
        ...existingStrengths,
        ...analysis.strengths
      ])].slice(0, 10);

      // Update grammar weaknesses with frequency tracking
      const grammarMap = new Map<string, GrammarIssue>();
      existingGrammarWeaknesses.forEach((gw: GrammarIssue) => {
        grammarMap.set(gw.pattern, gw);
      });
      analysis.grammarIssues.forEach((gi: GrammarIssue) => {
        const existing = grammarMap.get(gi.pattern);
        if (existing) {
          existing.frequency += gi.frequency;
          existing.examples = [...new Set([...existing.examples, ...gi.examples])].slice(0, 5);
        } else {
          grammarMap.set(gi.pattern, gi);
        }
      });
      const updatedGrammarWeaknesses = Array.from(grammarMap.values())
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 15);

      // Update profile
      const { error: updateError } = await supabase
        .from('student_learning_profiles')
        .update({
          estimated_cefr_level: analysis.cefrLevelDemonstrated,
          primary_struggles: mergedStruggles,
          strengths: mergedStrengths,
          grammar_weaknesses: updatedGrammarWeaknesses,
          last_updated: new Date().toISOString()
        })
        .eq('student_id', studentId)
        .eq('academic_year', academicYear);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: {
          summary: analysis.conversationSummary,
          level: analysis.cefrLevelDemonstrated,
          issuesCount: analysis.grammarIssues.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-and-profile:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
