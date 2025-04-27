
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
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('join_classroom', {
        class_code: classCode
      });

      if (error) throw error;

      const response = data as ClassroomResponse;

      toast({
        title: t("success"),
        description: response.message,
      });
      
      setClassCode('');
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4 mt-8">
      <h2 className="text-xl font-semibold">{t("joinClass")}</h2>
      <Input
        placeholder={t("enterClassCode")}
        value={classCode}
        onChange={(e) => setClassCode(e.target.value)}
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? t("joining") : t("joinClass")}
      </Button>
    </form>
  );
};

export default JoinClassForm;
