
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { secureStorage } from "@/utils/security/dataEncryption";

export const useAuthFlow = (onAuthSuccess?: () => void) => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleEmailAuth = async (e: React.FormEvent, passcode?: string) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    try {
      let result;
      
      if (isLogin) {
        // Simple login - no passcode needed
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        // Simple frontend passcode check for signup
        const SIGNUP_PASSCODE = "08132010";
        if (!passcode || passcode !== SIGNUP_PASSCODE) {
          setIsLoading(false);
          setAuthError(t("incorrectPasscode") || "Incorrect passcode");
          return;
        }

        // Sign up with language preferences
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              native_language: secureStorage.getItem("nativeLanguage") || undefined,
              target_language: secureStorage.getItem("targetLanguage") || undefined,
            }
          }
        });
      }

      if (result.error) {
        setAuthError(result.error.message);
        throw result.error;
      }

      // Clear form on success
      setEmail("");
      setPassword("");
      setAuthError(null);
      setRetryCount(0);
      
      toast({
        title: isLogin ? t("signInSuccess") : t("accountCreated"),
        description: isLogin ? t("welcomeBack") : t("pleaseCheckEmail"),
      });

      // Call success callback
      if (onAuthSuccess) {
        onAuthSuccess();
      }
      
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      if (!authError) {
        toast({
          title: t("error"),
          description: error.message || t("authFailed"),
          variant: "destructive",
        });
      }
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
    setAuthError,
    retryCount
  };
};
