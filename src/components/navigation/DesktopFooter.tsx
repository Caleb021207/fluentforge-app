
import LogoutButton from "@/components/auth/LogoutButton";

interface DesktopFooterProps {
  isLoggedIn: boolean;
}

export const DesktopFooter = ({ isLoggedIn }: DesktopFooterProps) => {
  if (!isLoggedIn) return null;
  
  return (
    <div className="hidden md:block mt-auto pt-4 border-t mt-8">
      <LogoutButton />
    </div>
  );
};

export default DesktopFooter;
