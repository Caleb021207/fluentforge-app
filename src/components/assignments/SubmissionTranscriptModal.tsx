import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { User, Bot, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import { StudentSubmission } from '@/hooks/useTeacherAssignments';

interface SubmissionTranscriptModalProps {
  submission: StudentSubmission | null;
  studentName?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
}

const SubmissionTranscriptModal = ({
  submission,
  studentName,
  isOpen,
  onClose
}: SubmissionTranscriptModalProps) => {
  if (!submission) return null;

  const transcript = (Array.isArray(submission.transcript) ? submission.transcript : []) as TranscriptMessage[];
  const userMessages = transcript.filter(m => m.role === 'user').length;
  const feedback = submission.ai_feedback as Record<string, unknown> | null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Conversation Transcript
          </DialogTitle>
        </DialogHeader>
        
        {/* Submission info */}
        <div className="flex flex-wrap gap-3 py-3 border-b border-border/50">
          {studentName && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {studentName}
            </Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {userMessages} messages
          </Badge>
          {submission.completed_at && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(submission.completed_at), 'MMM d, yyyy h:mm a')}
            </Badge>
          )}
          {submission.ai_score !== null && (
            <Badge 
              variant={submission.ai_score >= 100 ? "default" : "secondary"}
              className={`flex items-center gap-1 ${submission.ai_score >= 100 ? 'bg-green-600' : ''}`}
            >
              <CheckCircle className="h-3 w-3" />
              {submission.ai_score}%
            </Badge>
          )}
        </div>

        {/* Transcript */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {transcript.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No conversation recorded
              </div>
            ) : (
              transcript.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block px-4 py-2 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.translation && (
                      <p className={`text-xs text-muted-foreground mt-1 px-2 ${
                        message.role === 'user' ? 'text-right' : ''
                      }`}>
                        {message.translation}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Feedback section */}
        {feedback && typeof feedback === 'object' && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium mb-2">Completion Summary</h4>
            <p className="text-sm text-muted-foreground">
              {(feedback as any).summary || 'Assignment completed.'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionTranscriptModal;