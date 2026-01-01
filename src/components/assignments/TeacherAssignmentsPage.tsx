import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AnimatedLoader from '@/components/ui/animated-loader';
import TeacherAssignmentsView from './TeacherAssignmentsView';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClassInfo {
  id: string;
  name: string;
  student_count?: number;
}

interface TeacherAssignmentsPageProps {
  teacherId: string;
}

const TeacherAssignmentsPage = ({ teacherId }: TeacherAssignmentsPageProps) => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Fetch teacher's classes
        const { data: classData, error } = await supabase
          .from('classes')
          .select('id, name')
          .eq('teacher_id', teacherId)
          .order('name');

        if (error) throw error;

        if (classData && classData.length > 0) {
          // Get student counts for each class
          const classesWithCounts = await Promise.all(
            classData.map(async (cls) => {
              const { count } = await supabase
                .from('student_enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', cls.id);
              return { ...cls, student_count: count || 0 };
            })
          );

          setClasses(classesWithCounts);
          setSelectedClass(classesWithCounts[0]);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <AnimatedLoader size="md" message="Loading classes..." />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="py-12 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Classes Found</h3>
          <p className="text-muted-foreground">
            Create a class to start creating assignments for your students.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Class Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>
        {classes.length > 1 && (
          <Select 
            value={selectedClass?.id} 
            onValueChange={(id) => setSelectedClass(classes.find(c => c.id === id) || null)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} ({cls.student_count} students)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {classes.length === 1 && (
          <span className="text-muted-foreground">
            {selectedClass?.name} • {selectedClass?.student_count} students
          </span>
        )}
      </div>

      {/* Assignments for Selected Class */}
      {selectedClass && (
        <TeacherAssignmentsView 
          classId={selectedClass.id} 
          className={selectedClass.name} 
        />
      )}
    </div>
  );
};

export default TeacherAssignmentsPage;
