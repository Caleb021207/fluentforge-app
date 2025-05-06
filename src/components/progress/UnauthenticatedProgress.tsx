
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
        variant="accent"
      >
        {t("signIn")}
      </Button>
    </div>
  );
};

export default UnauthenticatedProgress;
