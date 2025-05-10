
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import LanguageSelectionCard from "@/components/home/LanguageSelectionCard";
import AuthDialog from "@/components/home/AuthDialog";
import FerpaConsentForm from "@/components/compliance/FerpaConsentForm";
import { useToast } from "@/hooks/use-toast";
import { getFerpaConsentStatus } from "@/utils/contentSafetyUtils";
import { hasStudyMaterials } from "@/utils/languageUtils";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import HomeActions from "@/components/home/HomeActions";
import HomeFooter from "@/components/home/HomeFooter";

const Index = () => {
  const { t, setCurrentLanguage } = useLocalization();
  const { toast } = useToast();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isFerpaConsentOpen, setIsFerpaConsentOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
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

    const savedNativeLanguage = localStorage.getItem("nativeLanguage");
    const savedTargetLanguage = localStorage.getItem("targetLanguage");
    
    if (savedNativeLanguage) setNativeLanguage(savedNativeLanguage);
    if (savedTargetLanguage) setTargetLanguage(savedTargetLanguage);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (nativeLanguage && targetLanguage) {
      const materialsAvailable = hasStudyMaterials(nativeLanguage, targetLanguage);
      setStudyMaterialsAvailable(materialsAvailable);
      
      sessionStorage.setItem("languagePair", `${nativeLanguage}-${targetLanguage}`);
      sessionStorage.setItem("hasStudyMaterials", materialsAvailable.toString());
    }
  }, [nativeLanguage, targetLanguage]);

  const handleLanguageSelection = () => {
    if (nativeLanguage && targetLanguage) {
      localStorage.setItem("nativeLanguage", nativeLanguage);
      localStorage.setItem("targetLanguage", targetLanguage);
      
      const languagePair = `${nativeLanguage}-${targetLanguage}`;
      sessionStorage.setItem("languagePair", languagePair);
      
      const materialsAvailable = hasStudyMaterials(nativeLanguage, targetLanguage);
      sessionStorage.setItem("hasStudyMaterials", materialsAvailable.toString());
      
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
        title: t("pleaseSelectBothLanguages"),
        description: t("youNeedToSelectBoth"),
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
          {/* Fox Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/27012de7-f750-43a0-9ca9-77e785cd2fd6.png" 
              alt="Palavox Logo" 
              className="w-48 h-48 object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            {t("welcomeToLanguageLearning")}
          </h1>
          <p className="text-lg md:text-xl text-foreground dark:text-white mb-8">
            {t("yourPersonalAICompanion")}
          </p>
          
          <LanguageSelectionCard
            nativeLanguage={nativeLanguage}
            targetLanguage={targetLanguage}
            setNativeLanguage={setNativeLanguage}
            setTargetLanguage={setTargetLanguage}
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
      
      <FerpaConsentForm
        isOpen={isFerpaConsentOpen}
        onOpenChange={setIsFerpaConsentOpen}
        onComplete={handleFerpaConsentComplete}
      />
    </div>
  );
};

export default Index;
