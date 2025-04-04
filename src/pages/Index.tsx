
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import LanguageSelectionCard from "@/components/home/LanguageSelectionCard";
import AuthDialog from "@/components/home/AuthDialog";
import { useLocalization } from "@/context/LocalizationContext";

const Index = () => {
  const { toast } = useToast();
  const { currentLanguage, setCurrentLanguage, t } = useLocalization();
  const [nativeLanguage, setNativeLanguage] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [hasSelectedLanguages, setHasSelectedLanguages] = useState(false);
  const [hasStudyMaterials, setHasStudyMaterials] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load language preferences from localStorage
    const savedNativeLanguage = localStorage.getItem("nativeLanguage");
    const savedTargetLanguage = localStorage.getItem("targetLanguage");
    
    if (savedNativeLanguage) {
      setNativeLanguage(savedNativeLanguage);
      setCurrentLanguage(savedNativeLanguage);
    }
    
    if (savedTargetLanguage) {
      setTargetLanguage(savedTargetLanguage);
    }
    
    if (savedNativeLanguage && savedTargetLanguage) {
      setHasSelectedLanguages(true);
    }
    
    // Check if there are study materials for the selected language pair
    // This is a placeholder logic - in a real app, you'd check against available study materials
    if (savedNativeLanguage && savedTargetLanguage) {
      const hasMaterials = !(
        (savedNativeLanguage === "korean" && savedTargetLanguage === "spanish") ||
        (savedNativeLanguage === "vietnamese" && savedTargetLanguage === "spanish")
      );
      setHasStudyMaterials(hasMaterials);
    }
    
    // Check for authenticated user
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentLanguage]);

  const handleLanguageSelection = () => {
    if (!nativeLanguage) {
      toast({
        title: t("pleaseSelectBothLanguages"),
        description: t("youNeedToSelectBoth"),
        variant: "destructive",
      });
      return;
    }
    
    // Save to localStorage
    localStorage.setItem("nativeLanguage", nativeLanguage);
    
    // Update the UI language based on native language selection
    setCurrentLanguage(nativeLanguage);
    
    setHasSelectedLanguages(true);
    
    toast({
      title: t("languagePreferencesSaved"),
      description: `${t("youreNowLearning")} ${nativeLanguage}`,
    });
  };

  const openAuthDialog = () => {
    setAuthDialogOpen(true);
  };

  const closeAuthDialog = () => {
    setAuthDialogOpen(false);
  };

  const isPersianSelected = nativeLanguage === 'persian';
  
  return (
    <main className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-lingua-text mb-3">
            {t("welcomeToLingua")}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("linguaDescription")}
          </p>
        </div>

        <LanguageSelectionCard
          nativeLanguage={nativeLanguage}
          targetLanguage={targetLanguage}
          setNativeLanguage={setNativeLanguage}
          setTargetLanguage={setTargetLanguage}
          hasStudyMaterials={hasStudyMaterials}
          handleLanguageSelection={handleLanguageSelection}
        />

        {hasSelectedLanguages && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full md:col-span-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="bg-white/90 backdrop-blur shadow-lg rounded-lg p-6 h-full">
                  <h3 className="text-xl font-semibold mb-4">{t("practiceYourLanguage")}</h3>
                  <p className="text-gray-600 mb-6">
                    {t("practiceDescription")}
                  </p>
                  <Link to="/practice">
                    <Button className="w-full bg-lingua-primary hover:bg-lingua-primary/90">
                      {t("startPracticing")}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>

            <div className="col-span-full md:col-span-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="bg-white/90 backdrop-blur shadow-lg rounded-lg p-6 h-full">
                  <h3 className="text-xl font-semibold mb-4">{t("voiceChat")}</h3>
                  <p className="text-gray-600 mb-6">
                    {t("voiceChatDescription")}
                  </p>
                  {isPersianSelected ? (
                    <Link to="/persian-voice-chat">
                      <Button className="w-full bg-amber-500 hover:bg-amber-600">
                        {t("persianVoiceAssistant")}
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/voice-chat">
                      <Button className="w-full bg-lingua-primary hover:bg-lingua-primary/90">
                        {t("tryVoiceChat")}
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="col-span-full md:col-span-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="bg-white/90 backdrop-blur shadow-lg rounded-lg p-6 h-full">
                  <h3 className="text-xl font-semibold mb-4">{t("premiumVoiceChat")}</h3>
                  <p className="text-gray-600 mb-6">
                    {t("premiumVoiceChatShortDescription")}
                  </p>
                  {isPersianSelected ? (
                    <div>
                      <p className="text-amber-700 mb-4 text-sm">
                        {t("notSupportedByEleven")}
                      </p>
                      <Link to="/persian-voice-chat">
                        <Button className="w-full bg-amber-500 hover:bg-amber-600">
                          {t("persianVoiceAssistant")}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Link to="/premium-voice-chat">
                      <Button className="w-full bg-lingua-primary hover:bg-lingua-primary/90">
                        {t("tryPremiumVoice")}
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {!user && (
          <div className="mt-10">
            <div className="bg-white/90 backdrop-blur shadow-lg rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">{t("createAccount")}</h3>
              <p className="text-gray-600 mb-6">
                {t("createAccountDescription")}
              </p>
              <Button 
                onClick={openAuthDialog}
                className="w-full md:w-auto bg-lingua-primary hover:bg-lingua-primary/90"
              >
                {t("signUpOrLogIn")}
              </Button>
            </div>
          </div>
        )}

      </motion.div>

      <AuthDialog open={authDialogOpen} onClose={closeAuthDialog} />
    </main>
  );
};

export default Index;
