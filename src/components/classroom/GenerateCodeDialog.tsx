
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
import { useLocalization } from "@/context/LocalizationContext";

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
  const { t } = useLocalization();
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
        title: t("success"),
        description: response.message,
      });
      
      onOpenChange(false);
      setClassName('');
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createNewClass")}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder={t("className")}
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("creating") : t("createClass")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateCodeDialog;
