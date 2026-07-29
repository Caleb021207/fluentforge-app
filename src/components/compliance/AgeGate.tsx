import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { needsAgeVerification } from "@/utils/safety/ageVerification";
import AgeVerificationDialog from "@/components/compliance/AgeVerificationDialog";

/**
 * Mounts the COPPA age gate for signed-in users whose profile has not yet been
 * age-verified server-side. The verdict comes from the `verify-age` edge
 * function, so dismissing or bypassing this dialog in the browser does not
 * grant the user adult status or lift strict safety mode.
 */
const AgeGate = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (active) setOpen(false);
        return;
      }
      const needs = await needsAgeVerification();
      if (active) setOpen(needs);
    };

    check();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!open) return null;

  return <AgeVerificationDialog isOpen={open} onOpenChange={setOpen} />;
};

export default AgeGate;
