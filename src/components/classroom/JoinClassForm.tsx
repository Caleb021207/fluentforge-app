
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useClassroomText } from "@/hooks/useClassroomText";
import { z } from "zod";

// Validation schema for class codes
const classCodeSchema = z.string()
  .trim()
  .min(6, "Class code must be at least 6 characters")
  .max(10, "Class code must be less than 10 characters")
  .regex(/^[A-Z0-9]+$/, "Class code must contain only uppercase letters and numbers");

// Define the interface for the response from process_access_code RPC
interface AccessCodeResponse {
  success: boolean;
  message: string;
  role?: string;
  assignment?: string;
}

const JoinClassForm = () => {
  const { toast } = useToast();
  const classroomText = useClassroomText();
  const [classCode, setClassCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = classCode.trim().toUpperCase();
    
    // Validate input
    const validation = classCodeSchema.safeParse(trimmedCode);
    if (!validation.success) {
      toast({
        title: classroomText.ERROR,
        description: validation.error.errors[0].message,
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
          title: classroomText.ERROR,
          description: "Please sign in to join a class",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('User authenticated:', session.user.id);

      // Log attempt for rate limiting
      await supabase.from('access_code_attempts').insert({
        user_id: session.user.id,
        attempted_code: trimmedCode,
        success: false
      });

      const { data, error } = await supabase.rpc('process_access_code', {
        p_code: trimmedCode
      });

      console.log('Process access code response:', { data, error });

      if (error) {
        console.error('Error processing access code:', error);
        toast({
          title: classroomText.ERROR,
          description: error.message || classroomText.ERROR_JOINING,
          variant: "destructive",
        });
        return;
      }

      // Cast the data to the proper type
      const response = data as unknown as AccessCodeResponse;

      if (response && response.success) {
        // Log successful attempt
        await supabase.from('access_code_attempts').insert({
          user_id: session.user.id,
          attempted_code: trimmedCode,
          success: true
        });

        toast({
          title: classroomText.SUCCESS,
          description: response.message || classroomText.SUCCESS_JOINING,
        });
        
        setClassCode('');
        console.log('Successfully joined class:', response.assignment);
        
        // No need to reload - real-time subscription will update automatically
      } else {
        console.error('Join class failed:', data);
        toast({
          title: classroomText.ERROR,
          description: response?.message || classroomText.ERROR_JOINING,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Unexpected error joining class:', error);
      toast({
        title: classroomText.ERROR,
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
