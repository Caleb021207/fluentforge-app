
import { ThemeToggle } from "@/components/ui/theme-toggle";
import LogoutButton from "@/components/auth/LogoutButton";

interface MobileFooterProps {
  isLoggedIn: boolean;
  onClose: () => void;
}

export const MobileFooter = ({ isLoggedIn, onClose }: MobileFooterProps) => {
  if (!isLoggedIn) return null;
  
  return (
    <div className="md:hidden mt-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <ThemeToggle />
        <LogoutButton iconOnly={true} onClose={onClose} />
      </div>
    </div>
  );
};

export default MobileFooter;
