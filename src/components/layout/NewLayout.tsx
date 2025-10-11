
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TopNavigationDropdown } from "@/components/ui/top-navigation-dropdown";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useLocalization } from "@/context/LocalizationContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import LogoutButton from "@/components/auth/LogoutButton";
import { MessageSquare, Mic, Home, Volume2, User as UserIcon, Settings, Brain, Sparkles } from "lucide-react";

interface NewLayoutProps {
  children: React.ReactNode;
}

const NewLayout = ({ children }: NewLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocalization();
  const [user, setUser] = useState<User | null>(null);

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

  const navigationItems = [
    { label: t("home") || "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    { label: t("practice") || "Practice", path: "/practice", icon: <MessageSquare className="w-4 h-4" /> },
    { label: t("unlimitedVoicePractice") || "Voice Chat", path: "/voice-chat", icon: <Mic className="w-4 h-4" /> },
    { label: t("pronunciationPractice") || "Pronunciation", path: "/pronunciation-practice", icon: <Volume2 className="w-4 h-4" /> },
    { label: t("premiumVoicePractice") || "Premium Voice", path: "/premium-voice-practice", icon: <Sparkles className="w-4 h-4" /> },
    { label: t("aiAnalysis") || "AI Analysis", path: "/analysis", icon: <Brain className="w-4 h-4" /> },
    { label: t("profile") || "Profile", path: "/profile", icon: <UserIcon className="w-4 h-4" /> },
    { label: t("settings") || "Settings", path: "/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <div className="bg-card border-b sticky top-0 z-30">
        {/* User Info Bar */}
        {user && (
          <div className="px-4 py-2 bg-muted/30 flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("signedInAs")}</span>
              <span className="font-medium truncate max-w-[200px]">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton iconOnly />
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-primary">Palavox</h1>
            {user && (
              <TopNavigationDropdown
                items={navigationItems}
                currentPath={location.pathname}
                onNavigate={handleNavigate}
              />
            )}
          </div>
          
          {!user && (
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Add top margin to account for fixed dropdown */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default NewLayout;
