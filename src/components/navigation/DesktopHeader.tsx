
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const DesktopHeader = () => {
  return (
    <div className="hidden md:flex items-center justify-between mb-8">
      <Link 
        to="/" 
        className="font-bold text-2xl text-primary"
      >
        Palavox
      </Link>
      <ThemeToggle />
    </div>
  );
};

export default DesktopHeader;
