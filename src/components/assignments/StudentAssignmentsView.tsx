import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentAssignments, AssignmentWithSubmission } from '@/hooks/useStudentAssignments';
import StudentAssignmentCard from './StudentAssignmentCard';
import { useToast } from "@/hooks/use-toast";
import AnimatedLoader from "@/components/ui/animated-loader";
import { ClipboardList, CheckCircle, Clock } from "lucide-react";

const StudentAssignmentsView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    assignments, 
    isLoading, 
    startAssignment 
  } = useStudentAssignments();

  const handleStart = async (submissionId: string, assignment: AssignmentWithSubmission) => {
    try {
      await startAssignment(submissionId);
      
      // Navigate to challenge mode with assignment context
      navigate('/challenge-mode', { 
        state: { 
          submissionId,
          assignment: {
            id: assignment.id,
            title: assignment.title,
            topic_prompt: assignment.topic_prompt,
            cefr_level: assignment.cefr_level,
            min_messages: assignment.min_messages,
            max_duration_minutes: assignment.max_duration_minutes,
            assignment_mode: assignment.assignment_mode,
            points_possible: assignment.points_possible
          }
        } 
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <AnimatedLoader size="md" message="Loading assignments..." />
      </div>
    );
  }

  // Only show assignments where student has a submission (was assigned)
  const assignedAssignments = assignments.filter(a => a.submission);
  
  const pendingAssignments = assignedAssignments.filter(a => 
    a.submission!.status === 'pending' || a.submission!.status === 'in_progress'
  );
  
  const completedAssignments = assignedAssignments.filter(a => 
    a.submission!.status === 'completed' || a.submission!.status === 'graded'
  );

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          My Assignments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assignedAssignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No assignments yet</p>
            <p className="text-sm">Your teacher will assign conversation challenges here</p>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                To Do ({pendingAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed ({completedAssignments.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              {pendingAssignments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  All caught up! No pending assignments.
                </p>
              ) : (
                pendingAssignments.map(assignment => (
                  <StudentAssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onStart={handleStart}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedAssignments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No completed assignments yet.
                </p>
              ) : (
                completedAssignments.map(assignment => (
                  <StudentAssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onStart={handleStart}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentAssignmentsView;