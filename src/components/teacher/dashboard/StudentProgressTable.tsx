import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown,
  ChevronUp,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocalization } from '@/context/LocalizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, differenceInDays } from 'date-fns';

interface StudentProgressTableProps {
  teacherId: string | undefined;
  onStudentSelect: (studentId: string) => void;
}

interface StudentProgress {
  id: string;
  displayName: string;
  className: string;
  classId: string;
  cefrLevel: string | null;
  completedAssignments: number;
  totalAssignments: number;
  averageScore: number;
  lastActive: string | null;
  status: 'active' | 'inactive' | 'at-risk';
}

type SortField = 'displayName' | 'className' | 'cefrLevel' | 'averageScore' | 'lastActive' | 'completedAssignments';
type SortDirection = 'asc' | 'desc';

const StudentProgressTable = ({ teacherId, onStudentSelect }: StudentProgressTableProps) => {
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('displayName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['teacher-students-progress', teacherId],
    queryFn: async (): Promise<{ students: StudentProgress[]; classes: { id: string; name: string }[] }> => {
      if (!teacherId) return { students: [], classes: [] };

      // Get classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .eq('teacher_id', teacherId);

      if (!classes?.length) return { students: [], classes: [] };

      const classIds = classes.map(c => c.id);
      const classMap = new Map(classes.map(c => [c.id, c.name]));

      // Get enrollments
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('student_id, class_id')
        .in('class_id', classIds);

      if (!enrollments?.length) return { students: [], classes };

      const studentIds = [...new Set(enrollments.map(e => e.student_id).filter(Boolean))] as string[];

      // Get profiles separately (no FK relationship exists)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', studentIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);


      // Get assignments for classes
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, class_id')
        .in('class_id', classIds);

      const assignmentsByClass = new Map<string, string[]>();
      assignments?.forEach(a => {
        const existing = assignmentsByClass.get(a.class_id!) || [];
        assignmentsByClass.set(a.class_id!, [...existing, a.id]);
      });

      // Get submissions
      const assignmentIds = assignments?.map(a => a.id) || [];
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('student_id, assignment_id, ai_score, status')
        .in('student_id', studentIds)
        .in('assignment_id', assignmentIds);

      // Get learning profiles for CEFR levels
      const { data: learningProfiles } = await supabase
        .from('student_learning_profiles')
        .select('student_id, estimated_cefr_level')
        .in('student_id', studentIds);

      const cefrMap = new Map(learningProfiles?.map(p => [p.student_id, p.estimated_cefr_level]) || []);

      // Get metrics for last activity
      const { data: metrics } = await supabase
        .from('student_metrics')
        .select('student_id, last_activity')
        .in('student_id', studentIds);

      const activityMap = new Map(metrics?.map(m => [m.student_id, m.last_activity]) || []);

      // Build student progress list
      const studentProgress: StudentProgress[] = [];
      const seenStudents = new Set<string>();

      enrollments.forEach(enrollment => {
        const studentId = enrollment.student_id as string;
        const classId = enrollment.class_id;
        
        if (!studentId || !classId || seenStudents.has(`${studentId}-${classId}`)) return;
        seenStudents.add(`${studentId}-${classId}`);

        const displayName = profileMap.get(studentId);
        const classAssignmentIds = assignmentsByClass.get(classId) || [];
        const studentSubmissions = submissions?.filter(s => 
          s.student_id === studentId && classAssignmentIds.includes(s.assignment_id!)
        ) || [];
        
        const completedSubmissions = studentSubmissions.filter(s => s.status === 'completed');
        const avgScore = completedSubmissions.length > 0
          ? completedSubmissions.reduce((sum, s) => sum + (s.ai_score || 0), 0) / completedSubmissions.length
          : 0;

        const lastActive = activityMap.get(studentId);
        const daysSinceActive = lastActive 
          ? differenceInDays(new Date(), new Date(lastActive))
          : 999;

        let status: 'active' | 'inactive' | 'at-risk' = 'active';
        if (daysSinceActive > 14) status = 'inactive';
        else if (daysSinceActive > 7) status = 'at-risk';

        studentProgress.push({
          id: studentId,
          displayName: displayName || t("unknownStudent"),
          className: classMap.get(classId) || t("unknownClass"),
          classId,
          cefrLevel: cefrMap.get(studentId) || null,
          completedAssignments: completedSubmissions.length,
          totalAssignments: classAssignmentIds.length,
          averageScore: Math.round(avgScore),
          lastActive,
          status
        });
      });

      return { students: studentProgress, classes };
    },
    enabled: !!teacherId,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedStudents = useMemo(() => {
    let result = studentsData?.students || [];

    // Apply filters
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.displayName.toLowerCase().includes(query) ||
        s.className.toLowerCase().includes(query)
      );
    }

    if (classFilter !== 'all') {
      result = result.filter(s => s.classId === classFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'displayName':
          comparison = a.displayName.localeCompare(b.displayName);
          break;
        case 'className':
          comparison = a.className.localeCompare(b.className);
          break;
        case 'cefrLevel':
          comparison = (a.cefrLevel || 'Z').localeCompare(b.cefrLevel || 'Z');
          break;
        case 'averageScore':
          comparison = a.averageScore - b.averageScore;
          break;
        case 'completedAssignments':
          comparison = a.completedAssignments - b.completedAssignments;
          break;
        case 'lastActive':
          comparison = new Date(a.lastActive || 0).getTime() - new Date(b.lastActive || 0).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [studentsData?.students, searchQuery, classFilter, statusFilter, sortField, sortDirection]);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-emerald-500"><CheckCircle className="h-3 w-3 mr-1" />{t("active")}</Badge>;
      case 'at-risk':
        return <Badge variant="secondary" className="bg-amber-500 text-white"><AlertCircle className="h-3 w-3 mr-1" />{t("atRisk")}</Badge>;
      case 'inactive':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />{t("inactive")}</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("studentProgress")}</span>
            <Badge variant="outline">{filteredAndSortedStudents.length} {t("students")}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters - Responsive */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchStudents")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t("filterByClass")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allClasses")}</SelectItem>
                  {studentsData?.classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder={t("filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatus")}</SelectItem>
                  <SelectItem value="active">{t("active")}</SelectItem>
                  <SelectItem value="at-risk">{t("atRisk")}</SelectItem>
                  <SelectItem value="inactive">{t("inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table - Horizontal scroll on mobile */}
          <div className="rounded-md border overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="displayName">{t("name")}</SortableHeader>
                    <SortableHeader field="className">{t("class")}</SortableHeader>
                    <SortableHeader field="cefrLevel">{t("level")}</SortableHeader>
                    <SortableHeader field="completedAssignments">{t("assignments")}</SortableHeader>
                    <SortableHeader field="averageScore">{t("avgScore")}</SortableHeader>
                    <SortableHeader field="lastActive">{t("lastActive")}</SortableHeader>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {t("noStudentsFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedStudents.map(student => (
                      <TableRow key={`${student.id}-${student.classId}`} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{student.displayName}</TableCell>
                        <TableCell>{student.className}</TableCell>
                        <TableCell>
                          {student.cefrLevel ? (
                            <Badge variant="outline">{student.cefrLevel}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.completedAssignments}/{student.totalAssignments}
                        </TableCell>
                        <TableCell>
                          <span className={student.averageScore >= 70 ? 'text-emerald-500' : student.averageScore >= 50 ? 'text-amber-500' : 'text-destructive'}>
                            {student.averageScore}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {student.lastActive ? (
                            format(new Date(student.lastActive), 'MMM d, yyyy')
                          ) : (
                            <span className="text-muted-foreground">{t("never")}</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onStudentSelect(student.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StudentProgressTable;
