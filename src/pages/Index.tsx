
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LanguageSelectionCard from "@/components/home/LanguageSelectionCard";
import AuthDialog from "@/components/home/AuthDialog";
import AgeVerificationDialog from "@/components/compliance/AgeVerificationDialog";
import FerpaConsentForm from "@/components/compliance/FerpaConsentForm";
import { useLocalization } from "@/context/LocalizationContext";
import { needsAgeVerification, getFerpaConsentStatus } from "@/utils/contentSafetyUtils";
import { Shield, BookOpen } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const { t, setCurrentLanguage } = useLocalization();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isAgeVerificationOpen, setIsAgeVerificationOpen] = useState(false);
  const [isFerpaConsentOpen, setIsFerpaConsentOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [hasStudyMaterials, setHasStudyMaterials] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setIsSignedIn(!!data.user);
      
      // Check if FERPA consent is needed after sign in
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
    
    // Check if age verification is needed
    const needsVerification = needsAgeVerification();
    if (needsVerification) {
      setIsAgeVerificationOpen(true);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (nativeLanguage && targetLanguage) {
      setHasStudyMaterials(true);
      
      sessionStorage.setItem("languagePair", `${nativeLanguage}-${targetLanguage}`);
      sessionStorage.setItem("hasStudyMaterials", "true");
    }
  }, [nativeLanguage, targetLanguage]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let result;
      
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              native_language: nativeLanguage || undefined,
              target_language: targetLanguage || undefined,
            }
          }
        });
      }

      if (result.error) throw result.error;

      setIsAuthDialogOpen(false);
      setEmail("");
      setPassword("");
      
      toast({
        title: isLogin ? t("signInSuccess") : t("accountCreated"),
        description: isLogin ? t("welcomeBack") : t("pleaseCheckEmail"),
      });
      
      if (nativeLanguage) localStorage.setItem("nativeLanguage", nativeLanguage);
      if (targetLanguage) localStorage.setItem("targetLanguage", targetLanguage);
      
      // Show FERPA consent form if user just registered or hasn't provided consent yet
      if (!isLogin || !getFerpaConsentStatus()) {
        setIsFerpaConsentOpen(true);
      }
      
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: t("error"),
        description: error.message || t("authFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSelection = () => {
    if (nativeLanguage && targetLanguage) {
      localStorage.setItem("nativeLanguage", nativeLanguage);
      localStorage.setItem("targetLanguage", targetLanguage);
      
      const languagePair = `${nativeLanguage}-${targetLanguage}`;
      sessionStorage.setItem("languagePair", languagePair);
      sessionStorage.setItem("hasStudyMaterials", "true");
      
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
          <h1 className="text-4xl md:text-6xl font-bold text-lingua-text mb-4">
            {t("welcomeToLanguageLearning")}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            {t("yourPersonalAICompanion")}
          </p>
          
          <LanguageSelectionCard
            nativeLanguage={nativeLanguage}
            targetLanguage={targetLanguage}
            setNativeLanguage={setNativeLanguage}
            setTargetLanguage={setTargetLanguage}
            hasStudyMaterials={hasStudyMaterials}
            handleLanguageSelection={handleLanguageSelection}
          />
          
          <div className="space-x-4">
            {!isSignedIn ? (
              <Button 
                size="lg" 
                className="bg-lingua-primary hover:bg-lingua-primary/90"
                onClick={() => {
                  setIsLogin(true);
                  setIsAuthDialogOpen(true);
                }}
              >
                {t("signIn")}
              </Button>
            ) : null}
            <Link to="/practice">
              <Button size="lg" variant="outline">
                {t("practiceWithAI")}
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link to="/settings" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <Shield size={16} className="mr-1" />
              {t("parentalControls")}
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/safety-policy" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <Shield size={16} className="mr-1" />
              {t("safetyPolicy")}
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/safety-policy?tab=ferpa" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <BookOpen size={16} className="mr-1" />
              {t("ferpaPrivacy") || "FERPA Privacy"}
            </Link>
          </div>
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
