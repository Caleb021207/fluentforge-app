
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { Loader2, ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Type for a student and their metrics
interface Student {
  id: string;
  name: string;
  email?: string;
  selected: boolean;
  color: string;
}

// Individual metric data point
interface MetricDataPoint {
  studentId: string;
  date: string;
  timestamp: string; // Original timestamp for sorting
  grammarAccuracy: number;
  conversationComplexity: number;
}

// Props for the component
interface StudentLanguageProgressChartProps {
  classroomId: string;
}

// Colors for the chart lines (tailwind colors)
const lineColors = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#10b981", // emerald-500
  "#f97316", // orange-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#f59e0b", // amber-500
  "#6366f1", // indigo-500
  "#84cc16"  // lime-500
];

const StudentLanguageProgressChart: React.FC<StudentLanguageProgressChartProps> = ({ classroomId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [metrics, setMetrics] = useState<MetricDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComplexity, setShowComplexity] = useState(true);
  const [showGrammar, setShowGrammar] = useState(true);
  const [expandedControls, setExpandedControls] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();

  // Fetch students in this classroom
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Get classroom members
        const { data: memberships, error: membershipError } = await supabase
          .from('classroom_memberships')
          .select('student_id')
          .eq('classroom_id', classroomId);

        if (membershipError) throw membershipError;
        if (!memberships || memberships.length === 0) {
          setStudents([]);
          setIsLoading(false);
          return;
        }

        // Get student profile information
        const studentIds = memberships.map(m => m.student_id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', studentIds);

        if (profileError) throw profileError;

        // Map profiles to our student structure with colors
        const studentData: Student[] = (profiles || []).map((profile, idx) => ({
          id: profile.id,
          name: profile.display_name || `Student ${idx + 1}`,
          email: profile.email,
          selected: idx < 5, // Only select first 5 by default to avoid visual clutter
          color: lineColors[idx % lineColors.length]
        }));

        setStudents(studentData);
        
        // After setting students, fetch the metrics for these students
        await fetchMetrics(studentIds);
      } catch (err: any) {
        console.error("Error fetching students:", err);
        setError(err.message);
        toast({
          title: t("error"),
          description: t("failedToLoadStudents"),
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (classroomId) {
      fetchStudents();
    }
  }, [classroomId, toast, t]);

  // Function to fetch metrics for the students
  const fetchMetrics = async (studentIds: string[]) => {
    try {
      setIsLoading(true);
      
      // Get metrics for these students
      const { data, error } = await supabase
        .from('student_language_metrics')
        .select('user_id, grammar_accuracy, conversation_complexity, created_at')
        .in('user_id', studentIds)
        .eq('classroom_id', classroomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Format the data for our chart
      const formattedData: MetricDataPoint[] = (data || []).map(item => ({
        studentId: item.user_id,
        date: format(new Date(item.created_at), 'MM/dd'),
        timestamp: item.created_at,
        grammarAccuracy: parseFloat(String(item.grammar_accuracy)),
        conversationComplexity: parseFloat(String(item.conversation_complexity))
      }));

      setMetrics(formattedData);
    } catch (err: any) {
      console.error("Error fetching metrics:", err);
      setError(err.message);
      toast({
        title: t("error"),
        description: t("failedToLoadMetrics"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle student selection
  const toggleStudent = (studentId: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, selected: !student.selected } 
          : student
      )
    );
  };

  // Filter chart data based on selected students
  const filteredData = useMemo(() => {
    const selectedStudentIds = students
      .filter(s => s.selected)
      .map(s => s.id);
      
    return metrics.filter(m => selectedStudentIds.includes(m.studentId));
  }, [students, metrics]);

  // Get student name by ID
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : "Unknown";
  };

  // Get student color by ID
  const getStudentColor = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.color : "#000000";
  };

  if (isLoading && students.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{t("studentLanguageProgress") || "Student Language Progress"}</CardTitle>
        <CardDescription>
          {t("trackStudentProgressDescription") || "Track the language skill progression of your students over time"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Chart Controls */}
        <div className="mb-4">
          <button 
            onClick={() => setExpandedControls(!expandedControls)}
            className="flex items-center text-sm mb-2 text-muted-foreground hover:text-foreground"
          >
            {expandedControls ? (
              <>
                <ArrowUp className="h-4 w-4 mr-1" />
                {t("hideControls") || "Hide Controls"}
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 mr-1" />
                {t("showControls") || "Show Controls"}
              </>
            )}
          </button>
          
          {expandedControls && (
            <div className="p-4 border rounded-md bg-muted/20">
              <div className="mb-4">
                <h4 className="font-medium mb-2">{t("metrics") || "Metrics"}</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-grammar" 
                      checked={showGrammar}
                      onCheckedChange={() => setShowGrammar(!showGrammar)}
                    />
                    <Label htmlFor="show-grammar">{t("grammarAccuracy") || "Grammar Accuracy"}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-complexity" 
                      checked={showComplexity}
                      onCheckedChange={() => setShowComplexity(!showComplexity)}
                    />
                    <Label htmlFor="show-complexity">{t("conversationComplexity") || "Conversation Complexity"}</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">{t("students") || "Students"}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`student-${student.id}`} 
                        checked={student.selected}
                        onCheckedChange={() => toggleStudent(student.id)}
                      />
                      <Label 
                        htmlFor={`student-${student.id}`}
                        className="flex items-center"
                      >
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: student.color }}
                        />
                        {student.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Chart */}
        <div className="h-[400px]">
          {students.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">
                {t("noStudentsInClass") || "No students in this class yet"}
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">
                {t("noLanguageDataAvailable") || "No language data available for the selected students"}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[0, 100]}
                  tickCount={6}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: 'Score',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                    dx: -10
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => {
                    // Extract student ID from payload
                    const studentId = props.payload.studentId;
                    const studentName = getStudentName(studentId);
                    
                    // Format the name to include the student
                    const formattedName = `${name} (${studentName})`;
                    return [`${value.toFixed(1)}`, formattedName];
                  }}
                />
                <Legend />
                
                {/* Render lines for each student with Grammar Accuracy */}
                {showGrammar && students.filter(s => s.selected).map(student => (
                  <Line
                    key={`grammar-${student.id}`}
                    type="monotone"
                    dataKey="grammarAccuracy"
                    name="Grammar"
                    stroke={student.color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    // Only display data points for this student
                    data={metrics.filter(m => m.studentId === student.id)}
                  />
                ))}
                
                {/* Render lines for each student with Conversation Complexity */}
                {showComplexity && students.filter(s => s.selected).map(student => (
                  <Line
                    key={`complexity-${student.id}`}
                    type="monotone"
                    dataKey="conversationComplexity"
                    name="Complexity"
                    stroke={student.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    // Only display data points for this student
                    data={metrics.filter(m => m.studentId === student.id)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentLanguageProgressChart;
