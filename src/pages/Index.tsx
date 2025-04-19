import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import LanguageSelectionCard from "@/components/home/LanguageSelectionCard";
import AuthDialog from "@/components/home/AuthDialog";
import AgeVerificationDialog from "@/components/compliance/AgeVerificationDialog";
import FerpaConsentForm from "@/components/compliance/FerpaConsentForm";
import { useToast } from "@/hooks/use-toast";
import { needsAgeVerification, getFerpaConsentStatus } from "@/utils/contentSafetyUtils";
import { hasStudyMaterials } from "@/utils/languageUtils";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import HomeActions from "@/components/home/HomeActions";
import HomeFooter from "@/components/home/HomeFooter";

const Index = () => {
  const { t, setCurrentLanguage } = useLocalization();
  const { toast } = useToast();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isAgeVerificationOpen, setIsAgeVerificationOpen] = useState(false);
  const [isFerpaConsentOpen, setIsFerpaConsentOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedPair, setSelectedPair] = useState("");
  const [studyMaterialsAvailable, setStudyMaterialsAvailable] = useState(true);
  
  const {
    isLogin,
    setIsLogin,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleEmailAuth,
    authError,
    retryCount
  } = useAuthFlow(() => setIsAuthDialogOpen(false));

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setIsSignedIn(!!data.user);
      
      if (data.user && !getFerpaConsentStatus()) {
        setIsFerpaConsentOpen(true);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    const savedPair = localStorage.getItem("languagePair");
    if (savedPair) setSelectedPair(savedPair);
    
    const needsVerification = needsAgeVerification();
    if (needsVerification) {
      setIsAgeVerificationOpen(true);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedPair) {
      const [nativeLanguage, targetLanguage] = selectedPair.split("-");
      const materialsAvailable = hasStudyMaterials(nativeLanguage, targetLanguage);
      setStudyMaterialsAvailable(materialsAvailable);
      
      sessionStorage.setItem("languagePair", selectedPair);
      sessionStorage.setItem("hasStudyMaterials", materialsAvailable.toString());
    }
  }, [selectedPair]);

  const handleLanguageSelection = () => {
    if (selectedPair) {
      const [nativeLanguage, targetLanguage] = selectedPair.split("-");
      
      localStorage.setItem("languagePair", selectedPair);
      localStorage.setItem("nativeLanguage", nativeLanguage);
      localStorage.setItem("targetLanguage", targetLanguage);
      
      sessionStorage.setItem("languagePair", selectedPair);
      sessionStorage.setItem("hasStudyMaterials", hasStudyMaterials(nativeLanguage, targetLanguage).toString());
      
      setCurrentLanguage(nativeLanguage);
      
      toast({
        title: t("languagePreferencesSaved"),
        description: t("learningLanguageFromNative", {
          targetLanguage: t(`languages.${targetLanguage}`),
          nativeLanguage: t(`languages.${nativeLanguage}`)
        }),
      });
      
      window.location.reload();
    } else {
      toast({
        title: t("pleaseSelectLanguage"),
        description: t("youNeedToSelectLanguage"),
        variant: "destructive",
      });
    }
  };

  const handleFerpaConsentComplete = () => {
    setIsFerpaConsentOpen(false);
    
    toast({
      title: t("privacyPreferencesSaved") || "Privacy Preferences Saved",
      description: t("ferpaPreferencesSaved") || "Your FERPA privacy preferences have been saved. You can change them anytime in your settings.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-lingua-text mb-4">
            {t("welcomeToLanguageLearning")}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            {t("yourPersonalAICompanion")}
          </p>
          
          <LanguageSelectionCard
            selectedPair={selectedPair}
            setSelectedPair={setSelectedPair}
            hasStudyMaterials={studyMaterialsAvailable}
            handleLanguageSelection={handleLanguageSelection}
          />
          
          <HomeActions 
            isSignedIn={isSignedIn}
            onLoginClick={() => {
              setIsLogin(true);
              setIsAuthDialogOpen(true);
            }}
          />
          
          <HomeFooter />
        </motion.div>
      </div>

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleEmailAuth={handleEmailAuth}
        isLoading={isLoading}
        authError={authError}
        retryCount={retryCount}
      />
      
      <AgeVerificationDialog 
        isOpen={isAgeVerificationOpen}
        onOpenChange={setIsAgeVerificationOpen}
      />
      
      <FerpaConsentForm
        isOpen={isFerpaConsentOpen}
        onOpenChange={setIsFerpaConsentOpen}
        onComplete={handleFerpaConsentComplete}
      />
    </div>
  );
};

export default Index;
