import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Loader2, Users, UserCheck } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAssignment: (data: AssignmentFormData) => Promise<void>;
  classId: string;
}

interface StudentInfo {
  id: string;
  display_name: string | null;
  email: string | null;
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
  assigned_student_ids?: string[];
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const CreateAssignmentDialog = ({ 
  open, 
  onOpenChange, 
  onCreateAssignment,
  classId
}: CreateAssignmentDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loadingStudents, setLoadingStudents] = useState(false);
  
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

  // Fetch students in the class
  useEffect(() => {
    const fetchStudents = async () => {
      if (!classId || !open) return;
      
      setLoadingStudents(true);
      try {
        const { data: enrollments, error } = await supabase
          .from('student_enrollments')
          .select('student_id')
          .eq('class_id', classId)
          .eq('status', 'active');

        if (error) throw error;

        if (enrollments && enrollments.length > 0) {
          const studentIds = enrollments.map(e => e.student_id).filter(Boolean) as string[];
          
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .in('id', studentIds);

          if (profilesError) throw profilesError;

          setStudents(profiles || []);
          // Select all students by default
          setSelectedStudents(new Set(studentIds));
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [classId, open]);

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.id)));
    }
  };

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

    if (selectedStudents.size === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one student",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onCreateAssignment({
        ...formData,
        assigned_student_ids: Array.from(selectedStudents)
      });
      toast({
        title: "Assignment Created",
        description: `Assigned to ${selectedStudents.size} student${selectedStudents.size !== 1 ? 's' : ''}`,
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
      setSelectedStudents(new Set());
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

          {/* Student Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Assign to Students
              </Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={toggleAll}
                className="text-xs"
              >
                {selectedStudents.size === students.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            {loadingStudents ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading students...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No students enrolled in this class
              </div>
            ) : (
              <ScrollArea className="h-[150px] border rounded-md p-2">
                <div className="space-y-2">
                  {students.map(student => (
                    <div 
                      key={student.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleStudent(student.id)}
                    >
                      <Checkbox 
                        checked={selectedStudents.has(student.id)}
                        onCheckedChange={() => toggleStudent(student.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {student.display_name || student.email || 'Unknown Student'}
                        </p>
                        {student.display_name && student.email && (
                          <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              {selectedStudents.size} of {students.length} students selected
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || selectedStudents.size === 0}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              `Create Assignment for ${selectedStudents.size} Student${selectedStudents.size !== 1 ? 's' : ''}`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog;