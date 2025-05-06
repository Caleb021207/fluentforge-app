import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useMicrophoneAccess = () => {
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();

  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        // Check if permission is already granted
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (permissionStatus.state === 'granted') {
          setMicrophoneAccess(true);
          return;
        }
        
        // Don't automatically request on page load - let user action trigger it
        console.log("Microphone permission status:", permissionStatus.state);
      } catch (error) {
        console.error("Error checking microphone permission:", error);
        // Fall back to old method if permissions API not supported
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicrophoneAccess(true);
          // Release the stream immediately
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          console.warn("Microphone access not granted");
          setMicrophoneAccess(false);
        }
      }
    };

    checkMicrophoneAccess();
  }, []);

  const requestMicrophoneAccess = async (): Promise<boolean> => {
    try {
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // We got access, but we don't need to keep the stream open
      // Release it immediately
      stream.getTracks().forEach(track => track.stop());
      
      setMicrophoneAccess(true);
      console.log("Microphone access granted");
      return true;
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
