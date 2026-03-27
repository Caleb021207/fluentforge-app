import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Mic, 
  Users, 
  Trash2, 
  Calendar,
  Eye,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from 'date-fns';
import { TeacherAssignment, StudentSubmission } from '@/hooks/useTeacherAssignments';
import SubmissionTranscriptModal from './SubmissionTranscriptModal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AssignmentsListProps {
  assignments: TeacherAssignment[];
  submissions: StudentSubmission[];
  onDeleteAssignment: (id: string) => void;
  onRefresh?: () => void;
}

const AssignmentsList = ({ 
  assignments, 
  submissions, 
  onDeleteAssignment,
  onRefresh
}: AssignmentsListProps) => {
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [expandedAssignments, setExpandedAssignments] = useState<Set<string>>(new Set());

  const getSubmissionStats = (assignmentId: string) => {
    const assignmentSubs = submissions.filter(s => s.assignment_id === assignmentId);
    // Total is all students assigned (all submissions, regardless of status)
    const total = assignmentSubs.length;
    const completed = assignmentSubs.filter(s => s.status === 'completed' || s.status === 'graded').length;
    const inProgress = assignmentSubs.filter(s => s.status === 'in_progress').length;
    const notStarted = assignmentSubs.filter(s => s.status === 'pending').length;
    const avgScore = assignmentSubs
      .filter(s => s.score !== null)
      .reduce((acc, s, _, arr) => acc + ((s.score ?? 0) / arr.length), 0);
    
    return { total, completed, inProgress, notStarted, avgScore, submissions: assignmentSubs };
  };

  const toggleExpanded = (assignmentId: string) => {
    setExpandedAssignments(prev => {
      const next = new Set(prev);
      if (next.has(assignmentId)) {
        next.delete(assignmentId);
      } else {
        next.add(assignmentId);
      }
      return next;
    });
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
        const isExpanded = expandedAssignments.has(assignment.id);
        
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
                {assignment.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(assignment.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {stats.completed} / {stats.total} completed
                        </span>
                      </div>
                      {stats.notStarted > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {stats.notStarted} not started
                        </Badge>
                      )}
                      {stats.inProgress > 0 && (
                        <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/30 text-yellow-600">
                          {stats.inProgress} in progress
                        </Badge>
                      )}
                    </div>
                    
                    {stats.total > 0 && (
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          View Submissions
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    )}
                  </div>

                  <CollapsibleContent className="mt-3">
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Student Submissions
                      </div>
                      {stats.submissions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No submissions yet</p>
                      ) : (
                        stats.submissions.map((sub) => {
                          const isCompleted = sub.status === 'completed' || sub.score === 100;
                          const hasTeacherGrade = sub.teacher_override_score !== null;
                          
                          return (
                            <div 
                              key={sub.id} 
                              className="flex items-center justify-between bg-background/50 rounded-md px-3 py-2"
                            >
                              <div className="flex items-center gap-3">
                                {/* Completion status */}
                                <Badge 
                                  variant={isCompleted ? 'default' : 'secondary'}
                                  className={`text-xs flex items-center gap-1 ${isCompleted ? 'bg-green-600' : 'bg-orange-500'}`}
                                >
                                  {isCompleted ? (
                                    <>
                                      <CheckCircle className="h-3 w-3" />
                                      Completed
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-3 w-3" />
                                      Incomplete
                                    </>
                                  )}
                                </Badge>
                                {/* Teacher grade if present */}
                                {hasTeacherGrade && (
                                  <Badge variant="outline" className="text-xs">
                                    Grade: {sub.teacher_override_score}%
                                  </Badge>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {sub.message_count || 0} msgs
                                </span>
                                {sub.submitted_at && (
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(sub.submitted_at), 'MMM d, h:mm a')}
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedSubmission(sub)}
                                className="gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                {hasTeacherGrade ? 'View' : 'Grade'}
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <SubmissionTranscriptModal
        submission={selectedSubmission}
        isOpen={selectedSubmission !== null}
        onClose={() => setSelectedSubmission(null)}
        onGradeSaved={() => {
          setSelectedSubmission(null);
          onRefresh?.();
        }}
      />
    </div>
  );
};

export default AssignmentsList;