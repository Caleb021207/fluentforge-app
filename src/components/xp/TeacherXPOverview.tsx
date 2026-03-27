import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AnimatedLoader from '@/components/ui/animated-loader';
import { motion } from 'framer-motion';

interface StudentXPData {
  user_id: string;
  total_xp: number;
  level: number;
  current_streak: number;
  email?: string;
  display_name?: string;
}

interface ClassInfo {
  id: string;
  name: string;
}

const TeacherXPOverview = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [studentXPData, setStudentXPData] = useState<StudentXPData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: classData, error } = await supabase
          .from('classes')
          .select('id, name')
          .eq('teacher_id', user.id)
          .order('name');

        if (error) throw error;
        setClasses(classData || []);
        if (classData && classData.length > 0) {
          setSelectedClassId(classData[0].id);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchStudentXP = async () => {
      if (!selectedClassId) return;
      
      setLoading(true);
      try {
        // Get students enrolled in the selected class
        const { data: enrollments, error: enrollError } = await supabase
          .from('student_enrollments')
          .select('student_id')
          .eq('class_id', selectedClassId);

        if (enrollError) throw enrollError;

        if (!enrollments || enrollments.length === 0) {
          setStudentXPData([]);
          setLoading(false);
          return;
        }

        const studentIds = enrollments.map(e => e.student_id).filter(Boolean);

        // Fetch XP data for these students
        const { data: xpData, error: xpError } = await supabase
          .from('user_progression')
          .select('user_id, total_xp, level, current_streak')
          .in('user_id', studentIds)
          .order('total_xp', { ascending: false });

        if (xpError) throw xpError;

        // Fetch profiles for display names
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', studentIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const enrichedData = (xpData || []).map(xp => ({
          ...xp,
          display_name: profileMap.get(xp.user_id)?.display_name,
          email: profileMap.get(xp.user_id)?.email,
        }));

        setStudentXPData(enrichedData);
      } catch (error) {
        console.error('Error fetching student XP:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentXP();
  }, [selectedClassId]);

  const totalClassXP = studentXPData.reduce((sum, s) => sum + (s.total_xp || 0), 0);
  const avgXP = studentXPData.length > 0 ? Math.round(totalClassXP / studentXPData.length) : 0;
  const topStudent = studentXPData[0];

  if (loading && classes.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <AnimatedLoader size="md" message="Loading class data..." />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Classes Found</h3>
          <p className="text-muted-foreground">Create a class to start tracking student XP.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class Selector */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select Class
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedClassId === cls.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Class XP</p>
                  <p className="text-2xl font-bold">{totalClassXP.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/10">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average XP</p>
                  <p className="text-2xl font-bold">{avgXP.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Top Student</p>
                  <p className="text-lg font-bold truncate">
                    {topStudent?.display_name || topStudent?.email?.split('@')[0] || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Student Leaderboard */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Class Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <AnimatedLoader size="sm" message="Loading students..." />
          ) : studentXPData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No students enrolled in this class.</p>
          ) : (
            <div className="space-y-3">
              {studentXPData.map((student, index) => (
                <motion.div
                  key={student.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500 text-yellow-950' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-amber-600 text-amber-50' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {student.display_name || student.email?.split('@')[0] || 'Student'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Level {student.current_level} • {student.current_streak_days} day streak
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{(student.total_xp || 0).toLocaleString()} XP</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherXPOverview;
