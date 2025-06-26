
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

const AuthRequiredState = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();

  const handleSignIn = () => {
    navigate("/");
  };

  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-bold mb-4">
        {t("authenticationRequired")}
      </h1>
      <p className="mb-6">
        {t("pleaseSignInToViewProfile")}
      </p>
      <Button 
        onClick={handleSignIn} 
        className="bg-primary hover:bg-primary/90"
      >
        {t("signIn")}
      </Button>
    </div>
  );
};

export default AuthRequiredState;
