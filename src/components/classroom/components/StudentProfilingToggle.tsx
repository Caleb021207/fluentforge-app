import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Brain, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StudentProfilingToggleProps {
  studentId: string;
  studentName: string;
  initialEnabled: boolean;
  hasConsent: boolean;
  onToggle?: (enabled: boolean) => void;
}

export const StudentProfilingToggle: React.FC<StudentProfilingToggleProps> = ({
  studentId,
  studentName,
  initialEnabled,
  hasConsent,
  onToggle
}) => {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingState, setPendingState] = useState<boolean | null>(null);

  const handleToggleClick = (newState: boolean) => {
    if (newState && !hasConsent) {
      toast({
        title: "Consent Required",
        description: "Parental consent must be recorded before enabling profiling.",
        variant: "destructive"
      });
      return;
    }
    
    setPendingState(newState);
    setShowConfirmDialog(true);
  };

  const confirmToggle = async () => {
    if (pendingState === null) return;
    
    setIsLoading(true);
    setShowConfirmDialog(false);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

      if (pendingState) {
        // Enable profiling - upsert the profile record
        const { error } = await supabase
          .from('student_learning_profiles')
          .upsert({
            student_id: studentId,
            profiling_enabled: true,
            enabled_by: user.id,
            enabled_at: new Date().toISOString(),
            academic_year: academicYear
          }, {
            onConflict: 'student_id,academic_year'
          });

        if (error) throw error;
      } else {
        // Disable profiling
        const { error } = await supabase
          .from('student_learning_profiles')
          .update({
            profiling_enabled: false,
            enabled_by: null,
            enabled_at: null
          })
          .eq('student_id', studentId)
          .eq('academic_year', academicYear);

        if (error) throw error;
      }

      setEnabled(pendingState);
      onToggle?.(pendingState);
      
      toast({
        title: pendingState ? "Profiling Enabled" : "Profiling Disabled",
        description: pendingState 
          ? `AI profiling is now active for ${studentName}` 
          : `AI profiling has been disabled for ${studentName}`
      });
    } catch (error: any) {
      console.error("Error toggling profiling:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profiling status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setPendingState(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Switch
                    checked={enabled}
                    onCheckedChange={handleToggleClick}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-primary"
                  />
                )}
                {enabled && (
                  <Brain className="h-4 w-4 text-primary" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{enabled ? "AI Profiling Active" : "AI Profiling Disabled"}</p>
              {!hasConsent && <p className="text-xs text-muted-foreground">Requires parental consent</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {hasConsent && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3 text-green-500" />
                  Consent
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Parental consent recorded</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingState ? "Enable AI Profiling?" : "Disable AI Profiling?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingState ? (
                <>
                  This will enable AI-powered learning profiling for <strong>{studentName}</strong>. 
                  The system will analyze their conversations to identify:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Grammar patterns and struggles</li>
                    <li>Vocabulary gaps</li>
                    <li>Estimated proficiency level</li>
                    <li>Personalized flashcard recommendations</li>
                  </ul>
                  <p className="mt-2 text-sm">
                    Only the last 10 conversations are retained. Data is deleted at the end of the school year.
                  </p>
                </>
              ) : (
                <>
                  This will disable AI profiling for <strong>{studentName}</strong>. 
                  Their existing profile data will be preserved but no new analysis will occur.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              {pendingState ? "Enable Profiling" : "Disable Profiling"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
