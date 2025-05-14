
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DownloadIcon, SearchIcon, RefreshCw, BarChart, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import LanguageMetricsChart from '@/components/classroom/LanguageMetricsChart';

interface Student {
  id: string;
  name: string;
  email: string;
  avgGrammarAccuracy: number;
  avgConversationComplexity: number;
  metricsCount: number;
  lastActivity: string | null;
}

interface MetricsData {
  date: string;
  grammarAccuracy: number;
  conversationComplexity: number;
  timestamp: string;
}

const TeacherMetricsDashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classroomId, setClassroomId] = useState<string>('');
  const [classrooms, setClassrooms] = useState<{id: string; name: string}[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentMetrics, setStudentMetrics] = useState<MetricsData[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();
  const { t } = useLocalization();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (classroomId) {
      fetchStudentsForClassroom(classroomId);
    }
  }, [classroomId]);

  useEffect(() => {
    // Apply search filtering
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(lowerSearchTerm) || 
        student.email.toLowerCase().includes(lowerSearchTerm)
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchClassrooms = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get classrooms where user is a teacher
      const { data, error } = await supabase
        .from('classroom_codes')
        .select('id, class_name')
        .eq('teacher_id', user.id)
        .eq('active', true);

      if (error) throw error;

      // Map the data to match the expected format
      const formattedClassrooms = (data || []).map(classroom => ({
        id: classroom.id,
        name: classroom.class_name
      }));

      setClassrooms(formattedClassrooms);
      
      // If there are classrooms, select the first one
      if (formattedClassrooms.length > 0) {
        setClassroomId(formattedClassrooms[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching classrooms:", err);
      toast({
        title: t("error"),
        description: t("failedToLoadClassrooms"),
        variant: "destructive"
      });
    }
  };

  const fetchStudentsForClassroom = async (classId: string) => {
    try {
      setIsLoadingStudents(true);
      
      // Get students in this classroom
      const { data: memberships, error: membershipError } = await supabase
        .from('classroom_memberships')
        .select('student_id')
        .eq('classroom_id', classId);

      if (membershipError) throw membershipError;
      
      if (!memberships || memberships.length === 0) {
        setStudents([]);
        setIsLoadingStudents(false);
        return;
      }
      
      // Get student metrics
      const studentIds = memberships.map(m => m.student_id);
      
      const { data: metrics, error: metricsError } = await supabase
        .from('student_metrics')
        .select('student_id, student_name, student_email, avg_grammar_accuracy, avg_conversation_complexity, language_metrics_count, last_activity')
        .eq('classroom_id', classId)
        .in('student_id', studentIds);

      if (metricsError) throw metricsError;

      const formattedStudents: Student[] = (metrics || []).map(m => ({
        id: m.student_id,
        name: m.student_name || 'Unnamed Student',
        email: m.student_email || '',
        avgGrammarAccuracy: m.avg_grammar_accuracy || 0,
        avgConversationComplexity: m.avg_conversation_complexity || 0,
        metricsCount: m.language_metrics_count || 0,
        lastActivity: m.last_activity
      }));

      setStudents(formattedStudents);
      setSelectedStudent(null);
      setSortField('name');
      setSortDirection('asc');
    } catch (err: any) {
      console.error("Error fetching students:", err);
      toast({
        title: t("error"),
        description: t("failedToLoadStudents"),
        variant: "destructive"
      });
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchStudentMetrics = async (studentId: string) => {
    try {
      setIsLoadingMetrics(true);
      
      const { data, error } = await supabase
        .from('student_language_metrics')
        .select('grammar_accuracy, conversation_complexity, created_at')
        .eq('user_id', studentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedData = (data || []).map(item => {
        const date = new Date(item.created_at);
        return {
          date: date.toLocaleDateString(),
          grammarAccuracy: parseFloat(String(item.grammar_accuracy)),
          conversationComplexity: parseFloat(String(item.conversation_complexity)),
          timestamp: item.created_at
        };
      });

      setStudentMetrics(formattedData);
    } catch (err: any) {
      console.error("Error fetching student metrics:", err);
      toast({
        title: t("error"),
        description: t("failedToLoadStudentMetrics"),
        variant: "destructive"
      });
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    fetchStudentMetrics(student.id);
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      
      // Get all student metrics for the classroom
      const { data, error } = await supabase
        .from('student_language_metrics')
        .select(`
          user_id,
          grammar_accuracy,
          conversation_complexity,
          vocabulary_diversity,
          message_count,
          created_at
        `)
        .eq('classroom_id', classroomId);

      if (error) throw error;

      // Get student details for mapping IDs
      const { data: studentData, error: studentError } = await supabase
        .from('student_metrics')
        .select('student_id, student_name, student_email')
        .eq('classroom_id', classroomId);

      if (studentError) throw studentError;

      // Create a lookup map for student details
      const studentLookup = (studentData || []).reduce((acc, student) => {
        acc[student.student_id] = {
          name: student.student_name || 'Unknown',
          email: student.student_email || 'Unknown'
        };
        return acc;
      }, {} as Record<string, {name: string, email: string}>);

      // Format data for CSV
      const csvData = (data || []).map(metric => {
        const student = studentLookup[metric.user_id] || { name: 'Unknown', email: 'Unknown' };
        const date = new Date(metric.created_at).toLocaleDateString();
        
        return {
          'Student Name': student.name,
          'Student Email': student.email,
          'Date': date,
          'Grammar Accuracy': metric.grammar_accuracy,
          'Conversation Complexity': metric.conversation_complexity,
          'Vocabulary Diversity': metric.vocabulary_diversity || 'N/A',
          'Message Count': metric.message_count
        };
      });

      if (csvData.length === 0) {
        toast({
          title: t("noData"),
          description: t("noDataToExport"),
          variant: "default"
        });
        return;
      }

      // Create CSV content
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csvContent = [headers, ...rows].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `classroom-language-metrics-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: t("exportSuccess"),
        description: t("dataExportedSuccessfully"),
        variant: "default"
      });
    } catch (err: any) {
      console.error("Error exporting data:", err);
      toast({
        title: t("error"),
        description: t("failedToExportData"),
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleTriggerAnalysis = async (studentId?: string) => {
    try {
      const target = studentId || (selectedStudent ? selectedStudent.id : null);
      
      if (!target) {
        toast({
          title: t("error"),
          description: t("noStudentSelected"),
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: t("inProgress"),
        description: t("analysingConversationHistory"),
      });
      
      // In a real implementation, this would call the function to analyze the student's conversations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh student data
      if (classroomId) {
        await fetchStudentsForClassroom(classroomId);
      }
      
      // If this was for the selected student, also refresh their metrics
      if (target === (selectedStudent?.id)) {
        await fetchStudentMetrics(target);
      }
      
      toast({
        title: t("success"),
        description: t("analysisComplete"),
      });
    } catch (err: any) {
      console.error("Error triggering analysis:", err);
      toast({
        title: t("error"),
        description: t("failedToAnalyzeConversations"),
        variant: "destructive"
      });
    }
  };

  // Sort students
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    // Apply sorting
    const sortedStudents = [...filteredStudents].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'grammar':
          comparison = a.avgGrammarAccuracy - b.avgGrammarAccuracy;
          break;
        case 'complexity':
          comparison = a.avgConversationComplexity - b.avgConversationComplexity;
          break;
        case 'count':
          comparison = a.metricsCount - b.metricsCount;
          break;
        case 'activity':
          const dateA = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
          const dateB = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
          comparison = dateA - dateB;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredStudents(sortedStudents);
  }, [sortField, sortDirection]);

  // Helper function to determine CEFR level based on score
  const getCEFRLevel = (score: number) => {
    if (score < 30) return 'A1';
    if (score < 50) return 'A2';
    if (score < 65) return 'B1';
    if (score < 80) return 'B2';
    if (score < 95) return 'C1';
    return 'C2';
  };

  return (
    <div>
      <Tabs defaultValue="overview">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="overview">{t("classOverview")}</TabsTrigger>
            <TabsTrigger value="student" disabled={!selectedStudent}>{t("studentDetails")}</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row items-center gap-2">
            <Select value={classroomId} onValueChange={setClassroomId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("selectClassroom")} />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map(classroom => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => fetchStudentsForClassroom(classroomId)}
              disabled={isLoadingStudents || !classroomId}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStudents ? 'animate-spin' : ''}`} />
              {t("refresh")}
            </Button>
            
            <Button 
              onClick={handleExportCSV}
              disabled={isExporting || students.length === 0}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              {t("exportData")}
            </Button>
          </div>
        </div>
        
        <TabsContent value="overview" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t("classLanguageMetrics")}</CardTitle>
              <CardDescription>{t("overviewOfStudentLanguageSkills")}</CardDescription>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <div className="relative w-full sm:w-72">
                  <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchStudents")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingStudents ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">
                          <button 
                            onClick={() => handleSort('name')}
                            className="flex items-center hover:text-foreground/80"
                          >
                            {t("name")}
                            {sortField === 'name' && (
                              sortDirection === 'asc' 
                                ? <ChevronUp className="h-4 w-4 ml-1" /> 
                                : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </button>
                        </th>
                        <th className="text-left p-3 font-medium">
                          <button 
                            onClick={() => handleSort('grammar')}
                            className="flex items-center hover:text-foreground/80"
                          >
                            {t("grammarAccuracy")}
                            {sortField === 'grammar' && (
                              sortDirection === 'asc' 
                                ? <ChevronUp className="h-4 w-4 ml-1" /> 
                                : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </button>
                        </th>
                        <th className="text-left p-3 font-medium">
                          <button 
                            onClick={() => handleSort('complexity')}
                            className="flex items-center hover:text-foreground/80"
                          >
                            {t("complexity")}
                            {sortField === 'complexity' && (
                              sortDirection === 'asc' 
                                ? <ChevronUp className="h-4 w-4 ml-1" /> 
                                : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </button>
                        </th>
                        <th className="text-left p-3 font-medium">
                          <button 
                            onClick={() => handleSort('count')}
                            className="flex items-center hover:text-foreground/80"
                          >
                            {t("metricsCount")}
                            {sortField === 'count' && (
                              sortDirection === 'asc' 
                                ? <ChevronUp className="h-4 w-4 ml-1" /> 
                                : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </button>
                        </th>
                        <th className="text-left p-3 font-medium">
                          <button 
                            onClick={() => handleSort('activity')}
                            className="flex items-center hover:text-foreground/80"
                          >
                            {t("lastActivity")}
                            {sortField === 'activity' && (
                              sortDirection === 'asc' 
                                ? <ChevronUp className="h-4 w-4 ml-1" /> 
                                : <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </button>
                        </th>
                        <th className="text-right p-3 font-medium">{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(student => (
                        <tr key={student.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <span>{Math.round(student.avgGrammarAccuracy)}%</span>
                              <Badge className="ml-2" variant="outline">
                                {getCEFRLevel(student.avgGrammarAccuracy)}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <span>{Math.round(student.avgConversationComplexity)}%</span>
                              <Badge className="ml-2" variant="outline">
                                {getCEFRLevel(student.avgConversationComplexity)}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3">{student.metricsCount}</td>
                          <td className="p-3">
                            {student.lastActivity 
                              ? new Date(student.lastActivity).toLocaleDateString() 
                              : t("never")}
                          </td>
                          <td className="p-3 text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSelectStudent(student)}
                            >
                              {t("viewDetails")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-8">
                  <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    {classrooms.length === 0 
                      ? t("noClassroomsFound") 
                      : t("noStudentsFound")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {classrooms.length === 0 
                      ? t("createClassroomFirst") 
                      : searchTerm 
                        ? t("noStudentsMatchingSearch")
                        : t("addStudentsToClass")}
                  </p>
                </div>
              )}
            </CardContent>
            {filteredStudents.length > 0 && (
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  {t("showingStudentsCount", { count: filteredStudents.length.toString() })}
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="student" className="mt-0">
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-muted-foreground">{selectedStudent.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleTriggerAnalysis(selectedStudent.id)}
                  >
                    {t("analyzeConversations")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedStudent(null)}
                  >
                    {t("backToOverview")}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("grammarAccuracy")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Math.round(selectedStudent.avgGrammarAccuracy)}%
                    </div>
                    <Badge className="mt-2">
                      {getCEFRLevel(selectedStudent.avgGrammarAccuracy)}
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t("conversationComplexity")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Math.round(selectedStudent.avgConversationComplexity)}%
                    </div>
                    <Badge className="mt-2">
                      {getCEFRLevel(selectedStudent.avgConversationComplexity)}
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t("metricsAnalyzed")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {selectedStudent.metricsCount}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {selectedStudent.lastActivity 
                        ? t("lastUpdated") + ': ' + new Date(selectedStudent.lastActivity).toLocaleDateString() 
                        : t("noMetricsYet")}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {isLoadingMetrics ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : studentMetrics.length > 0 ? (
                <LanguageMetricsChart 
                  data={studentMetrics} 
                  title={t("studentProgressOverTime")}
                />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">{t("noDetailedMetricsYet")}</h3>
                    <p className="text-muted-foreground mb-6">{t("analyzeConversationsToGenerateMetrics")}</p>
                    <Button 
                      onClick={() => handleTriggerAnalysis(selectedStudent.id)}
                    >
                      {t("analyzeConversations")}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherMetricsDashboard;
