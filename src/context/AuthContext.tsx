
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

// Create context types
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
  checkAuth: async () => false,
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "There was an error signing out",
        variant: "destructive",
      });
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);
