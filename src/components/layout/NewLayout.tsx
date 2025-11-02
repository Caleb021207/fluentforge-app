
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TopNavigationDropdown } from "@/components/ui/top-navigation-dropdown";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useLocalization } from "@/context/LocalizationContext";

import LogoutButton from "@/components/auth/LogoutButton";
import { MessageSquare, Mic, Home, Volume2, User as UserIcon, Settings, Brain, Sparkles } from "lucide-react";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useGamification } from "@/hooks/useGamification";
import XPProgressBar from "@/components/gamification/XPProgressBar";
import { motion } from "framer-motion";

interface NewLayoutProps {
  children: React.ReactNode;
}

const NewLayout = ({ children }: NewLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocalization();
  const [user, setUser] = useState<User | null>(null);
  const { usageLimits, premiumVoiceMinutesRemaining } = useUsageLimits();
  const { progression } = useGamification();

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

  const voiceChatDisabled = (usageLimits?.whisperSTTMinutesRemaining ?? 180) <= 0;

  const navigationItems = [
    { label: t("home") || "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    { label: t("practice") || "Practice", path: "/practice", icon: <MessageSquare className="w-4 h-4" /> },
    { label: t("unlimitedVoicePractice") || "Voice Chat", path: "/voice-chat", icon: <Mic className="w-4 h-4" />, disabled: voiceChatDisabled },
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background text-foreground">
      {/* Top Bar */}
      <div className="bg-card/80 backdrop-blur-lg border-b sticky top-0 z-30 shadow-sm">
        {/* User Info Bar */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 flex justify-between items-center text-sm gap-4"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{t("signedInAs")}</span>
              <span className="font-semibold truncate max-w-[200px]">{user.email}</span>
            </div>
            {progression && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="flex-1 max-w-xs origin-left"
              >
                <XPProgressBar totalXP={progression.total_xp} />
              </motion.div>
            )}
            <div className="flex items-center gap-2">
              <LogoutButton iconOnly />
            </div>
          </motion.div>
        )}

        {/* Navigation Bar */}
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate("/")}
              className="text-[120px] md:text-[180px] font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity leading-none"
            >
              Palavox
            </motion.button>
            {user && (
              <TopNavigationDropdown
                items={navigationItems}
                currentPath={location.pathname}
                onNavigate={handleNavigate}
              />
            )}
          </div>
          
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default NewLayout;
