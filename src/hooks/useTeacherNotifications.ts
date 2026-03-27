import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';

interface TeacherNotification {
  id: string;
  type: 'new_submission' | 'student_inactive' | 'assignment_due';
  message: string;
  studentId?: string;
  studentName?: string;
  assignmentId?: string;
  assignmentTitle?: string;
  createdAt: string;
  read: boolean;
}

export const useTeacherNotifications = (teacherId: string | undefined) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['teacher-notifications', teacherId],
    queryFn: async (): Promise<TeacherNotification[]> => {
      if (!teacherId) return [];

      const notifications: TeacherNotification[] = [];
      const now = new Date();

      // Get classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .eq('teacher_id', teacherId);

      if (!classes?.length) return [];

      const classIds = classes.map(c => c.id);

      // Get recent submissions (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, title')
        .in('class_id', classIds);

      const assignmentIds = assignments?.map(a => a.id) || [];
      const assignmentMap = new Map(assignments?.map(a => [a.id, a.title]) || []);

      if (assignmentIds.length > 0) {
        const { data: recentSubmissions } = await supabase
          .from('assignment_submissions')
          .select(`
            id,
            student_id,
            assignment_id,
            completed_at,
            profiles:student_id (display_name)
          `)
          .in('assignment_id', assignmentIds)
          .eq('status', 'completed')
          .gte('completed_at', sevenDaysAgo.toISOString())
          .order('completed_at', { ascending: false })
          .limit(10);

        recentSubmissions?.forEach(sub => {
          const profile = sub.profiles as any;
          notifications.push({
            id: `sub-${sub.id}`,
            type: 'new_submission',
            message: `${profile?.display_name || 'Student'} completed "${assignmentMap.get(sub.assignment_id!) || 'Assignment'}"`,
            studentId: sub.student_id,
            studentName: profile?.display_name,
            assignmentId: sub.assignment_id!,
            assignmentTitle: assignmentMap.get(sub.assignment_id!),
            createdAt: sub.submitted_at!,
            read: false
          });
        });
      }

      // Get inactive students (no activity in 7+ days)
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('student_id')
        .in('class_id', classIds);

      const studentIds = [...new Set(enrollments?.map(e => e.student_id).filter(Boolean))] as string[];

      if (studentIds.length > 0) {
        const { data: metrics } = await supabase
          .from('student_metrics')
          .select('student_id, last_activity')
          .in('student_id', studentIds);

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', studentIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);

        metrics?.forEach(m => {
          const daysSinceActive = m.last_activity 
            ? differenceInDays(now, new Date(m.last_activity))
            : 999;

          if (daysSinceActive > 7) {
            notifications.push({
              id: `inactive-${m.student_id}`,
              type: 'student_inactive',
              message: `${profileMap.get(m.student_id) || 'Student'} has been inactive for ${daysSinceActive} days`,
              studentId: m.student_id,
              studentName: profileMap.get(m.student_id) || undefined,
              createdAt: m.last_activity || now.toISOString(),
              read: false
            });
          }
        });
      }

      // Get assignments due soon (next 3 days)
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const { data: upcomingAssignments } = await supabase
        .from('assignments')
        .select('id, title, due_date')
        .in('class_id', classIds)
        .gte('due_date', now.toISOString())
        .lte('due_date', threeDaysFromNow.toISOString());

      upcomingAssignments?.forEach(a => {
        notifications.push({
          id: `due-${a.id}`,
          type: 'assignment_due',
          message: `"${a.title}" is due ${a.due_date}`,
          assignmentId: a.id,
          assignmentTitle: a.title,
          createdAt: a.due_date!,
          read: false
        });
      });

      // Sort by date, most recent first
      notifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return notifications;
    },
    enabled: !!teacherId,
    refetchInterval: 60000, // Refresh every minute
  });

  const unreadCount = data?.filter(n => !n.read).length || 0;

  return {
    notifications: data || [],
    unreadCount,
    isLoading,
    refetch
  };
};
