
import { MessageSquare, Shield, Mic, Home, Headphones } from "lucide-react";
import { NavItem } from "./types";

export const getNavItems = (isAdmin: boolean, isMobile: boolean): NavItem[] => {
  const navItems: NavItem[] = [
    { icon: MessageSquare, label: "Text Practice", path: "/practice" },
    { icon: Mic, label: "Unlimited Voice Practice", path: "/voice-chat" },
    { icon: Headphones, label: "Premium Voice Chat", path: "/premium-voice-chat" },
  ];
  
  if (isAdmin) {
    navItems.push({ icon: Shield, label: "Admin", path: "/admin" });
  }

  if (isMobile) {
    navItems.unshift({ icon: Home, label: "Home", path: "/" });
  }

  return navItems;
};
