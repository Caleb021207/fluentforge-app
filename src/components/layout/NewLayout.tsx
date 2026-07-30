import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TopNavigationDropdown } from "@/components/ui/top-navigation-dropdown";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useLocalization } from "@/context/LocalizationContext";

import LogoutButton from "@/components/auth/LogoutButton";
import {
  MessageSquare,
  Mic,
  Home,
  Volume2,
  User as UserIcon,
  Settings,
  Sparkles,
  Trophy,
  ClipboardList,
  BookOpen,
  Layers,
  BarChart3,
  Award,
  GraduationCap,
} from "lucide-react";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useGamification } from "@/hooks/useGamification";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import XPProgressBar from "@/components/gamification/XPProgressBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NewLayoutProps {
  children: React.ReactNode;
}

const NewLayout = ({ children }: NewLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocalization();
  const [user, setUser] = useState<User | null>(null);
  const { usageLimits } = useUsageLimits();
  const { progression } = useGamification();
  const { isTeacher } = useTeacherStatus();

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

  // t() returns the key itself when a translation is missing, so `t(k) || fb`
  // never falls back. This helper does.
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  // Core destinations stay visible on desktop; everything is reachable from
  // the dropdown. Low nav depth matters for young ESL learners.
  const primaryItems = [
    { label: tr("home", "Home"), path: "/", icon: <Home className="w-4 h-4" /> },
    { label: tr("learn", "Learn"), path: "/learn", icon: <BookOpen className="w-4 h-4" /> },
    { label: tr("practice", "Practice"), path: "/practice", icon: <MessageSquare className="w-4 h-4" /> },
    { label: tr("vocabReview", "Review"), path: "/review", icon: <Layers className="w-4 h-4" /> },
    { label: tr("assignments", "Assignments"), path: "/assignments", icon: <ClipboardList className="w-4 h-4" /> },
  ];

  const secondaryItems = [
    { label: tr("progress", "Progress"), path: "/progress", icon: <BarChart3 className="w-4 h-4" /> },
    { label: tr("unlimitedVoicePractice", "Voice Chat"), path: "/voice-chat", icon: <Mic className="w-4 h-4" />, disabled: voiceChatDisabled },
    { label: tr("pronunciationPractice", "Pronunciation"), path: "/pronunciation-practice", icon: <Volume2 className="w-4 h-4" /> },
    { label: tr("certificates", "Certificates"), path: "/certificates", icon: <Award className="w-4 h-4" /> },
    { label: tr("xpRewards", "XP & Rewards"), path: "/xp", icon: <Trophy className="w-4 h-4" /> },
    { label: tr("profile", "Profile"), path: "/profile", icon: <UserIcon className="w-4 h-4" /> },
    { label: tr("settings", "Settings"), path: "/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const navigationItems = [...primaryItems, ...secondaryItems];

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
            className="px-4 py-2 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 flex justify-between items-center text-sm gap-4"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span className="hidden sm:inline text-muted-foreground">{t("signedInAs")}</span>
              <span className="font-semibold truncate max-w-[200px]">{user.email}</span>
            </div>
            {progression && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="flex-1 max-w-xs origin-left hidden md:block"
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
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate("/")}
              className="text-2xl md:text-3xl font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity leading-none shrink-0"
            >
              Palavox
            </button>

            {/* Visible primary nav on desktop */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {primaryItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "gap-1.5",
                    location.pathname === item.path && "bg-accent text-accent-foreground",
                  )}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Full menu (all destinations) */}
            <TopNavigationDropdown
              items={navigationItems}
              currentPath={location.pathname}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Teacher entry point */}
          {isTeacher && (
            <Button
              variant={location.pathname.startsWith("/teacher") ? "default" : "outline"}
              size="sm"
              onClick={() => navigate("/teacher/dashboard")}
              className="gap-1.5 shrink-0"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Teacher</span>
            </Button>
          )}
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
