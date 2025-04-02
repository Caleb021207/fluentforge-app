
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface MobileMenuToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ isOpen, onClick }) => {
  return (
    <div className="fixed top-0 right-0 z-50 md:hidden p-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClick}
        className="text-gray-700"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default MobileMenuToggle;
