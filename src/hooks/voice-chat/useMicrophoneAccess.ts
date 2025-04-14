
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useMicrophoneAccess = (t: (key: string, options?: any) => string) => {
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const { toast } = useToast();

  const checkMicrophoneAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneAccess(true);
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

  useEffect(() => {
    checkMicrophoneAccess();
  }, []);

  return {
    microphoneAccess,
    checkMicrophoneAccess
  };
};
