import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Mic, Trophy, ArrowRight } from "lucide-react";
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
import { appStorage } from '@/utils/security/storage';
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
      // Signed-in learners go straight to their learning path — the marketing
      // landing page is for visitors.
      if (session?.user) navigate('/learn', { replace: true });
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuthSuccess = () => {
    setIsAuthDialogOpen(false);
    // Profile completeness (role/onboarding) is enforced by the profile flow;
    // learners land on their learning path.
    navigate('/learn');
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
      appStorage.set("nativeLanguage", nativeLanguage);
      appStorage.set("targetLanguage", targetLanguage);

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
    <div className="aurora relative -mx-4 -my-6 flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden px-6 py-12">
      {/* Ambient brand orbs */}
      <motion.div
        aria-hidden
        animate={{ y: [0, -24, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-24 left-[-12%] h-[30rem] w-[30rem] rounded-full bg-brand-sky/25 blur-[100px]"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, 28, 0], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute bottom-[-14%] right-[-12%] h-[32rem] w-[32rem] rounded-full bg-brand-mint/25 blur-[110px]"
      />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.12, 1], opacity: [0.14, 0.26, 0.14] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-azure/20 blur-[120px]"
      />

      {/* Fine grid overlay for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--brand-sky)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-sky)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 40%, transparent 100%)",
        }}
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        {/* Logo with a soft brand halo behind it */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "backOut" }}
          className="relative mb-5"
        >
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-125 rounded-full bg-brand-radial opacity-25 blur-3xl"
          />
          <img
            src={theme === "dark" ? DARK_LOGO : LIGHT_LOGO}
            alt="Palavox"
            className="h-28 w-28 object-contain drop-shadow-2xl md:h-40 md:w-40"
          />
        </motion.div>

        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="gradient-border mb-5 inline-flex items-center gap-2 rounded-full bg-background/40 px-4 py-1.5 text-xs font-medium backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-mint" />
          <span className="text-muted-foreground">AI tutor · CEFR curriculum · built for classrooms</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="gradient-text text-balance pb-2 text-5xl font-bold leading-[1.08] tracking-tight md:text-7xl"
        >
          {t("welcomeToLanguageLearning")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="mt-5 max-w-xl text-balance text-lg text-muted-foreground md:text-xl"
        >
          {t("yourPersonalAICompanion")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8"
        >
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="xl" onClick={handlePrimaryCta} className="sheen group w-full sm:w-auto">
              <Sparkles className="h-5 w-5" />
              {isSignedIn ? t("startPracticing") : t("getStarted")}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="xl"
              variant="outlineGradient"
              onClick={() => navigate("/placement-quiz")}
              className="w-full sm:w-auto"
            >
              Find my level
            </Button>
          </div>

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
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass gradient-border group flex flex-col items-center gap-2.5 rounded-2xl p-5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-[#06263A] shadow-brand transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-foreground/90">
                {label}
              </span>
            </motion.li>
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
