
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useNavigate } from "react-router-dom";

const AuthRequiredPrompt = () => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const navigate = useNavigate();

  const redirectToAuth = () => {
    navigate("/auth");
    toast({
      title: t("loginRequired"),
      description: t("redirectingToLogin")
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <LogIn className="h-12 w-12 text-primary" />
          <h2 className="text-xl font-semibold">
            {t("loginRequired")}
          </h2>
          <p className="text-muted-foreground">
            {t("loginRequiredDescription")}
          </p>
          <Button onClick={redirectToAuth} variant="accent">
            {t("signIn")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AuthRequiredPrompt;
