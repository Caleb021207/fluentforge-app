
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Menu, X, Mic, Home, Headphones, BookOpen, Lock as LockIcon, BarChart, Volume2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./auth/LogoutButton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useLocalization();
  const isMobile = useIsMobile();
  const { isTeacher, isLoading: teacherStatusLoading } = useTeacherStatus();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const loggedIn = !!data.session;
      setIsLoggedIn(loggedIn);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getNavItems = () => {
    const items = [
      { icon: MessageSquare, label: "textPractice", path: "/practice", requiresAuth: true },
      { icon: Mic, label: "unlimitedVoicePractice", path: "/voice-chat", requiresAuth: true },
      { icon: Volume2, label: "pronunciationPractice", path: "/pronunciation-practice", requiresAuth: true },
      { icon: BarChart, label: "accuracy", path: "/accuracy", requiresAuth: true }
    ];

    if (isLoggedIn && !teacherStatusLoading) {
      // Add the class menu item after voice chat items
      const insertIndex = items.length;
      items.splice(insertIndex, 0, {
        icon: BookOpen,
        label: isTeacher ? "myClasses" : "myClass",
        path: isTeacher ? "/teacher/classes" : "/student/class",
        requiresAuth: true
      });
    }

    if (isMobile) {
      items.unshift({ icon: Home, label: "home", path: "/", requiresAuth: false });
    }

    return items;
  };

  const renderNavButton = (item: any) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    const button = (
      <Button
        variant={isActive ? "accent" : "ghost"}
        className={`w-full justify-start text-left transition-all duration-200 ${
          isActive ? 'shadow-modern scale-[1.02]' : 'hover:scale-[1.01]'
        }`}
        disabled={item.requiresAuth && !isLoggedIn}
      >
        <Icon className="h-5 w-5 md:mr-3" />
        <span className="hidden md:inline font-medium">{t(item.label)}</span>
        {item.requiresAuth && !isLoggedIn && (
          <LockIcon className="h-4 w-4 ml-2 opacity-50" />
        )}
      </Button>
    );

    if (item.requiresAuth && !isLoggedIn) {
      return (
        <TooltipProvider key={item.path}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                {button}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("loginRequiredForFeature")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
        {button}
      </Link>
    );
  };

  return (
    <>
      <div className="fixed top-0 right-0 z-50 md:hidden p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)}
          className="text-foreground glass-effect rounded-full"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className={`
        fixed bottom-0 left-0 w-full md:relative md:w-64 
        glass-effect border-t md:border-r md:border-t-0 md:h-screen 
        z-40 transition-all duration-300 ease-in-out text-sidebar-foreground
        ${isOpen ? 'translate-y-0' : 'md:translate-y-0 translate-y-[calc(100%-4rem)]'}
      `}>
        <div className="p-4 md:p-6">
          <div className="hidden md:flex items-center justify-between mb-8">
            <Link 
              to="/" 
              className="font-bold text-2xl gradient-text hover:scale-105 transition-transform duration-200"
              onClick={() => setIsOpen(false)}
            >
              Palavox
            </Link>
            <ThemeToggle />
          </div>
          
          <div className="flex md:flex-col justify-around md:justify-start md:space-y-3">
            {getNavItems().map(item => renderNavButton(item))}
            
            {isLoggedIn && isOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <ThemeToggle />
                  <LogoutButton iconOnly={true} onClose={() => setIsOpen(false)} />
                </div>
              </div>
            )}
          </div>
          
          {isLoggedIn && (
            <div className="hidden md:block mt-auto pt-6 border-t border-border mt-8">
              <LogoutButton />
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
