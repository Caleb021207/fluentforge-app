
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavItem } from "./types";
import { useNavTranslation } from "./useNavTranslation";

interface NavMenuProps {
  items: NavItem[];
  onItemClick?: () => void;
  className?: string; // Add className prop to interface
}

const NavMenu: React.FC<NavMenuProps> = ({ items, onItemClick, className }) => {
  const location = useLocation();
  const { getTranslatedLabel } = useNavTranslation();

  return (
    <div className={`flex md:flex-col justify-around md:justify-start md:space-y-2 ${className || ''}`}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        const translatedLabel = getTranslatedLabel(item.label);
        
        return (
          <Link 
            key={item.path} 
            to={item.path}
            onClick={onItemClick}
            className="flex-1 md:flex-auto"
          >
            <Button
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActive ? "bg-lingua-primary hover:bg-lingua-primary/90" : ""
              }`}
            >
              {Icon && <Icon className="h-5 w-5 md:mr-2" />}
              <span className="hidden md:inline">{translatedLabel}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
};

export default NavMenu;
