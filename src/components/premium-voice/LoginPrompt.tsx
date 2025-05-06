
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useNavigate } from "react-router-dom";
import { getLanguagePair } from "@/utils/languageUtils";

const LoginPrompt = () => {
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const navigate = useNavigate();
  
  // Get the practice language based on the user's interface language
  const { practice } = getLanguagePair(currentLanguage);

  const redirectToLogin = () => {
    navigate("/");
    toast({
      title: t("loginRequired"),
      description: t("redirectingToLogin")
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("premiumVoiceTitle")}
        </h1>
        <p className="text-gray-600 mb-4">
          {t("premiumVoiceChatDescription", { practice })}
        </p>
      </div>
      
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <LogIn className="h-12 w-12 text-amber-600" />
          <h2 className="text-xl font-semibold text-amber-800">
            {t("loginRequired")}
          </h2>
          <p className="text-amber-700">
            {t("loginRequiredDescription")}
          </p>
          <Button onClick={redirectToLogin} variant="accent">
            {t("signIn")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPrompt;
