
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, BookOpen, Headphones, Mic, Trophy } from "lucide-react";
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { SwipeUpPanel } from '@/components/ui/swipe-up-panel';
import AuthDialog from '@/components/home/AuthDialog';
import LanguageSelectionCard from '@/components/home/LanguageSelectionCard';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { useToast } from '@/hooks/use-toast';
import { hasStudyMaterials } from '@/utils/languageUtils';
import { secureStorage } from '@/utils/security/dataEncryption';
import { supabase } from '@/integrations/supabase/client';

const NewLandingPage = () => {
  const { theme } = useTheme();
  const { t, setCurrentLanguage } = useLocalization();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [studyMaterialsAvailable, setStudyMaterialsAvailable] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session?.user);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsSignedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    console.log('Auth success - navigating to profile');
    setIsAuthDialogOpen(false);
    navigate('/profile');
  };

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
  } = useAuthFlow(handleAuthSuccess);

  const handleLanguageSelection = () => {
    if (nativeLanguage && targetLanguage) {
      secureStorage.setItem("nativeLanguage", nativeLanguage, false);
      secureStorage.setItem("targetLanguage", targetLanguage, false);
      
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
      
      setIsPanelOpen(false);
      
      // If user is not signed in, show auth dialog after toast
      if (!isSignedIn) {
        setTimeout(() => {
          setIsLogin(true);
          setIsAuthDialogOpen(true);
        }, 1000);
      } else {
        window.location.reload();
      }
    } else {
      toast({
        title: t("pleaseSelectBothLanguages"),
        description: t("youNeedToSelectBoth"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Enhanced Background Pattern with animations */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, var(--primary) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, var(--accent) 1px, transparent 1px)`,
            backgroundSize: '60px 60px, 40px 40px'
          }}
        />
      </div>

      {/* Animated floating orbs */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-palavox-teal/10 rounded-full blur-3xl"
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center space-y-8 max-w-2xl mx-auto relative z-10"
      >
        {/* Logo with entrance animation only */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
          className="flex justify-center mb-8 relative"
        >
          {theme === "dark" ? (
            <img 
              src="/lovable-uploads/c1a8d618-54a4-41f8-b53f-06f699ca6180.png" 
              alt="Palavox Logo" 
              className="w-80 h-80 md:w-96 md:h-96 object-contain relative z-10"
            />
          ) : (
            <img 
              src="/lovable-uploads/6ec27db4-fc32-4cfe-a326-919be83e5960.png" 
              alt="Palavox Logo" 
              className="w-80 h-80 md:w-96 md:h-96 object-contain relative z-10"
            />
          )}
        </motion.div>

        {/* Title with gradient animation */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative"
        >
          <span className="text-4xl md:text-6xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary via-palavox-teal to-accent bg-clip-text text-transparent leading-tight pb-2 inline-block">
            {t("welcomeToLanguageLearning")}
          </span>
          {/* Animated underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="h-1 bg-gradient-to-r from-primary via-palavox-teal to-accent rounded-full mx-auto mt-4"
            style={{ width: '60%' }}
          />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground mb-8"
        >
          {t("yourPersonalAICompanion")}
        </motion.p>

        {/* Call to Action Buttons with enhanced animations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col items-center gap-6 mt-12"
        >
          {/* Primary CTA with particle effect on hover */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <motion.button
              onClick={() => {
                if (isSignedIn) {
                  navigate('/practice');
                } else {
                  setIsPanelOpen(true);
                }
              }}
              className="relative px-12 py-5 bg-gradient-to-r from-primary via-palavox-teal to-accent text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
            >
              {/* Animated shine effect */}
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t("startPracticing")}
              </span>
            </motion.button>
          </motion.div>

          {/* Secondary info with animated icon */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-muted-foreground flex items-center gap-2"
          >
            {t("practiceYourLanguageSkills")}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Swipe Up Panel */}
      <SwipeUpPanel
        isOpen={isPanelOpen}
        onOpenChange={setIsPanelOpen}
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center mb-6">{t("getStarted")}</h2>
          
          <LanguageSelectionCard
            nativeLanguage={nativeLanguage}
            targetLanguage={targetLanguage}
            setNativeLanguage={setNativeLanguage}
            setTargetLanguage={setTargetLanguage}
            hasStudyMaterials={studyMaterialsAvailable}
            handleLanguageSelection={handleLanguageSelection}
          />

          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsLogin(true);
                setIsAuthDialogOpen(true);
              }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              {t("signIn")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsLogin(false);
                setIsAuthDialogOpen(true);
              }}
              className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium"
            >
              {t("signUp")}
            </motion.button>
          </div>
        </div>
      </SwipeUpPanel>

      {/* Auth Dialog */}
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
    </div>
  );
};

export default NewLandingPage;
