
import MobileHeader from "./navigation/MobileHeader";
import NavOverlay from "./navigation/NavOverlay";
import DesktopHeader from "./navigation/DesktopHeader";
import NavItems from "./navigation/NavItems";
import MobileFooter from "./navigation/MobileFooter";
import DesktopFooter from "./navigation/DesktopFooter";
import useNavigation from "./navigation/useNavigation";

const Navigation = () => {
  const {
    isOpen,
    isLoggedIn,
    toggleMenu,
    closeMenu
  } = useNavigation();

  return (
    <>
      <MobileHeader isOpen={isOpen} toggleMenu={toggleMenu} />
      <NavOverlay isOpen={isOpen} onClose={closeMenu} />

      <nav className={`
        fixed bottom-0 left-0 w-full md:relative md:w-64 
        bg-sidebar-background/90 backdrop-blur-lg border-t md:border-r md:border-t-0 md:h-screen 
        z-40 transition-transform duration-300 ease-in-out text-sidebar-foreground
        ${isOpen ? 'translate-y-0' : 'md:translate-y-0 translate-y-[calc(100%-4rem)]'}
      `}>
        <div className="p-4">
          <DesktopHeader />
          
          <NavItems 
            isLoggedIn={isLoggedIn}
            onItemClick={closeMenu}
          />
          
          <MobileFooter 
            isLoggedIn={isLoggedIn} 
            onClose={closeMenu} 
          />
          
          <DesktopFooter isLoggedIn={isLoggedIn} />
        </div>
      </nav>
    </>
  );
};

export default Navigation;
