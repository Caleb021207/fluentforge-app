
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LanguageSelectionCard from "@/components/home/LanguageSelectionCard";
import AuthDialog from "@/components/home/AuthDialog";
import { useLocalization } from "@/context/LocalizationContext";

const availableLanguagePairs = [
  "english-spanish",
  "spanish-english",
];

const Index = () => {
  const { toast } = useToast();
  const { t, setCurrentLanguage } = useLocalization();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
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
      const languagePair = `${nativeLanguage}-${targetLanguage}`;
      setHasStudyMaterials(availableLanguagePairs.includes(languagePair));
      
      sessionStorage.setItem("languagePair", languagePair);
      sessionStorage.setItem("hasStudyMaterials", availableLanguagePairs.includes(languagePair).toString());
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
        title: isLogin ? "Successfully signed in" : "Account created",
        description: isLogin ? "Welcome back!" : "Please check your email to verify your account",
      });
      
      if (nativeLanguage) localStorage.setItem("nativeLanguage", nativeLanguage);
      if (targetLanguage) localStorage.setItem("targetLanguage", targetLanguage);
      
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast({
        title: "Error signing in",
        description: error.message || "Please try again later",
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
      sessionStorage.setItem("hasStudyMaterials", availableLanguagePairs.includes(languagePair).toString());
      
      // Update the UI language to match the native language
      setCurrentLanguage(nativeLanguage);
      
      toast({
        title: t("languagePreferencesSaved"),
        description: `${t("youreNowLearning")} ${targetLanguage} ${t("from")} ${nativeLanguage}`,
      });
    } else {
      toast({
        title: t("pleaseSelectBothLanguages"),
        description: t("youNeedToSelectBoth"),
        variant: "destructive",
      });
    }
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
            ) : (
              <Link to="/profile">
                <Button 
                  size="lg" 
                  className="bg-lingua-primary hover:bg-lingua-primary/90"
                >
                  {t("goToDashboard")}
                </Button>
              </Link>
            )}
            <Link to="/practice">
              <Button size="lg" variant="outline">
                {t("practiceWithAI")}
              </Button>
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
        handleGoogleLogin={handleGoogleLogin}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Index;
