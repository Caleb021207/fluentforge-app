
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';

export const useAuthGuard = (redirectTo = '/auth') => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocalization();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: t("loginRequired"),
            description: t("pleaseLoginToAccessFeature"),
            variant: "destructive",
          });
          navigate(redirectTo);
          return;
        }
        
        // Ensure the user has a role (should be handled by DB trigger, but double-check)
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        // If no role found, we should ensure one exists (fallback only - the trigger should handle this)
        if (!roleData) {
          // Try to assign default student role
          await supabase.rpc('assign_role', {
            target_user_id: session.user.id,
            role_name: 'student'
          });
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate(redirectTo);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirectTo, t, toast]);

  return { isLoading, isAuthenticated };
};
