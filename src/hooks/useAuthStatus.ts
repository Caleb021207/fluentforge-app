
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthStatus {
  isLoggedIn: boolean;
  isLoading: boolean;
  userId: string | null;
}

export const useAuthStatus = (): AuthStatus => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isLoggedIn: false,
    isLoading: true,
    userId: null,
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        setAuthStatus({
          isLoggedIn: !!session,
          isLoading: false,
          userId: session?.user?.id || null,
        });
      } catch (error) {
        console.error("Error checking auth status:", error);
        setAuthStatus({
          isLoggedIn: false,
          isLoading: false,
          userId: null,
        });
      }
    };

    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthStatus({
          isLoggedIn: !!session,
          isLoading: false,
          userId: session?.user?.id || null,
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return authStatus;
};
