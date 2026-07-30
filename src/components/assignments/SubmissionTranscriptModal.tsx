import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { User, Bot, Calendar, MessageSquare, CheckCircle, XCircle, Save, Edit } from 'lucide-react';
import { StudentSubmission } from '@/hooks/useTeacherAssignments';
import { isFinished, statusLabel } from '@/utils/assignmentStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubmissionTranscriptModalProps {
  submission: StudentSubmission | null;
  studentName?: string;
  isOpen: boolean;
  onClose: () => void;
  onGradeSaved?: () => void;
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
  onClose,
  onGradeSaved
}: SubmissionTranscriptModalProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [teacherScore, setTeacherScore] = useState<string>('');
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  if (!submission) return null;

  const transcript = (Array.isArray((submission as any).messages) ? (submission as any).messages : []) as TranscriptMessage[];
  const userMessages = transcript.filter(m => m.role === 'user').length;
  // Automated completion feedback lives in ai_feedback (written by the
  // grade-assignment edge function); teacher_notes is the teacher's own text.
  const aiFeedback = submission.ai_feedback ?? null;

  const finished = isFinished(submission.status);
  const hasTeacherGrade = submission.teacher_override_score !== null;

  const handleStartEditing = () => {
    setTeacherScore(submission.teacher_override_score?.toString() || '');
    setTeacherNotes(submission.teacher_notes || '');
    setIsEditing(true);
  };

  const handleSaveGrade = async () => {
    setIsSaving(true);
    try {
      const scoreValue = teacherScore.trim() ? parseFloat(teacherScore) : null;
      
      if (scoreValue !== null && (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100)) {
        toast({
          title: "Invalid Score",
          description: "Score must be between 0 and 100",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          teacher_override_score: scoreValue,
          teacher_notes: teacherNotes.trim() || null,
          status: 'graded'
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast({
        title: "Grade Saved",
        description: "Teacher grade has been saved successfully"
      });
      
      setIsEditing(false);
      onGradeSaved?.();
    } catch (error: any) {
      console.error('Error saving grade:', error);
      toast({
        title: "Error",
        description: "Failed to save grade",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

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
          {submission.submitted_at && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(submission.submitted_at), 'MMM d, yyyy h:mm a')}
            </Badge>
          )}
          {/* Completion status badge */}
          <Badge
            variant={finished ? "default" : "secondary"}
            className={`flex items-center gap-1 ${finished ? 'bg-green-600' : 'bg-orange-500'}`}
          >
            {finished ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {statusLabel(submission.status)}
          </Badge>
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

        {/* Teacher grading section */}
        <div className="pt-4 border-t border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Teacher Grade</h4>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={handleStartEditing} className="gap-1">
                <Edit className="h-3 w-3" />
                {hasTeacherGrade ? 'Edit Grade' : 'Add Grade'}
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3 bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium w-16">Score:</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={teacherScore}
                  onChange={(e) => setTeacherScore(e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Notes:</label>
                <Textarea
                  placeholder="Add feedback for the student..."
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveGrade} disabled={isSaving} className="gap-1">
                  <Save className="h-3 w-3" />
                  {isSaving ? 'Saving...' : 'Save Grade'}
                </Button>
              </div>
            </div>
          ) : hasTeacherGrade ? (
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Score:</span>
                <Badge className="bg-primary">{submission.teacher_override_score}%</Badge>
              </div>
              {submission.teacher_notes && (
                <p className="text-sm text-muted-foreground">{submission.teacher_notes}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No teacher grade assigned yet.</p>
          )}
        </div>

        {/* Automated completion summary from the grading function */}
        {aiFeedback?.summary && (
          <div className="pt-3 border-t border-border/50">
            <h4 className="text-sm font-medium mb-1">Completion Summary</h4>
            <p className="text-sm text-muted-foreground">{aiFeedback.summary}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionTranscriptModal;