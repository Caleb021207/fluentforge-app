import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAssignment: (data: AssignmentFormData) => Promise<void>;
}

export interface AssignmentFormData {
  title: string;
  description?: string;
  topic_prompt: string;
  cefr_level: string;
  min_messages: number;
  max_duration_minutes: number;
  grammar_requirements?: string[];
  due_date?: string;
  points_possible?: number;
  assignment_mode?: string;
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const CreateAssignmentDialog = ({ 
  open, 
  onOpenChange, 
  onCreateAssignment 
}: CreateAssignmentDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    topic_prompt: '',
    cefr_level: 'B1',
    min_messages: 10,
    max_duration_minutes: 15,
    grammar_requirements: [],
    points_possible: 100,
    assignment_mode: 'text_practice'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.topic_prompt.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and topic prompt are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onCreateAssignment(formData);
      toast({
        title: "Assignment Created",
        description: "Students can now see and accept this assignment",
      });
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        topic_prompt: '',
        cefr_level: 'B1',
        min_messages: 10,
        max_duration_minutes: 15,
        grammar_requirements: [],
        points_possible: 100,
        assignment_mode: 'text_practice'
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Conversation Assignment</DialogTitle>
          <DialogDescription>
            Create an AI conversation challenge for your students
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input
              id="title"
              placeholder="e.g., Restaurant Ordering Practice"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic_prompt">Conversation Topic</Label>
            <Textarea
              id="topic_prompt"
              placeholder="Describe the conversation scenario. e.g., 'Practice ordering food at a restaurant. Ask about the menu, request modifications, and handle the bill.'"
              value={formData.topic_prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, topic_prompt: e.target.value }))}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional instructions for students..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cefr_level">Target CEFR Level</Label>
              <Select 
                value={formData.cefr_level} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, cefr_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CEFR_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment_mode">Mode</Label>
              <Select 
                value={formData.assignment_mode} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignment_mode: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text_practice">Text Chat</SelectItem>
                  <SelectItem value="voice_practice">Voice Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_messages">Min. Messages</Label>
              <Input
                id="min_messages"
                type="number"
                min={5}
                max={50}
                value={formData.min_messages}
                onChange={(e) => setFormData(prev => ({ ...prev, min_messages: parseInt(e.target.value) || 10 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_duration">Max Duration (min)</Label>
              <Input
                id="max_duration"
                type="number"
                min={5}
                max={60}
                value={formData.max_duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, max_duration_minutes: parseInt(e.target.value) || 15 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points Possible</Label>
              <Input
                id="points"
                type="number"
                min={10}
                max={1000}
                value={formData.points_possible}
                onChange={(e) => setFormData(prev => ({ ...prev, points_possible: parseInt(e.target.value) || 100 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date (Optional)</Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value || undefined }))}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Assignment'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog;
