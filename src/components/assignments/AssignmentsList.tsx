import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Mic, 
  Clock, 
  Users, 
  Trash2, 
  Calendar 
} from "lucide-react";
import { format } from 'date-fns';
import { TeacherAssignment, StudentSubmission } from '@/hooks/useTeacherAssignments';

interface AssignmentsListProps {
  assignments: TeacherAssignment[];
  submissions: StudentSubmission[];
  onDeleteAssignment: (id: string) => void;
}

const AssignmentsList = ({ 
  assignments, 
  submissions, 
  onDeleteAssignment 
}: AssignmentsListProps) => {
  const getSubmissionStats = (assignmentId: string) => {
    const assignmentSubs = submissions.filter(s => s.assignment_id === assignmentId);
    const completed = assignmentSubs.filter(s => s.status === 'completed' || s.status === 'graded').length;
    const inProgress = assignmentSubs.filter(s => s.status === 'in_progress').length;
    const avgScore = assignmentSubs
      .filter(s => s.ai_score !== null)
      .reduce((acc, s, _, arr) => acc + (s.ai_score! / arr.length), 0);
    
    return { total: assignmentSubs.length, completed, inProgress, avgScore };
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No assignments created yet</p>
        <p className="text-sm">Create your first conversation assignment above</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const stats = getSubmissionStats(assignment.id);
        const isVoice = assignment.assignment_mode === 'voice_practice';
        
        return (
          <Card key={assignment.id} className="glass">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isVoice ? (
                      <Mic className="h-4 w-4 text-primary" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-primary" />
                    )}
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <Badge variant="secondary">{assignment.cefr_level}</Badge>
                  </div>
                  {assignment.description && (
                    <p className="text-sm text-muted-foreground">{assignment.description}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDeleteAssignment(assignment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-md p-3 mb-3">
                <p className="text-sm font-medium mb-1">Topic:</p>
                <p className="text-sm text-muted-foreground">{assignment.topic_prompt}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{assignment.min_messages} min messages</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{assignment.max_duration_minutes} min max</span>
                </div>
                {assignment.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {stats.completed} / {stats.total} completed
                    </span>
                  </div>
                  {stats.inProgress > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {stats.inProgress} in progress
                    </Badge>
                  )}
                </div>
                {stats.avgScore > 0 && (
                  <div className="text-sm">
                    Avg: <span className="font-semibold">{Math.round(stats.avgScore)}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AssignmentsList;
