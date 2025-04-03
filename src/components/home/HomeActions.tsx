
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

type HomeActionsProps = {
  isSignedIn: boolean;
  onOpenAuthDialog: () => void;
};

const HomeActions = ({ isSignedIn, onOpenAuthDialog }: HomeActionsProps) => {
  const { t } = useLocalization();

  return (
    <div className="space-x-4">
      {!isSignedIn ? (
        <Button 
          size="lg" 
          className="bg-lingua-primary hover:bg-lingua-primary/90"
          onClick={onOpenAuthDialog}
        >
          {t("signIn")}
        </Button>
      ) : null}
      <Link to="/practice">
        <Button size="lg" variant="outline">
          {t("practiceWithAI")}
        </Button>
      </Link>
    </div>
  );
};

export default HomeActions;
