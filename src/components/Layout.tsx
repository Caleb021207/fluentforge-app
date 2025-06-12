
import { ReactNode } from "react";
import Navigation from "./Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import LogoutButton from "./auth/LogoutButton";
import LanguageAvailabilityBanner from "./LanguageAvailabilityBanner";
import { useLocalization } from "@/context/LocalizationContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const { t } = useLocalization();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden w-full">
      {user && (
        <div className="w-full glass-effect border-b py-3 px-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 animate-slide-up">
          <div className="flex items-center">
            <span className="text-xs sm:text-sm text-muted-foreground mr-1 sm:mr-2">
              {t("signedInAs")}
            </span>
            <span className="font-medium text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{user.email}</span>
          </div>
          <LogoutButton />
        </div>
      )}

      <div className="flex flex-col md:flex-row min-h-screen">
        <Navigation />
        <main className="flex-1 p-4 sm:p-6 md:p-8 mb-16 md:mb-0 md:ml-64 overflow-x-hidden w-full">
          <div className="max-w-full animate-fade-in">
            {/* Add Language Availability Banner that will show on all pages except the home page */}
            {window.location.pathname !== "/" && <LanguageAvailabilityBanner />}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
