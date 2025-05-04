import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/hooks/useLocalization";
import AuthDialog from "@/components/home/AuthDialog";
import LanguageSelectionCard from "@/components/home/LanguageSelectionCard";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const Index = () => {
  const { t, currentLanguage, setCurrentLanguage, getNativeLanguageName } = useLocalization();
  const navigate = useNavigate();
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const { isLoading, isAuthenticated } = useAuthGuard();

  useEffect(() => {
    const savedLanguage = localStorage.getItem("nativeLanguage");
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, [setCurrentLanguage]);

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem("nativeLanguage", language);
  };

  const handleAuthAction = (action: "login" | "signup") => {
    setOpenAuthDialog(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lingua-primary"></div>
    </div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{t("welcome")}</h1>
      <p className="text-gray-600 mb-6">{t("indexPageDescription")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <LanguageSelectionCard
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          getNativeLanguageName={getNativeLanguageName}
        />

        <div className="space-y-4">
          <Button onClick={() => navigate("/practice")} className="w-full">
            {t("startPracticing")}
          </Button>
          {!isAuthenticated && (
            <Button variant="secondary" onClick={() => setOpenAuthDialog(true)} className="w-full">
              {t("loginOrSignup")}
            </Button>
          )}
        </div>
      </div>

      <AuthDialog open={openAuthDialog} onOpenChange={setOpenAuthDialog} />
    </div>
  );
};

export default Index;
