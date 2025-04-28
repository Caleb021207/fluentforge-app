
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useClassroomText } from "@/hooks/useClassroomText";

const JoinClassForm = () => {
  const { toast } = useToast();
  const classroomText = useClassroomText();
  const [classCode, setClassCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = classCode.trim();
    
    if (!trimmedCode) {
      toast({
        title: "Error",
        description: "Please enter a class code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    console.log('Attempting to join class with code:', trimmedCode);

    try {
      // Check authentication status first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No authenticated session found');
        toast({
          title: "Error",
          description: "Please sign in to join a class",
          variant: "destructive",
        });
        return;
      }

      console.log('User authenticated:', session.user.id);

      const { data, error } = await supabase.rpc('join_classroom', {
        class_code: trimmedCode
      });

      console.log('Join classroom response:', { data, error });

      if (error) {
        console.error('Error joining classroom:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to join class",
          variant: "destructive",
        });
        return;
      }

      if (data && data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        
        setClassCode('');
        console.log('Successfully joined classroom:', data.class_name);
        
        // Reload after a short delay to show the success message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error('Join classroom failed:', data);
        toast({
          title: "Error",
          description: data?.message || "Failed to join class",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Unexpected error joining classroom:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !classCode.trim()}>
        {isLoading ? classroomText.JOINING : classroomText.JOIN_CLASS}
      </Button>
    </form>
  );
};

export default JoinClassForm;
