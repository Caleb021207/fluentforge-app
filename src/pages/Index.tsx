
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useTheme } from "next-themes";
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
  const { theme } = useTheme();
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Floating shapes for visual interest */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-float [animation-delay:1s]" />
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-secondary/10 rounded-full blur-xl animate-float [animation-delay:2s]" />
      
      <div className="text-center space-y-8 max-w-2xl mx-auto p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Logo with enhanced styling */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              {theme === "dark" ? (
                <img 
                  src="/lovable-uploads/c1a8d618-54a4-41f8-b53f-06f699ca6180.png" 
                  alt="Palavox Logo" 
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                />
              ) : (
                <img 
                  src="/lovable-uploads/6ec27db4-fc32-4cfe-a326-919be83e5960.png" 
                  alt="Palavox Logo" 
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4"
          >
            {t("welcomeToLanguageLearning")}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            {t("yourPersonalAICompanion")}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <LanguageSelectionCard
              nativeLanguage={nativeLanguage}
              targetLanguage={targetLanguage}
              setNativeLanguage={setNativeLanguage}
              setTargetLanguage={setTargetLanguage}
              hasStudyMaterials={studyMaterialsAvailable}
              handleLanguageSelection={handleLanguageSelection}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <HomeActions 
              isSignedIn={isSignedIn}
              onLoginClick={() => {
                setIsLogin(true);
                setIsAuthDialogOpen(true);
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <HomeFooter />
          </motion.div>
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
