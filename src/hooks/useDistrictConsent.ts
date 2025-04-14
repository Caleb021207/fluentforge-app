
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DistrictUser } from "@/types/district";

export const useDistrictConsent = (districtId: string) => {
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [districtUser, setDistrictUser] = useState<DistrictUser | null>(null);

  useEffect(() => {
    const checkConsent = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('district_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('district_id', districtId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking district consent:', error);
        }

        setDistrictUser(data);
        setHasConsent(!!data?.consent_provided);
        setLoading(false);
      } catch (error) {
        console.error('Error in checkConsent:', error);
        setLoading(false);
      }
    };

    checkConsent();
  }, [districtId]);

  return {
    loading,
    hasConsent,
    districtUser
  };
};
