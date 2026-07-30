import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Reports whether a user is signed in so pages can show a sign-in prompt
 * instead of empty RLS-filtered content. (A previous version returned
 * `isAuthenticated: true` in every branch, which made every auth prompt in
 * the app dead code and left signed-out visitors on blank pages.)
 */
export const useAuthGuard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAuthenticated, isLoading };
};
