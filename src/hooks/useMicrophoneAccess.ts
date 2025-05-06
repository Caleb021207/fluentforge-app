
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useMicrophoneAccess = () => {
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const { t } = useLocalization();

  // Check if browser supports permissions API
  const supportsPermissionsAPI = useCallback(() => {
    return 'permissions' in navigator;
  }, []);

  // Check microphone permission state
  const checkMicrophonePermission = useCallback(async () => {
    console.log("Checking microphone permission state...");
    try {
      if (supportsPermissionsAPI()) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log("Microphone permission state:", result.state);
        if (result.state === 'granted') {
          setMicrophoneAccess(true);
        } else if (result.state === 'prompt') {
          console.log("Microphone permission will be requested when needed");
        } else {
          console.log("Microphone permission denied");
        }
      } else {
        console.log("Permissions API not supported, will check on demand");
      }
    } catch (err) {
      console.error("Error checking microphone permission:", err);
    } finally {
      setIsChecking(false);
    }
  }, [supportsPermissionsAPI]);

  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);

  const requestMicrophoneAccess = async (): Promise<boolean> => {
    try {
      console.log("Requesting microphone access...");
      setIsChecking(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Release the stream immediately
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
    } finally {
      setIsChecking(false);
    }
  };

  return {
    microphoneAccess,
    requestMicrophoneAccess,
    isCheckingMicrophoneAccess: isChecking
  };
};
