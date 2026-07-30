import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Mic, Trophy } from "lucide-react";
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/home/AuthDialog';
import LanguageSelectionCard from '@/components/home/LanguageSelectionCard';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { useToast } from '@/hooks/use-toast';
import { hasStudyMaterials } from '@/utils/languageUtils';
import { secureStorage } from '@/utils/security/dataEncryption';
import { supabase } from '@/integrations/supabase/client';

const DARK_LOGO = "/lovable-uploads/c1a8d618-54a4-41f8-b53f-06f699ca6180.png";
const LIGHT_LOGO = "/lovable-uploads/6ec27db4-fc32-4cfe-a326-919be83e5960.png";

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
  const [studyMaterialsAvailable] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session?.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
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
    resetPassword,
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

  const handlePrimaryCta = () => {
    if (isSignedIn) {
      navigate('/practice');
    } else {
      setIsPanelOpen(true);
    }
  };

  const features = [
    { icon: Mic, label: "Voice Practice" },
    { icon: Sparkles, label: "AI Tutor" },
    { icon: BookOpen, label: "Guided Curriculum" },
    { icon: Trophy, label: "Certifications" },
  ];

  return (
    <div className="relative -mx-4 -my-6 flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 px-6 py-12">
      {/* Ambient background orbs (subtle, decorative) */}
      <motion.div
        aria-hidden
        animate={{ y: [0, -20, 0], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-20 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, 24, 0], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-palavox-teal/20 blur-3xl"
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <motion.img
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "backOut" }}
          src={theme === "dark" ? DARK_LOGO : LIGHT_LOGO}
          alt="Palavox"
          className="mb-4 h-28 w-28 object-contain drop-shadow-xl md:h-40 md:w-40"
        />

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-gradient-to-r from-primary via-palavox-teal to-accent bg-clip-text pb-2 text-4xl font-bold leading-tight text-transparent md:text-5xl"
        >
          {t("welcomeToLanguageLearning")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-4 max-w-xl text-lg text-muted-foreground md:text-xl"
        >
          {t("yourPersonalAICompanion")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8"
        >
          <Button
            size="lg"
            onClick={handlePrimaryCta}
            className="group relative h-auto overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-palavox-teal to-accent px-10 py-6 text-lg font-bold text-white shadow-lg transition-shadow hover:shadow-2xl"
          >
            {/* Shine sweep */}
            <motion.span
              aria-hidden
              animate={{ x: ['-120%', '220%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {isSignedIn ? t("startPracticing") : t("getStarted")}
            </span>
          </Button>

          <p className="mt-4 text-sm text-muted-foreground">
            {t("practiceYourLanguageSkills")}
          </p>
        </motion.div>

        {/* Feature strip */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 grid w-full grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {features.map(({ icon: Icon, label }, i) => (
            <li
              key={i}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="line-clamp-2 text-xs font-medium text-muted-foreground">
                {label}
              </span>
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* Get Started dialog */}
      <Dialog open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("getStarted")}</DialogTitle>
            <DialogDescription>{t("selectYourLanguagePreferences")}</DialogDescription>
          </DialogHeader>

          <LanguageSelectionCard
            nativeLanguage={nativeLanguage}
            targetLanguage={targetLanguage}
            setNativeLanguage={setNativeLanguage}
            setTargetLanguage={setTargetLanguage}
            hasStudyMaterials={studyMaterialsAvailable}
            handleLanguageSelection={handleLanguageSelection}
          />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("or") || "or"}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsLogin(true);
                setIsAuthDialogOpen(true);
              }}
            >
              {t("signIn")}
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setIsLogin(false);
                setIsAuthDialogOpen(true);
              }}
            >
              {t("signUp")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
        resetPassword={resetPassword}
        isLoading={isLoading}
        authError={authError}
        retryCount={retryCount}
      />
    </div>
  );
};

export default NewLandingPage;
