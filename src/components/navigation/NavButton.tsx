
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LockIcon } from "lucide-react";

interface NavButtonProps {
  icon: LucideIcon;
  label: string;
  path: string;
  isActive: boolean;
  requiresAuth: boolean;
  isLoggedIn: boolean;
  onClick?: () => void;
}

export const NavButton = ({
  icon: Icon,
  label,
  path,
  isActive,
  requiresAuth,
  isLoggedIn,
  onClick,
}: NavButtonProps) => {
  const translatedLabel = label;
  const loginRequiredText = "Login is required for this feature";
  
  const button = (
    <Button
      variant={isActive ? "accent" : "ghost"}
      className="w-full justify-start"
      disabled={requiresAuth && !isLoggedIn}
    >
      <Icon className="h-5 w-5 md:mr-2" />
      <span className="hidden md:inline">{translatedLabel}</span>
      {requiresAuth && !isLoggedIn && (
        <LockIcon className="h-4 w-4 ml-2 opacity-50" />
      )}
    </Button>
  );

  if (requiresAuth && !isLoggedIn) {
    return (
      <TooltipProvider key={path}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              {button}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{loginRequiredText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Link to={path} onClick={onClick}>
      {button}
    </Link>
  );
};

export default NavButton;
