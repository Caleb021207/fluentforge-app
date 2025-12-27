import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle,
  Loader2,
  Sparkles,
  ArrowLeft
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
import { useChallengeChat } from "@/components/practice/hooks/useChallengeChat";
import { motion } from "framer-motion";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { InteractiveCard } from "@/components/ui/card";

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
  const [startTime] = useState<Date>(new Date());
  const [restoredMessages, setRestoredMessages] = useState<any[] | null>(null);

  // Use the challenge-specific chat hook with MANDATORY CEFR level from assignment
  const {
    messages,
    setMessages,
    input,
    setInput,
    handleSubmit: handleChatSubmit,
    isLoading,
    getPlaceholderText,
    cefrLevel,
    topicPrompt: assignmentTopicPrompt,
  } = useChallengeChat({
    cefrLevel: state?.assignment.cefr_level || 'B1',
    topicPrompt: state?.assignment.topic_prompt || '',
    submissionId: state?.submissionId,
    initialMessages: restoredMessages
  });

  // Redirect if no assignment state
  useEffect(() => {
    if (!state) {
      navigate('/profile');
      toast({
        title: "No Assignment",
        description: "Please start an assignment from your profile",
        variant: "destructive",
      });
    }
  }, [state, navigate, toast]);

  // Restore progress from database on mount
  useEffect(() => {
    const restoreProgress = async () => {
      if (!state?.submissionId) return;
      
      try {
        const { data: submission } = await supabase
          .from('assignment_submissions')
          .select('transcript, message_count')
          .eq('id', state.submissionId)
          .single();
        
        if (submission?.transcript && Array.isArray(submission.transcript) && submission.transcript.length > 0) {
          console.log('[ChallengeMode] Restoring progress:', submission.message_count, 'messages');
          setRestoredMessages(submission.transcript);
        }
      } catch (error) {
        console.error('[ChallengeMode] Error restoring progress:', error);
      }
    };
    
    restoreProgress();
  }, [state?.submissionId]);

  // Auto-save progress when messages change
  const saveProgress = useCallback(async () => {
    if (!state?.submissionId || messages.length === 0) return;
    
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    
    try {
      await supabase
        .from('assignment_submissions')
        .update({
          transcript: JSON.parse(JSON.stringify(messages)),
          message_count: userMessageCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.submissionId);
    } catch (error) {
      console.error('[ChallengeMode] Error saving progress:', error);
    }
  }, [state?.submissionId, messages]);

  // Debounced save on message changes
  useEffect(() => {
    if (messages.length === 0) return;
    
    const timeoutId = setTimeout(() => {
      saveProgress();
    }, 1000); // Debounce 1 second
    
    return () => clearTimeout(timeoutId);
  }, [messages, saveProgress]);

  // Prevent navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an assignment in progress. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const minMessages = state?.assignment.min_messages || 10;
  const progress = Math.min((userMessageCount / minMessages) * 100, 100);
  const canSubmit = userMessageCount >= minMessages;

  const handleAssignmentSubmit = async () => {
    if (!state || isSubmitting) return;
    
    setIsSubmitting(true);

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

      // Call grading function (now completion-based)
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
        title: "Assignment Completed! 🎉",
        description: gradeResult?.xpAwarded 
          ? `Great work! You earned ${gradeResult.xpAwarded} XP!`
          : "Your assignment has been submitted successfully",
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

  if (!state) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-primary/5 to-accent/10 overflow-hidden">
      {/* Decorative elements */}
      <GradientBlob className="top-10 left-5 opacity-30" />
      <GradientBlob className="bottom-10 right-5 opacity-30" colors="from-palavox-teal to-palavox-accent" />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-4 py-4 border-b border-primary/10 bg-background/80 backdrop-blur-lg"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setShowExitDialog(true)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-bold gradient-text">{state.assignment.title}</h1>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    {state.assignment.cefr_level}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {state.assignment.points_possible} pts
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleAssignmentSubmit}
              disabled={!canSubmit || isSubmitting}
              className={`${canSubmit ? 'bg-green-600 hover:bg-green-700' : ''} shadow-lg`}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Submit
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {userMessageCount} / {minMessages} messages
              </span>
              <span className={`font-medium ${canSubmit ? 'text-green-600' : 'text-muted-foreground'}`}>
                {canSubmit ? '✓ Ready to submit!' : `${minMessages - userMessageCount} more to go`}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </motion.div>

      {/* Main content area */}
      <div className="relative z-10 h-[calc(100vh-140px)] max-w-4xl mx-auto px-4 py-4 flex flex-col">
        {/* Task card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InteractiveCard className="mb-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-lg">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Your Task</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {state.assignment.topic_prompt}
              </p>
            </div>
          </InteractiveCard>
        </motion.div>

        {/* Chat interface */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 min-h-0"
        >
          <InteractiveCard className="h-full glass border-primary/20 shadow-xl overflow-hidden">
            <ChatContainer
              messages={messages}
              input={input}
              setInput={setInput}
              handleSubmit={handleChatSubmit}
              isLoading={isLoading}
              getPlaceholderText={getPlaceholderText}
              bilingualMode={false}
              cefrLevel={cefrLevel}
              assignmentTopic={assignmentTopicPrompt}
            />
          </InteractiveCard>
        </motion.div>
      </div>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="glass border-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Leave Assignment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your progress is saved! You've sent {userMessageCount} messages
              {userMessageCount < minMessages && 
                ` (need ${minMessages - userMessageCount} more to submit)`
              }. You can continue later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Assignment</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/profile', { replace: true })}
            >
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChallengeMode;