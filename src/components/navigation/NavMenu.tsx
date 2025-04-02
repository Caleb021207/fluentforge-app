
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NavItem } from "./types";
import { useNavTranslation } from "./useNavTranslation";
import { useLocalization } from "@/context/LocalizationContext";

interface NavMenuProps {
  items: NavItem[];
  className?: string;
}

const NavMenu: React.FC<NavMenuProps> = ({ items, className }) => {
  const location = useLocation();
  const { translateNavItem } = useNavTranslation();
  const { currentLanguage } = useLocalization();

  // Replace this with your actual login check
  const isLoggedIn = true;

  const isActive = (to: string) => location.pathname === to;

  const filteredItems = items.filter(
    (item) => !item.requiresAuth || (item.requiresAuth && isLoggedIn)
  );

  return (
    <nav className={className}>
      <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
        {filteredItems.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                isActive(item.to)
                  ? "text-foreground font-semibold"
                  : "text-foreground/60"
              }`}
            >
              {translateNavItem(item, currentLanguage)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavMenu;
