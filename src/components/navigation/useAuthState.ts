
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuthState = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const loggedIn = !!data.session;
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAdmin(user?.email?.includes("admin") || false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
        const user = session?.user;
        setIsAdmin(user?.email?.includes("admin") || false);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isLoggedIn, isAdmin };
};
