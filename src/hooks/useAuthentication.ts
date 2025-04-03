
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthentication = () => {
  const { toast } = useToast();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setIsSignedIn(!!data.user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let result;
      
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
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

      if (result.error) throw result.error;

      setIsAuthDialogOpen(false);
      setEmail("");
      setPassword("");
      
      toast({
        title: isLogin ? "Successfully signed in" : "Account created",
        description: isLogin ? "Welcome back!" : "Please check your email to verify your account",
      });
      
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast({
        title: "Error signing in",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSignedIn,
    isLoading,
    email,
    password,
    isAuthDialogOpen,
    isLogin,
    setEmail,
    setPassword,
    setIsAuthDialogOpen,
    setIsLogin,
    handleEmailAuth,
    handleGoogleLogin
  };
};
