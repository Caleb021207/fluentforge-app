
import { useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "./auth/LogoutButton";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileMenuToggle from "./navigation/MobileMenuToggle";
import NavMenu from "./navigation/NavMenu";
import { useAuthState } from "./navigation/useAuthState";
import { getNavItems } from "./navigation/getNavItems";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, isAdmin } = useAuthState();
  const isMobile = useIsMobile();
  
  const navItems = getNavItems(isAdmin, isMobile);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <MobileMenuToggle isOpen={isOpen} onClick={toggleMenu} />

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      <nav className={`
        fixed bottom-0 left-0 w-full md:relative md:w-64 
        bg-white/90 backdrop-blur-lg border-t md:border-r md:border-t-0 md:h-screen 
        z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-y-0' : 'md:translate-y-0 translate-y-[calc(100%-4rem)]'}
      `}>
        <div className="p-4">
          <Link 
            to="/" 
            className="hidden md:flex items-center space-x-2 mb-8"
            onClick={closeMenu}
          >
            <span className="font-bold text-2xl text-lingua-primary">Palavox</span>
          </Link>
          
          <NavMenu items={navItems} onItemClick={closeMenu} />
          
          {isLoggedIn && isOpen && (
            <div className="md:hidden mt-4 pt-4 border-t">
              <LogoutButton iconOnly={true} onClose={closeMenu} />
            </div>
          )}
          
          {isLoggedIn && (
            <div className="hidden md:block mt-auto pt-4 border-t mt-8">
              <LogoutButton />
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
