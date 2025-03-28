
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import LoadingProgress from "@/components/progress/LoadingProgress";
import UnauthenticatedProgress from "@/components/progress/UnauthenticatedProgress";
import AuthenticatedProgress from "@/components/progress/AuthenticatedProgress";
import { useToast } from "@/hooks/use-toast";

const ProgressPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          setAuthError(true);
          toast({
            title: "Authentication error",
            description: "Please try signing in again.",
            variant: "destructive"
          });
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setAuthError(true);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, [toast]);

  if (isLoading) {
    return <LoadingProgress />;
  }

  if (!user || authError) {
    return <UnauthenticatedProgress />;
  }

  return <AuthenticatedProgress user={user} />;
};

export default ProgressPage;
