
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useClassroomText } from "@/hooks/useClassroomText";

interface ClassroomResponse {
  success: boolean;
  message: string;
  classroom_id?: string;
  class_name?: string;
}

const JoinClassForm = () => {
  const { toast } = useToast();
  const classroomText = useClassroomText();
  const [classCode, setClassCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('join_classroom', {
        class_code: classCode.trim()
      });

      if (error) throw error;

      const response = data as unknown as ClassroomResponse;

      toast({
        title: "Success",
        description: response.message,
      });
      
      setClassCode('');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join class",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4 mt-8">
      <h2 className="text-xl font-semibold">{classroomText.JOIN_CLASS}</h2>
      <Input
        placeholder={classroomText.ENTER_CLASS_CODE}
        value={classCode}
        onChange={(e) => setClassCode(e.target.value)}
        required
        className="w-full"
      />
      <Button type="submit" disabled={isLoading || !classCode.trim()}>
        {isLoading ? classroomText.JOINING : classroomText.JOIN_CLASS}
      </Button>
    </form>
  );
};

export default JoinClassForm;
