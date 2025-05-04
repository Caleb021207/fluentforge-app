
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useLocalization } from "@/hooks/useLocalization";
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
              <Button size="lg" variant="outline" disabled className="opacity-60">
                <Lock className="w-4 h-4 mr-2" />
                {t("practiceWithAI")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("loginRequiredForFeature")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link to="/practice">
        <Button size="lg" variant="outline">
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
          className="bg-lingua-primary hover:bg-lingua-primary/90"
          onClick={onLoginClick}
        >
          {t("signIn")}
        </Button>
      ) : null}
      {renderPracticeButton()}
    </div>
  );
};

export default HomeActions;
