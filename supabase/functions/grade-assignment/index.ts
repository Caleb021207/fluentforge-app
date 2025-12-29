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

    const messageCount = submission.message_count || 0;
    const minMessages = assignment.min_messages || 10;

    // COMPLETION-BASED SCORING (no harsh percentages)
    // 100% if met or exceeded minimum messages = "Completed"
    // null score if not met = "Incomplete" (teacher can manually grade)
    let score: number | null = null;
    let status = 'incomplete';
    let feedback: any = {};
    let totalXP = 25; // Small participation XP for incomplete

    if (messageCount >= minMessages) {
      // Full completion - 100%
      score = 100;
      status = 'completed';
      totalXP = 100; // Full XP for completion
      feedback = {
        status: 'completed',
        summary: 'Great job! You successfully completed the conversation assignment.',
        messagesMet: true,
        messagesRequired: minMessages,
        messagesSubmitted: messageCount
      };
    } else {
      // Incomplete - don't assign a harsh percentage score
      feedback = {
        status: 'incomplete',
        summary: `Submitted ${messageCount} of ${minMessages} required messages. Assignment incomplete.`,
        messagesMet: false,
        messagesRequired: minMessages,
        messagesSubmitted: messageCount
      };
    }

    console.log(`[grade-assignment] Submission ${submissionId}: messages=${messageCount}/${minMessages}, status=${status}, XP=${totalXP}`);

    // Update submission with grades
    const { error: updateError } = await supabase
      .from('assignment_submissions')
      .update({
        ai_score: score,
        ai_feedback: feedback,
        xp_awarded: totalXP,
        status: status
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