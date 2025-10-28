
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CLASSROOM_TEXT } from "@/constants/classroomText";
import { z } from "zod";
import { Copy } from "lucide-react";
import { getCurrentAcademicYear } from "@/utils/academicYearUtils";

// Validation schema for class names
const classNameSchema = z.string()
  .trim()
  .min(3, "Class name must be at least 3 characters")
  .max(100, "Class name must be less than 100 characters");

interface GenerateCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GenerateCodeDialog = ({ open, onOpenChange }: GenerateCodeDialogProps) => {
  const { toast } = useToast();
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = classNameSchema.safeParse(className);
    if (!validation.success) {
      toast({
        title: CLASSROOM_TEXT.ERROR,
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // First create the class in the classes table
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .insert({
          name: className,
          academic_year: getCurrentAcademicYear(),
          class_code: '' // Will be updated with the access code
        })
        .select()
        .single();

      if (classError) throw classError;

      // Generate access code for the class
      const { data: codeData, error: codeError } = await supabase.rpc('generate_access_code', {
        p_code_type: 'class',
        p_target_id: classData.id,
        p_target_name: className
      });

      if (codeError) throw codeError;

      // Update the class with the generated code
      await supabase
        .from('classes')
        .update({ class_code: codeData })
        .eq('id', classData.id);

      setGeneratedCode(codeData as string);

      toast({
        title: CLASSROOM_TEXT.SUCCESS,
        description: `Class "${className}" created successfully!`,
      });
      
      setClassName('');
      
      // Reload after showing the code
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error: any) {
      console.error('Error creating class:', error);
      toast({
        title: CLASSROOM_TEXT.ERROR,
        description: error.message || "Failed to create class",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast({
        title: "Copied!",
        description: "Class code copied to clipboard",
      });
    }
  };

  const handleClose = () => {
    setGeneratedCode(null);
    setClassName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{CLASSROOM_TEXT.CREATE_CLASS}</DialogTitle>
          {generatedCode && (
            <DialogDescription>
              Share this code with your students
            </DialogDescription>
          )}
        </DialogHeader>
        
        {generatedCode ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Class Code:</p>
              <p className="text-2xl font-bold font-mono tracking-wider">{generatedCode}</p>
            </div>
            <Button onClick={handleCopyCode} variant="outline" className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Students can use this code to join your class
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder={CLASSROOM_TEXT.CLASS_NAME}
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !className.trim()}>
              {isLoading ? CLASSROOM_TEXT.CREATING_CLASS : CLASSROOM_TEXT.CREATE_CLASS}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GenerateCodeDialog;
