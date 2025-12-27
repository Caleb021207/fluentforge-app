import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  CheckCircle,
  Loader2 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ChatContainer from "@/components/practice/ChatContainer";
import { useChatMessages } from "@/components/practice/hooks/useChatMessages";

interface ChallengeState {
  submissionId: string;
  assignment: {
    id: string;
    title: string;
    topic_prompt: string;
    cefr_level: string;
    min_messages: number;
    max_duration_minutes: number;
    assignment_mode: string;
    points_possible: number;
  };
}

const ChallengeMode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = location.state as ChallengeState | null;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [startTime] = useState<Date>(new Date());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Use the existing chat messages hook with the assignment's CEFR level
  const {
    messages,
    input,
    setInput,
    handleSubmit: handleChatSubmit,
    isLoading,
    getPlaceholderText,
  } = useChatMessages(state?.assignment.cefr_level?.toLowerCase() || 'intermediate');

  // Redirect if no assignment state
  useEffect(() => {
    if (!state) {
      navigate('/profile');
      toast({
        title: "No Assignment",
        description: "Please start an assignment from your profile",
        variant: "destructive",
      });
    } else {
      setTimeRemaining(state.assignment.max_duration_minutes * 60);
    }
  }, [state, navigate, toast]);

  // Timer countdown
  useEffect(() => {
    if (!state || timeRemaining <= 0) return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  // Prevent navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an assignment in progress. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleTimeUp = () => {
    toast({
      title: "Time's Up!",
      description: "Your conversation is being submitted automatically",
    });
    handleAssignmentSubmit();
  };

  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const progress = Math.min((userMessageCount / (state?.assignment.min_messages || 10)) * 100, 100);
  const canSubmit = userMessageCount >= (state?.assignment.min_messages || 10);

  const handleAssignmentSubmit = async () => {
    if (!state || isSubmitting) return;
    
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const durationSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      // Update submission with transcript
      const transcriptJson = JSON.parse(JSON.stringify(messages));
      await supabase
        .from('assignment_submissions')
        .update({
          transcript: transcriptJson,
          message_count: userMessageCount,
          duration_seconds: durationSeconds,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', state.submissionId);

      // Call grading function
      const { data: gradeResult, error: gradeError } = await supabase.functions.invoke('grade-assignment', {
        body: {
          submissionId: state.submissionId,
          assignmentId: state.assignment.id
        }
      });

      if (gradeError) {
        console.error('Grading error:', gradeError);
      }

      toast({
        title: "Assignment Submitted!",
        description: gradeResult?.score 
          ? `You scored ${Math.round(gradeResult.score)}% and earned ${gradeResult.xpAwarded} XP!`
          : "Your assignment has been submitted for grading",
      });

      navigate('/profile', { replace: true });
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!state) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header with progress */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-primary/20 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Challenge Mode
              </Badge>
              <span className="font-semibold">{state.assignment.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 ${timeRemaining < 60 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowExitDialog(true)}
              >
                Exit
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Messages: {userMessageCount}/{state.assignment.min_messages}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <Button 
              size="sm"
              onClick={handleAssignmentSubmit}
              disabled={!canSubmit || isSubmitting}
              className={canSubmit ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Assignment prompt */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Card className="bg-primary/5 border-primary/20 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Your Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{state.assignment.topic_prompt}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{state.assignment.cefr_level}</Badge>
              <Badge variant="outline">{state.assignment.points_possible} pts</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Chat interface */}
        <div className="h-[60vh]">
          <ChatContainer
            messages={messages}
            input={input}
            setInput={setInput}
            handleSubmit={handleChatSubmit}
            isLoading={isLoading}
            getPlaceholderText={getPlaceholderText}
            bilingualMode={false}
          />
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Leave Assignment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be lost if you exit now. You have sent {userMessageCount} messages
              {userMessageCount < state.assignment.min_messages && 
                ` (need ${state.assignment.min_messages - userMessageCount} more to submit)`
              }.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Assignment</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => navigate('/profile', { replace: true })}
            >
              Exit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChallengeMode;
