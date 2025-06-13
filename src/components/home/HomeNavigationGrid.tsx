import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocalization } from "@/context/LocalizationContext";
import { MessageSquare, Mic, Home, Volume2, User as UserIcon, Settings, Brain } from "lucide-react";

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const HomeNavigationGrid = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();

  const navigationItems: NavigationItem[] = [
    { 
      label: t("practice") || "Practice", 
      path: "/practice", 
      icon: <MessageSquare className="w-8 h-8" />,
      description: t("practiceConversations") || "Practice conversations with AI"
    },
    { 
      label: t("unlimitedVoicePractice") || "Voice Chat", 
      path: "/voice-chat", 
      icon: <Mic className="w-8 h-8" />,
      description: t("speakWithAI") || "Practice speaking with AI"
    },
    { 
      label: t("pronunciationPractice") || "Pronunciation", 
      path: "/pronunciation-practice", 
      icon: <Volume2 className="w-8 h-8" />,
      description: "Perfect your pronunciation"
    },
    { 
      label: "AI Analysis", 
      path: "/analysis", 
      icon: <Brain className="w-8 h-8" />,
      description: "Get AI-powered language insights"
    },
    { 
      label: t("profile") || "Profile", 
      path: "/profile", 
      icon: <UserIcon className="w-8 h-8" />,
      description: t("trackProgress") || "Track your progress"
    },
    { 
      label: t("settings") || "Settings", 
      path: "/settings", 
      icon: <Settings className="w-8 h-8" />,
      description: "Customize your experience"
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          {t("whereWouldYouLikeToGo") || "Where would you like to go?"}
        </h2>
        <p className="text-muted-foreground">
          {t("chooseActivityToContinueLearning") || "Choose an activity to continue your learning journey"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigationItems.map((item, index) => (
          <motion.button
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigate(item.path)}
            className="group relative p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {item.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default HomeNavigationGrid;