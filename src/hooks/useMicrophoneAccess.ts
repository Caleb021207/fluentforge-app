
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useMicrophoneAccess = () => {
  const [microphoneAccess, setMicrophoneAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  // Added double-check protection to prevent race conditions
  const isCheckingRef = useRef<boolean>(false);

  const checkMicrophoneAccess = useCallback(async () => {
    if (isCheckingRef.current) return false;
    
    isCheckingRef.current = true;
    setIsChecking(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Always stop the tracks after checking to release the microphone
      stream.getTracks().forEach(track => track.stop());
      
      setMicrophoneAccess(true);
      setIsChecking(false);
      isCheckingRef.current = false;
      return true;
    } catch (error) {
      console.error("Microphone access error:", error);
      setMicrophoneAccess(false);
      setIsChecking(false);
      isCheckingRef.current = false;
      
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
  }, [toast, t]);

  // Check microphone access on component mount, but only once
  useEffect(() => {
    // Only check if we haven't checked before
    if (microphoneAccess === null) {
      checkMicrophoneAccess();
    }
  }, [checkMicrophoneAccess, microphoneAccess]);

  const requestMicrophoneAccess = async () => {
    return await checkMicrophoneAccess();
  };

  return {
    microphoneAccess,
    requestMicrophoneAccess,
    isChecking
  };
};

// Add missing useRef import
import { useRef } from "react";
