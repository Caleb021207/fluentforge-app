
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface GenerateCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClassroomResponse {
  success: boolean;
  message: string;
  classroom_id?: string;
  class_code?: string;
  class_name?: string;
}

const GenerateCodeDialog = ({ open, onOpenChange }: GenerateCodeDialogProps) => {
  const { toast } = useToast();
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('create_classroom', {
        class_name: className
      });

      if (error) throw error;

      // Type assertion to ensure data is treated as ClassroomResponse
      const response = data as unknown as ClassroomResponse;

      toast({
        title: CLASSROOM_TEXT.SUCCESS,
        description: response.message,
      });
      
      onOpenChange(false);
      setClassName('');
    } catch (error: any) {
      toast({
        title: CLASSROOM_TEXT.ERROR,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{CLASSROOM_TEXT.CREATE_CLASS}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder={CLASSROOM_TEXT.CLASS_NAME}
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? CLASSROOM_TEXT.CREATING_CLASS : CLASSROOM_TEXT.CREATE_CLASS}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateCodeDialog;
