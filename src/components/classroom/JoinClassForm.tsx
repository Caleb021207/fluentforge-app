
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";

interface ClassroomResponse {
  success: boolean;
  message: string;
  classroom_id?: string;
  class_name?: string;
}

const JoinClassForm = () => {
  const { toast } = useToast();
  const { t } = useLocalization();
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

      // Type assertion to ensure data is treated as ClassroomResponse
      const response = data as unknown as ClassroomResponse;

      toast({
        title: t("success") || "Success",
        description: response.message,
      });
      
      // Clear the form after successful submission
      setClassCode('');
      
      // Reload the page to show updated class information
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      toast({
        title: t("error") || "Error",
        description: error.message || "Failed to join class",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4 mt-8">
      <h2 className="text-xl font-semibold">{t("joinClass") || "Join Class"}</h2>
      <Input
        placeholder={t("enterClassCode") || "Enter class code"}
        value={classCode}
        onChange={(e) => setClassCode(e.target.value)}
        required
        className="w-full"
      />
      <Button type="submit" disabled={isLoading || !classCode.trim()}>
        {isLoading ? (t("joining") || "Joining...") : (t("joinClass") || "Join Class")}
      </Button>
    </form>
  );
};

export default JoinClassForm;
