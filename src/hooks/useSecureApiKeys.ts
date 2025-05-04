import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useLocalization } from "@/hooks/useLocalization";

interface ApiKeys {
  ELEVENLABS_API_KEY: string | null;
  OPENAI_API_KEY: string | null;
}

export const useSecureApiKeys = (): { apiKeys: ApiKeys; isLoading: boolean } => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    ELEVENLABS_API_KEY: null,
    OPENAI_API_KEY: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuthStatus();
  const { t } = useLocalization();
  const { toast } = useToast();

  useEffect(() => {
    const fetchApiKeys = async () => {
      setIsLoading(true);
      try {
        if (!isLoggedIn) {
          console.warn("User is not logged in, API keys not fetched.");
          return;
        }

        const { data, error } = await supabase
          .from("api_keys")
          .select("ELEVENLABS_API_KEY, OPENAI_API_KEY")
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setApiKeys({
            ELEVENLABS_API_KEY: data.ELEVENLABS_API_KEY || null,
            OPENAI_API_KEY: data.OPENAI_API_KEY || null,
          });
        } else {
          console.warn("No API keys found for the current user.");
        }
      } catch (error: any) {
        console.error("Failed to fetch API keys:", error.message);
        toast({
          title: t("errorFetchingApiKeys"),
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKeys();
  }, [isLoggedIn, toast, t]);

  return { apiKeys, isLoading };
};
