
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

const UnauthenticatedProgress = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();

  const handleSignIn = () => {
    navigate("/");
  };

  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-bold mb-4">{t("authRequired")}</h1>
      <p className="mb-6">{t("pleaseSignInDashboard")}</p>
      <Button 
        onClick={handleSignIn} 
        className="bg-lingua-primary hover:bg-lingua-primary/90"
      >
        {t("signIn")}
      </Button>
    </div>
  );
};

export default UnauthenticatedProgress;
