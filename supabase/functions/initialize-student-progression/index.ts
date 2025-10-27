import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Initializing student progression records...');

    // Get all student profiles that don't have progression records
    const { data: studentsWithoutProgression, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .eq('role', 'student')
      .not('id', 'in', `(SELECT user_id FROM user_progression)`);

    if (fetchError) {
      console.error('Error fetching students:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${studentsWithoutProgression?.length || 0} students without progression records`);

    if (!studentsWithoutProgression || studentsWithoutProgression.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'All students already have progression records',
          initialized_count: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create progression records for all students
    const progressionRecords = studentsWithoutProgression.map(student => ({
      user_id: student.id,
      total_xp: 0,
      current_level: 1,
      current_streak_days: 0,
      lessons_completed: 0,
      certifications_completed: 0,
      voice_sessions_completed: 0,
      text_messages_sent: 0,
      voice_messages_sent: 0,
      pronunciation_exercises: 0,
      conversations_analyzed: 0,
      exams_completed: 0,
      premium_voice_messages: 0,
      realtime_ai_messages: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('user_progression')
      .insert(progressionRecords);

    if (insertError) {
      console.error('Error inserting progression records:', insertError);
      throw insertError;
    }

    console.log(`Successfully initialized ${progressionRecords.length} student progression records`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Initialized ${progressionRecords.length} student progression records`,
        initialized_count: progressionRecords.length,
        students: studentsWithoutProgression.map(s => ({
          email: s.email,
          name: s.display_name,
        })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in initialize-student-progression:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
