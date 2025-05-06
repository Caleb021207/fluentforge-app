
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useMicrophoneAccess = () => {
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();

  useEffect(() => {
    // Check silently if permission is already granted
    navigator.permissions.query({ name: 'microphone' as PermissionName })
      .then(permissionStatus => {
        if (permissionStatus.state === 'granted') {
          setMicrophoneAccess(true);
          console.log("Microphone permission already granted");
        } else {
          console.log("Microphone permission status:", permissionStatus.state);
        }
      })
      .catch(err => {
        console.log("Permission API not supported, will check on demand");
      });
  }, []);

  const requestMicrophoneAccess = async (): Promise<boolean> => {
    try {
      console.log("Requesting microphone access...");
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
    }
  };

  return {
    microphoneAccess,
    requestMicrophoneAccess
  };
};
