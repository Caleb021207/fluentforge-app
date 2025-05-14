
import { useLocation } from "react-router-dom";
import { Home, MessageSquare, Mic, BookOpen, BarChart } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import NavButton from "./NavButton";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemsProps {
  isLoggedIn: boolean;
  onItemClick: () => void;
}

export const NavItems = ({ isLoggedIn, onItemClick }: NavItemsProps) => {
  const location = useLocation();
  const { t } = useLocalization();
  const isMobile = useIsMobile();
  const { isTeacher, isLoading: teacherStatusLoading } = useTeacherStatus();

  const getNavItems = () => {
    const items = [
      { icon: MessageSquare, label: t("textPractice"), path: "/practice", requiresAuth: true },
      { icon: Mic, label: t("unlimitedVoicePractice"), path: "/voice-chat", requiresAuth: true },
    ];

    if (isLoggedIn && !teacherStatusLoading) {
      // Add the class menu item after voice chat items
      const insertIndex = items.length;
      items.splice(insertIndex, 0, {
        icon: BookOpen,
        label: isTeacher ? t("myClasses") : t("myClass"),
        path: isTeacher ? "/teacher/classes" : "/student/class",
        requiresAuth: true
      });
      
      // Add the metrics dashboard after the class item
      items.splice(insertIndex + 1, 0, {
        icon: BarChart,
        label: t("metricsDashboard"),
        path: "/metrics-dashboard",
        requiresAuth: true
      });
    }

    if (isMobile) {
      items.unshift({ icon: Home, label: t("home"), path: "/", requiresAuth: false });
    }

    return items;
  };

  return (
    <div className="flex md:flex-col justify-around md:justify-start md:space-y-2">
      {getNavItems().map(item => (
        <NavButton
          key={item.path}
          icon={item.icon}
          label={item.label}
          path={item.path}
          isActive={location.pathname === item.path}
          requiresAuth={item.requiresAuth}
          isLoggedIn={isLoggedIn}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};

export default NavItems;
