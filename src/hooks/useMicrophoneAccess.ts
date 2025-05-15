
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useMicrophoneAccess = () => {
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();

  const checkMicrophoneAccess = useCallback(async () => {
    if (isChecking) return false;
    
    setIsChecking(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Always stop the tracks after checking to release the microphone
      stream.getTracks().forEach(track => track.stop());
      
      setMicrophoneAccess(true);
      setIsChecking(false);
      return true;
    } catch (error) {
      console.error("Microphone access error:", error);
      setMicrophoneAccess(false);
      setIsChecking(false);
      
      // Check for specific permission errors
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
      } else {
        // Generic error for other cases
        toast({
          title: t("error"),
          description: t("microphoneAccessFailed"),
          variant: "destructive",
        });
      }
      
      return false;
    }
  }, [toast, t, isChecking]);

  // Check microphone access on component mount
  useEffect(() => {
    checkMicrophoneAccess();
  }, [checkMicrophoneAccess]);

  const requestMicrophoneAccess = async () => {
    return await checkMicrophoneAccess();
  };

  return {
    microphoneAccess,
    requestMicrophoneAccess,
    isChecking
  };
};
