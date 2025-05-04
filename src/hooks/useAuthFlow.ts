import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/hooks/useLocalization";
import { handleConnectionError } from "@/utils/authErrorHandler";

export const useAuthFlow = (onAuthSuccess?: () => void) => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const navigate = useNavigate();
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
      
      // For "Failed to fetch" errors, try to reconnect first
      if (retryCount > 0) {
        const reconnected = await handleConnectionError();
        if (!reconnected && retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setAuthError("Network connection issue. Retrying...");
          setIsLoading(false);
          
          // Wait and retry
          setTimeout(() => {
            handleEmailAuth(e, passcode);
          }, 1500);
          return;
        }
      }
      
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
        // Check if it's a network error and handle retry
        if (result.error.message.includes("Failed to fetch") || 
            result.error.message.includes("NetworkError")) {
          setRetryCount(prev => prev + 1);
          setAuthError("Connection issue. Please check your network and try again.");
        } else {
          setAuthError(result.error.message);
        }
        throw result.error;
      }

      // Reset states on success
      setEmail("");
      setPassword("");
      setAuthError(null);
      setRetryCount(0);
      
      toast({
        title: isLogin ? t("signInSuccess") : t("accountCreated"),
        description: isLogin ? t("welcomeBack") : t("pleaseCheckEmail"),
      });

      // Call the success callback if provided
      onAuthSuccess?.();
      
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      // Don't show toast if we already set authError for displaying in the form
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
