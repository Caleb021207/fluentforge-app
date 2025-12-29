import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudentAssignments, AssignmentWithSubmission } from '@/hooks/useStudentAssignments';
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Clock, Target, MessageSquare, Zap, AlertTriangle } from "lucide-react";
import { format } from 'date-fns';

interface AssignmentPopupProps {
  onDismiss?: () => void;
}

const AssignmentPopup = ({ onDismiss }: AssignmentPopupProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assignments, isLoading, startAssignment } = useStudentAssignments();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithSubmission | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Get pending assignments (assigned to student but not completed)
  const pendingAssignments = assignments.filter(a => 
    a.submission && (a.submission.status === 'pending' || a.submission.status === 'in_progress')
  );

  // Auto-open popup when there are pending assignments
  useEffect(() => {
    if (!isLoading && pendingAssignments.length > 0) {
      // Check if we've already shown the popup this session
      const sessionKey = `assignment_popup_shown_${pendingAssignments[0]?.id}`;
      const alreadyShown = sessionStorage.getItem(sessionKey);
      
      if (!alreadyShown) {
        setSelectedAssignment(pendingAssignments[0]);
        setIsOpen(true);
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  }, [isLoading, pendingAssignments]);

  const handleStartAssignment = async () => {
    if (!selectedAssignment?.submission) return;
    
    setIsStarting(true);
    try {
      await startAssignment(selectedAssignment.submission.id);
      
      setIsOpen(false);
      
      // Navigate to challenge mode with assignment context
      navigate('/challenge-mode', { 
        state: { 
          submissionId: selectedAssignment.submission.id,
          assignment: {
            id: selectedAssignment.id,
            title: selectedAssignment.title,
            topic_prompt: selectedAssignment.topic_prompt,
            cefr_level: selectedAssignment.cefr_level,
            min_messages: selectedAssignment.min_messages,
            max_duration_minutes: selectedAssignment.max_duration_minutes,
            assignment_mode: selectedAssignment.assignment_mode,
            points_possible: selectedAssignment.points_possible
          }
        } 
      });
    } catch (error: any) {
      toast({
        title: "Error starting assignment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    onDismiss?.();
  };

  const isPastDue = selectedAssignment?.due_date && new Date(selectedAssignment.due_date) < new Date();
  const isInProgress = selectedAssignment?.submission?.status === 'in_progress';

  if (isLoading || !selectedAssignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background via-primary/5 to-accent/10 border-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
            <ClipboardList className="h-6 w-6" />
            <Badge variant="destructive" className="animate-pulse">
              {pendingAssignments.length} Assignment{pendingAssignments.length > 1 ? 's' : ''} Due
            </Badge>
          </div>
          <DialogTitle className="text-2xl">
            {isInProgress ? 'Continue Your Assignment' : 'New Assignment Available!'}
          </DialogTitle>
          <DialogDescription>
            Your teacher has assigned you a conversation challenge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Assignment Title & Class */}
          <div className="bg-card/50 p-4 rounded-lg border border-border/50">
            <h3 className="font-bold text-lg text-foreground">{selectedAssignment.title}</h3>
            <p className="text-sm text-muted-foreground">{selectedAssignment.class_name}</p>
            {selectedAssignment.description && (
              <p className="mt-2 text-sm text-foreground/80">{selectedAssignment.description}</p>
            )}
          </div>

          {/* Assignment Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>{selectedAssignment.min_messages} messages required</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>{selectedAssignment.max_duration_minutes} min max</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span>Level: {selectedAssignment.cefr_level}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>{selectedAssignment.points_possible} points</span>
            </div>
          </div>

          {/* Due Date */}
          {selectedAssignment.due_date && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${isPastDue ? 'bg-destructive/10 border border-destructive/20' : 'bg-accent/10'}`}>
              {isPastDue && <AlertTriangle className="h-4 w-4 text-destructive" />}
              <span className={`text-sm font-medium ${isPastDue ? 'text-destructive' : ''}`}>
                {isPastDue ? 'Past Due: ' : 'Due: '}
                {format(new Date(selectedAssignment.due_date), 'PPp')}
              </span>
            </div>
          )}

          {/* Topic Preview */}
          {selectedAssignment.topic_prompt && (
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary mb-1">Your Challenge Topic:</p>
              <p className="text-sm text-foreground">{selectedAssignment.topic_prompt}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            Later
          </Button>
          <Button
            onClick={handleStartAssignment}
            disabled={isStarting || isPastDue}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isStarting ? 'Starting...' : isInProgress ? 'Continue Challenge' : 'Start Challenge'}
          </Button>
        </div>

        {pendingAssignments.length > 1 && (
          <p className="text-xs text-center text-muted-foreground">
            +{pendingAssignments.length - 1} more assignment{pendingAssignments.length > 2 ? 's' : ''} waiting
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentPopup;
