
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useSecureApiKeys = () => {
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();

  const fetchApiKey = async (language: string = 'english') => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[API] Fetching API key for language: ${language}`);
      
      const { data, error } = await supabase.functions.invoke('voice-chat-auth', {
        body: { language }
      });

      if (error) {
        setError(error.message);
        // Silently log ElevenLabs API key errors without showing toast
        console.warn('ElevenLabs API key not configured (silent):', error.message);
        return null;
      }

      console.log(`[API] Successfully retrieved API key`);
      setElevenLabsApiKey(data.apiKey);
      return data.apiKey;
    } catch (err: any) {
      console.error("Error fetching API key:", err);
      setError(err.message || "Failed to fetch API key");
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    elevenLabsApiKey,
    fetchApiKey,
    isLoading,
    error
  };
};

export default useSecureApiKeys;
