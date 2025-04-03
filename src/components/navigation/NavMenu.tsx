
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavItem } from "./types";
import { useNavTranslation } from "./useNavTranslation";

interface NavMenuProps {
  items: NavItem[];
  onItemClick?: () => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ items, onItemClick }) => {
  const location = useLocation();
  const { getTranslatedLabel } = useNavTranslation();

  return (
    <div className="flex md:flex-col justify-around md:justify-start md:space-y-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        const translatedLabel = getTranslatedLabel(item.label);
        
        return (
          <div key={item.path} className="flex-1 md:flex-auto">
            <Link 
              to={item.path}
              onClick={onItemClick}
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                className={isActive ? "w-full justify-start bg-lingua-primary hover:bg-lingua-primary/90" : "w-full justify-start"}
              >
                {Icon && <Icon className="h-5 w-5 md:mr-2" />}
                <span className="hidden md:inline">{translatedLabel}</span>
              </Button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default NavMenu;
