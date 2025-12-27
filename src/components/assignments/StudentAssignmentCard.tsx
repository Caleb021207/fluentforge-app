import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Mic, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Play,
  Award
} from "lucide-react";
import { format } from 'date-fns';
import { AssignmentWithSubmission } from '@/hooks/useStudentAssignments';

interface StudentAssignmentCardProps {
  assignment: AssignmentWithSubmission;
  onAccept: (assignmentId: string) => void;
  onStart: (submissionId: string, assignment: AssignmentWithSubmission) => void;
}

const StudentAssignmentCard = ({ 
  assignment, 
  onAccept, 
  onStart 
}: StudentAssignmentCardProps) => {
  const isVoice = assignment.assignment_mode === 'voice_practice';
  const submission = assignment.submission;
  
  const getStatusBadge = () => {
    if (!submission) return <Badge variant="secondary">New</Badge>;
    
    switch (submission.status) {
      case 'pending':
        return <Badge variant="outline">Accepted</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Completed</Badge>;
      case 'graded':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Graded</Badge>;
      default:
        return null;
    }
  };

  const isPastDue = assignment.due_date && new Date(assignment.due_date) < new Date();
  const canStart = submission && (submission.status === 'pending' || submission.status === 'in_progress');

  return (
    <Card className="glass hover:shadow-lg transition-shadow">
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
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">{assignment.class_name}</p>
          </div>
          <Badge variant="secondary">{assignment.cefr_level}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {assignment.description && (
          <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
        )}
        
        <div className="bg-muted/50 rounded-md p-3 mb-3">
          <p className="text-sm font-medium mb-1">Your Task:</p>
          <p className="text-sm text-muted-foreground">{assignment.topic_prompt}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>{assignment.min_messages}+ messages</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{assignment.max_duration_minutes} min max</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>{assignment.points_possible} pts</span>
          </div>
          {assignment.due_date && (
            <div className={`flex items-center gap-1 ${isPastDue ? 'text-destructive' : ''}`}>
              <Calendar className="h-3 w-3" />
              <span>Due: {format(new Date(assignment.due_date), 'MMM d, yyyy h:mm a')}</span>
            </div>
          )}
        </div>

        {/* Score display for completed assignments */}
        {submission && (submission.status === 'completed' || submission.status === 'graded') && (
          <div className="bg-primary/10 rounded-md p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">Completed!</span>
              </div>
              {submission.ai_score !== null && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{Math.round(submission.ai_score)}%</p>
                  <p className="text-xs text-muted-foreground">+{submission.xp_awarded} XP</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {!submission && (
            <Button 
              onClick={() => onAccept(assignment.id)} 
              className="flex-1"
              disabled={isPastDue}
            >
              Accept Assignment
            </Button>
          )}
          
          {canStart && (
            <Button 
              onClick={() => onStart(submission.id, assignment)} 
              className="flex-1"
              disabled={isPastDue}
            >
              <Play className="mr-2 h-4 w-4" />
              {submission.status === 'in_progress' ? 'Continue' : 'Start Challenge'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentAssignmentCard;
