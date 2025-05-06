
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
        <h1 className="text-3xl font-bold text-lingua-accent mb-4">
          {t("premiumVoiceTitle")}
        </h1>
        <p className="text-lingua-accent mb-4">
          {t("premiumVoiceChatDescription", { practice })}
        </p>
      </div>
      
      <Card className="p-6 bg-lingua-gold/10 border-lingua-gold/30">
        <div className="flex flex-col items-center text-center space-y-4">
          <LogIn className="h-12 w-12 text-lingua-gold" />
          <h2 className="text-xl font-semibold text-lingua-accent">
            {t("loginRequired")}
          </h2>
          <p className="text-lingua-accent">
            {t("loginRequiredDescription")}
          </p>
          <Button onClick={redirectToLogin} className="bg-lingua-primary hover:bg-lingua-primary/90 text-white">
            {t("signIn")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPrompt;
