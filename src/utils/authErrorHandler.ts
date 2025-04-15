
import { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tries to reconnect to Supabase when there are connection issues
 */
export const handleConnectionError = async () => {
  try {
    // Force refresh the session
    await supabase.auth.refreshSession();
    return true;
  } catch (error) {
    console.error("Failed to refresh session:", error);
    return false;
  }
};

/**
 * Displays a user-friendly error message for auth errors
 */
export const showAuthErrorToast = (error: AuthError | Error | unknown, toast: any) => {
  let message = "An authentication error occurred. Please try signing in again.";
  
  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch")) {
      message = "Network error. Please check your connection and try again.";
    }
  }
  
  toast({
    title: "Authentication Error",
    description: message,
    variant: "destructive"
  });
};
