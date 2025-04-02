
import React from "react";
import { Card } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const LoginRequired: React.FC = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const { toast } = useToast();

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
          {t("premiumVoiceChat")}
        </h1>
        <p className="text-gray-600 mb-4">
          {t("premiumVoiceChatDescription", { practice: "language" })}
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
          <Button onClick={redirectToLogin} className="bg-lingua-primary hover:bg-lingua-primary/90">
            {t("login")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginRequired;
