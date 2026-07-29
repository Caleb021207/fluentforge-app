
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { handleConnectionError } from "@/utils/authErrorHandler";

export const useAuthFlow = (onAuthSuccess?: () => void) => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const resetPassword = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setAuthError("Enter your email first, then request a password reset.");
      return;
    }

    setAuthError(null);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: t("resetPassword") || "Password reset sent",
        description: "Check your email for the reset link.",
      });
    } catch (error: any) {
      setAuthError(error.message || "Could not send the reset email.");
      toast({
        title: t("error"),
        description: error.message || "Could not send the reset email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
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
            handleEmailAuth(e);
          }, 1500);
          return;
        }
      }
      
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
      } else {
        result = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
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

      const session = result.data?.session;
      const identityCount = result.data?.user?.identities?.length ?? 0;

      if (isLogin && !session) {
        throw new Error("Sign-in did not create a session. Please try again or reset your password.");
      }

      if (!isLogin && !session) {
        if (identityCount === 0) {
          setIsLogin(true);
          setAuthError("That email already has an account. Sign in with the original password or reset it.");
          return;
        }

        toast({
          title: t("accountCreated"),
          description: "Check your email to finish signing in.",
        });
        setPassword("");
        return;
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
    resetPassword,
    authError,
    setAuthError,
    retryCount
  };
};
