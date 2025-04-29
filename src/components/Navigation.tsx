
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";
import { cn } from "@/lib/utils";
import { Home, MessageSquare, Mic, TrendingUp, Award, User } from "lucide-react";

const Navigation = () => {
  const { t } = useLocalization();
  const location = useLocation();
  
  const navItems = [
    { label: t("dashboard"), path: "/", icon: <Home className="w-5 h-5" /> },
    { label: t("practice"), path: "/practice", icon: <MessageSquare className="w-5 h-5" /> },
    { label: t("voiceChat"), path: "/voice-chat", icon: <Mic className="w-5 h-5" /> },
    { label: t("progress"), path: "/progress", icon: <TrendingUp className="w-5 h-5" /> },
    { label: t("certificates"), path: "/certificates", icon: <Award className="w-5 h-5" /> },
    { label: t("profile"), path: "/profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="flex justify-center lg:justify-start bg-white py-2 lg:py-0 border-b shadow-sm">
      <div className="container flex overflow-x-auto lg:overflow-visible no-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "px-4 py-4 whitespace-nowrap flex items-center gap-2 text-sm font-medium transition-colors",
              location.pathname === item.path
                ? "text-lingua-primary border-b-2 border-lingua-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon}
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
