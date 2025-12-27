import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  teacherId: string;
  format: 'csv' | 'json';
  startDate: string;
  endDate: string;
  classId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { teacherId, format, startDate, endDate, classId }: ReportRequest = await req.json();

    console.log('Generating report for teacher:', teacherId, 'Format:', format);

    // Get teacher's classes
    let classQuery = supabase
      .from('classes')
      .select('id, name')
      .eq('teacher_id', teacherId);

    if (classId) {
      classQuery = classQuery.eq('id', classId);
    }

    const { data: classes, error: classesError } = await classQuery;

    if (classesError) throw classesError;
    if (!classes?.length) {
      return new Response(
        JSON.stringify({ content: format === 'csv' ? 'No data available' : { students: [] } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const classIds = classes.map(c => c.id);
    const classMap = new Map(classes.map(c => [c.id, c.name]));

    // Get enrollments
    const { data: enrollments } = await supabase
      .from('student_enrollments')
      .select('student_id, class_id')
      .in('class_id', classIds);

    const studentIds = [...new Set(enrollments?.map(e => e.student_id).filter(Boolean))] as string[];

    if (studentIds.length === 0) {
      return new Response(
        JSON.stringify({ content: format === 'csv' ? 'No students enrolled' : { students: [] } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get student profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('id', studentIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Get learning profiles
    const { data: learningProfiles } = await supabase
      .from('student_learning_profiles')
      .select('student_id, estimated_cefr_level, estimated_actfl_level')
      .in('student_id', studentIds);

    const learningMap = new Map(learningProfiles?.map(p => [p.student_id, p]) || []);

    // Get assignments
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, title, class_id, due_date, points_possible')
      .in('class_id', classIds);

    const assignmentIds = assignments?.map(a => a.id) || [];
    const assignmentMap = new Map(assignments?.map(a => [a.id, a]) || []);

    // Get submissions within date range
    const { data: submissions } = await supabase
      .from('assignment_submissions')
      .select('*')
      .in('assignment_id', assignmentIds)
      .in('student_id', studentIds)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Get student metrics
    const { data: metrics } = await supabase
      .from('student_metrics')
      .select('*')
      .in('student_id', studentIds);

    const metricsMap = new Map(metrics?.map(m => [m.student_id, m]) || []);

    // Get language metrics aggregates
    const { data: langMetrics } = await supabase
      .from('student_language_metrics')
      .select('user_id, grammar_accuracy, conversation_complexity, pronunciation_accuracy')
      .in('user_id', studentIds)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Aggregate language metrics per student
    const langAggregates = new Map<string, { grammar: number[]; complexity: number[]; pronunciation: number[] }>();
    langMetrics?.forEach(m => {
      const existing = langAggregates.get(m.user_id) || { grammar: [], complexity: [], pronunciation: [] };
      if (m.grammar_accuracy != null) existing.grammar.push(m.grammar_accuracy);
      if (m.conversation_complexity != null) existing.complexity.push(m.conversation_complexity);
      if (m.pronunciation_accuracy != null) existing.pronunciation.push(m.pronunciation_accuracy);
      langAggregates.set(m.user_id, existing);
    });

    // Build report data
    const reportData: any[] = [];

    enrollments?.forEach(enrollment => {
      const studentId = enrollment.student_id as string;
      const classId = enrollment.class_id;
      
      if (!studentId || !classId) return;

      const profile = profileMap.get(studentId);
      const learning = learningMap.get(studentId);
      const studentMetrics = metricsMap.get(studentId);
      const langAgg = langAggregates.get(studentId);

      // Calculate assignment stats for this class
      const classAssignmentIds = assignments?.filter(a => a.class_id === classId).map(a => a.id) || [];
      const studentSubmissions = submissions?.filter(s => 
        s.student_id === studentId && classAssignmentIds.includes(s.assignment_id!)
      ) || [];

      const completedSubmissions = studentSubmissions.filter(s => s.status === 'completed');
      const avgScore = completedSubmissions.length > 0
        ? completedSubmissions.reduce((sum, s) => sum + (s.ai_score || 0), 0) / completedSubmissions.length
        : 0;

      // Calculate language metric averages
      const avgGrammar = langAgg?.grammar.length 
        ? langAgg.grammar.reduce((a, b) => a + b, 0) / langAgg.grammar.length 
        : null;
      const avgComplexity = langAgg?.complexity.length 
        ? langAgg.complexity.reduce((a, b) => a + b, 0) / langAgg.complexity.length 
        : null;
      const avgPronunciation = langAgg?.pronunciation.length 
        ? langAgg.pronunciation.reduce((a, b) => a + b, 0) / langAgg.pronunciation.length 
        : null;

      reportData.push({
        studentId,
        studentName: profile?.display_name || 'Unknown',
        studentEmail: profile?.email || '',
        className: classMap.get(classId) || 'Unknown',
        cefrLevel: learning?.estimated_cefr_level || '',
        actflLevel: learning?.estimated_actfl_level || '',
        assignmentsCompleted: completedSubmissions.length,
        totalAssignments: classAssignmentIds.length,
        averageScore: Math.round(avgScore * 10) / 10,
        averageGrammar: avgGrammar ? Math.round(avgGrammar * 10) / 10 : '',
        averageComplexity: avgComplexity ? Math.round(avgComplexity * 10) / 10 : '',
        averagePronunciation: avgPronunciation ? Math.round(avgPronunciation * 10) / 10 : '',
        textPracticeSessions: studentMetrics?.text_practice_calls || 0,
        voicePracticeSessions: studentMetrics?.premium_voice_calls || 0,
        lastActivity: studentMetrics?.last_activity || ''
      });
    });

    // Remove duplicates (student might be in multiple classes)
    const uniqueStudents = Array.from(
      new Map(reportData.map(r => [`${r.studentId}-${r.className}`, r])).values()
    );

    let content: string | object;

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Student Name',
        'Email',
        'Class',
        'CEFR Level',
        'ACTFL Level',
        'Assignments Completed',
        'Total Assignments',
        'Average Score',
        'Avg Grammar',
        'Avg Complexity',
        'Avg Pronunciation',
        'Text Sessions',
        'Voice Sessions',
        'Last Activity'
      ];

      const rows = uniqueStudents.map(s => [
        s.studentName,
        s.studentEmail,
        s.className,
        s.cefrLevel,
        s.actflLevel,
        s.assignmentsCompleted,
        s.totalAssignments,
        s.averageScore,
        s.averageGrammar,
        s.averageComplexity,
        s.averagePronunciation,
        s.textPracticeSessions,
        s.voicePracticeSessions,
        s.lastActivity
      ].join(','));

      content = [headers.join(','), ...rows].join('\n');
    } else {
      // Return JSON
      content = {
        generatedAt: new Date().toISOString(),
        dateRange: { startDate, endDate },
        totalStudents: new Set(uniqueStudents.map(s => s.studentId)).size,
        totalClasses: classes.length,
        students: uniqueStudents
      };
    }

    console.log('Report generated successfully with', uniqueStudents.length, 'records');

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
