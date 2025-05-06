
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { isSafari, isIOS } from "@/utils/browserUtils";

export const useMicrophoneAccess = () => {
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const accessAttempted = useRef(false);
  const { toast } = useToast();
  const { t } = useLocalization();

  useEffect(() => {
    const checkInitialAccess = async () => {
      if (accessAttempted.current) return;
      
      try {
        // Check if we already have permission
        const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (permissions.state === 'granted') {
          setMicrophoneAccess(true);
          accessAttempted.current = true;
        } else if (permissions.state === 'prompt') {
          // We'll wait for explicit request
        } else if (permissions.state === 'denied') {
          console.warn("Microphone access is denied");
          toast({
            title: t("microphoneAccessRequired"),
            description: t("allowMicAccess"),
            variant: "destructive",
          });
        }
      } catch (error) {
        // Permissions API might not be supported, we'll try getUserMedia instead
        console.warn("Permissions API not fully supported, will try direct access:", error);
      }
    };

    checkInitialAccess();
  }, [toast, t]);

  const requestMicrophoneAccess = async () => {
    accessAttempted.current = true;
    
    try {
      // For Safari and iOS, we need to handle permissions differently
      if (isSafari() || isIOS()) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Immediately stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
          
          setMicrophoneAccess(true);
          return true;
        } catch (error) {
          console.error("Failed to get microphone access:", error);
          setMicrophoneAccess(false);
          
          toast({
            title: t("microphoneAccessRequired"),
            description: t("allowMicAccess"),
            variant: "destructive",
          });
          
          return false;
        }
      } else {
        // Standard approach for other browsers
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Immediately stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
        
        setMicrophoneAccess(true);
        return true;
      }
    } catch (error) {
      console.error("Microphone access error:", error);
      setMicrophoneAccess(false);
      
      toast({
        title: t("microphoneAccessRequired"),
        description: t("allowMicAccess"),
        variant: "destructive",
      });
      
      return false;
    }
  };

  return {
    microphoneAccess,
    requestMicrophoneAccess
  };
};
