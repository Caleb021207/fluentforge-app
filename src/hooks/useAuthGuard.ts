
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useNavigate } from "react-router-dom";

export const useAuthGuard = (redirectTo = "/login") => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getUser();
        const authenticated = !!data.user;
        
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          toast({
            title: t("authRequired"),
            description: t("pleaseLoginToContinue"),
          });
          navigate(redirectTo);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        navigate(redirectTo);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirectTo, t, toast]);

  return { isAuthenticated, isLoading };
};
