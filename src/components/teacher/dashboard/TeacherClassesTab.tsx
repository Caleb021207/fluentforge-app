import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Trash2, Copy, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ClassStudentsList from '@/components/classroom/ClassStudentsList';
import TeacherAssignmentsView from '@/components/assignments/TeacherAssignmentsView';

interface TeacherClassesTabProps {
  teacherId: string | undefined;
}

interface ClassItem {
  id: string;
  name: string;
  class_code: string;
  created_at: string;
  academic_year: string;
  student_count: number;
}

const TeacherClassesTab = ({ teacherId }: TeacherClassesTabProps) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [viewStudentsClass, setViewStudentsClass] = useState<{ id: string; name: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: classes, isLoading } = useQuery({
    queryKey: ['teacher-classes', teacherId],
    queryFn: async (): Promise<ClassItem[]> => {
      if (!teacherId) return [];

      const { data, error } = await supabase
        .from('classes')
        .select('id, name, class_code, created_at, academic_year')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get student counts
      const classesWithCounts = await Promise.all(
        (data || []).map(async (cls) => {
          const { count } = await supabase
            .from('student_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);

          return { ...cls, student_count: count || 0 };
        })
      );

      return classesWithCounts;
    },
    enabled: !!teacherId,
  });

  const createClassMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!teacherId) throw new Error('No teacher ID');
      
      // Generate a unique class code
      const classCode = `CLS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

      const { data, error } = await supabase
        .from('classes')
        .insert({
          name,
          teacher_id: teacherId,
          class_code: classCode,
          academic_year: academicYear,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classes', teacherId] });
      setCreateDialogOpen(false);
      setNewClassName('');
      toast({
        title: t("success") || "Success",
        description: t("classCreated") || "Class created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: t("error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classes', teacherId] });
      toast({
        title: t("success") || "Success",
        description: t("classDeleted") || "Class deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: t("error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: t("copied") || "Copied",
      description: t("classCodeCopied") || "Class code copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold truncate">{t("myClasses")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("manageClassesDescription")}
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t("createClass")}
        </Button>
      </div>

      {/* Classes Grid */}
      {classes?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {t("noClassesCreated")}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("createFirstClass")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes?.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{cls.name}</CardTitle>
                    <CardDescription>{cls.academic_year}</CardDescription>
                  </div>
                  <Badge variant="default" className="shrink-0">{t("active")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="text-muted-foreground shrink-0">{t("classCode")}:</span>
                  <div className="flex items-center gap-1 min-w-0">
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono truncate">
                      {cls.class_code}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => copyClassCode(cls.class_code)}
                    >
                      {copiedCode === cls.class_code ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("students")}:</span>
                  <span className="font-medium">{cls.student_count}</span>
                </div>

                {/* Action buttons - 2 column grid + delete */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewStudentsClass({ id: cls.id, name: cls.name })}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    <span className="truncate">{t("viewStudents")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedClass(cls)}
                  >
                    <span className="truncate">{t("assignments")}</span>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteClassMutation.mutate(cls.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("deleteClass")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Class Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createClass")}</DialogTitle>
            <DialogDescription>
              {t("createClassDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="className">{t("className")}</Label>
              <Input
                id="className"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder={t("classNamePlaceholder")}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="w-full sm:w-auto">
              {t("cancel")}
            </Button>
            <Button
              onClick={() => createClassMutation.mutate(newClassName)}
              disabled={!newClassName.trim() || createClassMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createClassMutation.isPending ? t("creating") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Students Dialog */}
      {viewStudentsClass && (
        <ClassStudentsList
          classId={viewStudentsClass.id}
          className={viewStudentsClass.name}
          open={!!viewStudentsClass}
          onOpenChange={(open) => !open && setViewStudentsClass(null)}
        />
      )}

      {/* Assignments Dialog */}
      <Dialog open={!!selectedClass} onOpenChange={(open) => !open && setSelectedClass(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedClass?.name} - {t("assignments") || "Assignments"}</DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <TeacherAssignmentsView
              classId={selectedClass.id}
              className={selectedClass.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default TeacherClassesTab;
