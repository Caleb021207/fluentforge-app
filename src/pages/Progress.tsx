
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import LoadingProgress from "@/components/progress/LoadingProgress";
import UnauthenticatedProgress from "@/components/progress/UnauthenticatedProgress";
import AuthenticatedProgress from "@/components/progress/AuthenticatedProgress";

const ProgressPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getCurrentUser();
  }, []);

  if (isLoading) {
    return <LoadingProgress />;
  }

  if (!user) {
    return <UnauthenticatedProgress />;
  }

  return <AuthenticatedProgress user={user} />;
};

export default ProgressPage;
