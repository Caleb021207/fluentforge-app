
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface MobileHeaderProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export const MobileHeader = ({ isOpen, toggleMenu }: MobileHeaderProps) => {
  return (
    <div className="fixed top-0 right-0 z-50 md:hidden p-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleMenu}
        className="text-foreground"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default MobileHeader;
