
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";

export const useAuthFlow = (onAuthSuccess?: () => void) => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent, passcode?: string) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    try {
      let result;
      
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        // Verify passcode for signup
        if (!isLogin && (!passcode || passcode !== "08132010")) {
          setIsLoading(false);
          setAuthError("Incorrect passcode");
          return;
        }

        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              native_language: localStorage.getItem("nativeLanguage") || undefined,
              target_language: localStorage.getItem("targetLanguage") || undefined,
            }
          }
        });
      }

      if (result.error) {
        setAuthError(result.error.message);
        throw result.error;
      }

      setEmail("");
      setPassword("");
      setAuthError(null);
      
      toast({
        title: isLogin ? t("signInSuccess") : t("accountCreated"),
        description: isLogin ? t("welcomeBack") : t("pleaseCheckEmail"),
      });

      // Call the success callback if provided
      onAuthSuccess?.();
      
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: t("error"),
        description: error.message || t("authFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLogin,
    setIsLogin,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleEmailAuth,
    authError,
    setAuthError
  };
};
