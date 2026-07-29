import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Authoritative role check: reads the user_roles table through the
 * has_role() security-definer function. Never trusts profiles.role.
 */
export function useUserRole(role: "admin" | "moderator" | "user" = "admin") {
  const [hasRole, setHasRole] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      setSignedIn(!!user);
      if (!user) {
        setHasRole(false);
        setLoading(false);
        return;
      }
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: role });
      if (!active) return;
      setHasRole(data === true);
      setLoading(false);
    };

    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [role]);

  return { hasRole, loading, signedIn };
}
