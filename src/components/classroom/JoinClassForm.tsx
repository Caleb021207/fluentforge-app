import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useClassroomText } from "@/hooks/useClassroomText";
import { z } from "zod";

// Class codes look like CLS-A1B2C3; legacy access codes are plain A-Z0-9.
const classCodeSchema = z.string()
  .trim()
  .min(6, "Class code must be at least 6 characters")
  .max(12, "Class code must be less than 12 characters")
  .regex(/^[A-Z0-9-]+$/, "Class code must contain only letters, numbers, and dashes");

interface JoinResponse {
  success: boolean;
  message: string;
  class_name?: string;
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

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: classroomText.ERROR,
          description: "Please sign in to join a class",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Log attempt for rate limiting
      await supabase.from('access_code_attempts').insert({
        user_id: session.user.id,
        attempted_code: trimmedCode,
        success: false
      });

      // Try the class join code first (the CLS-XXXXXX code teachers share),
      // then fall back to legacy access codes.
      let response: JoinResponse | null = null;

      const { data: joinData, error: joinError } = await supabase.rpc('join_class_by_code' as never, {
        p_code: trimmedCode,
      } as never);
      if (!joinError && joinData) {
        response = joinData as unknown as JoinResponse;
      }

      if (!response?.success) {
        const { data: accessData, error: accessError } = await supabase.rpc('process_access_code', {
          p_code: trimmedCode,
        });
        if (accessError) {
          toast({
            title: classroomText.ERROR,
            description: response?.message || accessError.message || classroomText.ERROR_JOINING,
            variant: "destructive",
          });
          return;
        }
        const accessResponse = accessData as unknown as JoinResponse;
        if (accessResponse?.success) response = accessResponse;
        else if (!response) response = accessResponse;
      }

      if (response?.success) {
        await supabase.from('access_code_attempts').insert({
          user_id: session.user.id,
          attempted_code: trimmedCode,
          success: true
        });

        toast({
          title: classroomText.SUCCESS,
          description: response.class_name
            ? `Joined ${response.class_name}!`
            : response.message || classroomText.SUCCESS_JOINING,
        });

        setClassCode('');
      } else {
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
