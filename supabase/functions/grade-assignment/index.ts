import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId, assignmentId } = await req.json();
    
    if (!submissionId || !assignmentId) {
      throw new Error('Missing submissionId or assignmentId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch submission and assignment
    const { data: submission, error: subError } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (subError || !submission) {
      throw new Error('Submission not found');
    }

    const { data: assignment, error: assignError } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (assignError || !assignment) {
      throw new Error('Assignment not found');
    }

    const transcript = submission.transcript || [];
    const messageCount = submission.message_count || 0;
    const minMessages = assignment.min_messages || 10;

    // Calculate base score components
    let score = 0;
    let feedback: any = {
      topicRelevance: 0,
      grammarAccuracy: 0,
      levelAppropriateness: 0,
      conversationFlow: 0,
      details: []
    };

    // If OpenAI key is available, use AI grading
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a language learning assessment expert. Grade this conversation based on:
1. Topic Relevance (0-25): How well did the student stay on topic "${assignment.topic_prompt}"?
2. Grammar Accuracy (0-25): Correctness of grammar for ${assignment.cefr_level || 'B1'} level
3. Level Appropriateness (0-25): Did they use vocabulary/structures appropriate for ${assignment.cefr_level || 'B1'}?
4. Conversation Flow (0-25): Natural flow, turn-taking, responsiveness

Respond in JSON format:
{
  "topicRelevance": <number 0-25>,
  "grammarAccuracy": <number 0-25>,
  "levelAppropriateness": <number 0-25>,
  "conversationFlow": <number 0-25>,
  "totalScore": <number 0-100>,
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<area1>", "<area2>"],
  "summary": "<brief overall assessment>"
}`
              },
              {
                role: 'user',
                content: `Grade this conversation:\n\n${JSON.stringify(transcript, null, 2)}`
              }
            ],
            max_tokens: 500,
            temperature: 0.3
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0]?.message?.content || '';
          
          try {
            // Parse JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              feedback = JSON.parse(jsonMatch[0]);
              score = feedback.totalScore || 
                (feedback.topicRelevance + feedback.grammarAccuracy + 
                 feedback.levelAppropriateness + feedback.conversationFlow);
            }
          } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
          }
        }
      } catch (aiError) {
        console.error('OpenAI API error:', aiError);
      }
    }

    // Fallback scoring if AI grading failed
    if (score === 0) {
      // Simple heuristic scoring
      const messageScore = Math.min((messageCount / minMessages) * 25, 25);
      const lengthBonus = transcript.length > minMessages * 1.5 ? 10 : 0;
      score = Math.round(50 + messageScore + lengthBonus); // Base 50 + up to 35 bonus
      
      feedback = {
        topicRelevance: 15,
        grammarAccuracy: 15,
        levelAppropriateness: 15,
        conversationFlow: Math.round(messageScore),
        summary: "Your conversation has been automatically scored based on length and engagement.",
        strengths: ["Completed the assignment", messageCount >= minMessages ? "Met message requirement" : "Made good progress"],
        improvements: ["Continue practicing to improve fluency"]
      };
    }

    // Calculate XP (67% of exam XP which is ~150, so ~100 XP max)
    const examXP = 150;
    const assignmentBaseXP = Math.round(examXP * 0.67);
    const completionXP = Math.round(assignmentBaseXP * 0.5); // 50 XP for completing
    const performanceXP = Math.round((assignmentBaseXP * 0.5) * (score / 100)); // Up to 50 XP based on score
    const totalXP = completionXP + performanceXP;

    // Update submission with grades
    const { error: updateError } = await supabase
      .from('assignment_submissions')
      .update({
        ai_score: score,
        ai_feedback: feedback,
        xp_awarded: totalXP,
        status: 'graded'
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission:', updateError);
    }

    // Award XP to student
    try {
      await supabase.functions.invoke('award-xp', {
        body: {
          userId: submission.student_id,
          activityType: 'assignment',
          xpAmount: totalXP,
          metadata: {
            assignmentId,
            score,
            title: assignment.title
          }
        }
      });
    } catch (xpError) {
      console.error('Error awarding XP:', xpError);
    }

    console.log(`Graded assignment ${assignmentId}: score=${score}, xp=${totalXP}`);

    return new Response(JSON.stringify({
      success: true,
      score,
      feedback,
      xpAwarded: totalXP
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in grade-assignment:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
