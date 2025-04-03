
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { navItems } from "./getNavItems";
import { useNavTranslation } from "./useNavTranslation";
import MobileMenuToggle from "./MobileMenuToggle";

interface NavMenuProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

const NavMenu = ({ isLoggedIn, isAdmin = false }: NavMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getTranslatedLabel } = useNavTranslation();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const filteredNavItems = navItems
    .filter(item => {
      if (item.requiresAuth && !isLoggedIn) return false;
      if (item.adminOnly && !isAdmin) return false;
      return true;
    });

  return (
    <nav className="flex">
      <div className="hidden md:flex space-x-6">
        {filteredNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="text-gray-700 hover:text-lingua-primary transition-colors"
          >
            {getTranslatedLabel(item.label)}
          </Link>
        ))}
      </div>
      
      <div className="md:hidden">
        <MobileMenuToggle isOpen={isOpen} toggleMenu={toggleMenu} />
        
        {isOpen && (
          <div className="absolute top-16 right-0 w-64 bg-white shadow-lg rounded-md py-2 z-50">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <span>{getTranslatedLabel(item.label)}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavMenu;
