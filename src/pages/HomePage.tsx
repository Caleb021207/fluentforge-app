
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">{t("welcomeToLingua")}</h1>
      <div className="space-y-4">
        <Button
          onClick={() => navigate('/practice')}
          className="w-full"
        >
          {t("startPracticing")}
        </Button>
        <Button
          onClick={() => navigate('/voice-chat')}
          variant="outline"
          className="w-full"
        >
          {t("premiumVoiceChat")}
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
