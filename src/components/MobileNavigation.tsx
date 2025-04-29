
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";
import { cn } from "@/lib/utils";
import { Home, MessageSquare, Mic, TrendingUp, User } from "lucide-react";

const MobileNavigation = () => {
  const { t } = useLocalization();
  const location = useLocation();

  const navItems = [
    { label: t("home"), path: "/", icon: <Home className="w-5 h-5" /> },
    { label: t("chat"), path: "/practice", icon: <MessageSquare className="w-5 h-5" /> },
    { label: t("voiceChat"), path: "/voice-chat", icon: <Mic className="w-5 h-5" /> },
    { label: t("progress"), path: "/progress", icon: <TrendingUp className="w-5 h-5" /> },
    { label: t("profile"), path: "/profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-1 flex-col items-center py-2 px-1",
              location.pathname === item.path
                ? "text-lingua-primary"
                : "text-muted-foreground"
            )}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
