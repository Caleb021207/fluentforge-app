import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Trash2, Copy, Check, FolderOpen, Sparkles, BookOpen, FileText } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
    queryKey: ['teacher-classes-cards', teacherId],
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
      queryClient.invalidateQueries({ queryKey: ['teacher-classes-cards', teacherId] });
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
      queryClient.invalidateQueries({ queryKey: ['teacher-classes-cards', teacherId] });
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
        <div className="min-w-0 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">{t("myClasses")}</h2>
            <p className="text-muted-foreground text-sm">
              {t("manageClassesDescription")}
            </p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            {t("createClass")}
          </Button>
        </motion.div>
      </div>

      {/* Classes Grid */}
      {classes?.length === 0 ? (
        <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <CardContent className="py-16 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4"
            >
              <BookOpen className="h-12 w-12 text-primary" />
            </motion.div>
            <p className="text-muted-foreground mb-6 text-lg">
              {t("noClassesCreated")}
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="shadow-lg">
                <Sparkles className="h-4 w-4 mr-2" />
                {t("createFirstClass")}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes?.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg truncate">{cls.name}</CardTitle>
                        <CardDescription>{cls.academic_year}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="default" className="shrink-0 bg-gradient-to-r from-emerald-500 to-green-500">{t("active")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm gap-2 p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground shrink-0">{t("classCode")}:</span>
                    <div className="flex items-center gap-1 min-w-0">
                      <code className="bg-background/80 px-3 py-1.5 rounded-lg text-xs font-mono border truncate">
                        {cls.class_code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 hover:bg-primary/20"
                        onClick={() => copyClassCode(cls.class_code)}
                      >
                        {copiedCode === cls.class_code ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">{t("students")}:</span>
                    <span className="font-semibold text-lg">{cls.student_count}</span>
                  </div>

                  {/* Action buttons - 2 column grid + delete */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 hover:bg-primary/10"
                      onClick={() => setViewStudentsClass({ id: cls.id, name: cls.name })}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      <span className="truncate">{t("viewStudents")}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 hover:bg-primary/10"
                      onClick={() => setSelectedClass(cls)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      <span className="truncate">{t("assignments")}</span>
                    </Button>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("deleteClass")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{cls.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently deletes the class, unenrolls all{' '}
                          {cls.student_count ?? 0} student{(cls.student_count ?? 0) === 1 ? '' : 's'},
                          and removes their enrollment history. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteClassMutation.mutate(cls.id)}
                        >
                          Delete class
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Class Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="glass border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              {t("createClass")}
            </DialogTitle>
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
