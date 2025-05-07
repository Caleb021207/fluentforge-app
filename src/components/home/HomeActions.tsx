
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HomeActionsProps {
  isSignedIn: boolean;
  onLoginClick: () => void;
}

const HomeActions = ({ isSignedIn, onLoginClick }: HomeActionsProps) => {
  const { t } = useLocalization();

  const renderPracticeButton = () => {
    if (!isSignedIn) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="lg" variant="outline" disabled className="opacity-60 text-foreground dark:text-white">
                <Lock className="w-4 h-4 mr-2" />
                {t("practiceWithAI")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="dark:text-white">{t("loginRequiredForFeature")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link to="/practice">
        <Button size="lg" variant="outline" className="text-foreground dark:text-white">
          {t("practiceWithAI")}
        </Button>
      </Link>
    );
  };

  return (
    <div className="space-x-4">
      {!isSignedIn ? (
        <Button 
          size="lg" 
          variant="accent"
          onClick={onLoginClick}
          className="text-foreground dark:text-white"
        >
          {t("signIn")}
        </Button>
      ) : null}
      {renderPracticeButton()}
    </div>
  );
};

export default HomeActions;
